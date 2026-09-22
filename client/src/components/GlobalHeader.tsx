import React from 'react';
import type { UserProfile } from '../types/music';
import {
  Music,
  LogOut
} from 'lucide-react';

interface GlobalHeaderProps {
  user: UserProfile | null;
  onToggleAIPanel?: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  user,
  onLogout,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#161616]/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand: cifralab */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-orange-500 group-hover:bg-orange-600 transition-colors flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Music size={18} />
          </div>
          <span className="text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">cifralab</span>
        </div>

        {/* Ações da Direita: User info & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-xs sm:text-sm text-zinc-300 font-medium">
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
