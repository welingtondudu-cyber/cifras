import React, { useState, useMemo, useEffect } from 'react';
import type { Song, Setlist } from '../types/music';
import {
  ArrowLeft,
  Search,
  X,
  Play,
  Bookmark,
  ListMusic,
  Users,
  Music,
  Globe,
  Lock,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  Layers,
  Archive,
  ArchiveRestore
} from 'lucide-react';

export type CatalogTab = 'all' | 'setlists' | 'songs' | 'artists' | 'archived';
export type SortOption = 'name_asc' | 'name_desc' | 'recent' | 'count';

interface SongsListViewProps {
  songs: Song[];
  setlists?: Setlist[];
  initialSearch?: string;
  initialStyle?: string | null;
  initialArtist?: string | null;
  initialTab?: CatalogTab;
  favoriteSongIds?: Set<string>;
  onBack: () => void;
  onSelectSong: (song: Song) => void;
  onSelectSetlist?: (setlist: Setlist) => void;
  onToggleFavorite?: (song: Song) => void;
  onCreateNewSetlist?: () => void;
  onCreateNewSong?: () => void;
  onEditArtistPhoto?: (artistName: string, currentAvatar?: string) => void;
  onEditSetlistPhoto?: (setlist: Setlist) => void;
  onToggleArchiveSong?: (song: Song) => void;
  onToggleArchiveSetlist?: (setlist: Setlist) => void;
}

