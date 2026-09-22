import React, { useMemo } from 'react';
import type { Song, Setlist } from '../types/music';
import {
  ListMusic,
  Lock,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Mic2,
  Camera,
  Music,
  Play
} from 'lucide-react';

interface HomeHubViewProps {
  songs: Song[];
  setlists: Setlist[];
  onSelectSong: (song: Song) => void;
  onSelectSetlist: (setlist: Setlist) => void;
  onCreateNewSetlist?: () => void;
  onNavigateToSongsList: (filters?: { search?: string; style?: string | null; artist?: string | null; tab?: 'all' | 'setlists' | 'songs' | 'artists' | 'archived' }) => void;
  onEditArtistPhoto?: (artistName: string, currentAvatar?: string) => void;
  onEditSetlistPhoto?: (setlist: Setlist) => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  songs,
  setlists,
  onSelectSong,
  onSelectSetlist,
  onNavigateToSongsList,
  onEditArtistPhoto,
  onEditSetlistPhoto,
}) => {
  const ALL_STYLES = ['Samba', 'MPB', 'Rock', 'Sertanejo', 'Gospel'];

  // Filtrar apenas itens ativos (não arquivados)
  const activeSetlists = useMemo(() => setlists.filter(s => !s.arquivado), [setlists]);
  const activeSongs = useMemo(() => songs.filter(s => !s.arquivado), [songs]);

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

      {/* SEÇÃO 1: Repertórios */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ListMusic size={20} className="text-orange-500" />
            Repertórios
            <span className="text-xs font-mono text-zinc-400 font-normal">
              ({activeSetlists.length})
            </span>
          </h2>

          <button
            onClick={() => onNavigateToSongsList({ tab: 'setlists' })}
            className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-orange-500/10"
          >
            <span>Mostrar todos</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Grade de Repertórios com Suporte a Foto Personalizada */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {activeSetlists.slice(0, 6).map((setlist, idx) => (
            <div
              key={setlist.id}
              onClick={() => onSelectSetlist(setlist)}
              className="group cursor-pointer flex flex-col transition-all duration-200 hover:-translate-y-1 select-none"
            >
              <div className={`aspect-square w-full rounded-2xl ${
                setlist.cover_image ? 'bg-zinc-800' : `bg-gradient-to-br ${setlist.cover_gradient || (idx % 2 === 0 ? 'from-orange-500 to-amber-700' : 'from-zinc-800 to-zinc-900')}`
              } p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group-hover:ring-2 group-hover:ring-orange-500 transition-all`}>
                {setlist.cover_image && (
                  <img
                    src={setlist.cover_image}
                    alt={setlist.nome}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                  />
                )}

                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center gap-1 font-semibold">
                    {setlist.publico ? <Globe size={11} /> : <Lock size={11} />}
                    {setlist.publico ? 'Público' : 'Privado'}
                  </span>
                  <div className="flex items-center gap-1">
                    {onEditSetlistPhoto && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSetlistPhoto(setlist);
                        }}
                        title="Alterar capa do repertório"
                        className="p-1 rounded-full bg-black/40 hover:bg-orange-500 text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Camera size={12} />
                      </button>
                    )}
                    <ListMusic size={17} className="text-white/80" />
                  </div>
                </div>

                <div className="relative z-10">
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
        </div>
      </section>

      {/* SEÇÃO 2: Cifras e Músicas em Destaque (Clique abre direto no palco) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Music size={20} className="text-orange-500" />
            Cifras em Destaque
          </h2>

          <button
            onClick={() => onNavigateToSongsList({ tab: 'songs' })}
            className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-orange-500/10"
          >
            <span>Mostrar todas</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeSongs.slice(0, 6).map(song => (
            <div
              key={song.id}
              onClick={() => onSelectSong(song)}
              className="p-3.5 bg-[#181818] hover:bg-[#202020] border border-zinc-800 hover:border-orange-500/50 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-zinc-850 flex items-center justify-center font-bold text-orange-400 text-xs shrink-0 border border-zinc-750">
                  {song.tom_original}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                    {song.titulo}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                    <span>{song.artista}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {song.estilo}
                    </span>
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-orange-500 text-zinc-400 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <Play size={13} fill="currentColor" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 3: Estilos Musicais */}
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
              onClick={() => onNavigateToSongsList({ style, tab: 'songs' })}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap bg-[#181818] hover:bg-orange-500 hover:text-white text-zinc-300 border border-zinc-800 transition-all shadow-md active:scale-95"
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* SEÇÃO 3: Artistas (Quebra de linha sem barra horizontal) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mic2 size={20} className="text-orange-500" />
            Artistas
          </h2>

          <button
            onClick={() => onNavigateToSongsList({ tab: 'artists' })}
            className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-orange-500/10"
          >
            <span>Mostrar todos</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Quebra de linha inteligente para não criar rolagem horizontal */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-2">
          {topArtists.map(artist => (
            <div
              key={artist.name}
              onClick={() => onNavigateToSongsList({ artist: artist.name, tab: 'songs' })}
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
