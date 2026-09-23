import React, { useState, useMemo } from 'react';
import type { Song, Setlist } from '../types/music';
import {
  X,
  ListPlus,
  Search,
  Check,
  Plus,
  Globe,
  Lock,
  Music,
  Sparkles,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';

interface AddToSetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  setlists: Setlist[];
  onAddSongToSetlist: (songId: string, setlistId: string) => Promise<void>;
  onRemoveSongFromSetlist: (songId: string, setlistId: string) => Promise<void>;
  onCreateSetlistWithSong: (
    name: string,
    description: string,
    isPublic: boolean,
    songId: string
  ) => Promise<Setlist>;
}

export const AddToSetlistModal: React.FC<AddToSetlistModalProps> = ({
  isOpen,
  onClose,
  song,
  setlists,
  onAddSongToSetlist,
  onRemoveSongFromSetlist,
  onCreateSetlistWithSong,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDesc, setNewSetDesc] = useState('');
  const [newSetPublic, setNewSetPublic] = useState(true);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [loadingSetlistId, setLoadingSetlistId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtrar repertórios não arquivados e aplicar busca
  const filteredSetlists = useMemo(() => {
    const active = setlists.filter(s => !s.arquivado);
    if (!searchTerm.trim()) return active;
    const term = searchTerm.toLowerCase();
    return active.filter(
      s =>
        s.nome.toLowerCase().includes(term) ||
        (s.descricao && s.descricao.toLowerCase().includes(term))
    );
  }, [setlists, searchTerm]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleToggleSetlist = async (setlist: Setlist) => {
    const isIncluded = (setlist.itens || []).some(
      item => item.musica_id === song.id || item.musica?.id === song.id
    );

    setLoadingSetlistId(setlist.id);
    try {
      if (isIncluded) {
        await onRemoveSongFromSetlist(song.id, setlist.id);
        showToast(`Removida de "${setlist.nome}"`);
      } else {
        await onAddSongToSetlist(song.id, setlist.id);
        showToast(`✓ Adicionada a "${setlist.nome}"!`);
      }
    } finally {
      setLoadingSetlistId(null);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetName.trim() || isSubmittingNew) return;

    setIsSubmittingNew(true);
    try {
      const created = await onCreateSetlistWithSong(
        newSetName.trim(),
        newSetDesc.trim(),
        newSetPublic,
        song.id
      );
      setNewSetName('');
      setNewSetDesc('');
      setIsCreatingInline(false);
      showToast(`✓ Repertório "${created.nome}" criado com a cifra adicionada!`);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-[#1c1c1e] text-zinc-100 border border-zinc-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 shadow-sm">
              <FolderPlus size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Adicionar a Repertório
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                <span className="font-semibold text-zinc-300 truncate">{song.titulo}</span>
                <span>•</span>
                <span className="text-orange-400 font-medium truncate">{song.artista}</span>
                {song.tom_original && (
                  <span className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 border border-zinc-700/60 ml-0.5">
                    {song.tom_original}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-2 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notificação Toast Flutuante Interna */}
        {toastMessage && (
          <div className="my-2 p-2.5 px-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-300 animate-in fade-in slide-in-from-top-1 duration-150 shadow-md">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* Barra de Busca e Botão Novo Repertório */}
        <div className="pt-3.5 pb-2 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar repertório..."
                className="w-full bg-[#121212] border border-zinc-800 focus:border-orange-500/60 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsCreatingInline(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isCreatingInline
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  : 'bg-orange-500/15 hover:bg-orange-500/25 border-orange-500/30 text-orange-400'
              }`}
            >
              {isCreatingInline ? (
                <>
                  <X size={14} />
                  <span>Cancelar</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Criar Novo</span>
                </>
              )}
            </button>
          </div>

          {/* Formulário Inline de Criação Rápida */}
          {isCreatingInline && (
            <form
              onSubmit={handleCreateAndAdd}
              className="p-3.5 bg-zinc-900/90 border border-orange-500/30 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Criar e Adicionar a esta Cifra
                </span>
                <span className="text-[10px] text-zinc-400">Salva diretamente</span>
              </div>

              <div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newSetName}
                  onChange={e => setNewSetName(e.target.value)}
                  placeholder="Nome do Repertório (Ex: Show de Sexta)"
                  className="w-full bg-[#121212] border border-zinc-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={newSetDesc}
                  onChange={e => setNewSetDesc(e.target.value)}
                  placeholder="Descrição opcional..."
                  className="w-full bg-[#121212] border border-zinc-800 focus:border-orange-500 rounded-xl px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={newSetPublic}
                    onChange={e => setNewSetPublic(e.target.checked)}
                    className="accent-orange-500 w-3.5 h-3.5 rounded"
                  />
                  <span className="flex items-center gap-1">
                    {newSetPublic ? <Globe size={13} className="text-emerald-400" /> : <Lock size={13} className="text-amber-400" />}
                    <span>{newSetPublic ? 'Público' : 'Privado'}</span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!newSetName.trim() || isSubmittingNew}
                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>{isSubmittingNew ? 'Criando...' : 'Criar & Adicionar'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Lista de Repertórios Rolável */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 pt-1 pb-2 select-none">
          {filteredSetlists.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-850 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-800">
                <Music size={24} />
              </div>
              <p className="text-sm font-semibold text-zinc-300">
                {searchTerm ? 'Nenhum repertório encontrado' : 'Nenhum repertório disponível'}
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mt-1">
                {searchTerm
                  ? 'Tente outro termo ou crie um novo repertório acima.'
                  : 'Crie seu primeiro repertório para organizar suas cifras de palco.'}
              </p>
              {!isCreatingInline && !searchTerm && (
                <button
                  type="button"
                  onClick={() => setIsCreatingInline(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <Plus size={14} />
                  <span>Criar primeiro repertório</span>
                </button>
              )}
            </div>
          ) : (
            filteredSetlists.map(setlist => {
              const isIncluded = (setlist.itens || []).some(
                item => item.musica_id === song.id || item.musica?.id === song.id
              );
              const isLoading = loadingSetlistId === setlist.id;
              const count = (setlist.itens || []).length;

              return (
                <div
                  key={setlist.id}
                  onClick={() => !isLoading && handleToggleSetlist(setlist)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isIncluded
                      ? 'bg-orange-500/10 border-orange-500/40 hover:bg-orange-500/15'
                      : 'bg-[#151515] border-zinc-800/80 hover:bg-[#1a1a1a] hover:border-zinc-700'
                  }`}
                >
                  {/* Capa / Ícone do Repertório */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-md ${
                        setlist.cover_image
                          ? 'bg-zinc-800'
                          : `bg-gradient-to-br ${setlist.cover_gradient || 'from-orange-500 to-amber-700'}`
                      }`}
                    >
                      {setlist.cover_image ? (
                        <img
                          src={setlist.cover_image}
                          alt={setlist.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ListPlus size={18} className="text-white drop-shadow" />
                      )}
                    </div>

                    {/* Informações */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4
                          className={`text-sm font-bold truncate transition-colors ${
                            isIncluded ? 'text-orange-300' : 'text-zinc-100 group-hover:text-white'
                          }`}
                        >
                          {setlist.nome}
                        </h4>
                        {setlist.publico ? (
                          <Globe size={11} className="text-zinc-500 shrink-0" />
                        ) : (
                          <Lock size={11} className="text-amber-500/70 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span>{count} {count === 1 ? 'música' : 'músicas'}</span>
                        {setlist.descricao && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[160px] sm:max-w-[200px] text-zinc-500">
                              {setlist.descricao}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Ação / Estado */}
                  <div className="shrink-0 flex items-center">
                    {isLoading ? (
                      <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    ) : isIncluded ? (
                      <div className="flex items-center gap-1.5">
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/20 text-orange-400 font-bold text-xs border border-orange-500/30">
                          <Check size={13} className="stroke-[3]" />
                          <span>No Repertório</span>
                        </span>
                        <div
                          className="w-8 h-8 rounded-xl bg-orange-500 text-white flex sm:hidden items-center justify-center shadow-md shadow-orange-500/30"
                          title="No Repertório (toque para remover)"
                        >
                          <Check size={16} className="stroke-[3]" />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 group-hover:bg-orange-500 text-zinc-300 group-hover:text-white font-bold text-xs transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                      >
                        <Plus size={14} />
                        <span>Adicionar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            {filteredSetlists.filter(s =>
              (s.itens || []).some(
                item => item.musica_id === song.id || item.musica?.id === song.id
              )
            ).length}{' '}
            repertório(s) com esta cifra
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-bold rounded-xl transition-colors active:scale-95"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
