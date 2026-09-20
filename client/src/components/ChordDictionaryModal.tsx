import React from 'react';
import type { InstrumentType } from '../types/music';
import { ChordDiagram } from './ChordDiagram';
import { getChordShape } from '../chordEngine/chordShapes';
import { X, Guitar } from 'lucide-react';

interface ChordDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chords: string[];
  instrument: InstrumentType;
  onToggleInstrument: () => void;
  highlightedChord?: string | null;
}

export const ChordDictionaryModal: React.FC<ChordDictionaryModalProps> = ({
  isOpen,
  onClose,
  chords,
  instrument,
  onToggleInstrument,
  highlightedChord,
}) => {
  const [modalChordVariations, setModalChordVariations] = React.useState<Record<string, number>>({});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#181818] border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#141414] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-500 border border-orange-500/30">
              <Guitar size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dicionário de Acordes</h2>
              <p className="text-xs text-zinc-400">
                {chords.length} acordes encontrados para{' '}
                <span className="text-orange-500 font-semibold">
                  {instrument === 'cavaco' ? 'Cavaco' : 'Violão e guitarra'}
                </span>
                {' · '}Use ‹ e › para alternar a forma/digitação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleInstrument}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-semibold text-orange-400 transition-colors"
            >
              Mudar para {instrument === 'cavaco' ? 'Violão' : 'Cavaco'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Grade de Diagramas */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700">
          {chords.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              Nenhum acorde detectado nesta música.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {chords.map(chord => {
                const curVar = modalChordVariations[chord] || 0;
                const shape = getChordShape(chord, instrument, curVar);
                const isSelected = highlightedChord === chord;

                return (
                  <div
                    key={`${instrument}-${chord}`}
                    className={`transition-all rounded-xl ${
                      isSelected ? 'ring-2 ring-orange-500 scale-105' : ''
                    }`}
                  >
                    <ChordDiagram
                      chordShape={shape}
                      size="md"
                      onPrevVariation={() => {
                        setModalChordVariations(prev => {
                          const cur = prev[chord] || 0;
                          const total = shape.totalVariations || 1;
                          return { ...prev, [chord]: (cur - 1 + total) % total };
                        });
                      }}
                      onNextVariation={() => {
                        setModalChordVariations(prev => {
                          const cur = prev[chord] || 0;
                          const total = shape.totalVariations || 1;
                          return { ...prev, [chord]: (cur + 1) % total };
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#141414] border-t border-zinc-800 text-center text-xs text-zinc-500 font-mono">
          {instrument === 'cavaco' ? 'Cavaco' : 'Violão e guitarra'} • Posições padrão para palco
        </div>
      </div>
    </div>
  );
};
