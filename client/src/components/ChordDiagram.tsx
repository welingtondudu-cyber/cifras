import React from 'react';
import type { ChordShape } from '../types/music';

interface ChordDiagramProps {
  chordShape: ChordShape;
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
  onPrevVariation?: () => void;
  onNextVariation?: () => void;
  onClick?: () => void;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chordShape,
  size = 'md',
  showControls = true,
  onPrevVariation,
  onNextVariation,
  onClick
}) => {
  const { chord, instrument, frets, variationIndex = 0, totalVariations = 1 } = chordShape;
  const numStrings = instrument === 'cavaco' ? 4 : 6;
  const numFrets = 4;

  const positiveFrets = frets.filter(f => f > 0);
  const minFret = positiveFrets.length > 0 ? Math.min(...positiveFrets) : 1;
  const maxFret = positiveFrets.length > 0 ? Math.max(...positiveFrets) : 4;
  const baseFret = maxFret > 4 ? minFret : 1;

  const width = size === 'sm' ? 100 : size === 'lg' ? 160 : 124;
  const height = size === 'sm' ? 118 : size === 'lg' ? 190 : 144;
  const padX = 18;
  const padTop = 24;
  const padBottom = 14;

  const fretboardWidth = width - padX * 2;
  const fretboardHeight = height - padTop - padBottom;

  const stringSpacing = fretboardWidth / (numStrings - 1);
  const fretSpacing = fretboardHeight / numFrets;

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center bg-[#181818] border border-zinc-800 rounded-xl p-2.5 shadow-md hover:border-orange-500/60 transition-all relative group shrink-0 select-none"
    >
      <div className="flex items-center justify-between w-full px-1 mb-1.5">
        <span className="font-bold text-sm text-orange-500 font-mono tracking-tight">{chord}</span>
        {showControls && totalVariations > 1 && (
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-0.5 text-[11px] text-zinc-400 font-mono shadow-sm">
            {onPrevVariation && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevVariation();
                }}
                title="Forma anterior do acorde"
                className="hover:text-orange-400 active:scale-90 px-1 text-zinc-400 hover:bg-zinc-800 rounded transition-colors text-sm font-bold leading-none"
              >
                ‹
              </button>
            )}
            <span className="text-[10px] text-zinc-300 font-semibold select-none px-0.5">
              {variationIndex + 1}/{totalVariations}
            </span>
            {onNextVariation && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNextVariation();
                }}
                title="Próxima forma do acorde"
                className="hover:text-orange-400 active:scale-90 px-1 text-zinc-400 hover:bg-zinc-800 rounded transition-colors text-sm font-bold leading-none"
              >
                ›
              </button>
            )}
          </div>
        )}
      </div>

      <svg width={width} height={height} className="select-none overflow-visible">
        {/* Pestana superior (Nut) se baseFret == 1 */}
        {baseFret === 1 && (
          <line
            x1={padX}
            y1={padTop}
            x2={padX + fretboardWidth}
            y2={padTop}
            stroke="#f4f4f5"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}

        {/* Indicador de traste inicial se baseFret > 1 */}
        {baseFret > 1 && (
          <text
            x={padX - 6}
            y={padTop + fretSpacing / 2 + 3.5}
            fill="#ff7b00"
            fontSize="9"
            fontWeight="bold"
            textAnchor="end"
            fontFamily="monospace"
          >
            {baseFret}ª
          </text>
        )}

        {/* Linhas dos Trastes horizontais */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={padX}
            y1={padTop + i * fretSpacing}
            x2={padX + fretboardWidth}
            y2={padTop + i * fretSpacing}
            stroke="#3f3f46"
            strokeWidth="1.2"
          />
        ))}

        {/* Linhas das Cordas verticais */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`str-${i}`}
            x1={padX + i * stringSpacing}
            y1={padTop}
            x2={padX + i * stringSpacing}
            y2={padTop + fretboardHeight}
            stroke="#71717a"
            strokeWidth={1 + (numStrings - 1 - i) * 0.25}
          />
        ))}

        {/* Marcadores de cordas soltas (O), mudas (X) e dedos */}
        {frets.map((fret, stringIdx) => {
          const stringX = padX + stringIdx * stringSpacing;

          if (fret === -1) {
            return (
              <text
                key={`mute-${stringIdx}`}
                x={stringX}
                y={padTop - 6}
                fill="#ef4444"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                ✕
              </text>
            );
          }

          if (fret === 0) {
            return (
              <circle
                key={`open-${stringIdx}`}
                cx={stringX}
                cy={padTop - 8}
                r="3"
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="1.2"
              />
            );
          }

          const relativeFret = fret - baseFret + 1;
          if (relativeFret >= 1 && relativeFret <= numFrets) {
            const dotY = padTop + (relativeFret - 0.5) * fretSpacing;
            return (
              <g key={`dot-${stringIdx}`}>
                <circle
                  cx={stringX}
                  cy={dotY}
                  r="5"
                  fill="#ff7b00"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              </g>
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
};
