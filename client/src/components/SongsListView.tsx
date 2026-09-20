import React, { useState, useMemo } from 'react';
import type { Song, Setlist } from '../types/music';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  X,
  Play,
  Bookmark,
  ListMusic,
  User,
  Globe,
  Lock
} from 'lucide-react';

interface SongsListViewProps {
  songs: Song[];
  setlists?: Setlist[];
  initialSearch?: string;
  initialStyle?: string | null;
  initialArtist?: string | null;
  favoriteSongIds?: Set<string>;
  onBack: () => void;
  onSelectSong: (song: Song) => void;
  onSelectSetlist?: (setlist: Setlist) => void;
  onToggleFavorite?: (song: Song) => void;
}

export const SongsListView: React.FC<SongsListViewProps> = ({
  songs,
  setlists = [],
  initialSearch = '',
  initialStyle = null,
  initialArtist = null,
  favoriteSongIds = new Set(),
  onBack,
  onSelectSong,
  onSelectSetlist,
  onToggleFavorite,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(initialStyle);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(initialArtist);

  const ALL_STYLES = ['Todos', 'Samba', 'MPB', 'Rock', 'Sertanejo', 'Gospel'];

  // Busca de Repertórios correspondentes (não arquivados)
  const matchingSetlists = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return setlists.filter(
      s =>
        !s.arquivado &&
        (s.nome.toLowerCase().includes(q) ||
          (s.descricao && s.descricao.toLowerCase().includes(q)))
    );
  }, [setlists, search]);

  // Artistas encontrados na pesquisa
  const matchingArtists = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const unique = Array.from(new Set(songs.map(s => s.artista)));
    return unique.filter(a => a.toLowerCase().includes(q));
  }, [songs, search]);

  // Filtragem flexível de músicas (sem exigir correspondência exata)
  const filteredSongs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return songs.filter(song => {
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
  }, [songs, search, selectedStyle, selectedArtist]);

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 text-zinc-100 flex-1">
      {/* Botão de Retorno e Título da Tela */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Voltar para o Início</span>
        </button>

        {selectedArtist && (
          <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
            <span>Cantor: <strong>{selectedArtist}</strong></span>
            <button onClick={() => setSelectedArtist(null)} className="ml-1 text-zinc-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Barra de Pesquisa no Topo da Lista */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por nome da música ou cantor (ex: Cartola, Moinho, Alcione)..."
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

      {/* Se houver pesquisa ativa e encontrar Repertórios correspondentes */}
      {matchingSetlists.length > 0 && onSelectSetlist && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
              <ListMusic size={16} />
              Repertórios Encontrados ({matchingSetlists.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {matchingSetlists.map(s => (
              <div
                key={s.id}
                onClick={() => onSelectSetlist(s)}
                className="p-3.5 bg-[#181818] hover:bg-[#222222] border border-zinc-800 hover:border-orange-500/60 rounded-xl cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-zinc-400 text-[10px] mb-2 font-mono">
                  <span className="flex items-center gap-1">
                    {s.publico ? <Globe size={10} /> : <Lock size={10} />}
                    {s.publico ? 'Público' : 'Privado'}
                  </span>
                  <span>{s.itens.length} músicas</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                  {s.nome}
                </h4>
                <span className="text-[11px] text-zinc-500 truncate mt-1">
                  {s.owner_name || 'Welington_sc'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Se houver pesquisa ativa e encontrar Artistas correspondentes */}
      {matchingArtists.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-zinc-400 flex items-center gap-1">
            <User size={14} /> Artistas encontrados:
          </span>
          {matchingArtists.map(art => (
            <button
              key={art}
              onClick={() => setSelectedArtist(art === selectedArtist ? null : art)}
              className={`text-xs sm:text-[13px] px-3.5 py-1.5 rounded-full border transition-all ${
                selectedArtist === art
                  ? 'bg-orange-500 text-white border-orange-500 font-bold shadow-sm'
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-zinc-750'
              }`}
            >
              {art}
            </button>
          ))}
        </div>
      )}

      {/* Seletor de Estilos em Abas */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-zinc-800">
        {ALL_STYLES.map(st => {
          const isSelected = selectedStyle === st || (!selectedStyle && st === 'Todos');
          return (
            <button
              key={st}
              onClick={() => setSelectedStyle(st === 'Todos' ? null : st)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#181818] hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>

      {/* Título e Quantidade */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          {selectedStyle ? `Músicas de ${selectedStyle}` : selectedArtist ? `Músicas de ${selectedArtist}` : 'Catálogo de Músicas'}
        </h2>
        <span className="text-xs text-zinc-400 font-mono">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'música encontrada' : 'músicas encontradas'}
        </span>
      </div>

      {/* Grade de Músicas */}
      {filteredSongs.length === 0 ? (
        <div className="p-12 text-center bg-[#181818] rounded-2xl border border-zinc-800">
          <p className="text-sm text-zinc-400">Nenhuma música encontrada para os filtros selecionados.</p>
          <button
            onClick={() => { setSearch(''); setSelectedStyle(null); setSelectedArtist(null); }}
            className="mt-3 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSongs.map((song, idx) => {
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
                      <CheckCircle2 size={13} className="text-orange-500 fill-orange-500/20 shrink-0" />
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
  );
};
