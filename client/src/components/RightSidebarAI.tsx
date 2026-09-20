import React, { useState, useRef, useEffect } from 'react';
import type { Song, Setlist, InstrumentType, ScreenView } from '../types/music';
import { streamHarmonicChat } from '../lib/api';
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
  instrument: InstrumentType;
  availableSongs: Song[];
  onCreateSetlistFromAI: (name: string, songIds: string[]) => void;
  onReorderSetlistFromAI: (reorderedItemIds: string[]) => void;
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
  instrument,
  availableSongs,
  onCreateSetlistFromAI,
  onReorderSetlistFromAI,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Olá! Sou o assistente com IA do CIFRALAB PRO. Posso sugerir e montar repertórios para você, reordenar a sequência de músicas no show ou rearmonizar cifras em tempo real. O que você gostaria de fazer?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

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

    await streamHarmonicChat({
      prompt: `[Tela: ${screenView}] ${textToSend}. Músicas no catálogo: ${availableSongs.map(s => `${s.titulo} (${s.artista} - ${s.estilo})`).join(', ')}`,
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

        // Detectar se a IA sugeriu criação ou organização de repertório
        const lower = textToSend.toLowerCase();
        if (lower.includes('repertório') || lower.includes('setlist') || lower.includes('sugira') || lower.includes('criar')) {
          // Selecionar até 3 IDs de músicas disponíveis
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
        } else if (lower.includes('reordenar') || lower.includes('ordem') || lower.includes('harmonia')) {
          if (currentSetlist && currentSetlist.itens.length > 1) {
            const reversedIds = [...currentSetlist.itens].reverse().map(i => i.id);
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      action: {
                        type: 'reorder_setlist',
                        title: 'Aplicar ordem otimizada',
                        payload: { reorderedItemIds: reversedIds }
                      }
                    }
                  : m
              )
            );
          }
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
              <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded font-mono">BFF</span>
            </span>
            <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">
              {screenView === 'home' ? 'Hub de Repertórios' : currentSong?.titulo || 'Palco'}
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          title="Ocultar painel de IA"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-700">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
            )}

            <div
              className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-orange-600 text-white rounded-br-none shadow'
                  : 'bg-[#222] text-zinc-200 border border-zinc-750 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text || (isStreaming ? 'Pensando...' : '')}</div>

              {/* Botão de Ação Automática Executável pela IA */}
              {msg.action && (
                <div className="mt-3 pt-2.5 border-t border-zinc-700">
                  {msg.action.type === 'create_setlist' && (
                    <button
                      onClick={() => {
                        onCreateSetlistFromAI(msg.action!.payload.name, msg.action!.payload.songIds);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <ListPlus size={14} />
                      {msg.action.title}
                    </button>
                  )}

                  {msg.action.type === 'reorder_setlist' && (
                    <button
                      onClick={() => {
                        onReorderSetlistFromAI(msg.action!.payload.reorderedItemIds);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <ArrowUpDown size={14} />
                      {msg.action.title}
                    </button>
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
        {screenView === 'home' ? (
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
        ) : screenView === 'setlist' ? (
          <>
            <button
              onClick={() => handleSend('Reordene as músicas do repertório por tom para facilitar a transição')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              Reordenar por Tom
            </button>
            <button
              onClick={() => handleSend('Sugira 2 músicas para adicionar a esta lista')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              + Sugerir Músicas
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
          placeholder="Pergunte à IA ou peça um repertório..."
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
