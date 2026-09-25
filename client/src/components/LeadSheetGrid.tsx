import React, { useState, useMemo } from 'react';
import type { ParsedSong, InstrumentType, ViewMode, Setlist, Song } from '../types/music';
import { StageTabsHeader } from './StageTabsHeader';
import { ChordDiagram } from './ChordDiagram';
import { getChordShape } from '../chordEngine/chordShapes';
import { Clock } from 'lucide-react';

interface LeadSheetGridProps {
  parsedSong: ParsedSong;
  instrument: InstrumentType;
  showDiagrams: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectChord: (chord: string) => void;
  activeSetlist?: Setlist | null;
  currentSongIndex?: number;
  totalSongsInSetlist?: number;
  nextSong?: Song;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

type TimeSignature = '4/4' | '2/4' | '3/4' | '6/8';

interface SongSection {
  title: string;
  chords: string[];
}

export const LeadSheetGrid: React.FC<LeadSheetGridProps> = ({
  parsedSong,
  instrument,
  showDiagrams,
  viewMode,
  onViewModeChange,
  onSelectChord,
  activeSetlist,
  currentSongIndex,
  totalSongsInSetlist,
  nextSong,
  isFavorite = false,
  onToggleFavorite,
}) => {
  // Reconhecimento automático inicial de fórmula de compasso
  const initialTimeSignature: TimeSignature = useMemo(() => {
    // 1. Procurar nas diretivas ChordPro se houver {time: ...}
    const fullText = parsedSong.lines.map(l => l.content).join(' ').toLowerCase();
    if (fullText.includes('2/4') || fullText.includes('samba') || fullText.includes('pagode')) {
      return '2/4';
    }
    if (fullText.includes('3/4') || fullText.includes('valsa') || fullText.includes('guarânia')) {
      return '3/4';
    }
    if (fullText.includes('6/8') || fullText.includes('toada')) {
      return '6/8';
    }
    return '4/4';
  }, [parsedSong]);

  const [timeSignature, setTimeSignature] = useState<TimeSignature>(initialTimeSignature);
  const [chordVariations, setChordVariations] = useState<Record<string, number>>({});

  // Extrair acordes agrupados por seções inteligentes (Intro, Primeira Parte, Refrão)
  const sections: SongSection[] = useMemo(() => {
    const result: SongSection[] = [];
    let currentSection: SongSection = { title: 'Harmonia Principal', chords: [] };

    parsedSong.lines.forEach((line) => {
      if (line.type === 'lyric_chord' && line.segments) {
        // Se a letra começar com termos de seção como [Refrão], [Intro] etc
        const textStart = line.segments.map(s => s.text).join('').trim();
        const sectionMatch = textStart.match(/^(intro|introdução|refrão|refr[aã]o|primeira parte|segunda parte|ponte|solo):?/i);

        if (sectionMatch) {
          if (currentSection.chords.length > 0) {
            result.push(currentSection);
          }
          currentSection = {
            title: sectionMatch[1].toUpperCase(),
            chords: [],
          };
        }

        line.segments.forEach(seg => {
          if (seg.chord) {
            currentSection.chords.push(seg.chord);
          }
        });
      }
    });

    if (currentSection.chords.length > 0) {
      result.push(currentSection);
    }

    if (result.length === 0) {
      // Fallback para todos os acordes
      const allChords: string[] = [];
      parsedSong.lines.forEach(line => {
        if (line.type === 'lyric_chord' && line.segments) {
          line.segments.forEach(seg => {
            if (seg.chord) allChords.push(seg.chord);
          });
        }
      });
      return [{ title: 'Sequência de Compassos', chords: allChords }];
    }

    return result;
  }, [parsedSong]);

  // Medida de compassos por linha conforme o tipo de compasso
  const measuresPerRow = timeSignature === '2/4' ? 4 : 4;

  return (
    <div className="text-zinc-100 font-sans select-text pb-20">
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

      {/* Barra de Configuração da Grade de Compassos */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Grade de Compassos
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-bold">
              {timeSignature}
            </span>
          </h3>
          <p className="text-xs text-zinc-400">
            {timeSignature === '2/4'
              ? 'Compasso Binário (Samba, Pagode, Choro)'
              : timeSignature === '3/4'
              ? 'Compasso Ternário (Valsa, Guarânia)'
              : timeSignature === '6/8'
              ? 'Compasso Composto (Toada, Blues)'
              : 'Compasso Quaternário padrão (4 tempos por compasso)'}
          </p>
        </div>

        {/* Seletor Rápido de Fórmula de Compasso */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
            <span className="text-zinc-500 pl-1.5 pr-1 text-xs flex items-center gap-1">
              <Clock size={12} />
              <span className="hidden sm:inline">Fórmula:</span>
            </span>
            {(['4/4', '2/4', '3/4', '6/8'] as TimeSignature[]).map(sig => (
              <button
                key={sig}
                onClick={() => setTimeSignature(sig)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  timeSignature === sig
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {sig}
              </button>
            ))}
          </div>

          <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 text-xs font-mono font-bold">
            Tom: {parsedSong.key}
          </div>
        </div>
      </div>

      {/* Renderização das Seções com Compassos Divididos */}
      <div className="space-y-6">
        {sections.map((sec, secIdx) => {
          const rows: string[][] = [];
          for (let i = 0; i < sec.chords.length; i += measuresPerRow) {
            rows.push(sec.chords.slice(i, i + measuresPerRow));
          }

          return (
            <div key={`sec-${secIdx}`} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  {sec.title}
                </h4>
                <span className="text-[10px] text-zinc-500 font-mono">
                  ({sec.chords.length} compassos)
                </span>
              </div>

              <div className="space-y-2">
                {rows.map((row, rowIdx) => (
                  <div
                    key={`r-${secIdx}-${rowIdx}`}
                    className="flex items-center bg-[#18181a] border border-zinc-800 rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="px-3 py-4 text-xs font-mono text-zinc-500 bg-[#141416] border-r border-zinc-800 select-none min-w-[40px] text-center">
                      {(rowIdx * measuresPerRow + 1).toString().padStart(2, '0')}
                    </div>

                    <div className="grid grid-cols-4 flex-1 divide-x divide-zinc-800">
                      {Array.from({ length: measuresPerRow }).map((_, colIdx) => {
                        const chord = row[colIdx];
                        return (
                          <div
                            key={`m-${secIdx}-${rowIdx}-${colIdx}`}
                            onClick={() => chord && onSelectChord(chord)}
                            className={`h-16 flex items-center justify-center font-mono text-lg sm:text-2xl font-black transition-all ${
                              chord
                                ? 'text-orange-500 hover:text-orange-400 hover:bg-zinc-800/60 cursor-pointer active:scale-95'
                                : 'text-zinc-700 bg-zinc-900/30'
                            }`}
                          >
                            {chord ? (
                              <span className="tracking-tight hover:scale-105 transition-transform">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
