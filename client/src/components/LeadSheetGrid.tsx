import React from 'react';
import type { ParsedSong, ViewMode, InstrumentType } from '../types/music';
import { StageTabsHeader } from './StageTabsHeader';
import { ChordDiagram } from './ChordDiagram';
import { getChordShape } from '../chordEngine/chordShapes';

interface LeadSheetGridProps {
  parsedSong: ParsedSong;
  instrument: InstrumentType;
  showDiagrams: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectChord: (chord: string) => void;
}

export const LeadSheetGrid: React.FC<LeadSheetGridProps> = ({
  parsedSong,
  instrument,
  showDiagrams,
  viewMode,
  onViewModeChange,
  onSelectChord,
}) => {
  const chordSequence: string[] = [];
  parsedSong.lines.forEach(line => {
    if (line.type === 'lyric_chord' && line.segments) {
      line.segments.forEach(seg => {
        if (seg.chord) {
          chordSequence.push(seg.chord);
        }
      });
    }
  });

  const measuresPerRow = 4;
  const rows: string[][] = [];
  for (let i = 0; i < chordSequence.length; i += measuresPerRow) {
    rows.push(chordSequence.slice(i, i + measuresPerRow));
  }

  const [chordVariations, setChordVariations] = React.useState<Record<string, number>>({});

  return (
    <div className="text-zinc-100 font-sans select-text pb-20">
      {/* Cabeçalho Unificado de Abas */}
      <StageTabsHeader
        title={parsedSong.title}
        artist={parsedSong.artist}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {/* Carrossel Horizontal de Diagramas SVG de Acordes com Troca de Forma */}
      {showDiagrams && parsedSong.chords.length > 0 && (
        <div className="mb-6 pb-4 border-b border-zinc-800 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700">
          <div className="flex items-center gap-3">
            {parsedSong.chords.map(chord => {
              const currentVar = chordVariations[chord] || 0;
              const shape = getChordShape(chord, instrument, currentVar);
              return (
                <div
                  key={`${instrument}-${chord}`}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <ChordDiagram
                    chordShape={shape}
                    size="sm"
                    onPrevVariation={() => {
                      setChordVariations(prev => {
                        const cur = prev[chord] || 0;
                        const total = shape.totalVariations || 1;
                        return { ...prev, [chord]: (cur - 1 + total) % total };
                      });
                    }}
                    onNextVariation={() => {
                      setChordVariations(prev => {
                        const cur = prev[chord] || 0;
                        const total = shape.totalVariations || 1;
                        return { ...prev, [chord]: (cur + 1) % total };
                      });
                    }}
                    onClick={() => onSelectChord(chord)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Grade de Compassos (Harmonia Pura)
          </h3>
          <p className="text-xs text-zinc-400">Organizada em compassos de 4 tempos</p>
        </div>
        <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-mono font-bold">
          Tom: {parsedSong.key}
        </div>
      </div>

      {chordSequence.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 bg-[#181818] rounded-xl border border-zinc-800">
          Nenhum acorde detectado para gerar a Grade de Compassos.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="flex items-center bg-[#181818] border border-zinc-800 rounded-xl overflow-hidden shadow-md"
            >
              <div className="px-3.5 py-4 text-xs font-mono text-zinc-500 bg-[#141414] border-r border-zinc-800 select-none">
                {(rowIdx * measuresPerRow + 1).toString().padStart(2, '0')}
              </div>

              <div className="grid grid-cols-4 flex-1 divide-x divide-zinc-800">
                {Array.from({ length: measuresPerRow }).map((_, colIdx) => {
                  const chord = row[colIdx];
                  return (
                    <div
                      key={`m-${rowIdx}-${colIdx}`}
                      onClick={() => chord && onSelectChord(chord)}
                      className={`h-16 flex items-center justify-center font-mono text-lg sm:text-2xl font-black transition-all ${
                        chord
                          ? 'text-orange-500 hover:text-orange-400 hover:bg-zinc-800/50 cursor-pointer'
                          : 'text-zinc-700 bg-zinc-900/30'
                      }`}
                    >
                      {chord ? (
                        <span className="tracking-tight hover:scale-110 transition-transform">
                          {chord}
                        </span>
                      ) : (
                        <span className="text-zinc-700 font-normal text-sm">%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
