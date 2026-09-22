import React, { useState } from 'react';
import type { ViewMode } from '../types/music';
import {
  Play,
  Pause,
  Minus,
  Plus,
  RotateCcw,
  Music2,
  FileText,
  Grid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders
} from 'lucide-react';

interface SongFloatingToolbarProps {
  currentKey: string;
  originalKey: string;
  semitones: number;
  onTranspose: (delta: number) => void;
  onResetTranspose: () => void;

  isPlaying: boolean;
  speed: number;
  isTemporarilyPaused: boolean;
  onToggleScroll: () => void;
  onSpeedChange: (speed: number) => void;

  scrollCycles?: 1 | 2;
  currentCycle?: number;
  onSetScrollCycles?: (cycles: 1 | 2) => void;
  autoAdvanceEnabled?: boolean;
  onSetAutoAdvanceEnabled?: (enabled: boolean) => void;
  isInSetlist?: boolean;

  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  onOpenOptions: () => void;
  onToggleAIPanel?: () => void;

  onPrevSong?: () => void;
  onNextSong?: () => void;
  hasPrevSong?: boolean;
  hasNextSong?: boolean;
}

export const SongFloatingToolbar: React.FC<SongFloatingToolbarProps> = ({
  currentKey,
  originalKey,
  semitones,
  onTranspose,
  onResetTranspose,
  isPlaying,
  speed,
  isTemporarilyPaused,
  onToggleScroll,
  onSpeedChange,
  scrollCycles = 1,
  currentCycle = 1,
  onSetScrollCycles,
  autoAdvanceEnabled = true,
  onSetAutoAdvanceEnabled,
  isInSetlist = false,
  viewMode,
  onViewModeChange,
  onOpenOptions,
  onToggleAIPanel,
  onPrevSong,
  onNextSong,
  hasPrevSong = false,
  hasNextSong = false,
}) => {
  const [showKeyPopover, setShowKeyPopover] = useState(false);
  const [showScrollPopover, setShowScrollPopover] = useState(false);

  const hasNavigation = isInSetlist || onPrevSong !== undefined || onNextSong !== undefined;

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-md pointer-events-auto select-none">
      {/* Popover Rápido de Tom */}
      {showKeyPopover && (
        <div className="mb-2 p-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl flex items-center justify-between text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Tom Original:</span>
            <span className="text-xs font-mono font-bold text-zinc-200">{originalKey}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTranspose(-1)}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center text-orange-400 font-bold"
              title="Descer meio tom"
            >
              <Minus size={15} />
            </button>

            <span className="font-mono font-black text-sm text-orange-400 min-w-[32px] text-center">
              {currentKey}
            </span>

            <button
              onClick={() => onTranspose(1)}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center text-orange-400 font-bold"
              title="Subir meio tom"
            >
              <Plus size={15} />
            </button>

            {semitones !== 0 && (
              <button
                onClick={() => {
                  onResetTranspose();
                  setShowKeyPopover(false);
                }}
                className="p-1 text-zinc-400 hover:text-white ml-1"
                title="Restaurar tom original"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Popover Rápido de Configurações de Rolagem (Velocidade, 1x/2x e Avanço Automático) */}
      {showScrollPopover && (
        <div className="mb-2 p-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col gap-2.5 text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">Velocidade:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={e => onSpeedChange(Number(e.target.value))}
              className="flex-1 accent-orange-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono font-bold text-xs text-orange-400 w-4 text-center">
              {speed}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400">Ciclos:</span>
              <div className="flex items-center bg-zinc-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => onSetScrollCycles?.(1)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                    scrollCycles === 1 ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => onSetScrollCycles?.(2)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                    scrollCycles === 2 ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  2x
                </button>
              </div>
            </div>

            {hasNavigation && onSetAutoAdvanceEnabled && (
              <button
                type="button"
                onClick={() => onSetAutoAdvanceEnabled(!autoAdvanceEnabled)}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                  autoAdvanceEnabled
                    ? 'border-orange-500/40 text-orange-400 bg-orange-500/10'
                    : 'border-zinc-700 text-zinc-400 bg-zinc-800'
                }`}
                title="Passar para a próxima cifra do repertório automaticamente ao fim da rolagem"
              >
                <span>Avanço Auto</span>
                <span className={`w-1.5 h-1.5 rounded-full ${autoAdvanceEnabled ? 'bg-orange-400' : 'bg-zinc-600'}`} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pílula Principal Discreta */}
      <div className="bg-[#18181b]/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-zinc-750/90 rounded-full px-2.5 py-1.5 shadow-2xl shadow-black/70 flex items-center justify-between text-zinc-300 gap-1">
        {/* Setinha Anterior (Quando em Repertório) */}
        {hasNavigation && onPrevSong && (
          <>
            <button
              onClick={onPrevSong}
              disabled={!hasPrevSong}
              className="p-1.5 rounded-full text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 disabled:opacity-20 active:scale-90 transition-all shrink-0"
              title="Música anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="h-5 w-px bg-zinc-800" />
          </>
        )}

        {/* 1. Botão Tom (sem setinha de expandir) */}
        <button
          onClick={() => {
            setShowKeyPopover(prev => !prev);
            setShowScrollPopover(false);
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all active:scale-95 ${
            showKeyPopover || semitones !== 0
              ? 'text-orange-400 bg-orange-500/10 font-bold'
              : 'hover:text-white'
          }`}
          title="Alterar Tom"
        >
          <span className="text-xs font-mono font-extrabold text-orange-400 leading-tight">
            {currentKey}
          </span>
          <span className="text-[10px] text-zinc-400 tracking-tight leading-none mt-0.5">Tom</span>
        </button>

        <div className="h-5 w-px bg-zinc-800" />

        {/* 2. Botão Rolagem com clique para tocar/pausar e indicador de repetição */}
        <div className="flex items-center">
          <button
            onClick={onToggleScroll}
            className={`flex flex-col items-center justify-center py-1 pl-2.5 pr-1.5 rounded-l-full transition-all active:scale-95 ${
              isPlaying
                ? isTemporarilyPaused
                  ? 'text-amber-400 animate-pulse'
                  : 'text-orange-400 font-bold'
                : 'hover:text-white'
            }`}
            title={isPlaying ? 'Pausar rolagem' : 'Iniciar rolagem automática'}
          >
            {isPlaying ? (
              <Pause size={14} className="text-orange-400" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
            <span className="text-[10px] tracking-tight leading-none mt-0.5 flex items-center gap-1">
              <span>{isPlaying ? (isTemporarilyPaused ? 'Pausa' : 'Pausar') : 'Rolagem'}</span>
              {scrollCycles === 2 && (
                <span className="text-[9px] px-1 rounded bg-orange-500/20 text-orange-400 font-mono font-bold">
                  {isPlaying ? `${currentCycle}/2` : '2x'}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowScrollPopover(prev => !prev);
              setShowKeyPopover(false);
            }}
            className="py-2 pr-2 pl-0.5 text-zinc-500 hover:text-zinc-200 transition-colors"
            title="Ajustar velocidade e repetição da rolagem"
          >
            <Sliders size={11} />
          </button>
        </div>

        <div className="h-5 w-px bg-zinc-800" />

        {/* 3. Botão Modo (Cifra / Compasso / Graus) */}
        <button
          onClick={() => {
            if (viewMode === 'chordpro') onViewModeChange('leadSheet');
            else if (viewMode === 'leadSheet') onViewModeChange('degrees');
            else onViewModeChange('chordpro');
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all hover:text-white active:scale-95"
          title={`Alternar modo (Atual: ${viewMode})`}
        >
          {viewMode === 'chordpro' && <FileText size={14} className="text-zinc-200" />}
          {viewMode === 'leadSheet' && <Grid size={14} className="text-amber-400" />}
          {viewMode === 'degrees' && <Music2 size={14} className="text-violet-400" />}
          <span className="text-[10px] tracking-tight leading-none mt-0.5">
            {viewMode === 'chordpro' ? 'Cifra' : viewMode === 'leadSheet' ? 'Compasso' : 'Graus'}
          </span>
        </button>

        {/* 4. Botão IA no Menu Suspenso da Cifra */}
        {onToggleAIPanel && (
          <>
            <div className="h-5 w-px bg-zinc-800" />
            <button
              onClick={onToggleAIPanel}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all text-orange-400 hover:text-orange-300 active:scale-95"
              title="Abrir Assistente Harmônico IA"
            >
              <Sparkles size={14} />
              <span className="text-[10px] tracking-tight font-bold leading-none mt-0.5">IA</span>
            </button>
          </>
        )}

        <div className="h-5 w-px bg-zinc-800" />

        {/* 5. Botão Opções (Abre o Bottom Sheet) */}
        <button
          onClick={() => {
            setShowKeyPopover(false);
            setShowScrollPopover(false);
            onOpenOptions();
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all text-zinc-300 hover:text-orange-400 active:scale-95"
          title="Opções completas da cifra"
        >
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 items-center justify-items-center">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-0.5">Opções</span>
        </button>

        {/* Setinha Próxima (Quando em Repertório) */}
        {hasNavigation && onNextSong && (
          <>
            <div className="h-5 w-px bg-zinc-800" />
            <button
              onClick={onNextSong}
              disabled={!hasNextSong}
              className="p-1.5 rounded-full text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 disabled:opacity-20 active:scale-90 transition-all shrink-0"
              title="Próxima música"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
