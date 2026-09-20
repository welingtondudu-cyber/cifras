import { useState, useEffect, useMemo } from 'react';
import type {
  Song,
  Setlist,
  InstrumentType,
  ViewMode,
  ScreenView,
  UserProfile
} from './types/music';
import {
  DEFAULT_SONGS,
  DEFAULT_SETLISTS,
  fetchMusicas,
  fetchSetlists,
  createMusicaDb,
  updateMusicaDb,
  createSetlistDb,
  updateSetlistItemsOrderDb,
  getCurrentUser,
  signOutUser,
  supabase
} from './lib/supabaseClient';
import { parseChordPro } from './chordEngine/chordProParser';
import { useSmartScroll } from './hooks/useSmartScroll';
import { LoginScreen } from './components/LoginScreen';
import { GlobalHeader } from './components/GlobalHeader';
import { HomeHubView } from './components/HomeHubView';
import { SongsListView } from './components/SongsListView';
import { StageHeader } from './components/StageHeader';
import { CifraClubSidebar } from './components/CifraClubSidebar';
import { ChordSheetView } from './components/ChordSheetView';
import { LeadSheetGrid } from './components/LeadSheetGrid';
import { DegreeGrid } from './components/DegreeGrid';
import { RightSidebarAI } from './components/RightSidebarAI';
import { SetlistDetailView } from './components/SetlistDetailView';
import { CreateSetlistModal } from './components/CreateSetlistModal';
import { SongLibraryModal } from './components/SongLibraryModal';
import { ChordDictionaryModal } from './components/ChordDictionaryModal';
import { EditArtistModal } from './components/EditArtistModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export function App() {
  // Autenticação (Apenas pessoas logadas têm acesso ao sistema)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Telas e navegação
  const [screenView, setScreenView] = useState<ScreenView>('home');

  // Parâmetros para a tela dedicada de músicas (SongsListView)
  const [songListFilters, setSongListFilters] = useState<{
    search?: string;
    style?: string | null;
    artist?: string | null;
  }>({});

  // Dados
  const [songs, setSongs] = useState<Song[]>(DEFAULT_SONGS);
  const [setlists, setSetlists] = useState<Setlist[]>(DEFAULT_SETLISTS);

  // Música e repertório ativos
  const [activeSong, setActiveSong] = useState<Song>(DEFAULT_SONGS[0]);
  const [activeSetlist, setActiveSetlist] = useState<Setlist | null>(DEFAULT_SETLISTS[0]);
  const [songIndexInSetlist, setSongIndexInSetlist] = useState<number>(0);

  // Controles de Palco
  const [semitones, setSemitones] = useState<number>(0);
  const [columns, setColumns] = useState<1 | 2>(1);
  const [instrument, setInstrument] = useState<InstrumentType>('violao');
  const [showTablature, setShowTablature] = useState<boolean>(true);
  const [showDiagrams, setShowDiagrams] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('chordpro');
  const [fontSize] = useState<number>(18);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Painel de IA lateral (estilo IDE Antigravity)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState<boolean>(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState<boolean>(false);
  const [pendingAIPrompt, setPendingAIPrompt] = useState<string | null>(null);

  // Disparar reordenação harmônica de repertório com IA
  const handleRequestAIReorder = () => {
    if (!activeSetlist) return;
    setIsAIPanelOpen(true);
    setPendingAIPrompt(
      `Reordene as músicas do repertório '${activeSetlist.nome}' para criar a melhor sequência harmônica com transições suaves de tom para o show ao vivo.`
    );
  };

  // Modais e Estados Auxiliares
  const [isCreateSetlistOpen, setIsCreateSetlistOpen] = useState<boolean>(false);
  const [isCreateSongOpen, setIsCreateSongOpen] = useState<boolean>(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editingArtist, setEditingArtist] = useState<{ name: string; avatar?: string } | null>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  // Favoritos persistentes sincronizados com o repertório de Favoritos
  const [favoriteSongIds, setFavoriteSongIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('cifralab_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set([DEFAULT_SONGS[0].id]);
    } catch {
      return new Set();
    }
  });

  // Smart Scroll Hook
  const {
    isPlaying,
    speed,
    isTemporarilyPaused,
    setSpeed,
    togglePlay,
  } = useSmartScroll();

  // Verificar autenticação inicial e carregar dados
  useEffect(() => {
    async function init() {
      const u = await getCurrentUser();
      setUser(u);
      setAuthChecking(false);

      const dbSongs = await fetchMusicas();
      if (dbSongs && dbSongs.length > 0) {
        setSongs(dbSongs);
      }

      const dbSetlists = await fetchSetlists();
      if (dbSetlists && dbSetlists.length > 0) {
        setSetlists(dbSetlists);
      }

      // Aplicar fotos personalizadas de artistas salvas
      try {
        const savedAvatars = JSON.parse(localStorage.getItem('cifralab_artist_avatars') || '{}');
        if (Object.keys(savedAvatars).length > 0) {
          setSongs(prev =>
            prev.map(s => (savedAvatars[s.artista] ? { ...s, avatar_url: savedAvatars[s.artista] } : s))
          );
        }
      } catch {}
    }

    init();

    const channel = supabase
      .channel('cifralab-sync-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'setlists' }, () => {
        fetchSetlists().then(data => data && setSetlists(data));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'musicas' }, () => {
        fetchMusicas().then(data => data && setSongs(data));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Parser em tempo real da cifra ativa
  const parsedSong = useMemo(() => {
    return parseChordPro(activeSong.chordpro, semitones);
  }, [activeSong.chordpro, semitones]);

  // Transposição
  const handleTranspose = (delta: number) => {
    setSemitones(prev => prev + delta);
  };

  // Navegar para a tela dedicada de Músicas
  const handleNavigateToSongsList = (filters?: { search?: string; style?: string | null; artist?: string | null }) => {
    setSongListFilters(filters || {});
    setScreenView('songs_list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tocar música individual
  const handleSelectSongToPlay = (song: Song) => {
    setActiveSong(song);
    setActiveSetlist(null);
    setSongIndexInSetlist(0);
    setSemitones(0);
    setScreenView('stage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abrir detalhes do Repertório
  const handleOpenSetlist = (setlist: Setlist) => {
    setActiveSetlist(setlist);
    setScreenView('setlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Iniciar Reprodução do Repertório no Palco
  const handlePlaySetlist = (startIndex: number = 0) => {
    if (!activeSetlist || activeSetlist.itens.length === 0) return;
    const targetItem = activeSetlist.itens[startIndex];
    if (targetItem?.musica) {
      setActiveSong(targetItem.musica);
      setSongIndexInSetlist(startIndex);
      setSemitones(0);
      setScreenView('stage');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Passar para Próxima ou Anterior música do repertório (fácil de palco)
  const handleNextSong = () => {
    if (!activeSetlist) return;
    const nextIndex = songIndexInSetlist + 1;
    if (nextIndex < activeSetlist.itens.length) {
      const nextSong = activeSetlist.itens[nextIndex].musica;
      if (nextSong) {
        setActiveSong(nextSong);
        setSongIndexInSetlist(nextIndex);
        setSemitones(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevSong = () => {
    if (!activeSetlist) return;
    const prevIndex = songIndexInSetlist - 1;
    if (prevIndex >= 0) {
      const prevSong = activeSetlist.itens[prevIndex].musica;
      if (prevSong) {
        setActiveSong(prevSong);
        setSongIndexInSetlist(prevIndex);
        setSemitones(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Reordenação de Itens do Repertório (Arrastar / Drag and Drop / IA)
  const handleReorderAllSetlistItems = async (reorderedItemIds: string[]) => {
    if (!activeSetlist) return;
    const reorderedItens: typeof activeSetlist.itens = [];

    reorderedItemIds.forEach((id, idx) => {
      const itemFound = activeSetlist.itens.find(i => i.id === id);
      if (itemFound) {
        reorderedItens.push({ ...itemFound, ordem: idx + 1 });
      }
    });

    const updatedSetlist = { ...activeSetlist, itens: reorderedItens };
    setActiveSetlist(updatedSetlist);
    setSetlists(prev => prev.map(s => (s.id === updatedSetlist.id ? updatedSetlist : s)));
    await updateSetlistItemsOrderDb(reorderedItemIds);
  };

  // Adicionar música ao repertório ativo
  const handleAddSongToActiveSetlist = (songId: string) => {
    if (!activeSetlist) return;
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    const newItem = {
      id: 'item-' + Date.now(),
      setlist_id: activeSetlist.id,
      musica_id: song.id,
      ordem: activeSetlist.itens.length + 1,
      musica: song
    };

    const updatedSetlist = {
      ...activeSetlist,
      itens: [...activeSetlist.itens, newItem]
    };
    setActiveSetlist(updatedSetlist);
    setSetlists(prev => prev.map(s => (s.id === updatedSetlist.id ? updatedSetlist : s)));
  };

  // Remover item do repertório
  const handleRemoveSetlistItem = (itemId: string) => {
    if (!activeSetlist) return;
    const filtered = activeSetlist.itens.filter(i => i.id !== itemId);
    const updated = { ...activeSetlist, itens: filtered };
    setActiveSetlist(updated);
    setSetlists(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  // Alternar privacidade do repertório
  const handleToggleSetlistPrivacy = () => {
    if (!activeSetlist) return;
    const updated = { ...activeSetlist, publico: !activeSetlist.publico };
    setActiveSetlist(updated);
    setSetlists(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  // Criar Repertório (Manualmente no Supabase + Estado Local)
  const handleCreateSetlist = async (
    name: string,
    description: string,
    isPublic: boolean,
    selectedSongIds: string[]
  ) => {
    const dbSetlist = await createSetlistDb({
      nome: name,
      descricao: description,
      publico: isPublic,
      songIds: selectedSongIds
    });

    if (dbSetlist) {
      setSetlists(prev => [dbSetlist, ...prev]);
      setActiveSetlist(dbSetlist);
      setScreenView('setlist');
      return;
    }

    // Fallback local caso offline
    const newSetlistId = 'set-' + Date.now();
    const items = selectedSongIds.map((sid, idx) => {
      const songFound = songs.find(s => s.id === sid);
      return {
        id: 'item-' + Date.now() + '-' + idx,
        setlist_id: newSetlistId,
        musica_id: sid,
        ordem: idx + 1,
        musica: songFound
      };
    });

    const newSetlist: Setlist = {
      id: newSetlistId,
      nome: name,
      descricao: description,
      owner_name: user?.name || 'Welington_sc',
      publico: isPublic,
      cover_gradient: 'from-orange-500 to-amber-700',
      itens: items
    };

    setSetlists(prev => [newSetlist, ...prev]);
    setActiveSetlist(newSetlist);
    setScreenView('setlist');
  };

  // Criar Repertório a partir da IA
  const handleCreateSetlistFromAI = async (name: string, songIds: string[]) => {
    await handleCreateSetlist(name, 'Criado pelo Assistente IA', true, songIds);
  };

  // Reordenar Repertório sugerido pela IA
  const handleReorderSetlistFromAI = (reorderedItemIds: string[]) => {
    handleReorderAllSetlistItems(reorderedItemIds);
  };

  // Cadastrar nova cifra individual (Supabase + Estado Local)
  const handleAddSong = async (newSongData: Omit<Song, 'id'>) => {
    const dbSong = await createMusicaDb(newSongData);
    const createdSong: Song = dbSong || {
      ...newSongData,
      id: 'song-' + Date.now()
    };
    setSongs(prev => [createdSong, ...prev]);
    setActiveSong(createdSong);
    setScreenView('stage');
  };

  // Upload massivo de cifras (Supabase + Estado Local)
  const handleBatchAddSongs = async (newSongsData: Omit<Song, 'id'>[]) => {
    const createdList: Song[] = [];
    for (let i = 0; i < newSongsData.length; i++) {
      const data = newSongsData[i];
      const dbSong = await createMusicaDb(data);
      createdList.push(
        dbSong || {
          ...data,
          id: 'song-bulk-' + Date.now() + '-' + i
        }
      );
    }
    setSongs(prev => [...createdList, ...prev]);
    if (createdList.length > 0) {
      setActiveSong(createdList[0]);
    }
  };

  // Editar cifra existente (Supabase + Estado Local)
  const handleEditActiveSong = () => {
    setEditingSong(activeSong);
    setIsCreateSongOpen(true);
  };

  const handleUpdateSong = async (updated: Song) => {
    await updateMusicaDb(updated);
    setSongs(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    if (activeSong.id === updated.id) {
      setActiveSong(updated);
    }
    // Sincronizar nos repertórios que contêm essa música
    setSetlists(prev =>
      prev.map(s => ({
        ...s,
        itens: s.itens.map(it => (it.musica_id === updated.id ? { ...it, musica: updated } : it))
      }))
    );
    setEditingSong(null);
  };

  // Favoritar / Desfavoritar Cifra com Sincronização ao Repertório "⭐ Favoritos"
  const handleToggleFavorite = (song: Song) => {
    setFavoriteSongIds(prev => {
      const next = new Set(prev);
      const isFav = next.has(song.id);
      if (isFav) {
        next.delete(song.id);
      } else {
        next.add(song.id);
      }

      try {
        localStorage.setItem('cifralab_favorites', JSON.stringify(Array.from(next)));
      } catch {}

      // Sincronizar com setlist de Favoritos
      setSetlists(currentSetlists => {
        const favIndex = currentSetlists.findIndex(s => s.id === 'set-favoritos');
        if (isFav) {
          // Remover do repertório de favoritos
          if (favIndex !== -1) {
            const updated = {
              ...currentSetlists[favIndex],
              itens: currentSetlists[favIndex].itens.filter(it => it.musica_id !== song.id)
            };
            return currentSetlists.map((s, idx) => (idx === favIndex ? updated : s));
          }
          return currentSetlists;
        } else {
          // Adicionar ao repertório de favoritos
          const newItem = {
            id: 'item-fav-' + song.id,
            setlist_id: 'set-favoritos',
            musica_id: song.id,
            ordem: 1,
            musica: song
          };
          if (favIndex !== -1) {
            const updated = {
              ...currentSetlists[favIndex],
              itens: [newItem, ...currentSetlists[favIndex].itens.filter(it => it.musica_id !== song.id)]
            };
            return currentSetlists.map((s, idx) => (idx === favIndex ? updated : s));
          } else {
            const newFavSetlist: Setlist = {
              id: 'set-favoritos',
              nome: '⭐ Favoritos',
              descricao: 'Músicas marcadas como favoritas no CIFRALAB',
              owner_name: user?.name || 'Welington_sc',
              publico: false,
              cover_gradient: 'from-amber-600 to-orange-700',
              itens: [newItem]
            };
            return [newFavSetlist, ...currentSetlists];
          }
        }
      });

      return next;
    });
  };

  // Baixar cifra em formato .txt
  const handleDownloadSong = (song: Song) => {
    const content = `=======================================================
CIFRALAB - ${song.titulo} - ${song.artista}
Tom Original: ${song.tom_original} | Estilo: ${song.estilo}
=======================================================

${song.chordpro}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${song.artista} - ${song.titulo}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Arquivar / Desarquivar Repertório
  const handleToggleArchiveSetlist = (setlistId: string) => {
    setSetlists(prev =>
      prev.map(s => {
        if (s.id === setlistId) {
          const updated = { ...s, arquivado: !s.arquivado };
          if (activeSetlist?.id === setlistId) {
            setActiveSetlist(updated);
          }
          return updated;
        }
        return s;
      })
    );
  };

  // Editar Nome e Descrição do Repertório
  const handleUpdateSetlistDetails = (name: string, description: string) => {
    if (!activeSetlist) return;
    const updated = { ...activeSetlist, nome: name, descricao: description };
    setActiveSetlist(updated);
    setSetlists(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  // Editar Foto do Artista e persistir no acervo e localStorage
  const handleSaveArtistAvatar = (artistName: string, newAvatarUrl: string) => {
    setSongs(prev =>
      prev.map(song =>
        song.artista.toLowerCase() === artistName.toLowerCase()
          ? { ...song, avatar_url: newAvatarUrl }
          : song
      )
    );
    try {
      const existing = JSON.parse(localStorage.getItem('cifralab_artist_avatars') || '{}');
      existing[artistName] = newAvatarUrl;
      localStorage.setItem('cifralab_artist_avatars', JSON.stringify(existing));
    } catch {}
  };

  // Logout
  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    setScreenView('home');
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 1. Bloqueio de Acesso: Apenas pessoas logadas podem acessar
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-zinc-400 font-mono text-sm">
        Carregando cifralab...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col antialiased selection:bg-orange-500/30 selection:text-orange-300">
      {/* Header Global Adaptativo (Presente nas telas Home, Músicas e Repertório) */}
      {screenView !== 'stage' && (
        <GlobalHeader
          currentView={screenView}
          user={user}
          onSearchSubmit={q => handleNavigateToSongsList({ search: q })}
          onOpenNewSong={() => setIsCreateSongOpen(true)}
          onToggleAIPanel={() => setIsAIPanelOpen(prev => !prev)}
          onLogout={handleLogout}
          onGoHome={() => setScreenView('home')}
        />
      )}

      {/* Container Principal com Suporte ao Chat Lateral Estilo IDE Antigravity */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lado Esquerdo / Conteúdo Central */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-[calc(100vh-57px)] pb-14 lg:pb-0">

          {/* TELA 1: HOME HUB (Repertórios com busca, Estilos e Artistas Principais) */}
          {screenView === 'home' && (
            <HomeHubView
              songs={songs}
              setlists={setlists}
              onSelectSetlist={handleOpenSetlist}
              onCreateNewSetlist={() => setIsCreateSetlistOpen(true)}
              onNavigateToSongsList={handleNavigateToSongsList}
              onEditArtistPhoto={(name, avatar) => setEditingArtist({ name, avatar })}
            />
          )}

          {/* TELA 2: LISTAGEM DEDICADA DE MÚSICAS (Busca, Estilos, Cantores) */}
          {screenView === 'songs_list' && (
            <SongsListView
              songs={songs}
              setlists={setlists}
              onSelectSetlist={handleOpenSetlist}
              favoriteSongIds={favoriteSongIds}
              onToggleFavorite={handleToggleFavorite}
              initialSearch={songListFilters.search}
              initialStyle={songListFilters.style}
              initialArtist={songListFilters.artist}
              onBack={() => setScreenView('home')}
              onSelectSong={handleSelectSongToPlay}
            />
          )}

          {/* TELA 3: REPERTÓRIO (Visualização, Drag & Drop e Chat IA) */}
          {screenView === 'setlist' && activeSetlist && (
            <SetlistDetailView
              setlist={activeSetlist}
              allAvailableSongs={songs}
              onBack={() => setScreenView('home')}
              onPlaySetlist={handlePlaySetlist}
              onReorderAllItems={handleReorderAllSetlistItems}
              onRemoveItem={handleRemoveSetlistItem}
              onAddSongToSetlist={handleAddSongToActiveSetlist}
              onTogglePrivacy={handleToggleSetlistPrivacy}
              onToggleArchive={() => handleToggleArchiveSetlist(activeSetlist.id)}
              onUpdateSetlistDetails={handleUpdateSetlistDetails}
              onToggleAIPanel={() => setIsAIPanelOpen(prev => !prev)}
              onRequestAIReorder={handleRequestAIReorder}
              onSelectSongDirectly={(song, idx) => {
                setActiveSong(song);
                setSongIndexInSetlist(idx);
                setScreenView('stage');
              }}
            />
          )}

          {/* TELA 4: PALCO / CIFRA (Design Cifra Club Fiel) */}
          {screenView === 'stage' && (
            <div className="flex-1 flex flex-col">
              {/* Header com Navegador de Músicas do Show */}
              <StageHeader
                currentSong={activeSong}
                currentSetlist={activeSetlist}
                songIndexInSetlist={songIndexInSetlist}
                totalSongsInSetlist={activeSetlist ? activeSetlist.itens.length : 1}
                onPrevSong={handlePrevSong}
                onNextSong={handleNextSong}
                onBackToHome={() => setScreenView(activeSetlist ? 'setlist' : 'home')}
                isAIPanelOpen={isAIPanelOpen}
                onToggleAIPanel={() => setIsAIPanelOpen(prev => !prev)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
              />

              {/* Corpo da Tela de Cifra com Sidebar Esquerda e Conteúdo */}
              <div className="flex-1 flex flex-col lg:flex-row">
                {/* Sidebar Esquerda de Palco (sem afinação e capotraste) */}
                <div className={`${isMobileToolsOpen ? 'block' : 'hidden lg:block'}`}>
                  <CifraClubSidebar
                    onBack={() => setScreenView(activeSetlist ? 'setlist' : 'home')}
                    isPlaying={isPlaying}
                    speed={speed}
                    isTemporarilyPaused={isTemporarilyPaused}
                    onToggleScroll={togglePlay}
                    onSpeedChange={setSpeed}
                    columns={columns}
                    onToggleColumns={() => setColumns(prev => (prev === 1 ? 2 : 1))}
                    instrument={instrument}
                    onToggleInstrument={() =>
                      setInstrument(prev => (prev === 'cavaco' ? 'violao' : 'cavaco'))
                    }
                    currentKey={parsedSong.key}
                    onTranspose={handleTranspose}
                    showTablature={showTablature}
                    onToggleTablature={() => setShowTablature(prev => !prev)}
                    showDiagrams={showDiagrams}
                    onToggleDiagrams={() => setShowDiagrams(prev => !prev)}
                    isFavorite={favoriteSongIds.has(activeSong.id)}
                    onToggleFavorite={() => handleToggleFavorite(activeSong)}
                    onEditSong={handleEditActiveSong}
                    onDownloadSong={() => handleDownloadSong(activeSong)}
                  />
                </div>

                {/* Conteúdo Central da Cifra */}
                <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6">
                  {viewMode === 'chordpro' && (
                    <ChordSheetView
                      parsedSong={parsedSong}
                      instrument={instrument}
                      showTablature={showTablature}
                      showDiagrams={showDiagrams}
                      fontSize={fontSize}
                      columns={columns}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onSelectChord={chord => {
                        setSelectedChord(chord);
                        setIsDictionaryOpen(true);
                      }}
                    />
                  )}

                  {viewMode === 'leadSheet' && (
                    <LeadSheetGrid
                      parsedSong={parsedSong}
                      instrument={instrument}
                      showDiagrams={showDiagrams}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onSelectChord={chord => {
                        setSelectedChord(chord);
                        setIsDictionaryOpen(true);
                      }}
                    />
                  )}

                  {viewMode === 'degrees' && (
                    <DegreeGrid
                      parsedSong={parsedSong}
                      instrument={instrument}
                      showDiagrams={showDiagrams}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onSelectChord={chord => {
                        setSelectedChord(chord);
                        setIsDictionaryOpen(true);
                      }}
                    />
                  )}
                </main>
              </div>
            </div>
          )}
        </div>

        {/* Painel Lateral de Chat IA Acoplado à Direita (Estilo IDE Antigravity) */}
        <RightSidebarAI
          isOpen={isAIPanelOpen}
          onToggle={() => setIsAIPanelOpen(prev => !prev)}
          screenView={screenView}
          currentSong={activeSong}
          currentSetlist={activeSetlist}
          availableSetlists={setlists}
          instrument={instrument}
          availableSongs={songs}
          onCreateSetlistFromAI={handleCreateSetlistFromAI}
          onReorderSetlistFromAI={handleReorderSetlistFromAI}
          promptToExecute={pendingAIPrompt}
          onPromptExecuted={() => setPendingAIPrompt(null)}
        />
      </div>

      {/* Barra de Navegação Inferior para Mobile */}
      <MobileBottomNav
        currentView={screenView}
        onNavigate={setScreenView}
        onToggleAIPanel={() => setIsAIPanelOpen(prev => !prev)}
        onToggleTools={() => setIsMobileToolsOpen(prev => !prev)}
        hasActiveSong={!!activeSong}
      />

      {/* Modais */}
      <CreateSetlistModal
        isOpen={isCreateSetlistOpen}
        onClose={() => setIsCreateSetlistOpen(false)}
        songs={songs}
        onCreate={handleCreateSetlist}
      />

      <SongLibraryModal
        isOpen={isCreateSongOpen}
        onClose={() => {
          setIsCreateSongOpen(false);
          setEditingSong(null);
        }}
        songs={songs}
        activeSongId={activeSong.id}
        onSelectSong={handleSelectSongToPlay}
        onAddSong={handleAddSong}
        onAddBatchSongs={handleBatchAddSongs}
        editingSong={editingSong}
        onUpdateSong={handleUpdateSong}
        isRealtimeConnected={true}
      />

      <ChordDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        chords={parsedSong.chords}
        instrument={instrument}
        onToggleInstrument={() =>
          setInstrument(prev => (prev === 'cavaco' ? 'violao' : 'cavaco'))
        }
        highlightedChord={selectedChord}
      />

      <EditArtistModal
        isOpen={!!editingArtist}
        onClose={() => setEditingArtist(null)}
        artistName={editingArtist?.name || ''}
        currentAvatarUrl={editingArtist?.avatar}
        onSaveAvatar={handleSaveArtistAvatar}
      />
    </div>
  );
}

export default App;
