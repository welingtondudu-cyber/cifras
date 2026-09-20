import React from 'react';
import type { ViewMode } from '../types/music';
import { CheckCircle2 } from 'lucide-react';

interface StageTabsHeaderProps {
  title: string;
  artist: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const StageTabsHeader: React.FC<StageTabsHeaderProps> = ({
  title,
  artist,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="mb-5 border-b border-zinc-800/80 pb-4 select-none">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          {title}
        </h1>
        <CheckCircle2 size={18} className="text-orange-500 fill-orange-500/20 shrink-0" />
      </div>

      <div className="mt-1 flex items-center gap-2">
        <span className="text-base sm:text-lg font-bold text-orange-500">
          {artist}
        </span>
      </div>

      {/* Abas: Cifra, Compassos, Graus */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <button
          onClick={() => onViewModeChange('chordpro')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            viewMode === 'chordpro'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-[#242424] text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Cifra
        </button>

        <button
          onClick={() => onViewModeChange('leadSheet')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            viewMode === 'leadSheet'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-[#242424] text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Compassos
        </button>

        <button
          onClick={() => onViewModeChange('degrees')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            viewMode === 'degrees'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-[#242424] text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Graus
        </button>
      </div>
    </div>
  );
};
