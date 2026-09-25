import React from 'react';
import type { ParsedSong, InstrumentType, ViewMode, Song, Setlist } from '../types/music';
import { ChordDiagram } from './ChordDiagram';
import { getChordShape } from '../chordEngine/chordShapes';
import { StageTabsHeader } from './StageTabsHeader';
import { StageTransitionCue } from './StageTransitionCue';

interface ChordSheetViewProps {
  parsedSong: ParsedSong;
  instrument: InstrumentType;
  showTablature: boolean;
  showDiagrams: boolean;
  fontSize: number;
  columns: 1 | 2;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectChord: (chord: string) => void;
  activeSetlist?: Setlist | null;
  currentSongIndex?: number;
  totalSongsInSetlist?: number;
  currentSong?: Song;
  nextSong?: Song;
  onAskAITransition?: (fromTitle: string, toTitle: string, fromKey: string, toKey: string) => void;
  showTransitionNotes?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const ChordSheetView: React.FC<ChordSheetViewProps> = ({
  parsedSong,
  instrument,
  showTablature,
  showDiagrams,
  fontSize,
  columns,
  viewMode,
  onViewModeChange,
  onSelectChord,
  activeSetlist,
  currentSongIndex,
  totalSongsInSetlist,
  currentSong,
  nextSong,
  onAskAITransition,
  showTransitionNotes = true,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [chordVariations, setChordVariations] = React.useState<Record<string, number>>({});

  return (
    <div className="text-zinc-100 font-sans select-text pb-28">
      {/* Cabeçalho Unificado de Abas */}
      <StageTabsHeader
        title={parsedSong.title}
        artist={parsedSong.artist}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        activeSetlist={activeSetlist}
        currentSongIndex={currentSongIndex}
        totalSongsInSetlist={totalSongsInSetlist}
        nextSong={nextSong}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
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

      {/* Metadados rápidos: Tom */}
      <div className="mb-3 font-mono text-sm leading-relaxed text-zinc-300 flex items-center justify-between">
        <div>
          Tom: <span className="font-bold text-orange-500">{parsedSong.key}</span>
        </div>
      </div>

      {/* Balão de Transição Harmônica para o Palco (quando em repertório) */}
      {activeSetlist && currentSong && nextSong && (
        <StageTransitionCue
          setlistId={activeSetlist.id}
          currentSong={currentSong}
          nextSong={nextSong}
          onAskAITransition={onAskAITransition}
          isVisible={showTransitionNotes}
        />
      )}

      {/* Letra e Cifra com suporte a 1 ou 2 colunas */}
      <div
        className={`font-mono select-text transition-all duration-150 ${
          columns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2' : 'space-y-3'
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {parsedSong.lines.map((line, lineIdx) => {
          if (line.type === 'empty') {
            return <div key={`empty-${lineIdx}`} className="h-4" />;
          }

          if (line.type === 'directive') {
            return null;
          }

          if (line.type === 'tab') {
            if (!showTablature) return null;

            return (
              <div
                key={`tab-${lineIdx}`}
                className="my-3 p-3.5 bg-[#1e1e1e] border border-zinc-750 rounded-xl overflow-x-auto text-sm font-mono text-zinc-300 col-span-full shadow-inner leading-relaxed"
              >
                <div className="text-xs text-orange-500 font-bold uppercase mb-1.5 font-mono">
                  Tablatura / Solo
                </div>
                <pre className="leading-relaxed whitespace-pre font-medium font-mono text-sm">{line.content}</pre>
              </div>
            );
          }

          if (line.type === 'lyric_chord' && line.segments) {
            const hasAnyChord = line.segments.some(s => !!s.chord);

            return (
              <div key={`line-${lineIdx}`} className="flex flex-wrap items-end leading-none py-0.5">
                {line.segments.map((seg, segIdx) => (
                  <div key={`seg-${segIdx}`} className="inline-flex flex-col">
                    {/* Linha do Acorde em Laranja Cifra Club */}
                    {hasAnyChord ? (
                      <span
                        onClick={() => seg.chord && onSelectChord(seg.chord)}
                        className={`font-bold transition-transform active:scale-95 whitespace-pre ${
                          seg.chord
                            ? 'text-orange-500 hover:text-orange-400 cursor-pointer hover:underline underline-offset-2 py-0.5'
                            : 'invisible select-none'
                        }`}
                        title={seg.chord ? `Ver desenho de ${seg.chord}` : undefined}
                      >
                        {seg.chord || '\u00A0'}
                      </span>
                    ) : null}

                    {/* Linha da Letra */}
                    <span className="text-zinc-200 font-sans tracking-wide leading-relaxed whitespace-pre">
                      {seg.text || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
