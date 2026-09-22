import React from 'react';
import type { ScreenView } from '../types/music';
import { Home, ListMusic, Music, Users, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: ScreenView;
  activeCatalogTab?: 'all' | 'setlists' | 'songs' | 'artists' | 'archived';
  onNavigate: (view: ScreenView) => void;
  onNavigateCatalogTab: (tab: 'all' | 'setlists' | 'songs' | 'artists' | 'archived') => void;
  onToggleAIPanel: () => void;
  isAIPanelOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  activeCatalogTab,
  onNavigate,
  onNavigateCatalogTab,
  onToggleAIPanel,
  isAIPanelOpen = false,
}) => {
  // Quando estiver na tela de cifra/palco ou com o chat da IA aberto, esconde para não conflitar com a digitação
  if (currentView === 'stage' || isAIPanelOpen) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 sm:bottom-3 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 z-40 bg-[#161616]/95 backdrop-blur-xl border-t sm:border border-zinc-800/90 px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-around sm:gap-4 sm:w-auto sm:min-w-[500px] sm:rounded-2xl select-none shadow-2xl shadow-black/80">
      {/* 1. Início */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
          currentView === 'home'
            ? 'text-orange-500 font-bold'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Home size={18} />
        <span className="text-[10px] sm:text-xs font-medium tracking-tight">Início</span>
      </button>

      {/* 2. Repertório (Abre o Catálogo filtrado por Repertórios) */}
      <button
        onClick={() => onNavigateCatalogTab('setlists')}
        className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
          currentView === 'songs_list' && activeCatalogTab === 'setlists'
            ? 'text-orange-500 font-bold'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <ListMusic size={18} />
        <span className="text-[10px] sm:text-xs font-medium tracking-tight">Repertório</span>
      </button>

      {/* 3. Cifras */}
      <button
        onClick={() => onNavigateCatalogTab('songs')}
        className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
          currentView === 'songs_list' && activeCatalogTab === 'songs'
            ? 'text-orange-500 font-bold'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Music size={18} />
        <span className="text-[10px] sm:text-xs font-medium tracking-tight">Cifras</span>
      </button>

      {/* 4. Artistas */}
      <button
        onClick={() => onNavigateCatalogTab('artists')}
        className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
          currentView === 'songs_list' && activeCatalogTab === 'artists'
            ? 'text-orange-500 font-bold'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Users size={18} />
        <span className="text-[10px] sm:text-xs font-medium tracking-tight">Artistas</span>
      </button>

      {/* 5. Assistente IA */}
      <button
        onClick={onToggleAIPanel}
        className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1 px-2.5 rounded-xl text-orange-400 font-bold transition-all active:scale-95"
        title="Assistente de Inteligência Harmônica"
      >
        <Sparkles size={18} />
        <span className="text-[10px] sm:text-xs font-medium tracking-tight">IA</span>
      </button>
    </nav>
  );
};
