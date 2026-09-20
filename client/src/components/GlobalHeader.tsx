import React, { useState } from 'react';
import type { ScreenView, UserProfile } from '../types/music';
import {
  Search,
  Sparkles,
  Music,
  Plus,
  LogOut,
  X
} from 'lucide-react';

interface GlobalHeaderProps {
  currentView: ScreenView;
  user: UserProfile | null;
  onSearchSubmit: (query: string) => void;
  onOpenNewSong: () => void;
  onToggleAIPanel: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  currentView,
  user,
  onSearchSubmit,
  onOpenNewSong,
  onToggleAIPanel,
  onLogout,
  onGoHome,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      onSearchSubmit(searchValue.trim());
    }
  };

  const handleClear = () => {
    setSearchValue('');
    if (currentView === 'songs_list') {
      onSearchSubmit('');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#161616]/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand: cifralab */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Music size={18} />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">cifralab</span>
        </div>

        {/* Search Bar no Centro */}
        <div className="flex-1 max-w-xl relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="O que você quer tocar?"
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#262626] border border-transparent focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-zinc-400 text-sm rounded-full pl-11 pr-10 py-2.5 transition-all outline-none"
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-full"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onOpenNewSong}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-750 text-xs sm:text-sm font-semibold text-zinc-200 transition-colors active:scale-95"
          >
            <Plus size={15} />
            <span>Nova Cifra</span>
          </button>

          <button
            onClick={onToggleAIPanel}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            title="Abrir assistente IA lateral"
          >
            <Sparkles size={15} />
            <span className="hidden md:inline">Assistente IA</span>
          </button>

          {/* User info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <span className="hidden lg:inline text-xs sm:text-sm text-zinc-300 font-medium">
              {user?.name || 'Músico'}
            </span>
            <button
              onClick={onLogout}
              title="Sair do sistema"
              className="p-2 sm:p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
