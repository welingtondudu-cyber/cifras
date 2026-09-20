import React from 'react';
import type { Song, Setlist } from '../types/music';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  Home,
  Music
} from 'lucide-react';

interface StageHeaderProps {
  currentSong: Song;
  currentSetlist?: Setlist | null;
  songIndexInSetlist: number;
  totalSongsInSetlist: number;
  onPrevSong: () => void;
  onNextSong: () => void;
  onBackToHome: () => void;
  isAIPanelOpen: boolean;
  onToggleAIPanel: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  currentSong,
  currentSetlist,
  songIndexInSetlist,
  totalSongsInSetlist,
  onPrevSong,
  onNextSong,
  onBackToHome,
  isAIPanelOpen,
  onToggleAIPanel,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="h-14 sm:h-16 bg-[#141414] border-b border-zinc-800 px-3 sm:px-6 flex items-center justify-between gap-3 text-zinc-100 select-none sticky top-0 z-30">
      {/* Botão de Voltar ao Início */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-300 transition-colors active:scale-95"
        >
          <Home size={15} />
          <span className="hidden sm:inline">Início</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm text-zinc-400 font-mono pl-1">
          <Music size={14} className="text-orange-500" />
          <span className="text-white font-bold">{currentSong.titulo}</span>
          <span>•</span>
          <span>{currentSong.artista}</span>
        </div>
      </div>

      {/* Navegador de Faixas do Repertório (Passagem Fácil de Músicas!) */}
      {currentSetlist && totalSongsInSetlist > 1 ? (
        <div className="flex items-center bg-[#1e1e1e] border border-zinc-750 rounded-xl p-1 shadow-inner">
          <button
            onClick={onPrevSong}
            disabled={songIndexInSetlist <= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-750 disabled:opacity-30 transition-all active:scale-95"
            title="Música anterior do repertório"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="px-3 text-center border-x border-zinc-750 min-w-[140px] sm:min-w-[180px]">
            <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-orange-400 font-bold font-mono">
              {currentSetlist.nome} ({songIndexInSetlist + 1}/{totalSongsInSetlist})
            </div>
            <div className="text-xs sm:text-sm font-black text-white truncate max-w-[160px] sm:max-w-[200px]">
              {currentSong.titulo}
            </div>
          </div>

          <button
            onClick={onNextSong}
            disabled={songIndexInSetlist >= totalSongsInSetlist - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-750 disabled:opacity-30 transition-all active:scale-95"
            title="Próxima música do repertório"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}

      {/* Ações da Direita: Assistente IA e Fullscreen */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAIPanel}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
            isAIPanelOpen
              ? 'bg-orange-500 text-white shadow-orange-500/20'
              : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750'
          }`}
          title="Abrir ou ocultar painel de IA lateral"
        >
          <Sparkles size={15} className={isAIPanelOpen ? 'animate-pulse' : ''} />
          <span className="hidden sm:inline">Assistente IA</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Palco Fullscreen'}
          className="p-2 sm:p-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </header>
  );
};
