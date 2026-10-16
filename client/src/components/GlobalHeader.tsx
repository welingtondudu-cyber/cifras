import React from 'react';
import type { UserProfile } from '../types/music';
import {
  Music,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

interface GlobalHeaderProps {
  user: UserProfile | null;
  onToggleAIPanel?: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  user,
  onLogout,
  onGoHome,
  theme = 'dark',
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-3 select-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand: cifralab */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-orange-500 group-hover:bg-orange-600 transition-colors flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Music size={18} />
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors">cifralab</span>
        </div>

        {/* Ações da Direita: Theme toggle, User info & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Botão de Alternância de Modo Claro / Escuro */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 shadow-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700/80"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} className="text-amber-400 animate-pulse-subtle" />
                  <span className="hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-indigo-600" />
                  <span className="hidden sm:inline">Modo Escuro</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
              {user?.name || 'Músico'}
            </span>
            <button
              onClick={onLogout}
              title="Sair do sistema"
              className="p-2 sm:p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