export const SongsListView: React.FC<SongsListViewProps> = ({
  songs,
  setlists = [],
  initialSearch = '',
  initialStyle = null,
  initialArtist = null,
  initialTab = 'all',
  favoriteSongIds = new Set(),
  onBack,
  onSelectSong,
  onSelectSetlist,
  onToggleFavorite,
  onCreateNewSetlist,
  onCreateNewSong,
  onEditArtistPhoto,
  onEditSetlistPhoto,
  onToggleArchiveSong,
  onToggleArchiveSetlist,
}) => {
  const [activeTab, setActiveTab] = useState<CatalogTab>(initialTab);
  const [search, setSearch] = useState(initialSearch);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(initialStyle);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(initialArtist);
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [archivedSubFilter, setArchivedSubFilter] = useState<'all' | 'songs' | 'setlists'>('all');
  const ITEMS_PER_PAGE = 12;

  // Atualizar quando props mudarem
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialArtist) setSelectedArtist(initialArtist);
  }, [initialArtist]);

  // Resetar página quando filtros ou aba mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStyle, selectedArtist, activeTab, sortBy, archivedSubFilter]);

  const ALL_STYLES = ['Todos', 'Samba', 'MPB', 'Rock', 'Sertanejo', 'Gospel'];

  // Agrupamento de artistas únicos do acervo ativo (não arquivado)
  const allArtists = useMemo(() => {
    const map = new Map<string, { name: string; count: number; estilo: string; avatar?: string }>();
    songs.filter(s => !s.arquivado).forEach(s => {
      const existing = map.get(s.artista);
      if (existing) {
        existing.count += 1;
        if (!existing.avatar && s.avatar_url) existing.avatar = s.avatar_url;
      } else {
        map.set(s.artista, {
          name: s.artista,
          count: 1,
          estilo: s.estilo,
          avatar: s.avatar_url
        });
      }
    });
    return Array.from(map.values());
  }, [songs]);

  // Filtro de Artistas
  const filteredArtists = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allArtists.filter(a => {
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.estilo.toLowerCase().includes(q);
      const matchStyle = !selectedStyle || selectedStyle === 'Todos' || a.estilo.toLowerCase() === selectedStyle.toLowerCase();
      return matchSearch && matchStyle;
    });

    list.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'pt-BR');
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name, 'pt-BR');
      if (sortBy === 'count') return b.count - a.count;
      return 0;
    });

    return list;
  }, [allArtists, search, selectedStyle, sortBy]);

  // Filtro de Repertórios Ativos
  const filteredSetlists = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = setlists.filter(s => {
      if (s.arquivado) return false;
      const matchSearch = !q || s.nome.toLowerCase().includes(q) || (s.descricao && s.descricao.toLowerCase().includes(q));
      return matchSearch;
    });

    list.sort((a, b) => {
      if (sortBy === 'name_asc') return a.nome.localeCompare(b.nome, 'pt-BR');
      if (sortBy === 'name_desc') return b.nome.localeCompare(a.nome, 'pt-BR');
      if (sortBy === 'count') return b.itens.length - a.itens.length;
      if (sortBy === 'recent') {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      }
      return 0;
    });

    return list;
  }, [setlists, search, sortBy]);

  // Filtro de Músicas / Cifras Ativas (não arquivadas)
  const filteredSongs = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = songs.filter(song => {
      if (song.arquivado) return false;

      const matchSearch =
        !q ||
        song.titulo.toLowerCase().includes(q) ||
        song.artista.toLowerCase().includes(q) ||
        song.estilo.toLowerCase().includes(q);

      const matchStyle =
        !selectedStyle || selectedStyle === 'Todos' || song.estilo.toLowerCase() === selectedStyle.toLowerCase();

      const matchArtist =
        !selectedArtist || song.artista.toLowerCase() === selectedArtist.toLowerCase();

      return matchSearch && matchStyle && matchArtist;
    });

    list.sort((a, b) => {
      if (sortBy === 'name_asc') return a.titulo.localeCompare(b.titulo, 'pt-BR');
      if (sortBy === 'name_desc') return b.titulo.localeCompare(a.titulo, 'pt-BR');
      if (sortBy === 'recent') {
        const da = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
        const db = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
        return db - da;
      }
      return 0;
    });

    return list;
  }, [songs, search, selectedStyle, selectedArtist, sortBy]);

  // Itens Arquivados (Cifras e Repertórios)
  const archivedSongs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return songs.filter(s => s.arquivado && (!q || s.titulo.toLowerCase().includes(q) || s.artista.toLowerCase().includes(q)));
  }, [songs, search]);

  const archivedSetlists = useMemo(() => {
    const q = search.trim().toLowerCase();
    return setlists.filter(s => s.arquivado && (!q || s.nome.toLowerCase().includes(q) || (s.descricao && s.descricao.toLowerCase().includes(q))));
  }, [setlists, search]);

  const totalArchivedCount = useMemo(() => {
    return songs.filter(s => s.arquivado).length + setlists.filter(s => s.arquivado).length;
  }, [songs, setlists]);

  // Paginação ativa baseada na aba selecionada
  const activeItemsCount = useMemo(() => {
    if (activeTab === 'setlists') return filteredSetlists.length;
    if (activeTab === 'artists') return filteredArtists.length;
    return filteredSongs.length;
  }, [activeTab, filteredSetlists.length, filteredArtists.length, filteredSongs.length]);

  const totalPages = Math.max(1, Math.ceil(activeItemsCount / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedSongs = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredSongs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSongs, safeCurrentPage]);

  const paginatedSetlists = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredSetlists.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSetlists, safeCurrentPage]);

  const paginatedArtists = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredArtists.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArtists, safeCurrentPage]);

  // Ao clicar em um artista, filtrar e listar suas músicas imediatamente
  const handleSelectArtist = (artistName: string) => {
    setSelectedArtist(artistName);
    setActiveTab('songs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 text-zinc-100 flex-1 pb-28">
      {/* Barra de Topo: Voltar e Botões de Ação Novo Repertório / Nova Cifra */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft size={16} />
          <span>Voltar para o Início</span>
        </button>

        {/* Botões de Ação: Novo Repertório e Nova Cifra (Centralizados nesta tela conforme solicitado) */}
        <div className="flex items-center gap-2.5">
          {onCreateNewSetlist && (
            <button
              onClick={onCreateNewSetlist}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs sm:text-sm font-bold text-zinc-200 transition-colors border border-zinc-700 active:scale-95 shadow-sm"
            >
              <Plus size={15} className="text-orange-400" />
              <span>Novo Repertório</span>
            </button>
          )}

          {onCreateNewSong && (
            <button
              onClick={onCreateNewSong}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm font-bold text-white transition-colors active:scale-95 shadow-lg shadow-orange-500/20"
            >
              <Plus size={15} />
              <span>Nova Cifra</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Pesquisa Instantânea */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por música, cantor, repertório ou estilo (ex: Cartola, MPB, Pagode)..."
          className="w-full bg-[#181818] border border-zinc-750 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-zinc-500 text-sm rounded-2xl pl-11 pr-10 py-3 outline-none shadow-lg transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-full"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tag de Filtro de Artista Ativo */}
      {selectedArtist && (
        <div className="mb-5 flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 bg-orange-500/10 px-3.5 py-1.5 rounded-full border border-orange-500/30">
            <Users size={14} />
            <span>Músicas de: <strong>{selectedArtist}</strong></span>
            <button
              onClick={() => setSelectedArtist(null)}
              className="ml-1.5 p-0.5 rounded-full hover:bg-orange-500/20 text-zinc-400 hover:text-white transition-colors"
              title="Limpar filtro de artista"
            >
              <X size={13} />
            </button>
          </div>
          <span className="text-xs text-zinc-500">
            ({filteredSongs.length} {filteredSongs.length === 1 ? 'música encontrada' : 'músicas encontradas'})
          </span>
        </div>
      )}

      {/* Abas Superiores de Filtro por Categoria: Tudo, Repertórios, Cifras, Artistas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#181818] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Layers size={15} />
            <span>Tudo</span>
          </button>

          <button
            onClick={() => setActiveTab('setlists')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'setlists'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#181818] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <ListMusic size={15} />
            <span>Repertórios</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {filteredSetlists.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('songs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'songs'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#181818] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Music size={15} />
            <span>Cifras</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {filteredSongs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'artists'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#181818] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Users size={15} />
            <span>Artistas</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {filteredArtists.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'archived'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-[#181818] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Archive size={15} />
            <span>Arquivados</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {totalArchivedCount}
            </span>
          </button>
        </div>

        {/* Seletor de Ordenação */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown size={15} className="text-zinc-500" />
          <span className="text-xs text-zinc-400 font-medium">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="bg-[#181818] border border-zinc-750 text-xs font-semibold text-zinc-200 rounded-xl px-3 py-1.5 outline-none focus:border-orange-500"
          >
            <option value="name_asc">Nome (A-Z)</option>
            <option value="name_desc">Nome (Z-A)</option>
            <option value="recent">Mais Recentes</option>
            {(activeTab === 'setlists' || activeTab === 'artists') && (
              <option value="count">Mais Músicas</option>
            )}
          </select>
        </div>
      </div>

      {/* Filtro secundário por Estilo Musical (visível nas abas Cifras e Tudo) */}
      {(activeTab === 'songs' || activeTab === 'all') && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {ALL_STYLES.map(st => {
            const isSelected = selectedStyle === st || (!selectedStyle && st === 'Todos');
            return (
              <button
                key={st}
                onClick={() => setSelectedStyle(st === 'Todos' ? null : st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                    : 'bg-[#181818] text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      )}

      {/* ================= ABA TUDO (Visão Geral) ================= */}
      {activeTab === 'all' && (
        <div className="space-y-10">
          {/* 1. Repertórios Correspondentes */}
          {filteredSetlists.length > 0 && onSelectSetlist && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ListMusic size={18} className="text-orange-500" />
                  Repertórios ({filteredSetlists.length})
                </h3>
                <button
                  onClick={() => setActiveTab('setlists')}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  Ver todos os repertórios <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {filteredSetlists.slice(0, 6).map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => onSelectSetlist(s)}
                    className="group cursor-pointer flex flex-col transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className={`aspect-square w-full rounded-2xl bg-gradient-to-br ${
                      s.cover_gradient || (idx % 2 === 0 ? 'from-orange-500 to-amber-700' : 'from-zinc-800 to-zinc-900')
                    } p-3.5 flex flex-col justify-between shadow-lg group-hover:ring-2 group-hover:ring-orange-500 transition-all`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center gap-1">
                          {s.publico ? <Globe size={10} /> : <Lock size={10} />}
                          {s.publico ? 'Público' : 'Privado'}
                        </span>
                        <ListMusic size={15} className="text-white/80" />
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-md truncate">
                        {s.nome}
                      </h4>
                    </div>
                    <div className="mt-2">
                      <span className="block text-xs font-bold text-zinc-200 group-hover:text-orange-400 truncate">
                        {s.nome}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {s.itens.length} {s.itens.length === 1 ? 'música' : 'músicas'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. Artistas Correspondentes */}
          {filteredArtists.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-orange-500" />
                  Artistas ({filteredArtists.length})
                </h3>
                <button
                  onClick={() => setActiveTab('artists')}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  Ver todos os artistas <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {filteredArtists.slice(0, 10).map(artist => (
                  <div
                    key={artist.name}
                    onClick={() => handleSelectArtist(artist.name)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-zinc-750 group-hover:border-orange-500 group-hover:scale-105 shadow-lg transition-all bg-zinc-800 flex items-center justify-center">
                      {artist.avatar ? (
                        <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-orange-400">{artist.name[0]}</span>
                      )}
                    </div>
                    <div className="text-center max-w-[85px]">
                      <span className="block text-xs font-semibold text-zinc-300 group-hover:text-orange-400 truncate">
                        {artist.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {artist.count} {artist.count === 1 ? 'música' : 'músicas'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Músicas Principais */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Music size={18} className="text-orange-500" />
                Cifras e Músicas ({filteredSongs.length})
              </h3>
              <button
                onClick={() => setActiveTab('songs')}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                Ver todas as músicas <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSongs.slice(0, 12).map((song, idx) => {
                const isFav = favoriteSongIds.has(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => onSelectSong(song)}
                    className="p-3.5 bg-[#181818] hover:bg-[#202020] border border-zinc-800 hover:border-orange-500/50 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-sm font-bold text-zinc-500 w-5 text-center shrink-0">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-orange-400 text-xs shrink-0 border border-zinc-700">
                        {song.tom_original}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                            {song.titulo}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                          <span>{song.artista}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                            {song.estilo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onToggleFavorite && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onToggleFavorite(song);
                          }}
                          title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          className={`p-2 rounded-full hover:bg-zinc-800 transition-colors ${
                            isFav ? 'text-amber-400' : 'text-zinc-500 hover:text-orange-400'
                          }`}
                        >
                          <Bookmark size={15} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-orange-500 text-zinc-400 group-hover:text-white flex items-center justify-center transition-colors">
                        <Play size={13} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ================= ABA REPERTÓRIOS (Todos os Repertórios) ================= */}
      {activeTab === 'setlists' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ListMusic size={20} className="text-orange-500" />
              Todos os Repertórios
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {filteredSetlists.length} {filteredSetlists.length === 1 ? 'repertório' : 'repertórios'}
            </span>
          </div>

          {filteredSetlists.length === 0 ? (
            <div className="p-12 text-center bg-[#181818] rounded-2xl border border-zinc-800">
              <p className="text-sm text-zinc-400 mb-3">Nenhum repertório encontrado.</p>
              {onCreateNewSetlist && (
                <button
                  onClick={onCreateNewSetlist}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus size={15} /> Criar Primeiro Repertório
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {paginatedSetlists.map((setlist, idx) => (
                <div
                  key={setlist.id}
                  onClick={() => onSelectSetlist?.(setlist)}
                  className="group cursor-pointer flex flex-col transition-all duration-200 hover:-translate-y-1 select-none"
                >
                  <div className={`aspect-square w-full rounded-2xl relative overflow-hidden bg-gradient-to-br ${
                    setlist.cover_gradient || (idx % 2 === 0 ? 'from-orange-500 to-amber-700' : 'from-zinc-800 to-zinc-900')
                  } p-4 flex flex-col justify-between shadow-lg group-hover:ring-2 group-hover:ring-orange-500 transition-all`}>
                    {setlist.cover_image && (
                      <img
                        src={setlist.cover_image}
                        alt={setlist.nome}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 z-[1]" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center gap-1 font-semibold">
                        {setlist.publico ? <Globe size={11} /> : <Lock size={11} />}
                        {setlist.publico ? 'Público' : 'Privado'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {onEditSetlistPhoto && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditSetlistPhoto(setlist);
                            }}
                            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white transition-colors"
                            title="Alterar foto do repertório"
                          >
                            <Camera size={13} />
                          </button>
                        )}
                        <ListMusic size={17} className="text-white/80" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-base font-black text-white leading-tight drop-shadow-md truncate">
                        {setlist.nome}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="block text-xs font-bold text-zinc-200 group-hover:text-orange-400 transition-colors truncate">
                      {setlist.nome}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {setlist.itens.length} {setlist.itens.length === 1 ? 'música' : 'músicas'} • {setlist.owner_name || 'Welington_sc'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= ABA CIFRAS (Todas as Músicas) ================= */}
      {activeTab === 'songs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Music size={20} className="text-orange-500" />
              {selectedArtist ? `Músicas de ${selectedArtist}` : selectedStyle ? `Músicas de ${selectedStyle}` : 'Todas as Cifras'}
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Página {safeCurrentPage} de {totalPages} ({filteredSongs.length} músicas)
            </span>
          </div>

          {filteredSongs.length === 0 ? (
            <div className="p-12 text-center bg-[#181818] rounded-2xl border border-zinc-800">
              <p className="text-sm text-zinc-400 mb-3">Nenhuma música encontrada para os filtros aplicados.</p>
              <button
                onClick={() => { setSearch(''); setSelectedStyle(null); setSelectedArtist(null); }}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginatedSongs.map((song, idx) => {
                const globalIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                const isFav = favoriteSongIds.has(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => onSelectSong(song)}
                    className="p-3.5 bg-[#181818] hover:bg-[#202020] border border-zinc-800 hover:border-orange-500/50 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-sm font-bold text-zinc-500 w-6 text-center shrink-0">
                        {globalIndex.toString().padStart(2, '0')}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-orange-400 text-xs shrink-0 border border-zinc-700">
                        {song.tom_original}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                            {song.titulo}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                          <span>{song.artista}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                            {song.estilo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onToggleFavorite && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onToggleFavorite(song);
                          }}
                          title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          className={`p-2 rounded-full hover:bg-zinc-800 transition-colors ${
                            isFav ? 'text-amber-400' : 'text-zinc-500 hover:text-orange-400'
                          }`}
                        >
                          <Bookmark size={15} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-orange-500 text-zinc-400 group-hover:text-white flex items-center justify-center transition-colors">
                        <Play size={13} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= ABA ARTISTAS (Todos os Artistas com Fotos) ================= */}
      {activeTab === 'artists' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-orange-500" />
              Todos os Artistas
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Página {safeCurrentPage} de {totalPages} ({filteredArtists.length} artistas)
            </span>
          </div>

          {filteredArtists.length === 0 ? (
            <div className="p-12 text-center bg-[#181818] rounded-2xl border border-zinc-800">
              <p className="text-sm text-zinc-400">Nenhum artista encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {paginatedArtists.map(artist => (
                <div
                  key={artist.name}
                  onClick={() => handleSelectArtist(artist.name)}
                  className="p-4 bg-[#181818] hover:bg-[#202020] border border-zinc-800 hover:border-orange-500/50 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all group shadow-md"
                >
                  <div className="relative group/avatar mb-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-zinc-750 group-hover:border-orange-500 group-hover:scale-105 shadow-lg transition-all bg-zinc-800 flex items-center justify-center">
                      {artist.avatar ? (
                        <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-black text-orange-400">{artist.name[0]}</span>
                      )}
                    </div>

                    {onEditArtistPhoto && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onEditArtistPhoto(artist.name, artist.avatar);
                        }}
                        title={`Editar foto de ${artist.name}`}
                        className="absolute bottom-0 right-0 p-1.5 rounded-full bg-zinc-900 border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-md group-hover/avatar:scale-110"
                      >
                        <Camera size={12} />
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate w-full">
                    {artist.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {artist.count} {artist.count === 1 ? 'música' : 'músicas'}
                  </p>
                  <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                    {artist.estilo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= ABA ARQUIVADOS (Cifras e Repertórios Ocultos) ================= */}
      {activeTab === 'archived' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Archive size={20} className="text-amber-500" />
              <h3 className="text-lg font-bold text-white">
                Itens Arquivados
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                ({totalArchivedCount} no total)
              </span>
            </div>

            {/* Sub-filtro de Arquivados */}
            <div className="flex items-center gap-2 bg-[#181818] p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
              <button
                onClick={() => setArchivedSubFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  archivedSubFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todos ({totalArchivedCount})
              </button>
              <button
                onClick={() => setArchivedSubFilter('songs')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  archivedSubFilter === 'songs'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Cifras ({archivedSongs.length})
              </button>
              <button
                onClick={() => setArchivedSubFilter('setlists')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  archivedSubFilter === 'setlists'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Repertórios ({archivedSetlists.length})
              </button>
            </div>
          </div>

          {totalArchivedCount === 0 ? (
            <div className="p-12 text-center bg-[#181818] rounded-2xl border border-zinc-800">
              <Archive size={32} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-300 font-semibold mb-1">Nenhum item arquivado</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Cifras e repertórios arquivados não aparecem no catálogo regular e ficam salvos com segurança aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Repertórios Arquivados */}
              {(archivedSubFilter === 'all' || archivedSubFilter === 'setlists') && archivedSetlists.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-1.5">
                    <ListMusic size={16} className="text-amber-400" />
                    Repertórios Arquivados ({archivedSetlists.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {archivedSetlists.map(setlist => (
                      <div
                        key={setlist.id}
                        className="p-3.5 bg-[#181818] border border-amber-500/20 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                      >
                        <div
                          onClick={() => onSelectSetlist?.(setlist)}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                            <ListMusic size={18} />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-white truncate hover:text-amber-400 transition-colors">
                              {setlist.nome}
                            </h5>
                            <span className="text-xs text-zinc-400">
                              {setlist.itens.length} {setlist.itens.length === 1 ? 'música' : 'músicas'}
                            </span>
                          </div>
                        </div>

                        {onToggleArchiveSetlist && (
                          <button
                            onClick={() => onToggleArchiveSetlist(setlist)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-white text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                            title="Desarquivar repertório"
                          >
                            <ArchiveRestore size={13} />
                            <span>Desarquivar</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Cifras Arquivadas */}
              {(archivedSubFilter === 'all' || archivedSubFilter === 'songs') && archivedSongs.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-1.5">
                    <Music size={16} className="text-amber-400" />
                    Cifras Arquivadas ({archivedSongs.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {archivedSongs.map(song => (
                      <div
                        key={song.id}
                        className="p-3.5 bg-[#181818] border border-amber-500/20 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                      >
                        <div
                          onClick={() => onSelectSong(song)}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-orange-400 font-bold text-xs shrink-0">
                            {song.tom_original}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-white truncate hover:text-orange-400 transition-colors">
                              {song.titulo}
                            </h5>
                            <span className="text-xs text-zinc-400 truncate block">
                              {song.artista}
                            </span>
                          </div>
                        </div>

                        {onToggleArchiveSong && (
                          <button
                            onClick={() => onToggleArchiveSong(song)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-white text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                            title="Desarquivar cifra"
                          >
                            <ArchiveRestore size={13} />
                            <span>Desarquivar</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* Paginação Universal (para Cifras, Artistas ou Repertórios quando houver mais de 1 página) */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2 select-none">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={safeCurrentPage <= 1}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 hover:text-white transition-colors"
            title="Página Anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  pageNum === safeCurrentPage
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-750'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 hover:text-white transition-colors"
            title="Próxima Página"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
