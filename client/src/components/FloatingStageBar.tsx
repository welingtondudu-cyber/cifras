import type { InstrumentType, ViewMode } from '../types/music';
import {
  Play,
  Pause,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  BookOpen,
  Eye,
  Guitar,
  Type,
  ListMusic,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface FloatingStageBarProps {
  // Transposição
  semitones: number;
  currentKey: string;
  originalKey: string;
  onTranspose: (delta: number) => void;
  onResetTranspose: () => void;

  // Smart Scroll
  isPlaying: boolean;
  speed: number;
  isTemporarilyPaused: boolean;
  onToggleScroll: () => void;
  onSpeedChange: (speed: number) => void;

  // Tablatura
  showTablature: boolean;
  onToggleTablature: () => void;

  // Instrumento
  instrument: InstrumentType;
  onToggleInstrument: () => void;

  // Modos de Visão
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  // Modais e Ações
  onOpenDictionary: () => void;
  onOpenAIChat: () => void;
  onOpenSongLibrary: () => void;

  // Tamanho da fonte
  fontSize: number;
  onFontSizeChange: (delta: number) => void;

  // Fullscreen
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const FloatingStageBar: React.FC<FloatingStageBarProps> = ({
  semitones,
  currentKey,
  originalKey,
  onTranspose,
  onResetTranspose,
  isPlaying,
  speed,
  isTemporarilyPaused,
  onToggleScroll,
  onSpeedChange,
  showTablature,
  onToggleTablature,
  instrument,
  onToggleInstrument,
  viewMode,
  onViewModeChange,
  onOpenDictionary,
  onOpenAIChat,
  onOpenSongLibrary,
  fontSize,
  onFontSizeChange,
  isFullscreen,
  onToggleFullscreen
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-5xl">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-wrap items-center justify-between gap-2.5 text-slate-100">

        {/* 1. Transposição de Tom */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => onTranspose(-1)}
            title="Descer 1 semitom (-1)"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 transition-all text-cyan-400"
          >
            <Minus size={15} />
          </button>

          <div className="px-2 flex flex-col items-center select-none min-w-[52px]">
            <span className="text-xs font-mono font-black text-cyan-300 leading-tight">
              {currentKey}
            </span>
            <span className="text-[9px] text-slate-400 leading-tight font-sans">
              {semitones === 0 ? 'Orig' : `${semitones > 0 ? '+' : ''}${semitones}st`}
            </span>
          </div>

          <button
            onClick={() => onTranspose(1)}
            title="Subir 1 semitom (+1)"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 transition-all text-cyan-400"
          >
            <Plus size={15} />
          </button>

          {semitones !== 0 && (
            <button
              onClick={onResetTranspose}
              title={`Voltar ao tom original (${originalKey})`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* 2. Smart Scroll (Play, Velocidade e Pausa Inteligente) */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={onToggleScroll}
            title={isPlaying ? 'Pausar Rolagem' : 'Iniciar Smart Scroll'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 ${
              isPlaying
                ? isTemporarilyPaused
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={14} />
                <span>{isTemporarilyPaused ? 'Pausa (2s)' : 'Pausar'}</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Scroll</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[10px] text-slate-400 font-mono select-none">Vel:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={e => onSpeedChange(Number(e.target.value))}
              className="w-16 sm:w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              title={`Velocidade de rolagem: ${speed}/10`}
            />
            <span className="text-xs font-mono font-bold text-cyan-400 w-4 text-center">
              {speed}
            </span>
          </div>
        </div>

        {/* 3. Instrumento: Cavaco vs Violão */}
        <button
          onClick={onToggleInstrument}
          title="Alternar instrumento do dicionário de acordes"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-xs font-semibold transition-all active:scale-95"
        >
          <Guitar size={15} className="text-amber-400" />
          <span className="capitalize font-mono text-amber-300">
            {instrument === 'cavaco' ? 'Cavaco (D-G-B-D)' : 'Violão (6C)'}
          </span>
        </button>

        {/* 4. Switch de Tablatura */}
        <button
          onClick={onToggleTablature}
          title="Mostrar ou ocultar tablaturas e solos"
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
            showTablature
              ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye size={14} />
          <span className="hidden sm:inline">Tabs:</span>
          <span>{showTablature ? 'ON' : 'OFF'}</span>
        </button>

        {/* 5. Modos de Visualização (Cifra / Grade / Graus) */}
        <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => onViewModeChange('chordpro')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'chordpro'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cifra
          </button>
          <button
            onClick={() => onViewModeChange('leadSheet')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'leadSheet'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Compassos
          </button>
          <button
            onClick={() => onViewModeChange('degrees')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'degrees'
                ? 'bg-violet-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Graus
          </button>
        </div>

        {/* 6. Botões Rápidos: Dicionário, IA e Letra */}
        <div className="flex items-center gap-1.5">
          {/* Zoom da Fonte */}
          <div className="hidden md:flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onFontSizeChange(-2)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
              title="Diminuir fonte"
            >
              <Type size={12} />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-400">{fontSize}px</span>
            <button
              onClick={() => onFontSizeChange(2)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
              title="Aumentar fonte"
            >
              <Type size={15} />
            </button>
          </div>

          {/* Dicionário de Acordes */}
          <button
            onClick={onOpenDictionary}
            title="Dicionário de Acordes da Música"
            className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 transition-all active:scale-95"
          >
            <BookOpen size={16} />
          </button>

          {/* Chat Harmônico IA */}
          <button
            onClick={onOpenAIChat}
            title="Chat Harmônico com IA de Palco"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
          >
            <Sparkles size={14} className="animate-spin-slow" />
            <span className="hidden sm:inline">Harmonic IA</span>
          </button>

          {/* Músicas / Repertório */}
          <button
            onClick={onOpenSongLibrary}
            title="Repertório e Músicas"
            className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <ListMusic size={16} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Palco Fullscreen'}
            className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 transition-all active:scale-95"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

      </div>
    </div>
  );
};
