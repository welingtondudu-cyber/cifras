import React from 'react';
import type { Song, InstrumentType, ViewMode } from '../types/music';
import {
  X,
  Bookmark,
  Share2,
  Printer,
  Edit3,
  Video,
  ChevronRight,
  Eye,
  Type,
  Guitar,
  Sliders,
  Sparkles,
  PlusCircle,
  Columns,
  Layout,
  Users,
  Download,
  Archive,
  ArchiveRestore,
  StickyNote,
  Repeat,
  FastForward,
  Save
} from 'lucide-react';

interface SongOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  currentKey: string;
  originalKey: string;
  semitones: number;
  onTranspose: (delta: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEditSong: () => void;
  onOpenTabEditor: () => void;
  showTablature: boolean;
  onToggleTablature: () => void;
  showDiagrams: boolean;
  onToggleDiagrams: () => void;
  instrument: InstrumentType;
  onToggleInstrument: () => void;
  fontSize: number;
  onFontSizeChange: (delta: number) => void;
  columns: 1 | 2;
  onToggleColumns: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenAIPanel?: () => void;
  onOpenArtistsSearch?: () => void;
  onOpenAITransitions?: () => void;
  onDownloadSong?: () => void;
  isArchived?: boolean;
  onToggleArchive?: () => void;
  showTransitionNotes?: boolean;
  onToggleTransitionNotes?: () => void;
  scrollCycles?: 1 | 2;
  onSetScrollCycles?: (cycles: 1 | 2) => void;
  autoAdvanceEnabled?: boolean;
  onSetAutoAdvanceEnabled?: (enabled: boolean) => void;
  isInSetlist?: boolean;
  onSaveCurrentKeyAsDefault?: () => void;
}

