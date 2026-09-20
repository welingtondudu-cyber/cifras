import React, { useState, useMemo } from 'react';
import type { Song, Setlist } from '../types/music';
import {
  Plus,
  ListMusic,
  Lock,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Mic2,
  Archive,
  Camera
} from 'lucide-react';

interface HomeHubViewProps {
  songs: Song[];
  setlists: Setlist[];
  onSelectSetlist: (setlist: Setlist) => void;
  onCreateNewSetlist: () => void;
  onNavigateToSongsList: (filters?: { search?: string; style?: string | null; artist?: string | null }) => void;
  onEditArtistPhoto?: (artistName: string, currentAvatar?: string) => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  songs,
  setlists,
  onSelectSetlist,
  onCreateNewSetlist,
  onNavigateToSongsList,
  onEditArtistPhoto,
}) => {
  const [showAllSetlists, setShowAllSetlists] = useState(false);
  const [viewArchived, setViewArchived] = useState(false);

  const ALL_STYLES = ['Samba', 'MPB', 'Rock', 'Sertanejo', 'Gospel'];

  // Separar repertórios ativos e arquivados
  const activeSetlists = useMemo(() => setlists.filter(s => !s.arquivado), [setlists]);
  const archivedSetlists = useMemo(() => setlists.filter(s => s.arquivado), [setlists]);

  const currentList = viewArchived ? archivedSetlists : activeSetlists;

  // Exibir os 5 mais recentes por padrão, ou todos se clicar em "Mostrar todos"
  const displayedSetlists = useMemo(() => {
    if (showAllSetlists) return currentList;
    return currentList.slice(0, 5);
  }, [currentList, showAllSetlists]);

  // Artistas que possuem mais músicas (sendo até 3 por estilo musical, sem subtítulos)
  const topArtists = useMemo(() => {
    const counts: Record<string, { count: number; estilo: string; avatar?: string }> = {};

    songs.forEach(s => {
      if (!counts[s.artista]) {
        counts[s.artista] = { count: 0, estilo: s.estilo, avatar: s.avatar_url };
      }
      counts[s.artista].count += 1;
    });

    const artistsByStyle: Record<string, string[]> = {};
    ALL_STYLES.forEach(st => { artistsByStyle[st] = []; });

    const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
    const result: { name: string; count: number; estilo: string; avatar?: string }[] = [];

    sorted.forEach(([artistName, data]) => {
      const st = data.estilo || 'Outro';
      if (!artistsByStyle[st]) artistsByStyle[st] = [];
      if (artistsByStyle[st].length < 3) {
        artistsByStyle[st].push(artistName);
        result.push({
          name: artistName,
          count: data.count,
          estilo: data.estilo,
          avatar: data.avatar
        });
      }
    });

    return result;
  }, [songs]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-9 text-zinc-100 pb-24">

      {/* SEÇÃO 1: Repertórios (5 mais recentes + botão Mostrar todos) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ListMusic size={20} className="text-orange-500" />
            {viewArchived ? 'Repertórios Arquivados' : 'Repertórios'}
            <span className="text-xs font-mono text-zinc-400 font-normal">
              ({displayedSetlists.length} de {currentList.length})
            </span>
          </h2>

          <div className="flex items-center gap-2 sm:gap-3">
            {archivedSetlists.length > 0 && (
              <button
                onClick={() => {
                  setViewArchived(prev => !prev);
                  setShowAllSetlists(false);
                }}
                className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-orange-400 flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-850"
                title={viewArchived ? 'Ver repertórios ativos' : 'Ver repertórios arquivados'}
              >
                <Archive size={15} />
                <span>{viewArchived ? 'Ver Ativos' : `Arquivados (${archivedSetlists.length})`}</span>
              </button>
            )}

            <button
              onClick={() => setShowAllSetlists(prev => !prev)}
              className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-orange-500/10"
            >
              <span>{showAllSetlists ? 'Mostrar menos' : 'Mostrar todos'}</span>
              <ChevronRight size={15} className={showAllSetlists ? 'rotate-90' : ''} />
            </button>
          </div>
        </div>

        {/* Grade de Repertórios (5 mais recentes + Criar Novo) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {displayedSetlists.map((setlist, idx) => (
            <div
              key={setlist.id}
              onClick={() => onSelectSetlist(setlist)}
              className="group cursor-pointer flex flex-col transition-all duration-200 hover:-translate-y-1 select-none"
            >
              <div className={`aspect-square w-full rounded-2xl bg-gradient-to-br ${
                setlist.cover_gradient || (idx % 2 === 0 ? 'from-orange-500 to-amber-700' : 'from-zinc-800 to-zinc-900')
              } p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group-hover:ring-2 group-hover:ring-orange-500 transition-all`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center gap-1 font-semibold">
                    {setlist.publico ? <Globe size={11} /> : <Lock size={11} />}
                    {setlist.publico ? 'Público' : 'Privado'}
                  </span>
                  <ListMusic size={17} className="text-white/80" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-md">
                    {setlist.nome}
                  </h3>
                </div>
              </div>

              <div className="mt-2">
                <span className="block text-xs sm:text-[13px] font-bold text-zinc-200 group-hover:text-orange-400 transition-colors truncate">
                  {setlist.nome}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {setlist.itens.length} {setlist.itens.length === 1 ? 'música' : 'músicas'} • {setlist.owner_name || 'Welington_sc'}
                </span>
              </div>
            </div>
          ))}

          {/* Card para Criar Novo Repertório */}
          {!viewArchived && (
            <div
              onClick={onCreateNewSetlist}
              className="aspect-square w-full rounded-2xl border-2 border-dashed border-zinc-800 hover:border-orange-500 bg-[#181818]/60 hover:bg-orange-500/5 cursor-pointer flex flex-col items-center justify-center p-4 text-center transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-zinc-800 group-hover:bg-orange-500 group-hover:text-white text-zinc-400 flex items-center justify-center transition-colors mb-2 shadow-sm">
                <Plus size={20} />
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-zinc-300 group-hover:text-orange-400">Novo Repertório</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Público ou Privado</span>
            </div>
          )}
        </div>
      </section>

      {/* SEÇÃO 2: Estilos Musicais */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-orange-500" />
            Estilos Musicais
          </h2>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {ALL_STYLES.map(style => (
            <button
              key={style}
              onClick={() => onNavigateToSongsList({ style })}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap bg-[#181818] hover:bg-orange-500 hover:text-white text-zinc-300 border border-zinc-800 transition-all shadow-md active:scale-95"
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* SEÇÃO 3: Artistas (Com Ícone no Título) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mic2 size={20} className="text-orange-500" />
            Artistas
          </h2>

          <button
            onClick={() => onNavigateToSongsList({})}
            className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-orange-500/10"
          >
            <span>Mostrar todos</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 scrollbar-none">
          {topArtists.map(artist => (
            <div
              key={artist.name}
              onClick={() => onNavigateToSongsList({ artist: artist.name })}
              className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
            >
              <div className="relative group/avatar">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-zinc-750 group-hover:border-orange-500 group-hover:scale-105 shadow-lg transition-all bg-zinc-800 flex items-center justify-center">
                  {artist.avatar ? (
                    <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-orange-400">{artist.name[0]}</span>
                  )}
                </div>

                {onEditArtistPhoto && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditArtistPhoto(artist.name, artist.avatar);
                    }}
                    title={`Editar foto de ${artist.name}`}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-zinc-900 border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-md group-hover/avatar:scale-110"
                  >
                    <Camera size={13} />
                  </button>
                )}
              </div>
              <div className="text-center max-w-[90px]">
                <span className="block text-xs font-semibold text-zinc-300 group-hover:text-orange-400 truncate transition-colors">
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

    </div>
  );
};
