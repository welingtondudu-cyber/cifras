import React, { useState } from 'react';
import type { Setlist, Song } from '../types/music';
import {
  ArrowLeft,
  Play,
  Trash2,
  Lock,
  Globe,
  Plus,
  Music,
  Share2,
  GripVertical,
  Search,
  Sparkles,
  X,
  Edit2,
  Check,
  Archive,
  ArchiveRestore
} from 'lucide-react';

interface SetlistDetailViewProps {
  setlist: Setlist;
  allAvailableSongs: Song[];
  onBack: () => void;
  onPlaySetlist: (startIndex?: number) => void;
  onReorderAllItems: (reorderedItemIds: string[]) => void;
  onRemoveItem: (itemId: string) => void;
  onAddSongToSetlist: (songId: string) => void;
  onTogglePrivacy: () => void;
  onToggleArchive?: () => void;
  onUpdateSetlistDetails?: (name: string, description: string) => void;
  onToggleAIPanel: () => void;
  onRequestAIReorder?: () => void;
  onSelectSongDirectly: (song: Song, indexInSetlist: number) => void;
}

export const SetlistDetailView: React.FC<SetlistDetailViewProps> = ({
  setlist,
  allAvailableSongs,
  onBack,
  onPlaySetlist,
  onReorderAllItems,
  onRemoveItem,
  onAddSongToSetlist,
  onTogglePrivacy,
  onToggleArchive,
  onUpdateSetlistDetails,
  onToggleAIPanel,
  onRequestAIReorder,
  onSelectSongDirectly,
}) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSongSearch, setAddSongSearch] = useState('');

  // Edição do Nome e Descrição do Repertório
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editName, setEditName] = useState(setlist.nome);
  const [editDesc, setEditDesc] = useState(setlist.descricao || '');

  const handleSaveHeader = () => {
    if (!editName.trim()) return;
    onUpdateSetlistDetails?.(editName.trim(), editDesc.trim());
    setIsEditingHeader(false);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetItemId) return;

    const currentOrder = setlist.itens.map(i => i.id);
    const fromIdx = currentOrder.indexOf(draggedItemId);
    const toIdx = currentOrder.indexOf(targetItemId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);

    onReorderAllItems(newOrder);
    setDraggedItemId(null);
  };

  // Músicas que podem ser adicionadas (filtradas por busca não exata)
  const availableToAdd = allAvailableSongs.filter(song => {
    const q = addSongSearch.trim().toLowerCase();
    const alreadyIn = setlist.itens.some(it => it.musica_id === song.id);
    if (alreadyIn) return false;
    if (!q) return true;
    return song.titulo.toLowerCase().includes(q) || song.artista.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-zinc-100 pb-20">
      {/* Barra de Retorno e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors self-start py-1"
        >
          <ArrowLeft size={16} />
          <span>Voltar para Listas</span>
        </button>

        <div className="flex items-center flex-wrap gap-2">
          {/* Botão de Ordenação Inteligente por IA */}
          {onRequestAIReorder && setlist.itens.length > 1 && (
            <button
              onClick={onRequestAIReorder}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500/25 to-amber-500/20 text-orange-400 border border-orange-500/40 text-xs sm:text-[13px] font-bold hover:bg-orange-500/30 transition-all active:scale-95 shadow-sm"
              title="Pedir à IA para organizar a sequência harmônica ideal das músicas"
            >
              <Sparkles size={14} className="text-orange-400 animate-pulse" />
              <span>Ordenar com IA</span>
            </button>
          )}

          {/* Acesso ao Chat IA para editar repertório */}
          <button
            onClick={onToggleAIPanel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs sm:text-[13px] font-bold hover:bg-orange-500/30 transition-all active:scale-95"
          >
            <Sparkles size={14} />
            <span>Editar com IA</span>
          </button>

          <button
            onClick={onTogglePrivacy}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold border transition-all ${
              setlist.publico
                ? 'bg-zinc-800 text-orange-400 border-orange-500/40'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
          >
            {setlist.publico ? <Globe size={14} /> : <Lock size={14} />}
            <span>{setlist.publico ? 'Público (Banda)' : 'Privado'}</span>
          </button>

          {onToggleArchive && (
            <button
              onClick={onToggleArchive}
              title={setlist.arquivado ? 'Desarquivar repertório' : 'Arquivar repertório'}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold border transition-all ${
                setlist.arquivado
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700'
              }`}
            >
              {setlist.arquivado ? <ArchiveRestore size={14} /> : <Archive size={14} />}
              <span>{setlist.arquivado ? 'Desarquivar' : 'Arquivar'}</span>
            </button>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link do repertório copiado para a área de transferência!');
            }}
            title="Compartilhar repertório"
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Cartão de Informações do Repertório */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-850 border border-zinc-800 rounded-2xl p-5 sm:p-6 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 flex-1 min-w-[280px]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-orange-950/40 shrink-0">
            <Music size={32} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                REPERTÓRIO • {setlist.itens.length} {setlist.itens.length === 1 ? 'MÚSICA' : 'MÚSICAS'}
              </span>
              {setlist.arquivado && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Arquivado
                </span>
              )}
            </div>

            {isEditingHeader ? (
              <div className="mt-2 space-y-2 max-w-md">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Nome do repertório..."
                  className="w-full bg-[#141414] border border-orange-500 rounded-xl px-3.5 py-2 text-base font-bold text-white outline-none focus:ring-1 focus:ring-orange-500/30"
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Descrição ou observações..."
                  className="w-full bg-[#141414] border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-300 outline-none focus:border-orange-500"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleSaveHeader}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-orange-600 shadow-md transition-all active:scale-95"
                  >
                    <Check size={14} /> Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditName(setlist.nome);
                      setEditDesc(setlist.descricao || '');
                      setIsEditingHeader(false);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-700 transition-colors"
                  >
                    <X size={14} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mt-0.5">
                  <h1 className="text-xl sm:text-3xl font-black text-white">
                    {setlist.nome}
                  </h1>
                  {onUpdateSetlistDetails && (
                    <button
                      onClick={() => setIsEditingHeader(true)}
                      title="Editar nome e descrição do repertório"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Criado por <span className="text-zinc-200 font-semibold">{setlist.owner_name || 'Welington_sc'}</span>
                  {setlist.descricao ? ` • ${setlist.descricao}` : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm transition-colors active:scale-95"
          >
            <Plus size={16} />
            <span>Adicionar Cifra</span>
          </button>

          <button
            onClick={() => onPlaySetlist(0)}
            disabled={setlist.itens.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Play size={16} fill="currentColor" />
            <span>TOCAR NO PALCO</span>
          </button>
        </div>
      </div>

      {/* Lista de Músicas com Drag & Drop */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2">
          <div className="flex items-center gap-2">
            <span>Arraste as músicas para organizar a ordem</span>
            {onRequestAIReorder && setlist.itens.length > 1 && (
              <button
                onClick={onRequestAIReorder}
                className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30 transition-colors cursor-pointer"
                title="Sugerir e aplicar ordem harmônica ideal com IA"
              >
                <Sparkles size={11} />
                <span>Auto-ordenar com IA</span>
              </button>
            )}
          </div>
          <span>Ações</span>
        </div>

        {setlist.itens.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800/80 rounded-2xl">
            <p className="text-sm text-zinc-400 mb-3">Este repertório ainda não tem nenhuma música.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
            >
              Adicionar Músicas Agora
            </button>
          </div>
        ) : (
          setlist.itens.map((item, idx) => {
            const song = item.musica;
            if (!song) return null;
            const isDragging = draggedItemId === item.id;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, item.id)}
                className={`p-3.5 bg-[#1a1a1a] hover:bg-[#222] border rounded-xl flex items-center justify-between gap-3 transition-all cursor-move select-none ${
                  isDragging
                    ? 'opacity-40 border-orange-500 bg-orange-500/5'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Ícone de Grip + Info da Música */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-zinc-600 hover:text-orange-400 cursor-grab active:cursor-grabbing p-1">
                    <GripVertical size={18} />
                  </div>

                  <span className="font-mono text-sm font-bold text-zinc-500 w-5 text-center shrink-0">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>

                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs sm:text-[13px] text-orange-400 shrink-0 border border-zinc-750 shadow-inner">
                    {song.tom_original}
                  </div>

                  <div
                    onClick={() => onSelectSongDirectly(song, idx)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="text-sm sm:text-[15px] font-bold text-white hover:text-orange-400 transition-colors truncate">
                      {song.titulo}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 truncate mt-0.5">
                      <span>{song.artista}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                        {song.estilo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remover item */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  title="Remover do repertório"
                  className="p-2 sm:p-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Adicionar Músicas com Pesquisa Parcial */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Adicionar Cifras ao Repertório</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Campo de Busca por Música ou Autor */}
            <div className="mt-4 mb-3 relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={addSongSearch}
                onChange={e => setAddSongSearch(e.target.value)}
                placeholder="Pesquisar por música ou autor (busca parcial)..."
                className="w-full bg-[#121212] border border-zinc-750 focus:border-orange-500 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-orange-500/30 transition-colors"
              />
            </div>

            {/* Lista de Músicas com 1 Clique para Adicionar */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availableToAdd.length === 0 ? (
                <div className="text-center py-8 text-xs sm:text-sm text-zinc-500">
                  Nenhuma música disponível encontrada.
                </div>
              ) : (
                availableToAdd.map(song => (
                  <div
                    key={song.id}
                    onClick={() => onAddSongToSetlist(song.id)}
                    className="p-3 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {song.titulo}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {song.artista} • {song.estilo} ({song.tom_original})
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <Plus size={15} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm font-bold text-white transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