export const SongOptionsSheet: React.FC<SongOptionsSheetProps> = ({
  isOpen,
  onClose,
  song,
  currentKey,
  originalKey,
  semitones,
  onTranspose,
  isFavorite,
  onToggleFavorite,
  onEditSong,
  onOpenTabEditor,
  showTablature,
  onToggleTablature,
  showDiagrams,
  onToggleDiagrams,
  instrument,
  onToggleInstrument,
  fontSize,
  onFontSizeChange,
  columns,
  onToggleColumns,
  viewMode,
  onViewModeChange,
  onOpenAIPanel,
  onOpenArtistsSearch,
  onOpenAITransitions,
  onDownloadSong,
  isArchived = false,
  onToggleArchive,
  showTransitionNotes = true,
  onToggleTransitionNotes,
  scrollCycles = 1,
  onSetScrollCycles,
  autoAdvanceEnabled = true,
  onSetAutoAdvanceEnabled,
  isInSetlist = false,
  onSaveCurrentKeyAsDefault,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop clicável */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Conteúdo do Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-[#1c1c1e] text-zinc-100 rounded-t-3xl border-t border-zinc-800 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Puxador Superior Tátil */}
        <div className="pt-3 pb-1 cursor-grab flex items-center justify-center" onClick={onClose}>
          <div className="w-10 h-1 bg-zinc-600 rounded-full" />
        </div>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-800/80">
          <h3 className="text-base font-bold text-white tracking-tight">Opções</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo com rolagem suave */}
        <div className="overflow-y-auto px-6 py-4 space-y-5 select-none">
          {/* 1. 4 Botões Circulares de Ação Rápida (Print 4) */}
          <div className="grid grid-cols-4 gap-3 text-center">
            {/* Salvar */}
            <button
              onClick={onToggleFavorite}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div
                className={`w-13 h-13 rounded-full flex items-center justify-center p-3.5 transition-colors ${
                  isFavorite
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700'
                }`}
              >
                <Bookmark size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </div>
              <span className="text-xs text-zinc-300 font-medium">
                {isFavorite ? 'Salvo' : 'Salvar'}
              </span>
            </button>

            {/* Compartilhar */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div className="w-13 h-13 rounded-full bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300 flex items-center justify-center p-3.5 transition-colors">
                <Share2 size={20} />
              </div>
              <span className="text-xs text-zinc-300 font-medium">
                {copiedLink ? 'Copiado!' : 'Compartilhar'}
              </span>
            </button>

            {/* Imprimir */}
            <button
              onClick={handlePrint}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div className="w-13 h-13 rounded-full bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300 flex items-center justify-center p-3.5 transition-colors">
                <Printer size={20} />
              </div>
              <span className="text-xs text-zinc-300 font-medium">Imprimir</span>
            </button>

            {/* Editar */}
            <button
              onClick={() => {
                onClose();
                onEditSong();
              }}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div className="w-13 h-13 rounded-full bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300 flex items-center justify-center p-3.5 transition-colors">
                <Edit3 size={20} />
              </div>
              <span className="text-xs text-zinc-300 font-medium">Editar</span>
            </button>
          </div>

          {/* 2. Card de Videoaula / YouTube */}
          <div className="bg-zinc-850/80 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between hover:bg-zinc-800/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                <Video size={22} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Videoaula & Áudio</h4>
                <p className="text-xs text-zinc-400">Ver execução de {song.titulo}</p>
              </div>
            </div>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                `${song.titulo} ${song.artista} cifra`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition-colors"
            >
              Assistir
            </a>
          </div>

          {/* 3. Modo de Visualização (3 botões: Cifra, Compasso, Graus com destaque em laranja) */}
          <div className="bg-zinc-850/80 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs sm:text-sm">
                <Layout size={17} className="text-orange-500" />
                <span>Modo de Visualização</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-orange-400">
                {viewMode === 'chordpro' ? 'Cifra' : viewMode === 'leadSheet' ? 'Compasso' : 'Graus'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onViewModeChange('chordpro')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center active:scale-95 border ${
                  viewMode === 'chordpro'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/30'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-750 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                Cifra
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('leadSheet')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center active:scale-95 border ${
                  viewMode === 'leadSheet'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/30'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-750 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                Compasso
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('degrees')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center active:scale-95 border ${
                  viewMode === 'degrees'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/30'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-750 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                Graus
              </button>
            </div>
          </div>

          {/* 4. Lista de Configurações (Estilo Cifra Club Print 4) */}
          <div className="bg-zinc-850/60 border border-zinc-800 rounded-2xl divide-y divide-zinc-800/70 overflow-hidden">
            {/* Assistente IA Harmônico (No menu suspenso conforme solicitado) */}
            {onOpenAIPanel && (
              <div
                onClick={() => {
                  onClose();
                  onOpenAIPanel();
                }}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Assistente Harmônico IA
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Tirar dúvidas de harmonia, passagens e arranjos
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-500 group-hover:text-orange-400 transition-colors" />
              </div>
            )}

            {/* Pesquisa & Catálogo com Lista de Artistas */}
            {onOpenArtistsSearch && (
              <div
                onClick={() => {
                  onClose();
                  onOpenArtistsSearch();
                }}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center group-hover:text-orange-400 group-hover:scale-105 transition-all">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Pesquisa e Artistas
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Abrir catálogo com a lista completa de artistas
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-500 group-hover:text-orange-400 transition-colors" />
              </div>
            )}
            {/* Tablaturas */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Eye size={17} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">Tablaturas</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleTablature}
                  className="text-xs font-medium text-zinc-400 hover:text-white"
                >
                  {showTablature ? 'Mostrar sempre' : 'Ocultar sempre'}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenTabEditor();
                  }}
                  className="text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 px-2 py-1 rounded flex items-center gap-1"
                  title="Abrir editor de tablaturas"
                >
                  <PlusCircle size={12} />
                  <span>Criar Tab</span>
                </button>
              </div>
            </div>

            {/* Aparência do texto (Tamanho da fonte e Colunas) */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Type size={17} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">Aparência do texto</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Colunas */}
                <button
                  onClick={onToggleColumns}
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                  title={columns === 1 ? 'Mudar para 2 colunas' : 'Mudar para 1 coluna'}
                >
                  <Columns size={14} />
                  <span className="sr-only">Colunas</span>
                </button>

                {/* Tamanho da Fonte */}
                <div className="flex items-center gap-1.5 bg-zinc-800/90 rounded-lg p-1 border border-zinc-700/60">
                  <button
                    onClick={() => onFontSizeChange(-2)}
                    className="px-2 py-0.5 text-xs text-zinc-300 hover:text-white font-bold"
                    title="Diminuir fonte"
                  >
                    A-
                  </button>
                  <span className="text-xs font-mono text-orange-400 font-bold px-1">
                    {Math.round((fontSize / 16) * 100)}%
                  </span>
                  <button
                    onClick={() => onFontSizeChange(2)}
                    className="px-2 py-0.5 text-xs text-zinc-300 hover:text-white font-bold"
                    title="Aumentar fonte"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Diagramas e Instrumento */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Guitar size={17} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">Diagramas</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleInstrument}
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 capitalize"
                >
                  {instrument === 'cavaco' ? 'Cavaquinho' : 'Violão & Guitarra'}
                </button>
                <button
                  onClick={onToggleDiagrams}
                  className={`text-[11px] px-2 py-0.5 rounded border ${
                    showDiagrams
                      ? 'border-emerald-500/40 text-emerald-400'
                      : 'border-zinc-700 text-zinc-500'
                  }`}
                >
                  {showDiagrams ? 'Ativo' : 'Oculto'}
                </button>
              </div>
            </div>

            {/* Tom e Transposição */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders size={17} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">Tom</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">
                  Orig: {originalKey} {semitones !== 0 ? `(${semitones > 0 ? '+' : ''}${semitones}st)` : ''}
                </span>
                <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => onTranspose(-1)}
                    className="w-6 h-6 flex items-center justify-center text-xs font-bold text-zinc-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-xs text-orange-400 px-1">
                    {currentKey}
                  </span>
                  <button
                    onClick={() => onTranspose(1)}
                    className="w-6 h-6 flex items-center justify-center text-xs font-bold text-zinc-300 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Salvar Tom Atual como Padrão da Cifra */}
            {semitones !== 0 && onSaveCurrentKeyAsDefault && (
              <div
                onClick={() => {
                  onSaveCurrentKeyAsDefault();
                }}
                className="px-3.5 py-2.5 bg-orange-500/10 border-y border-orange-500/20 flex items-center justify-between cursor-pointer hover:bg-orange-500/15 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Save size={15} className="text-orange-400" />
                  <span className="text-xs font-bold text-orange-300">
                    Definir {currentKey} como tom padrão da cifra
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-orange-500 text-white font-bold">
                  Salvar
                </span>
              </div>
            )}

            {/* Rolagem Inteligente: Ciclos (1x / 2x) */}
            {onSetScrollCycles && (
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Repeat size={17} className={scrollCycles === 2 ? 'text-orange-400' : 'text-zinc-400'} />
                  <div>
                    <span className="text-sm font-medium text-zinc-200 block">
                      Repetição de Rolagem
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {scrollCycles === 2 ? 'Rolagem dupla (desce 2x retornando ao topo)' : 'Rolagem única (1x até o fim)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center bg-zinc-800 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => onSetScrollCycles(1)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      scrollCycles === 1 ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    1x
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetScrollCycles(2)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      scrollCycles === 2 ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    2x (Dupla)
                  </button>
                </div>
              </div>
            )}

            {/* Avanço Automático de Cifra em Repertório */}
            {isInSetlist && onSetAutoAdvanceEnabled && (
              <div
                onClick={() => onSetAutoAdvanceEnabled(!autoAdvanceEnabled)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FastForward size={17} className={autoAdvanceEnabled ? 'text-orange-400' : 'text-zinc-500'} />
                  <div>
                    <span className="text-sm font-medium text-zinc-200 block">
                      Passar Cifra Automaticamente
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Avançar para a próxima música ao finalizar a rolagem
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${
                  autoAdvanceEnabled
                    ? 'border-orange-500/40 text-orange-400 bg-orange-500/10'
                    : 'border-zinc-700 text-zinc-500 bg-zinc-800'
                }`}>
                  {autoAdvanceEnabled ? 'Ativo' : 'Desativado'}
                </span>
              </div>
            )}

            {/* Transição Harmônica de Repertório */}
            {onOpenAITransitions && (
              <div
                onClick={() => {
                  onClose();
                  onOpenAITransitions();
                }}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={17} className="text-orange-400" />
                  <div>
                    <span className="text-sm font-medium text-zinc-200 block">
                      Passagem / Transição
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Anotações de palco sem alterar a cifra
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-500" />
              </div>
            )}

            {/* Baixar Cifra (.txt) */}
            {onDownloadSong && (
              <div
                onClick={() => {
                  onClose();
                  onDownloadSong();
                }}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Download size={17} className="text-zinc-400" />
                  <div>
                    <span className="text-sm font-medium text-zinc-200 block">
                      Baixar Cifra (.txt)
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Salvar arquivo de texto da cifra completa
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mostrar / Ocultar Anotações do Repertório */}
            {onToggleTransitionNotes && (
              <div
                onClick={onToggleTransitionNotes}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <StickyNote size={17} className={showTransitionNotes ? 'text-orange-400' : 'text-zinc-500'} />
                  <div>
                    <span className="text-sm font-medium text-zinc-200 block">
                      Anotações de Repertório
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {showTransitionNotes ? 'Bloquinho visível no palco' : 'Oculto para economizar espaço'}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${
                  showTransitionNotes
                    ? 'border-orange-500/40 text-orange-400 bg-orange-500/10'
                    : 'border-zinc-700 text-zinc-500 bg-zinc-800'
                }`}>
                  {showTransitionNotes ? 'Ativo' : 'Oculto'}
                </span>
              </div>
            )}

            {/* Arquivar / Desarquivar Cifra */}
            {onToggleArchive && (
              <div
                onClick={() => {
                  onClose();
                  onToggleArchive();
                }}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isArchived ? (
                    <ArchiveRestore size={17} className="text-amber-400" />
                  ) : (
                    <Archive size={17} className="text-zinc-400" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-zinc-200 block">
                      {isArchived ? 'Desarquivar Cifra' : 'Arquivar Cifra'}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {isArchived ? 'Retornar para o catálogo ativo' : 'Ocultar das buscas e catálogo regular'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
