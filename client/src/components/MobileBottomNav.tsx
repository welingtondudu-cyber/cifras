import React from 'react';
import type { ScreenView } from '../types/music';
import { Home, ListMusic, Music, Sparkles, Sliders } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  onToggleAIPanel: () => void;
  onToggleTools: () => void;
  hasActiveSong: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onToggleAIPanel,
  onToggleTools,
  hasActiveSong,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161616]/95 backdrop-blur-lg border-t border-zinc-800 px-2 py-1.5 flex items-center justify-around select-none">
      {/* 1. Início */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors ${
          currentView === 'home' ? 'text-orange-500 font-bold' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Home size={18} />
        <span className="text-[10px]">Início</span>
      </button>

      {/* 2. Listas */}
      <button
        onClick={() => onNavigate('setlist')}
        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors ${
          currentView === 'setlist' ? 'text-orange-500 font-bold' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <ListMusic size={18} />
        <span className="text-[10px]">Repertório</span>
      </button>

      {/* 3. Palco */}
      <button
        onClick={() => onNavigate('stage')}
        disabled={!hasActiveSong}
        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors disabled:opacity-30 ${
          currentView === 'stage' ? 'text-orange-500 font-bold' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Music size={18} />
        <span className="text-[10px]">Cifra/Palco</span>
      </button>

      {/* 4. Ferramentas de Palco (se estiver no palco) */}
      {currentView === 'stage' && (
        <button
          onClick={onToggleTools}
          className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          <Sliders size={18} />
          <span className="text-[10px]">Ajustes</span>
        </button>
      )}

      {/* 5. Chat IA */}
      <button
        onClick={onToggleAIPanel}
        className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-orange-400 font-bold transition-colors"
      >
        <Sparkles size={18} />
        <span className="text-[10px]">IA</span>
      </button>
    </nav>
  );
};
