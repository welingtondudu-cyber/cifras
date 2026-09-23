import React, { useState } from 'react';
import type { AcademyModule, InstrumentType } from '../../types/music';
import { getChordShape } from '../../chordEngine/chordShapes';
import { ChordDiagram } from '../ChordDiagram';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Sparkles,
  Guitar,
  X,
  Share2
} from 'lucide-react';

interface AcademyLessonModalProps {
  module: AcademyModule;
  levelTitle: string;
  levelNumber: number;
  isCompleted: boolean;
  onToggleComplete: (moduleId: number) => void;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  onAskAI?: (prompt: string) => void;
}

export const AcademyLessonModal: React.FC<AcademyLessonModalProps> = ({
  module,
  levelTitle,
  levelNumber,
  isCompleted,
  onToggleComplete,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  onAskAI
}) => {
  const [instrument, setInstrument] = useState<InstrumentType>('cavaco');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Estou estudando "${module.title}" no CIFRALAB Academia! 🎸`
      );
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* BARRA SUPERIOR DE NAVEGAÇÃO E CABEÇALHO */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800/90 bg-[#141414] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Voltar para a Trilha"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#ff7b00]">
                  NÍVEL {levelNumber} • {levelTitle}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 truncate max-w-md">
                Aula {module.number}: {module.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Ícone de IA para tirar dúvidas e apoio na aula (Abre o chat limpo para o usuário digitar) */}
            {onAskAI && (
              <button
                onClick={() => onAskAI('')}
                className="p-2 rounded-lg bg-orange-500/15 hover:bg-orange-500 text-orange-400 hover:text-zinc-950 border border-orange-500/30 transition-all shadow-sm active:scale-95"
                title="Tirar dúvidas com a IA"
              >
                <Sparkles size={16} />
              </button>
            )}

            {/* Navegação Entre Lições */}
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Lição Anterior"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Próxima Lição"
            >
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors ml-1"
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* CORPO DA LIÇÃO (LEITURA SEM DISTRAÇÕES) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 text-zinc-200">
          
          {/* TÍTULO E META */}
          <div className="space-y-2 pb-4 border-b border-zinc-800/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ff7b00]/15 text-[#ff7b00] border border-[#ff7b00]/30 flex items-center gap-1.5">
                  <BookOpen size={13} />
                  Módulo {levelNumber}.{module.number}
                </span>
                {module.time_estimate && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-400 flex items-center gap-1">
                    <Clock size={12} />
                    {module.time_estimate}
                  </span>
                )}
              </div>

              {isCompleted ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 size={14} className="fill-emerald-500/20" />
                  Lição Concluída
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
                  <Circle size={13} />
                  Em Andamento
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {module.title}
            </h1>
          </div>

          {/* SEÇÃO 1: CONCEITO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-[#ff7b00]"></span>
              Conceito Teórico
            </div>
            <div className="bg-[#121212] border border-zinc-800 rounded-xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-zinc-300">
              {module.concept}
            </div>
          </div>

          {/* SEÇÃO 2: EXEMPLO PRÁTICO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#ff7b00]">
              <Sparkles size={16} />
              Aplicação & Exemplo Prático de Palco
            </div>
            <div className="bg-gradient-to-br from-[#181818] to-[#141414] border border-[#ff7b00]/30 rounded-xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-zinc-100 shadow-md">
              <p className="font-mono text-xs sm:text-sm text-amber-200/90 whitespace-pre-wrap">
                {module.practical_example}
              </p>
            </div>
          </div>

          {/* SEÇÃO 3: ACORDES CHAVE NO INSTRUMENTO (SE DISPONÍVEL) */}
          {module.key_chords && module.key_chords.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                  <Guitar size={16} className="text-[#ff7b00]" />
                  Mapeamento de Acordes no Instrumento
                </div>
                {/* Seletor de instrumento para visualizar na aula */}
                <div className="flex items-center bg-[#121212] p-1 rounded-lg border border-zinc-800 text-xs">
                  <button
                    onClick={() => setInstrument('cavaco')}
                    className={`px-3 py-1 rounded font-semibold transition-colors ${
                      instrument === 'cavaco'
                        ? 'bg-[#ff7b00] text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Cavaco (DGBD)
                  </button>
                  <button
                    onClick={() => setInstrument('violao')}
                    className={`px-3 py-1 rounded font-semibold transition-colors ${
                      instrument === 'violao'
                        ? 'bg-[#ff7b00] text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Violão (EADGBE)
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {module.key_chords.map((chordName) => {
                  const shape = getChordShape(chordName, instrument, 0);
                  return (
                    <ChordDiagram
                      key={chordName}
                      chordShape={shape}
                      size="sm"
                      showControls={false}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* SEÇÃO 4: EXERCÍCIO DE FIXAÇÃO */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Exercício Prático de Fixação
            </div>
            <div className="bg-[#121212] border border-zinc-800 rounded-xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-zinc-300">
              <p>{module.exercise}</p>
            </div>
          </div>

        </div>

        {/* BARRA INFERIOR DE CONCLUSÃO E AÇÃO PRINCIPAL */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/90 bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onToggleComplete(module.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                  : 'bg-[#ff7b00] hover:bg-[#ff8f1f] text-zinc-950 shadow-orange-950/40'
              }`}
            >
              <CheckCircle2
                size={18}
                className={isCompleted ? 'fill-white/20' : 'text-zinc-950'}
              />
              <span>{isCompleted ? 'Lição Concluída ✓' : 'Marcar como Concluída'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
              title="Compartilhar aula"
            >
              <Share2 size={17} />
            </button>
            {copiedNotice && (
              <span className="text-xs text-emerald-400 font-medium">Link copiado!</span>
            )}
          </div>

          {hasNext && (
            <button
              onClick={onNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-sm font-semibold transition-colors border border-zinc-700/80 active:scale-95"
            >
              <span>Avançar para a Próxima Lição</span>
              <ArrowRight size={16} className="text-[#ff7b00]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
