import React from 'react';
import type { Song, Setlist } from '../types/music';
import { ArrowLeft } from 'lucide-react';

interface StageHeaderProps {
  currentSong: Song;
  currentSetlist?: Setlist | null;
  songIndexInSetlist?: number;
  totalSongsInSetlist?: number;
  onPrevSong?: () => void;
  onNextSong?: () => void;
  onBack: () => void;
  backLabel?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  onBack,
  backLabel = 'Voltar',
}) => {
  return (
    <header className="h-14 sm:h-16 bg-[#141414] border-b border-zinc-800 px-3 sm:px-6 flex items-center justify-between gap-3 text-zinc-100 select-none sticky top-0 z-30">
      {/* Botão de Voltar Contextual no Estilo Padrão */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-colors active:scale-95 border border-zinc-750 shadow-sm"
          title={`Retornar para ${backLabel}`}
        >
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Lado direito limpo sem botões intrusivos */}
      </div>
    </header>
  );
};
