import React from 'react';
import type { ParsedSong, ViewMode, InstrumentType } from '../types/music';
import { chordToHarmonicDegree } from '../chordEngine/functionalHarmony';
import { StageTabsHeader } from './StageTabsHeader';
import { ChordDiagram } from './ChordDiagram';
import { getChordShape } from '../chordEngine/chordShapes';

interface DegreeGridProps {
  parsedSong: ParsedSong;
  instrument: InstrumentType;
  showDiagrams: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectChord: (chord: string) => void;
}

export const DegreeGrid: React.FC<DegreeGridProps> = ({
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

  return (
    <div className="text-zinc-100 font-sans select-text pb-20">
      {/* Cabeçalho Unificado de Abas */}
      <StageTabsHeader
        title={parsedSong.title}
        artist={parsedSong.artist}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {/* Carrossel Horizontal de Diagramas SVG de Acordes */}
      {showDiagrams && parsedSong.chords.length > 0 && (
        <div className="mb-6 pb-4 border-b border-zinc-800 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700">
          <div className="flex items-center gap-3">
            {parsedSong.chords.map(chord => {
              const shape = getChordShape(chord, instrument);
              return (
                <div
                  key={`${instrument}-${chord}`}
                  onClick={() => onSelectChord(chord)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <ChordDiagram chordShape={shape} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Grade em Graus (Harmonia Funcional)
          </h3>
          <p className="text-xs text-zinc-400">Análise funcional romana (I, IV, V7, vi)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-sans">Tônica:</span>
          <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-mono font-bold">
            {parsedSong.key} (Grau I)
          </span>
        </div>
      </div>

      {chordSequence.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 bg-[#181818] rounded-xl border border-zinc-800">
          Nenhum acorde detectado para análise em Graus.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, rowIdx) => (
            <div
              key={`degree-row-${rowIdx}`}
              className="flex items-center bg-[#181818] border border-zinc-800 rounded-xl overflow-hidden shadow-md"
            >
              <div className="px-3.5 py-4 text-xs font-mono text-zinc-500 bg-[#141414] border-r border-zinc-800 select-none">
                {(rowIdx * measuresPerRow + 1).toString().padStart(2, '0')}
              </div>

              <div className="grid grid-cols-4 flex-1 divide-x divide-zinc-800">
                {Array.from({ length: measuresPerRow }).map((_, colIdx) => {
                  const chord = row[colIdx];
                  const degree = chord ? chordToHarmonicDegree(chord, parsedSong.key) : '';

                  return (
                    <div
                      key={`d-${rowIdx}-${colIdx}`}
                      onClick={() => chord && onSelectChord(chord)}
                      className={`h-20 flex flex-col items-center justify-center p-2 transition-all ${
                        chord
                          ? 'hover:bg-zinc-800/50 cursor-pointer'
                          : 'text-zinc-700 bg-zinc-900/30'
                      }`}
                    >
                      {chord ? (
                        <>
                          <span className="font-mono text-xl sm:text-2xl font-black text-orange-400 tracking-tight">
                            {degree}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400 mt-0.5">
                            ({chord})
                          </span>
                        </>
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
