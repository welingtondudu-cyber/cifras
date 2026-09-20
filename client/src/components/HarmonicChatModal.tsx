import React, { useState, useRef, useEffect } from 'react';
import type { InstrumentType } from '../types/music';
import { streamHarmonicChat } from '../lib/api';
import { Sparkles, X, Send, Bot, User, CornerDownLeft } from 'lucide-react';

interface HarmonicChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  instrument: InstrumentType;
  songTitle: string;
  chordproSnippet: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const HarmonicChatModal: React.FC<HarmonicChatModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  instrument,
  songTitle,
  chordproSnippet,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Olá! Sou seu assistente harmônico de palco do CIFRALAB. Estamos em **${songTitle}**, no tom **${currentKey}** para **${instrument === 'cavaco' ? 'Cavaco (D-G-B-D)' : 'Violão'}**. Como posso enriquecer seu arranjo ou rearmonizar essa música?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend || isStreaming) return;

    const userMsgId = 'u-' + Date.now();
    const assistantMsgId = 'a-' + Date.now();

    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: promptToSend },
      { id: assistantMsgId, sender: 'assistant', text: '' }
    ]);
    setInput('');
    setIsStreaming(true);

    let accumulatedText = '';

    await streamHarmonicChat({
      prompt: promptToSend,
      tomAtual: currentKey,
      instrumento: instrument === 'cavaco' ? 'Cavaco' : 'Violão',
      chordproSnippet: chordproSnippet.slice(0, 500),
      sessionId: 'stage-session-1',
      onChunk: (chunk: string) => {
        accumulatedText += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMsgId ? { ...msg, text: accumulatedText } : msg
          )
        );
      },
      onComplete: () => {
        setIsStreaming(false);
      },
      onError: (err) => {
        console.error('Chat error:', err);
        setIsStreaming(false);
      }
    });
  };

  const quickPrompts = [
    'Sugira substituições com SubV7 no tom',
    'Como fazer uma levada marcante no Cavaco?',
    'Dica de cadência de preparação para o refrão',
    'Quais tensões (9, 11, 13) usar nos acordes?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                CIFRALAB Harmonic AI
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono border border-violet-500/30">
                  SSE Streaming
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Contexto: <span className="text-cyan-400 font-mono font-bold">{currentKey}</span> •{' '}
                <span className="text-amber-400 capitalize">{instrument}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-750 rounded-bl-none shadow'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text || (isStreaming ? 'Pensando...' : '')}</div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 flex gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap active:scale-95 transition-all disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Pergunte algo sobre a harmonia em ${currentKey}...`}
            disabled={isStreaming}
            className="flex-1 bg-slate-900 border border-slate-750 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 active:scale-95 disabled:opacity-40 transition-all"
          >
            {isStreaming ? (
              <CornerDownLeft size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
