import React, { useState, useRef, useEffect } from 'react';
import type { Song, Setlist, InstrumentType, ScreenView } from '../types/music';
import { streamHarmonicChat } from '../lib/api';
import { optimizeHarmonicOrder } from '../chordEngine/harmonicOrder';
import {
  Sparkles,
  ChevronRight,
  Send,
  Bot,
  User,
  ListPlus,
  ArrowUpDown
} from 'lucide-react';

interface RightSidebarAIProps {
  isOpen: boolean;
  onToggle: () => void;
  screenView: ScreenView;
  currentSong?: Song | null;
  currentSetlist?: Setlist | null;
  availableSetlists?: Setlist[];
  instrument: InstrumentType;
  availableSongs: Song[];
  onCreateSetlistFromAI: (name: string, songIds: string[]) => void;
  onReorderSetlistFromAI: (reorderedItemIds: string[]) => void;
  promptToExecute?: string | null;
  onPromptExecuted?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: {
    type: 'create_setlist' | 'reorder_setlist';
    title: string;
    payload: any;
  };
}

export const RightSidebarAI: React.FC<RightSidebarAIProps> = ({
  isOpen,
  onToggle,
  screenView,
  currentSong,
  currentSetlist,
  availableSetlists,
  instrument,
  availableSongs,
  onCreateSetlistFromAI,
  onReorderSetlistFromAI,
  promptToExecute,
  onPromptExecuted,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Olá! Sou o assistente com IA do CIFRALAB PRO. Posso sugerir e montar repertórios para você, reordenar a sequência de músicas no show por harmonia e transição suave de tons, ou tirar dúvidas teóricas. Como posso te ajudar?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Executar prompt disparado externamente (ex: botão "Ordenar com IA")
  useEffect(() => {
    if (promptToExecute && !isStreaming) {
      handleSend(promptToExecute);
      onPromptExecuted?.();
    }
  }, [promptToExecute]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isStreaming) return;

    const userMsgId = 'u-' + Date.now();
    const assistantMsgId = 'a-' + Date.now();

    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: textToSend },
      { id: assistantMsgId, sender: 'assistant', text: '' }
    ]);
    setInput('');
    setIsStreaming(true);

    let accumulated = '';
    const currentKey = currentSong?.tom_original || 'C';

    const targetSetlist =
      currentSetlist ||
      (availableSetlists && availableSetlists.find(s => s.itens && s.itens.length > 1));

    const setlistSummary = targetSetlist
      ? `Repertório em foco: '${targetSetlist.nome}' com ${targetSetlist.itens.length} músicas: ${targetSetlist.itens
          .map((it, idx) => `${idx + 1}. ${it.musica?.titulo} (Tom: ${it.musica?.tom_original || '?'})`)
          .join(', ')}`
      : 'Nenhum repertório com músicas em foco no momento.';

    await streamHarmonicChat({
      prompt: `[Tela: ${screenView}] ${setlistSummary}. Músicas no catálogo geral: ${availableSongs
        .map(s => `${s.titulo} (${s.artista} - ${s.estilo})`)
        .join(', ')}. Pedido do usuário: ${textToSend}`,
      tomAtual: currentKey,
      instrumento: instrument === 'cavaco' ? 'Cavaco' : 'Violão',
      chordproSnippet: currentSong ? currentSong.chordpro.slice(0, 300) : '',
      onChunk: (chunk: string) => {
        accumulated += chunk;
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, text: accumulated } : m))
        );
      },
      onComplete: () => {
        setIsStreaming(false);

        const lower = textToSend.toLowerCase();

        // 1. Detectar pedido de reordenação de repertório
        if (
          lower.includes('reordenar') ||
          lower.includes('ordem') ||
          lower.includes('harmonia') ||
          lower.includes('organizar') ||
          lower.includes('otimizar') ||
          lower.includes('sequência')
        ) {
          if (targetSetlist && targetSetlist.itens.length > 1) {
            const optimized = optimizeHarmonicOrder(targetSetlist.itens);
            const reorderedIds = optimized.map(i => i.id);
            const previewText = optimized
              .map(
                (it, idx) =>
                  `${idx + 1}º ${it.musica?.titulo || 'Música'} (${it.musica?.tom_original || 'Tom'})`
              )
              .join(' ➔ ');

            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      action: {
                        type: 'reorder_setlist',
                        title: `Aplicar Nova Ordem no Repertório (${optimized.length} músicas)`,
                        payload: {
                          reorderedItemIds: reorderedIds,
                          preview: previewText
                        }
                      }
                    }
                  : m
              )
            );
            return;
          }
        }

        // 2. Detectar sugestão de criação de novo repertório
        if (
          lower.includes('repertório') ||
          lower.includes('setlist') ||
          lower.includes('sugira') ||
          lower.includes('criar')
        ) {
          const matchedIds = availableSongs.slice(0, 4).map(s => s.id);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    action: {
                      type: 'create_setlist',
                      title: 'Criar este repertório agora',
                      payload: {
                        name: 'Setlist Sugerido pela IA',
                        songIds: matchedIds
                      }
                    }
                  }
                : m
            )
          );
        }
      },
      onError: (err) => {
        console.error('Chat error:', err);
        setIsStreaming(false);
      }
    });
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 right-0 h-screen z-40 bg-[#161616] border-l border-zinc-800 flex flex-col transition-all duration-300 shadow-2xl ${
        isOpen
          ? 'w-[360px] sm:w-[400px] translate-x-0'
          : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'
      }`}
    >
      {/* Top Header estilo Antigravity IDE */}
      <div className="h-14 px-4 bg-[#1e1e1e] border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center">
            <Sparkles size={15} />
          </div>
          <div>
            <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              ASSISTENTE IA
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <p className="text-[10px] text-zinc-400">Harmonia e Repertório</p>
          </div>
        </div>

        <button
          onClick={onToggle}
          title="Recolher painel"
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Histórico de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-orange-500 text-white font-medium rounded-tr-sm'
                  : 'bg-[#1f1f1f] text-zinc-200 border border-zinc-800 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Botão de Ação Automática Executável pela IA */}
              {msg.action && (
                <div className="mt-3 pt-2.5 border-t border-zinc-700 space-y-2">
                  {msg.action.type === 'create_setlist' && (
                    <button
                      onClick={() => {
                        onCreateSetlistFromAI(
                          msg.action!.payload.name,
                          msg.action!.payload.songIds
                        );
                        setMessages(prev =>
                          prev.map(m =>
                            m.id === msg.id
                              ? {
                                  ...m,
                                  action: undefined,
                                  text:
                                    m.text +
                                    '\n\n✅ *Repertório criado com sucesso e adicionado às suas listas!*'
                                }
                              : m
                          )
                        );
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <ListPlus size={14} />
                      {msg.action.title}
                    </button>
                  )}

                  {msg.action.type === 'reorder_setlist' && (
                    <div className="space-y-2">
                      {msg.action.payload?.preview && (
                        <div className="p-2.5 bg-black/40 rounded-lg border border-zinc-750 text-[11px] text-zinc-300 font-mono leading-relaxed">
                          <div className="text-[10px] text-orange-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                            <Sparkles size={11} />
                            <span>Sequência Harmônica Proposta:</span>
                          </div>
                          <div className="text-zinc-200 leading-snug">
                            {msg.action.payload.preview}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          onReorderSetlistFromAI(msg.action!.payload.reorderedItemIds);
                          setMessages(prev =>
                            prev.map(m =>
                              m.id === msg.id
                                ? {
                                    ...m,
                                    action: undefined,
                                    text:
                                      m.text +
                                      '\n\n✅ *Ordem harmônica aplicada com sucesso ao seu repertório!*'
                                  }
                                : m
                            )
                          );
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        <ArrowUpDown size={14} />
                        {msg.action.title}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0">
                <User size={14} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões Rápidas de Prompt */}
      <div className="p-2.5 bg-[#1a1a1a] border-t border-zinc-800 flex gap-1.5 overflow-x-auto scrollbar-none">
        {screenView === 'setlist' ? (
          <>
            <button
              onClick={() =>
                handleSend(
                  'Reordene as músicas deste repertório para criar uma transição harmônica suave e perfeita para o show'
                )
              }
              className="text-[11px] px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/40 hover:bg-orange-500/30 whitespace-nowrap"
            >
              ⚡ Otimizar Ordem Harmônica
            </button>
            <button
              onClick={() => handleSend('Sugira 2 músicas que combinem com este repertório')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              + Sugerir Músicas
            </button>
          </>
        ) : screenView === 'home' ? (
          <>
            <button
              onClick={() => handleSend('Sugira um repertório de Samba e Pagode')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              + Repertório de Samba
            </button>
            <button
              onClick={() => handleSend('Quais músicas combinam com show acústico?')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              Show Acústico
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSend('Dica de substituição harmônica para esta música')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              Substituição Harmônica
            </button>
            <button
              onClick={() => handleSend('Como tocar esse refrão no Cavaco?')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              Dica Cavaco
            </button>
          </>
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="p-3 bg-[#181818] border-t border-zinc-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Peça para reordenar o repertório ou tirar dúvidas..."
          className="flex-1 bg-[#222] border border-zinc-700 text-white placeholder-zinc-500 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isStreaming}
          className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white shadow-md active:scale-95 transition-all"
        >
          <Send size={15} />
        </button>
      </div>
    </aside>
  );
};
