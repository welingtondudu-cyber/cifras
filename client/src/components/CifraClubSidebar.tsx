import React, { useState } from 'react';
import type { InstrumentType } from '../types/music';
import {
  ChevronLeft,
  Printer,
  Bookmark,
  Download,
  Edit3,
  Share2,
  ChevronRight,
  Play,
  Pause,
  Columns,
  Guitar,
  Minus,
  Plus,
  Eye,
  Sliders,
  BookOpen,
  Check
} from 'lucide-react';

interface CifraClubSidebarProps {
  onBack: () => void;
  isPlaying: boolean;
  speed: number;
  isTemporarilyPaused: boolean;
  onToggleScroll: () => void;
  onSpeedChange: (speed: number) => void;
  columns: 1 | 2;
  onToggleColumns: () => void;
  instrument: InstrumentType;
  onToggleInstrument: () => void;
  currentKey: string;
  onTranspose: (delta: number) => void;
  showTablature: boolean;
  onToggleTablature: () => void;
  showDiagrams: boolean;
  onToggleDiagrams: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onEditSong?: () => void;
  onDownloadSong?: () => void;
}

export const CifraClubSidebar: React.FC<CifraClubSidebarProps> = ({
  onBack,
  isPlaying,
  speed,
  isTemporarilyPaused,
  onToggleScroll,
  onSpeedChange,
  columns,
  onToggleColumns,
  instrument,
  onToggleInstrument,
  currentKey,
  onTranspose,
  showTablature,
  onToggleTablature,
  showDiagrams,
  onToggleDiagrams,
  isFavorite = false,
  onToggleFavorite,
  onEditSong,
  onDownloadSong,
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[#181818] border-r border-zinc-800 flex flex-col select-none text-zinc-300">
      {/* Barra de Ações Rápidas */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-zinc-400 relative">
        <button
          onClick={onBack}
          title="Voltar"
          className="p-2 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => window.print()}
            title="Imprimir"
            className="p-2 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Printer size={17} />
          </button>
          <button
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remover dos favoritos' : 'Favoritar cifra'}
            className={`p-2 rounded-full hover:bg-zinc-800 transition-colors ${
              isFavorite ? 'text-amber-400 bg-amber-500/10' : 'hover:text-orange-500'
            }`}
          >
            <Bookmark size={17} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onDownloadSong}
            title="Baixar cifra (.txt)"
            className="p-2 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Download size={17} />
          </button>
          <button
            onClick={onEditSong}
            title="Editar cifra"
            className="p-2 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Edit3 size={17} />
          </button>
          <button
            onClick={handleShare}
            title="Copiar link para compartilhar"
            className="p-2 rounded-full hover:bg-zinc-800 hover:text-orange-500 transition-colors relative"
          >
            {copiedLink ? <Check size={17} className="text-emerald-400" /> : <Share2 size={17} />}
          </button>
        </div>

        {/* Feedback visual de link copiado */}
        {copiedLink && (
          <div className="absolute -bottom-8 right-2 bg-zinc-900 border border-orange-500 text-orange-400 text-[10px] px-2.5 py-1 rounded-md shadow-lg animate-fadeIn">
            Link copiado!
          </div>
        )}
      </div>

      {/* Lista de Controles */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/80 text-xs">

        {/* 1. Rolagem */}
        <div className="p-3 hover:bg-zinc-850/50 transition-colors">
          <div
            onClick={() => toggleSection('rolagem')}
            className="flex items-center justify-between cursor-pointer py-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 flex items-center justify-center text-zinc-400">
                {isPlaying ? <Pause size={16} className="text-orange-500" /> : <Play size={16} />}
              </div>
              <span className="font-semibold text-zinc-200">Rolagem</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span>{isPlaying ? (isTemporarilyPaused ? 'Pausa 2s' : 'Ativa') : 'Parada'}</span>
              <ChevronRight size={14} className={openSection === 'rolagem' ? 'rotate-90' : ''} />
            </div>
          </div>

          {(openSection === 'rolagem' || isPlaying) && (
            <div className="mt-3 pt-2 border-t border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <button
                  onClick={onToggleScroll}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 ${
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pausar' : 'Iniciar'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">Vel:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={speed}
                    onChange={e => onSpeedChange(Number(e.target.value))}
                    className="w-16 accent-orange-500 h-1 bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-orange-400 font-bold w-3">{speed}</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500">
                * Pausa inteligente de 2s ao tocar na tela ou rolar.
              </p>
            </div>
          )}
        </div>

        {/* 2. Dividir em colunas */}
        <div
          onClick={onToggleColumns}
          className="p-3.5 hover:bg-zinc-850/50 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Columns size={16} className="text-zinc-400" />
            <span className="font-semibold text-zinc-200">Dividir em colunas</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {columns === 1 ? '1 coluna' : '2 colunas'}
          </span>
        </div>

        {/* 3. Instrumento */}
        <div
          onClick={onToggleInstrument}
          className="p-3.5 hover:bg-zinc-850/50 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Guitar size={16} className="text-zinc-400" />
            <span className="font-semibold text-zinc-200">Instrumento</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-orange-500 font-semibold">
            <span>{instrument === 'cavaco' ? 'Cavaco' : 'Violão e guitarra'}</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* 4. Tom */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders size={16} className="text-zinc-400" />
            <span className="font-semibold text-zinc-200">Tom</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTranspose(-1)}
              title="Descer meio tom"
              className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center text-zinc-300"
            >
              <Minus size={13} />
            </button>
            <span className="font-bold font-mono text-sm text-orange-500 min-w-[28px] text-center">
              {currentKey}
            </span>
            <button
              onClick={() => onTranspose(1)}
              title="Subir meio tom"
              className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center text-zinc-300"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* 5. Tablaturas */}
        <div
          onClick={onToggleTablature}
          className="p-3.5 hover:bg-zinc-850/50 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Eye size={16} className="text-zinc-400" />
            <span className="font-semibold text-zinc-200">Tablaturas</span>
          </div>
          <span className="text-[11px] text-zinc-400">
            {showTablature ? 'Mostrar sempre ›' : 'Ocultar sempre ›'}
          </span>
        </div>

        {/* 6. Diagramas (Com Ícone à Esquerda) */}
        <div
          onClick={onToggleDiagrams}
          className="p-3.5 hover:bg-zinc-850/50 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen size={16} className="text-zinc-400" />
            <span className="font-semibold text-zinc-200">Diagramas</span>
          </div>
          <span className="text-[11px] text-orange-500">
            {showDiagrams ? 'Mostrar no início ›' : 'Ocultar ›'}
          </span>
        </div>

      </div>
    </aside>
  );
};
