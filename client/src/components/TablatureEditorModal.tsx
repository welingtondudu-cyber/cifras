import React, { useState, useMemo } from 'react';
import type { InstrumentType } from '../types/music';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  Guitar,
  FileText,
  Grid,
  CornerDownLeft,
  RotateCcw
} from 'lucide-react';

interface TablatureEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  instrument: InstrumentType;
  onInsertTablature: (tabChordPro: string) => void;
}

interface MeasureData {
  id: string;
  notes: Record<string, string[]>; // stringIndex -> array of 8 or 16 step values
}

export const TablatureEditorModal: React.FC<TablatureEditorModalProps> = ({
  isOpen,
  onClose,
  instrument: defaultInstrument,
  onInsertTablature,
}) => {
  const [instrument, setInstrument] = useState<InstrumentType>(defaultInstrument);
  const [viewMode, setViewMode] = useState<'visual' | 'ascii'>('visual');
  const [copied, setCopied] = useState(false);

  // Cordas por instrumento: do agudo para o grave
  const stringNames = useMemo(() => {
    return instrument === 'cavaco'
      ? ['D', 'B', 'G', 'D'] // 1ª à 4ª
      : ['E', 'B', 'G', 'D', 'A', 'E']; // 1ª à 6ª
  }, [instrument]);

  const STEPS_PER_MEASURE = 8; // 8 subdivisões por compasso para mobile confortável

  // Estado dos compassos
  const [measures, setMeasures] = useState<MeasureData[]>([
    {
      id: 'm-1',
      notes: {
        '0': Array(STEPS_PER_MEASURE).fill('-'),
        '1': Array(STEPS_PER_MEASURE).fill('-'),
        '2': Array(STEPS_PER_MEASURE).fill('-'),
        '3': Array(STEPS_PER_MEASURE).fill('-'),
        '4': Array(STEPS_PER_MEASURE).fill('-'),
        '5': Array(STEPS_PER_MEASURE).fill('-'),
      }
    }
  ]);

  // Célula ativa selecionada para digitação
  const [selectedCell, setSelectedCell] = useState<{
    measureIdx: number;
    strIdx: number;
    stepIdx: number;
  } | null>({ measureIdx: 0, strIdx: 0, stepIdx: 0 });

  // Texto ASCII livre (bidirecional)
  const [asciiText, setAsciiText] = useState('');

  // Gerar representação ASCII a partir da grade visual
  const generatedAscii = useMemo(() => {
    let result = '';
    stringNames.forEach((strName, strIdx) => {
      let line = `${strName}|`;
      measures.forEach(m => {
        const steps = m.notes[strIdx.toString()] || Array(STEPS_PER_MEASURE).fill('-');
        steps.forEach(st => {
          line += st === '-' ? '--' : `-${st}-`.slice(0, 2);
        });
        line += '|';
      });
      result += line + '\n';
    });
    return result;
  }, [stringNames, measures]);

  // Preencher valor na célula selecionada
  const handleSetFret = (val: string) => {
    if (!selectedCell) return;
    const { measureIdx, strIdx, stepIdx } = selectedCell;

    setMeasures(prev => {
      const updated = [...prev];
      const measure = { ...updated[measureIdx] };
      const notes = { ...measure.notes };
      const strNotes = [...(notes[strIdx.toString()] || Array(STEPS_PER_MEASURE).fill('-'))];

      strNotes[stepIdx] = val;
      notes[strIdx.toString()] = strNotes;
      measure.notes = notes;
      updated[measureIdx] = measure;
      return updated;
    });

    // Avançar automaticamente para o próximo passo
    if (stepIdx + 1 < STEPS_PER_MEASURE) {
      setSelectedCell({ measureIdx, strIdx, stepIdx: stepIdx + 1 });
    } else if (measureIdx + 1 < measures.length) {
      setSelectedCell({ measureIdx: measureIdx + 1, strIdx, stepIdx: 0 });
    }
  };

  // Adicionar novo compasso
  const handleAddMeasure = () => {
    const newId = `m-${Date.now()}`;
    const emptyNotes: Record<string, string[]> = {};
    stringNames.forEach((_, idx) => {
      emptyNotes[idx.toString()] = Array(STEPS_PER_MEASURE).fill('-');
    });

    setMeasures(prev => [...prev, { id: newId, notes: emptyNotes }]);
  };

  // Limpar grade
  const handleClearAll = () => {
    const emptyNotes: Record<string, string[]> = {};
    stringNames.forEach((_, idx) => {
      emptyNotes[idx.toString()] = Array(STEPS_PER_MEASURE).fill('-');
    });
    setMeasures([{ id: 'm-1', notes: emptyNotes }]);
    setSelectedCell({ measureIdx: 0, strIdx: 0, stepIdx: 0 });
  };

  // Inserir na Cifra
  const handleInsert = () => {
    const finalTab = viewMode === 'ascii' && asciiText.trim() ? asciiText.trim() : generatedAscii.trim();
    const chordProTab = `\n{sot}\n${finalTab}\n{eot}\n`;
    onInsertTablature(chordProTab);
    onClose();
  };

  // Copiar ASCII
  const handleCopyAscii = () => {
    const content = viewMode === 'ascii' ? asciiText : generatedAscii;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Se o modal estiver fechado, não renderiza JSX (mas todos os hooks já foram chamados no topo)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Guitar size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                TabLab • Editor de Tablaturas
              </h3>
              <p className="text-[11px] text-zinc-400">
                Visual e ASCII para {instrument === 'cavaco' ? 'Cavaco (4C)' : 'Violão (6C)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Instrumento */}
            <button
              onClick={() =>
                setInstrument(prev => (prev === 'cavaco' ? 'violao' : 'cavaco'))
              }
              className="text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 px-2.5 py-1 rounded-lg transition-colors border border-orange-500/30"
            >
              {instrument === 'cavaco' ? 'Cavaco' : 'Violão'}
            </button>

            {/* Alternar Visual / ASCII */}
            <div className="flex items-center bg-zinc-850 p-0.5 rounded-lg border border-zinc-750">
              <button
                onClick={() => setViewMode('visual')}
                className={`p-1.5 rounded text-xs ${
                  viewMode === 'visual'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Modo Grade Visual"
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => {
                  setAsciiText(generatedAscii);
                  setViewMode('ascii');
                }}
                className={`p-1.5 rounded text-xs ${
                  viewMode === 'ascii'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Modo Texto ASCII"
              >
                <FileText size={14} />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Corpo do Editor */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {viewMode === 'visual' ? (
            <div>
              {/* Grade de Compassos com Rolagem Horizontal */}
              <div className="overflow-x-auto pb-2 border border-zinc-800 rounded-xl bg-zinc-900/60 p-3 scrollbar-thin scrollbar-thumb-zinc-700">
                <div className="flex items-start gap-4 min-w-max">
                  {measures.map((measure, mIdx) => (
                    <div
                      key={measure.id}
                      className="bg-[#202024] border border-zinc-750 rounded-xl p-2.5 flex flex-col"
                    >
                      <div className="text-[10px] font-mono font-bold text-zinc-400 mb-1 flex items-center justify-between">
                        <span>Compasso {mIdx + 1}</span>
                        {measures.length > 1 && (
                          <button
                            onClick={() =>
                              setMeasures(prev => prev.filter((_, idx) => idx !== mIdx))
                            }
                            className="text-zinc-500 hover:text-red-400 p-0.5"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>

                      {/* As cordas */}
                      <div className="space-y-1">
                        {stringNames.map((sName, sIdx) => {
                          const steps =
                            measure.notes[sIdx.toString()] ||
                            Array(STEPS_PER_MEASURE).fill('-');

                          return (
                            <div key={sIdx} className="flex items-center gap-1.5">
                              <span className="w-4 text-xs font-mono font-bold text-orange-400">
                                {sName}
                              </span>
                              <div className="flex items-center gap-1">
                                {steps.map((val, stepIdx) => {
                                  const isSelected =
                                    selectedCell?.measureIdx === mIdx &&
                                    selectedCell?.strIdx === sIdx &&
                                    selectedCell?.stepIdx === stepIdx;

                                  return (
                                    <button
                                      key={stepIdx}
                                      onClick={() =>
                                        setSelectedCell({
                                          measureIdx: mIdx,
                                          strIdx: sIdx,
                                          stepIdx,
                                        })
                                      }
                                      className={`w-7 h-7 font-mono text-xs font-bold rounded flex items-center justify-center transition-all ${
                                        isSelected
                                          ? 'bg-orange-500 text-white ring-2 ring-orange-300 scale-105'
                                          : val !== '-'
                                          ? 'bg-zinc-800 text-orange-400 border border-zinc-700'
                                          : 'bg-zinc-850 text-zinc-500 hover:bg-zinc-800'
                                      }`}
                                    >
                                      {val}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Botão Adicionar Compasso */}
                  <button
                    onClick={handleAddMeasure}
                    className="h-full min-h-[140px] px-4 rounded-xl border-2 border-dashed border-zinc-700 hover:border-orange-500/50 flex flex-col items-center justify-center gap-1.5 text-zinc-400 hover:text-orange-400 transition-colors"
                  >
                    <Plus size={20} />
                    <span className="text-xs font-bold">+ Compasso</span>
                  </button>
                </div>
              </div>

              {/* Teclado Numérico de Trastes para Toque no Celular */}
              <div className="mt-3 bg-[#202024] p-3 rounded-xl border border-zinc-750">
                <div className="text-[11px] font-mono text-zinc-400 mb-2 flex items-center justify-between">
                  <span>Toque para digitar o traste na posição selecionada:</span>
                  <button
                    onClick={handleClearAll}
                    className="text-zinc-400 hover:text-red-400 flex items-center gap-1 text-[10px]"
                  >
                    <RotateCcw size={11} /> Limpar
                  </button>
                </div>

                <div className="grid grid-cols-8 gap-1.5 mb-2">
                  {['0', '1', '2', '3', '4', '5', '6', '7'].map(num => (
                    <button
                      key={num}
                      onClick={() => handleSetFret(num)}
                      className="h-9 rounded-lg bg-zinc-800 hover:bg-orange-500 hover:text-white font-mono font-bold text-sm text-zinc-200 active:scale-90 transition-all border border-zinc-700"
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-8 gap-1.5 mb-2">
                  {['8', '9', '10', '11', '12', '13', '14', '15'].map(num => (
                    <button
                      key={num}
                      onClick={() => handleSetFret(num)}
                      className="h-9 rounded-lg bg-zinc-800 hover:bg-orange-500 hover:text-white font-mono font-bold text-xs text-zinc-200 active:scale-90 transition-all border border-zinc-700"
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Técnicas e Limpeza */}
                <div className="grid grid-cols-6 gap-1.5">
                  <button
                    onClick={() => handleSetFret('-')}
                    className="h-8 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 font-mono text-xs font-bold"
                  >
                    Vazio (-)
                  </button>
                  <button
                    onClick={() => handleSetFret('h')}
                    className="h-8 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-orange-400 font-mono text-xs font-bold"
                  >
                    h (hammer)
                  </button>
                  <button
                    onClick={() => handleSetFret('p')}
                    className="h-8 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-orange-400 font-mono text-xs font-bold"
                  >
                    p (pull-off)
                  </button>
                  <button
                    onClick={() => handleSetFret('/')}
                    className="h-8 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-orange-400 font-mono text-xs font-bold"
                  >
                    / (slide)
                  </button>
                  <button
                    onClick={() => handleSetFret('~')}
                    className="h-8 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-orange-400 font-mono text-xs font-bold"
                  >
                    ~ (vibrato)
                  </button>
                  <button
                    onClick={() => handleSetFret('b')}
                    className="h-8 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-orange-400 font-mono text-xs font-bold"
                  >
                    b (bend)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Modo Texto ASCII */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Edite ou cole sua tablatura em formato texto:</span>
                  <button
                    onClick={handleCopyAscii}
                    className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <textarea
                  value={asciiText}
                  onChange={e => setAsciiText(e.target.value)}
                  rows={8}
                  className="w-full bg-[#1e1e20] border border-zinc-750 rounded-xl p-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-orange-500 leading-relaxed"
                  placeholder="E|--------------------|\nB|--------------------|\n..."
                />
              </div>
            </div>
          )}

          {/* Preview Rápido */}
          <div className="p-3 bg-[#161618] border border-zinc-800 rounded-xl">
            <div className="text-[10px] font-mono uppercase text-orange-400 font-bold mb-1 flex items-center justify-between">
              <span>Prévia da Tablatura</span>
              <button
                onClick={handleCopyAscii}
                className="text-zinc-400 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-tight">
              {viewMode === 'ascii' ? asciiText : generatedAscii}
            </pre>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-4 py-3 border-t border-zinc-800 bg-[#161618] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleInsert}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all"
          >
            <CornerDownLeft size={14} />
            <span>Inserir na Cifra</span>
          </button>
        </div>
      </div>
    </div>
  );
};
