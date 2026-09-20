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

/**
 * Analisa a resposta da IA e o pedido do usuário para extrair de forma precisa:
 * 1. O título temático criado para o repertório (ex: "Samba de Raiz & Pagode")
 * 2. As músicas do catálogo que REALMENTE foram sugeridas/pertencem ao estilo
 */
function parseAISetlistSuggestion(
  aiText: string,
  availableSongs: Song[],
  userPrompt: string
): { name: string; songIds: string[]; songNames: string[] } | null {
  let title = '';
  const foundSongs: Song[] = [];

  // 1. Procurar bloco estruturado [SETLIST_DATA]
  const blockMatch = aiText.match(/\[SETLIST_DATA\]([\s\S]*?)\[\/SETLIST_DATA\]/i);
  if (blockMatch) {
    const blockContent = blockMatch[1];
    const titleMatch = blockContent.match(/TITLE:\s*(.+)/i);
    const songsMatch = blockContent.match(/SONGS:\s*(.+)/i);

    if (titleMatch) title = titleMatch[1].trim();
    if (songsMatch) {
      const rawSongs = songsMatch[1].split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      for (const rawName of rawSongs) {
        const clean = rawName
          .replace(/^[\d\.\-\*\s]+/, '')
          .replace(/[\*\"]/g, '')
          .toLowerCase();

        const match = availableSongs.find(
          s =>
            s.titulo.toLowerCase().includes(clean) ||
            clean.includes(s.titulo.toLowerCase()) ||
            s.artista.toLowerCase().includes(clean)
        );
        if (match && !foundSongs.some(f => f.id === match.id)) {
          foundSongs.push(match);
        }
      }
    }
  }

  // 2. Extração por menção explícita no texto caso o bloco não venha formatado
  if (foundSongs.length === 0) {
    const aiLower = aiText.toLowerCase();
    for (const song of availableSongs) {
      // Procurar se o título exato da música foi citado na resposta
      if (aiLower.includes(song.titulo.toLowerCase())) {
        if (!foundSongs.some(f => f.id === song.id)) {
          foundSongs.push(song);
        }
      }
    }
  }

  // 3. Validação por estilo solicitado (ex: Samba, Sertanejo, etc.)
  const promptLower = userPrompt.toLowerCase();
  const knownStyles = ['samba', 'pagode', 'sertanejo', 'rock', 'mpb', 'gospel'];
  const requestedStyle = knownStyles.find(st => promptLower.includes(st));

  // Se o usuário pediu um estilo específico, garantir que apenas músicas daquele estilo entrem
  let finalSongs = foundSongs;
  if (requestedStyle && foundSongs.length > 0) {
    const filteredByStyle = foundSongs.filter(
      s =>
        s.estilo.toLowerCase().includes(requestedStyle) ||
        (requestedStyle === 'pagode' && s.estilo.toLowerCase() === 'samba')
    );
    if (filteredByStyle.length > 0) {
      finalSongs = filteredByStyle;
    }
  }

  // Se ainda não encontrou nenhuma música citada, buscar músicas do catálogo do estilo solicitado
  if (finalSongs.length === 0 && requestedStyle) {
    const styleMatches = availableSongs.filter(
      s =>
        s.estilo.toLowerCase().includes(requestedStyle) ||
        (requestedStyle === 'pagode' && s.estilo.toLowerCase() === 'samba')
    );
    finalSongs = styleMatches;
  }

  if (finalSongs.length === 0) return null;

  // 4. Gerar nome de repertório criativo e personalizado (sem nomes genéricos)
  if (!title) {
    if (promptLower.includes('samba') || promptLower.includes('pagode')) {
      title = 'Samba de Raiz & Roda de Pagode';
    } else if (promptLower.includes('sertanejo')) {
      title = 'Especial Sertanejo ao Vivo';
    } else if (promptLower.includes('gospel') || promptLower.includes('louvor')) {
      title = 'Louvor & Adoração Intimista';
    } else if (promptLower.includes('mpb') || promptLower.includes('acústico') || promptLower.includes('acustico')) {
      title = 'Voz & Violão (MPB Clássicos)';
    } else if (promptLower.includes('rock')) {
      title = 'Clássicos do Rock Nacional';
    } else {
      title = `Repertório ${finalSongs[0]?.estilo || 'Palco'} (${finalSongs.length} músicas)`;
    }
  }

  return {
    name: title,
    songIds: finalSongs.map(s => s.id),
    songNames: finalSongs.map(s => `${s.titulo} (${s.artista})`)
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
      text: 'Olá! Sou o assistente com IA do CIFRALAB PRO. Posso sugerir e montar repertórios temáticos, reordenar as músicas do show por harmonia de tons, ou tirar dúvidas teóricas. Como posso te ajudar?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // 1. Preparar histórico real para manter contexto contínuo
    const conversationHistory = messages
      .filter(m => m.id !== 'welcome' && m.text && m.text.trim())
      .map(m => ({
        role: m.sender,
        content: m.text
      }));

    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: textToSend },
      { id: assistantMsgId, sender: 'assistant', text: '' }
    ]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
      : 'Nenhum repertório selecionado no momento.';

    await streamHarmonicChat({
      prompt: `[Tela: ${screenView}] ${setlistSummary}. Catálogo de músicas disponíveis no sistema: ${availableSongs
        .map(s => `"${s.titulo}" (${s.artista} - ${s.estilo}, Tom: ${s.tom_original})`)
        .join(', ')}. Mensagem do usuário: ${textToSend}`,
      history: conversationHistory,
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

        // A. Detectar se é reordenação de repertório
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

        // B. Detectar criação ou sugestão de novo repertório
        if (
          lower.includes('repertório') ||
          lower.includes('repertorio') ||
          lower.includes('setlist') ||
          lower.includes('sugira') ||
          lower.includes('criar') ||
          lower.includes('playlist') ||
          lower.includes('músicas de') ||
          lower.includes('musicas de')
        ) {
          const parsed = parseAISetlistSuggestion(accumulated, availableSongs, textToSend);
          if (parsed && parsed.songIds.length > 0) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      action: {
                        type: 'create_setlist',
                        title: `Criar Repertório: "${parsed.name}" (${parsed.songIds.length} músicas)`,
                        payload: {
                          name: parsed.name,
                          songIds: parsed.songIds,
                          preview: parsed.songNames.join(' • ')
                        }
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
          ? 'w-[360px] sm:w-[420px] translate-x-0'
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
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {msg.text.replace(/\[SETLIST_DATA\][\s\S]*?\[\/SETLIST_DATA\]/gi, '').trim()}
              </div>

              {/* Botão de Ação Automática Executável pela IA */}
              {msg.action && (
                <div className="mt-3 pt-2.5 border-t border-zinc-700 space-y-2">
                  {msg.action.type === 'create_setlist' && (
                    <div className="space-y-2">
                      {msg.action.payload?.preview && (
                        <div className="p-2.5 bg-black/40 rounded-lg border border-zinc-750 text-[11px] text-zinc-300 font-mono leading-relaxed">
                          <div className="text-[10px] text-orange-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                            <ListPlus size={12} />
                            <span>Músicas Selecionadas ({msg.action.payload.songIds.length}):</span>
                          </div>
                          <div className="text-zinc-200">{msg.action.payload.preview}</div>
                        </div>
                      )}
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
                                      `\n\n✅ *Repertório "${msg.action!.payload.name}" criado com sucesso com ${msg.action!.payload.songIds.length} músicas!*`
                                  }
                                : m
                            )
                          );
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 text-center"
                      >
                        <ListPlus size={14} />
                        {msg.action.title}
                      </button>
                    </div>
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
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              + Sugerir Músicas
            </button>
          </>
        ) : screenView === 'home' ? (
          <>
            <button
              onClick={() => handleSend('Sugira um repertório temático de Samba e Pagode')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/40 hover:bg-orange-500/30 whitespace-nowrap"
            >
              + Repertório de Samba
            </button>
            <button
              onClick={() => handleSend('Sugira um repertório para show acústico de Voz e Violão')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              Show Acústico
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSend('Dica de substituição harmônica para esta música')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              Substituição Harmônica
            </button>
            <button
              onClick={() => handleSend('Como tocar esse refrão no Cavaco?')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-300 whitespace-nowrap border border-zinc-700"
            >
              Dica Cavaco
            </button>
          </>
        )}
      </div>

      {/* Caixa de Texto Multilinha com Auto-expansão e Quebra de Linha */}
      <div className="p-3 bg-[#181818] border-t border-zinc-800 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Pergunte à IA, peça um repertório ou tire dúvidas... (Shift+Enter pula linha)"
          className="flex-1 bg-[#222] border border-zinc-700 text-white placeholder-zinc-500 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 resize-none min-h-[42px] max-h-32 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 whitespace-pre-wrap break-words"
          style={{ height: 'auto' }}
          onInput={e => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isStreaming}
          className="p-2.5 h-[42px] w-[42px] flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white shadow-md active:scale-95 transition-all shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </aside>
  );
};
