import React from 'react';
import type { ViewMode, Setlist, Song } from '../types/music';
import { Star } from 'lucide-react';

interface StageTabsHeaderProps {
  title: string;
  artist: string;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  activeSetlist?: Setlist | null;
  currentSongIndex?: number;
  totalSongsInSetlist?: number;
  nextSong?: Song;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const StageTabsHeader: React.FC<StageTabsHeaderProps> = ({
  title,
  artist,
  activeSetlist,
  currentSongIndex,
  totalSongsInSetlist,
  nextSong,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const isInSetlist = Boolean(activeSetlist && totalSongsInSetlist && totalSongsInSetlist > 0);
  const songNumber = (currentSongIndex ?? 0) + 1;

  return (
    <div className="mb-5 border-b border-zinc-800/80 pb-4 select-none">
      {/* Banner de Contexto de Repertório no Cabeçalho */}
      {isInSetlist && (
        <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-900/90 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-orange-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-orange-500/20">
              Música {songNumber} de {totalSongsInSetlist}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-300">
              Repertório: <span className="text-white font-bold">{activeSetlist?.nome}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            {nextSong ? (
              <div className="flex items-center gap-1.5 bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 rounded-xl">
                <span className="text-zinc-400 font-medium">Próxima:</span>
                <span className="text-orange-400 font-bold">{nextSong.titulo}</span>
                {nextSong.tom_original && (
                  <span className="text-zinc-400 font-mono text-xs">({nextSong.tom_original})</span>
                )}
              </div>
            ) : (
              <span className="text-zinc-500 text-xs italic">Última música do repertório</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {title}
          </h1>

          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-90 ${
                isFavorite
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm'
                  : 'bg-zinc-850/80 border-zinc-750 text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star
                size={18}
                className={isFavorite ? 'fill-amber-400 text-amber-400' : 'text-current'}
              />
            </button>
          )}
        </div>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <span className="text-base sm:text-lg font-bold text-orange-500">
          {artist}
        </span>
      </div>
    </div>
  );
};

