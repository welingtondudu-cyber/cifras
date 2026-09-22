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
  addSongToSetlistDb,
  removeSongFromSetlistDb,
  getCurrentUser,
  signOutUser,
  supabase
} from './lib/supabaseClient';
import { parseChordPro } from './chordEngine/chordProParser';
import { transposeChordProText } from './chordEngine/transposer';
import { ArrowLeft, Plus } from 'lucide-react';
import { useSmartScroll } from './hooks/useSmartScroll';
import { LoginScreen } from './components/LoginScreen';
import { GlobalHeader } from './components/GlobalHeader';
import { HomeHubView } from './components/HomeHubView';
import { SongsListView } from './components/SongsListView';
import { ChordSheetView } from './components/ChordSheetView';
import { LeadSheetGrid } from './components/LeadSheetGrid';
import { DegreeGrid } from './components/DegreeGrid';
import { RightSidebarAI } from './components/RightSidebarAI';
import { SetlistDetailView } from './components/SetlistDetailView';
import { CreateSetlistModal } from './components/CreateSetlistModal';
import { SongLibraryModal } from './components/SongLibraryModal';
import { ChordDictionaryModal } from './components/ChordDictionaryModal';
import { EditArtistModal } from './components/EditArtistModal';
import { EditSetlistPhotoModal } from './components/EditSetlistPhotoModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SongFloatingToolbar } from './components/SongFloatingToolbar';
import { SongOptionsSheet } from './components/SongOptionsSheet';
import { TablatureEditorModal } from './components/TablatureEditorModal';
import {
  getSavedFavorites,
  saveFavorites,
  getSavedCustomSongs,
  saveCustomSong,
  getSavedCustomSetlists,
  saveAllSetlists
} from './lib/storage';

export function App() {
  // Autenticação com restauração imediata de sessão salva no localStorage
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('cifralab_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authChecking, setAuthChecking] = useState<boolean>(false);

  // Rastreamento da origem de navegação para o botão Voltar da cifra
  type NavigationSource =
    | { type: 'home' }
    | { type: 'songs_list'; filters?: { search?: string; style?: string | null; artist?: string | null; tab?: 'all' | 'setlists' | 'songs' | 'artists' | 'archived' } }
    | { type: 'setlist'; setlist: Setlist };

  // Recuperação de tela e cifra salvas para evitar retorno de página no F5 (atualização)
  const savedNav = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('cifralab_active_nav');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  // Telas e navegação
  const [screenView, setScreenView] = useState<ScreenView>(() => {
    return savedNav?.screenView || 'home';
  });

  const [navigationSource, setNavigationSource] = useState<NavigationSource>(() => {
    return savedNav?.navigationSource || { type: 'home' };
  });

  // Parâmetros para a tela dedicada de músicas (SongsListView)
  const [songListFilters, setSongListFilters] = useState<{
    search?: string;
    style?: string | null;
    artist?: string | null;
    tab?: 'all' | 'setlists' | 'songs' | 'artists' | 'archived';
  }>(() => {
    return savedNav?.songListFilters || {};
  });

  // Dados com persistência híbrida
  const [songs, setSongs] = useState<Song[]>(() => {
    const cached = getSavedCustomSongs();
    return cached.length > 0 ? cached : DEFAULT_SONGS;
  });
  const [setlists, setSetlists] = useState<Setlist[]>(() => {
    return getSavedCustomSetlists();
  });

  // Música e repertório ativos
  const [activeSong, setActiveSong] = useState<Song>(() => {
    const cachedSongs = getSavedCustomSongs();
    const all = cachedSongs.length > 0 ? cachedSongs : DEFAULT_SONGS;
    if (savedNav?.activeSongId) {
      const found = all.find(s => s.id === savedNav.activeSongId);
      if (found) return found;
    }
    return all[0] || DEFAULT_SONGS[0];
  });

  const [activeSetlist, setActiveSetlist] = useState<Setlist | null>(() => {
    const cachedSetlists = getSavedCustomSetlists().filter(s => s.id !== 'set-1' && s.nome.trim().toLowerCase() !== 'recentes');
    if (savedNav?.activeSetlistId) {
      const found = cachedSetlists.find(s => s.id === savedNav.activeSetlistId);
      if (found) return found;
    }
    const defaultClean = DEFAULT_SETLISTS.filter(s => s.id !== 'set-1' && s.nome.trim().toLowerCase() !== 'recentes');
    return cachedSetlists[0] || defaultClean[0] || null;
  });

  const [songIndexInSetlist, setSongIndexInSetlist] = useState<number>(() => {
    return typeof savedNav?.songIndexInSetlist === 'number' ? savedNav.songIndexInSetlist : 0;
  });

  // Controles de Palco
  const [semitones, setSemitones] = useState<number>(0);
  const [columns, setColumns] = useState<1 | 2>(1);
  const [instrument, setInstrument] = useState<InstrumentType>('violao');
  const [showTablature, setShowTablature] = useState<boolean>(true);
  const [showDiagrams, setShowDiagrams] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('chordpro');
  const [fontSize, setFontSize] = useState<number>(18);

  // Modais de Palco Mobile (Bottom Sheet e Editor de Tablaturas)
  const [isSongOptionsOpen, setIsSongOptionsOpen] = useState<boolean>(false);
  const [isTabEditorOpen, setIsTabEditorOpen] = useState<boolean>(false);

  // Painel de IA lateral (estilo IDE Antigravity)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState<boolean>(false);
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
  const [editingSetlistPhoto, setEditingSetlistPhoto] = useState<Setlist | null>(null);
  const [showTransitionNotes, setShowTransitionNotes] = useState<boolean>(true);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  // Favoritos persistentes sincronizados com o repertório de Favoritos
  const [favoriteSongIds, setFavoriteSongIds] = useState<Set<string>>(() => {
    return new Set(getSavedFavorites());
  });

  // Itens válidos (não arquivados) do repertório ativo com garantia de resolução de música
  const activeSetlistNonArchivedItems = useMemo(() => {
    if (!activeSetlist) return [];
    return activeSetlist.itens
      .map(item => ({
        ...item,
        musica: item.musica || songs.find(s => s.id === item.musica_id)
      }))
      .filter(item => item.musica && !item.musica.arquivado);
  }, [activeSetlist, songs]);

  // Próxima música no repertório para o palco
  const nextSong = useMemo(() => {
    if (!activeSetlist || activeSetlistNonArchivedItems.length === 0) return undefined;
    const nextItem = activeSetlistNonArchivedItems[songIndexInSetlist + 1];
    return nextItem?.musica;
  }, [activeSetlist, activeSetlistNonArchivedItems, songIndexInSetlist]);

  // Salvar rota atual para manter a cifra aberta se a página for atualizada (F5)
  useEffect(() => {
    try {
      sessionStorage.setItem('cifralab_active_nav', JSON.stringify({
        screenView,
        activeSongId: activeSong?.id,
        activeSetlistId: activeSetlist?.id,
        songIndexInSetlist,
        navigationSource,
        songListFilters
      }));
    } catch {}
  }, [screenView, activeSong?.id, activeSetlist?.id, songIndexInSetlist, navigationSource, songListFilters]);

  // Smart Scroll Hook com Avanço Automático e Rolagem Dupla
  const canAutoAdvance = Boolean(
    activeSetlist &&
    activeSetlist.itens &&
    songIndexInSetlist < activeSetlist.itens.length - 1
  );

  const {
    isPlaying,
    speed,
    isTemporarilyPaused,
    scrollCycles,
    currentCycle,
    autoAdvanceEnabled,
    setSpeed,
    togglePlay,
    setScrollCycles,
    setAutoAdvanceEnabled
  } = useSmartScroll({
    canAutoAdvance,
    onAutoAdvance: () => {
      handleNextSong();
    }
  });

  // Verificar autenticação inicial e carregar dados
  useEffect(() => {
    async function init() {
      const u = await getCurrentUser();
      setUser(u);
      setAuthChecking(false);

      const dbSongs = await fetchMusicas();
      if (dbSongs && dbSongs.length > 0) {
        setSongs(dbSongs);
        if (savedNav?.activeSongId) {
          const matching = dbSongs.find(s => s.id === savedNav.activeSongId);
          if (matching) setActiveSong(matching);
        }
      }

      const dbSetlists = await fetchSetlists();
      if (dbSetlists && dbSetlists.length > 0) {
        const clean = dbSetlists.filter(s => s.id !== 'set-1' && s.nome.trim().toLowerCase() !== 'recentes');
        setSetlists(clean);
        saveAllSetlists(clean);
        if (savedNav?.activeSetlistId) {
          const matching = clean.find(s => s.id === savedNav.activeSetlistId);
          if (matching) setActiveSetlist(matching);
        }
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
        fetchSetlists().then(data => {
          if (data && data.length > 0) {
            const clean = data.filter(s => s.id !== 'set-1' && s.nome.trim().toLowerCase() !== 'recentes');
            setSetlists(clean);
            saveAllSetlists(clean);
            setActiveSetlist(prev => (prev ? clean.find(s => s.id === prev.id) || prev : prev));
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'setlist_itens' }, () => {
        fetchSetlists().then(data => {
          if (data && data.length > 0) {
            const clean = data.filter(s => s.id !== 'set-1' && s.nome.trim().toLowerCase() !== 'recentes');
            setSetlists(clean);
            saveAllSetlists(clean);
            setActiveSetlist(prev => (prev ? clean.find(s => s.id === prev.id) || prev : prev));
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'musicas' }, () => {
        fetchMusicas().then(data => data && setSongs(data));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Persistência contínua de repertórios em cache resiliente
  useEffect(() => {
    if (setlists && setlists.length > 0) {
      saveAllSetlists(setlists);
    }
  }, [setlists]);

  // Parser em tempo real da cifra ativa
  const parsedSong = useMemo(() => {
    return parseChordPro(activeSong.chordpro, semitones);
  }, [activeSong.chordpro, semitones]);

  // Transposição
  const handleTranspose = (delta: number) => {
    setSemitones(prev => prev + delta);
  };

  // Navegar para o Catálogo / Listagem de Músicas
  const handleNavigateToSongsList = (filters?: {
    search?: string;
    style?: string | null;
    artist?: string | null;
    tab?: 'all' | 'setlists' | 'songs' | 'artists' | 'archived';
  }) => {
    setSongListFilters(filters || {});
    setScreenView('songs_list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navegar via Barra Inferior
  const handleBottomNavNavigate = (view: ScreenView) => {
    if (view === 'setlist' && !activeSetlist && setlists.length > 0) {
      setActiveSetlist(setlists[0]);
    }
    setScreenView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retorno inteligente da tela de palco / cifra de acordo com a origem
  const handleStageBack = () => {
    if (navigationSource.type === 'setlist') {
      setActiveSetlist(navigationSource.setlist);
      setScreenView('setlist');
    } else if (navigationSource.type === 'songs_list') {
      if (navigationSource.filters) {
        setSongListFilters(navigationSource.filters);
      }
      setScreenView('songs_list');
    } else {
      setScreenView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stageBackLabel = useMemo(() => {
    if (navigationSource.type === 'setlist') return 'o Repertório';
    if (navigationSource.type === 'songs_list') return 'o Catálogo';
    return 'o Início';
  }, [navigationSource]);

  // Perguntar à IA sugestão de passagem harmônica
  const handleAskAITransition = (fromTitle: string, toTitle: string, fromKey: string, toKey: string) => {
    setIsAIPanelOpen(true);
    setPendingAIPrompt(
      `Sugira os acordes de passagem em colchetes [Acorde] para transicionar de "${fromTitle}" (${fromKey}) para "${toTitle}" (${toKey}) de forma suave para o show ao vivo.`
    );
  };

  // Inserir tablatura criada no TabLab na cifra ativa
  const handleInsertTablature = (tabChordPro: string) => {
    const updatedChordPro = activeSong.chordpro + '\n' + tabChordPro;
    const updatedSong = { ...activeSong, chordpro: updatedChordPro };
    setActiveSong(updatedSong);
    setSongs(prev => {
      const next = prev.map(s => (s.id === updatedSong.id ? updatedSong : s));
      saveCustomSong(updatedSong);
      return next;
    });
    updateMusicaDb(updatedSong);
  };

  // Tocar música individual com rastreamento da tela de origem
  const handleSelectSongToPlay = (song: Song, origin?: NavigationSource) => {
    setActiveSong(song);
    setActiveSetlist(null);
    setSongIndexInSetlist(0);
    setSemitones(0);
    setNavigationSource(origin || { type: 'home' });
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
      setNavigationSource({ type: 'setlist', setlist: activeSetlist });
      setScreenView('stage');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Passar para Próxima ou Anterior música do repertório (fácil de palco)
  const handleNextSong = () => {
    if (!activeSetlist || activeSetlistNonArchivedItems.length === 0) return;
    const nextIndex = songIndexInSetlist + 1;
    if (nextIndex < activeSetlistNonArchivedItems.length) {
      const nextSongObj = activeSetlistNonArchivedItems[nextIndex].musica;
      if (nextSongObj) {
        setActiveSong(nextSongObj);
        setSongIndexInSetlist(nextIndex);
        setSemitones(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevSong = () => {
    if (!activeSetlist || activeSetlistNonArchivedItems.length === 0) return;
    const prevIndex = songIndexInSetlist - 1;
    if (prevIndex >= 0) {
      const prevSongObj = activeSetlistNonArchivedItems[prevIndex].musica;
      if (prevSongObj) {
        setActiveSong(prevSongObj);
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
    setSetlists(prev => {
      const next = prev.map(s => (s.id === updatedSetlist.id ? updatedSetlist : s));
      saveAllSetlists(next);
      return next;
    });
    await updateSetlistItemsOrderDb(reorderedItemIds);
  };

  // Adicionar música ao repertório ativo (com persistência garantida)
  const handleAddSongToActiveSetlist = async (songId: string) => {
    if (!activeSetlist) return;
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    if (song.arquivado) {
      alert('Esta cifra está arquivada e não pode ser adicionada.');
      return;
    }

    const currentItens = activeSetlist.itens || [];
    const alreadyIn = currentItens.some(i => i.musica_id === songId || i.musica?.id === songId);
    if (alreadyIn) {
      alert('Esta música já está incluída neste repertório.');
      return;
    }

    const nextOrder = currentItens.length + 1;
    // Persistir no Supabase ou gerar ID resiliente
    const dbItem = await addSongToSetlistDb(activeSetlist.id, song.id, nextOrder);

    const newItem = {
      id: dbItem?.id || ('item-' + Date.now()),
      setlist_id: activeSetlist.id,
      musica_id: song.id,
      ordem: nextOrder,
      musica: song
    };

    const updatedSetlist = {
      ...activeSetlist,
      itens: [...currentItens, newItem]
    };
    setActiveSetlist(updatedSetlist);
    setSetlists(prev => {
      const next = prev.map(s => (s.id === updatedSetlist.id ? updatedSetlist : s));
      saveAllSetlists(next);
      return next;
    });
  };

  // Salvar tom transposto atual no texto ChordPro e tom original da cifra
  const handleSaveCurrentKeyAsDefault = () => {
    if (!activeSong || semitones === 0) return;
    const newKey = parsedSong.key;
    const updatedChordPro = transposeChordProText(activeSong.chordpro, semitones);
    const updatedSong: Song = {
      ...activeSong,
      tom_original: newKey,
      chordpro: updatedChordPro
    };

    setActiveSong(updatedSong);
    setSemitones(0);

    setSongs(prev => {
      const next = prev.map(s => (s.id === updatedSong.id ? updatedSong : s));
      saveCustomSong(updatedSong);
      return next;
    });

    if (activeSetlist) {
      const updatedItens = activeSetlist.itens.map(it =>
        it.musica_id === updatedSong.id ? { ...it, musica: updatedSong } : it
      );
      const updatedSetlist = { ...activeSetlist, itens: updatedItens };
      setActiveSetlist(updatedSetlist);
      setSetlists(prev => prev.map(s => (s.id === updatedSetlist.id ? updatedSetlist : s)));
    }

    updateMusicaDb(updatedSong);
    alert(`Tom ${newKey} salvo com sucesso como padrão da cifra!`);
  };

  // Remover item do repertório (com persistência no Supabase e cache local)
  const handleRemoveSetlistItem = async (itemId: string) => {
    if (!activeSetlist) return;
    await removeSongFromSetlistDb(itemId);
    const filtered = activeSetlist.itens.filter(i => i.id !== itemId);
    const updated = { ...activeSetlist, itens: filtered };
    setActiveSetlist(updated);
    setSetlists(prev => {
      const next = prev.map(s => (s.id === updated.id ? updated : s));
      saveAllSetlists(next);
      return next;
    });
  };

  // Alternar privacidade do repertório
  const handleToggleSetlistPrivacy = () => {
    if (!activeSetlist) return;
    const updated = { ...activeSetlist, publico: !activeSetlist.publico };
    setActiveSetlist(updated);
    setSetlists(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  // Criar Repertório (Sincronizado + Garantia de Persistência Local)
  const handleCreateSetlist = async (
    name: string,
    description: string,
    isPublic: boolean,
    selectedSongIds: string[]
  ) => {
    const created = await createSetlistDb({
      nome: name,
      descricao: description,
      publico: isPublic,
      songIds: selectedSongIds,
      allAvailableSongs: songs
    });

    setSetlists(prev => {
      const next = [created, ...prev.filter(s => s.id !== created.id)];
      saveAllSetlists(next);
      return next;
    });
    setActiveSetlist(created);
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

  // Cadastrar nova cifra individual (Sincronizado + Garantia de Persistência Local)
  const handleAddSong = async (newSongData: Omit<Song, 'id'>) => {
    const createdSong = await createMusicaDb(newSongData);
    setSongs(prev => {
      const next = [createdSong, ...prev.filter(s => s.id !== createdSong.id)];
      return next;
    });
    setActiveSong(createdSong);
    setScreenView('stage');
  };

  // Upload massivo de cifras (Sincronizado + Garantia de Persistência Local)
  const handleBatchAddSongs = async (newSongsData: Omit<Song, 'id'>[]) => {
    const createdList: Song[] = [];
    for (let i = 0; i < newSongsData.length; i++) {
      const data = newSongsData[i];
      const created = await createMusicaDb(data);
      createdList.push(created);
    }
    setSongs(prev => [...createdList, ...prev.filter(s => !createdList.some(c => c.id === s.id))]);
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

      saveFavorites(Array.from(next));

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
    setSetlists(prev => {
      const next = prev.map(s => {
        if (s.id === setlistId) {
          const updated = { ...s, arquivado: !s.arquivado };
          if (activeSetlist?.id === setlistId) {
            setActiveSetlist(updated);
          }
          return updated;
        }
        return s;
      });
      saveAllSetlists(next);
      return next;
    });
  };

  // Editar Nome e Descrição do Repertório
  const handleUpdateSetlistDetails = (name: string, description: string) => {
    if (!activeSetlist) return;
    const updated = { ...activeSetlist, nome: name, descricao: description };
    setActiveSetlist(updated);
    setSetlists(prev => {
      const next = prev.map(s => (s.id === updated.id ? updated : s));
      saveAllSetlists(next);
      return next;
    });
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

  // Alternar arquivamento de Cifra
  const handleToggleArchiveSong = (song: Song) => {
    const updatedArchived = !song.arquivado;
    const updatedSong = { ...song, arquivado: updatedArchived };
    saveCustomSong(updatedSong);
    setSongs(prev =>
      prev.map(s => (s.id === song.id ? updatedSong : s))
    );
    if (activeSong.id === song.id) {
      setActiveSong(updatedSong);
    }
  };

  // Salvar Capa do Repertório
  const handleSaveSetlistCover = (newCoverUrl: string) => {
    if (!editingSetlistPhoto) return;
    const updated = { ...editingSetlistPhoto, cover_image: newCoverUrl };
    if (activeSetlist?.id === updated.id) {
      setActiveSetlist(updated);
    }
    setSetlists(prev => {
      const next = prev.map(s => (s.id === updated.id ? updated : s));
      saveAllSetlists(next);
      return next;
    });
    setEditingSetlistPhoto(null);
  };

  // Logout
  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    setScreenView('home');
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
      {/* Header Global Adaptativo (Presente em todas as telas) */}
      <GlobalHeader
        user={user}
        onToggleAIPanel={() => setIsAIPanelOpen(prev => !prev)}
        onLogout={handleLogout}
        onGoHome={() => setScreenView('home')}
      />

      {/* Container Principal com Suporte ao Chat Lateral Estilo IDE Antigravity */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lado Esquerdo / Conteúdo Central */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-[calc(100vh-57px)] pb-14 lg:pb-0">

          {/* TELA 1: HOME HUB (Repertórios com busca, Estilos e Artistas Principais) */}
          {screenView === 'home' && (
            <HomeHubView
              songs={songs}
              setlists={setlists}
              onSelectSong={handleSelectSongToPlay}
              onSelectSetlist={handleOpenSetlist}
              onCreateNewSetlist={() => setIsCreateSetlistOpen(true)}
              onNavigateToSongsList={handleNavigateToSongsList}
              onEditArtistPhoto={(name, avatar) => setEditingArtist({ name, avatar })}
              onEditSetlistPhoto={(setlist) => setEditingSetlistPhoto(setlist)}
            />
          )}

          {/* TELA 2: CATÁLOGO E PESQUISA UNIFICADA (Tudo, Repertórios, Cifras, Artistas) */}
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
              initialTab={songListFilters.tab || 'all'}
              onBack={() => setScreenView('home')}
              onSelectSong={song => {
                handleSelectSongToPlay(song, { type: 'songs_list', filters: songListFilters });
              }}
              onCreateNewSetlist={() => setIsCreateSetlistOpen(true)}
              onCreateNewSong={() => {
                setEditingSong(null);
                setIsCreateSongOpen(true);
              }}
              onEditArtistPhoto={(name, avatar) => setEditingArtist({ name, avatar })}
              onEditSetlistPhoto={(setlist) => setEditingSetlistPhoto(setlist)}
              onToggleArchiveSong={handleToggleArchiveSong}
              onToggleArchiveSetlist={setlist => handleToggleArchiveSetlist(setlist.id)}
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
                setSemitones(0);
                setNavigationSource({ type: 'setlist', setlist: activeSetlist });
                setScreenView('stage');
              }}
              onEditSetlistPhoto={(setlist) => setEditingSetlistPhoto(setlist)}
            />
          )}

          {/* TELA 4: PALCO / CIFRA */}
          {screenView === 'stage' && (
            <div className="flex-1 flex flex-col">
              {/* Barra de Topo do Palco Conforme Anexo: Voltar + Novo Repertório + Nova Cifra */}
              <div className="max-w-5xl w-full mx-auto px-4 sm:px-8 pt-4 pb-2 flex items-center justify-between gap-3 select-none flex-wrap">
                <button
                  onClick={handleStageBack}
                  className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors self-start py-1"
                >
                  <ArrowLeft size={16} />
                  <span>Voltar para {stageBackLabel}</span>
                  {activeSetlist && activeSetlistNonArchivedItems.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 border border-zinc-700/60 text-orange-400 text-xs font-mono font-bold">
                      {songIndexInSetlist + 1}/{activeSetlistNonArchivedItems.length}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsCreateSetlistOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs sm:text-sm font-bold text-zinc-200 transition-colors border border-zinc-700 active:scale-95 shadow-sm"
                  >
                    <Plus size={15} className="text-orange-400" />
                    <span>Novo Repertório</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingSong(null);
                      setIsCreateSongOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm font-bold text-white transition-colors active:scale-95 shadow-lg shadow-orange-500/20"
                  >
                    <Plus size={15} />
                    <span>Nova Cifra</span>
                  </button>
                </div>
              </div>

              {/* Conteúdo Central da Cifra (Menu lateral esquerdo removido) */}
              <div className="flex-1 flex flex-col">
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
                      activeSetlist={activeSetlist}
                      currentSongIndex={songIndexInSetlist}
                      totalSongsInSetlist={activeSetlistNonArchivedItems.length}
                      currentSong={activeSong}
                      nextSong={nextSong}
                      onAskAITransition={handleAskAITransition}
                      showTransitionNotes={showTransitionNotes}
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
                      activeSetlist={activeSetlist}
                      currentSongIndex={songIndexInSetlist}
                      totalSongsInSetlist={activeSetlistNonArchivedItems.length}
                      nextSong={nextSong}
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
                      activeSetlist={activeSetlist}
                      currentSongIndex={songIndexInSetlist}
                      totalSongsInSetlist={activeSetlistNonArchivedItems.length}
                      nextSong={nextSong}
                    />
                  )}
                </main>
              </div>

              {/* Barra Flutuante com Atalhos Rápidos na Cifra (Mobile e Palco) */}
              <SongFloatingToolbar
                currentKey={parsedSong.key}
                originalKey={activeSong.tom_original}
                semitones={semitones}
                onTranspose={handleTranspose}
                onResetTranspose={() => setSemitones(0)}
                isPlaying={isPlaying}
                speed={speed}
                isTemporarilyPaused={isTemporarilyPaused}
                onToggleScroll={togglePlay}
                onSpeedChange={setSpeed}
                scrollCycles={scrollCycles}
                currentCycle={currentCycle}
                onSetScrollCycles={setScrollCycles}
                autoAdvanceEnabled={autoAdvanceEnabled}
                onSetAutoAdvanceEnabled={setAutoAdvanceEnabled}
                isInSetlist={Boolean(activeSetlist && activeSetlist.itens.length > 1)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onOpenOptions={() => setIsSongOptionsOpen(true)}
                onToggleAIPanel={() => setIsAIPanelOpen(prev => !prev)}
                onPrevSong={activeSetlist && activeSetlist.itens.length > 1 ? handlePrevSong : undefined}
                onNextSong={activeSetlist && activeSetlist.itens.length > 1 ? handleNextSong : undefined}
                hasPrevSong={songIndexInSetlist > 0}
                hasNextSong={activeSetlist ? songIndexInSetlist < activeSetlist.itens.length - 1 : false}
              />
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
          userId={user?.id}
        />
      </div>

      {/* Barra de Navegação Inferior Global para Mobile e Desktop */}
      <MobileBottomNav
        currentView={screenView}
        activeCatalogTab={songListFilters.tab || 'all'}
        onNavigate={handleBottomNavNavigate}
        onNavigateCatalogTab={(tab) => {
          setSongListFilters(prev => ({ ...prev, tab }));
          setScreenView('songs_list');
        }}
        onToggleAIPanel={() => setIsAIPanelOpen(prev => !prev)}
        isAIPanelOpen={isAIPanelOpen}
      />

      {/* Menu Deslizante de Opções Completas (Bottom Sheet) */}
      <SongOptionsSheet
        isOpen={isSongOptionsOpen}
        onClose={() => setIsSongOptionsOpen(false)}
        song={activeSong}
        currentKey={parsedSong.key}
        originalKey={activeSong.tom_original}
        semitones={semitones}
        onTranspose={handleTranspose}
        isFavorite={favoriteSongIds.has(activeSong.id)}
        onToggleFavorite={() => handleToggleFavorite(activeSong)}
        onEditSong={handleEditActiveSong}
        onOpenTabEditor={() => setIsTabEditorOpen(true)}
        showTablature={showTablature}
        onToggleTablature={() => setShowTablature(prev => !prev)}
        showDiagrams={showDiagrams}
        onToggleDiagrams={() => setShowDiagrams(prev => !prev)}
        instrument={instrument}
        onToggleInstrument={() =>
          setInstrument(prev => (prev === 'cavaco' ? 'violao' : 'cavaco'))
        }
        fontSize={fontSize}
        onFontSizeChange={delta =>
          setFontSize(prev => Math.max(12, Math.min(32, prev + delta)))
        }
        columns={columns}
        onToggleColumns={() => setColumns(prev => (prev === 1 ? 2 : 1))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAIPanel={() => setIsAIPanelOpen(true)}
        onOpenArtistsSearch={() => {
          setSongListFilters({ tab: 'artists' });
          setScreenView('songs_list');
        }}
        onOpenAITransitions={
          activeSetlist && nextSong
            ? () =>
                handleAskAITransition(
                  activeSong.titulo,
                  nextSong.titulo,
                  parsedSong.key,
                  nextSong.tom_original
                )
            : undefined
        }
        onDownloadSong={() => handleDownloadSong(activeSong)}
        isArchived={activeSong.arquivado}
        onToggleArchive={() => handleToggleArchiveSong(activeSong)}
        showTransitionNotes={showTransitionNotes}
        onToggleTransitionNotes={() => setShowTransitionNotes(prev => !prev)}
        scrollCycles={scrollCycles}
        onSetScrollCycles={setScrollCycles}
        autoAdvanceEnabled={autoAdvanceEnabled}
        onSetAutoAdvanceEnabled={setAutoAdvanceEnabled}
        isInSetlist={Boolean(activeSetlist && activeSetlist.itens.length > 1)}
        onSaveCurrentKeyAsDefault={handleSaveCurrentKeyAsDefault}
      />

      {/* Modal Editor de Tablaturas ("TabLab") */}
      <TablatureEditorModal
        isOpen={isTabEditorOpen}
        onClose={() => setIsTabEditorOpen(false)}
        instrument={instrument}
        onInsertTablature={handleInsertTablature}
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

      <EditSetlistPhotoModal
        isOpen={!!editingSetlistPhoto}
        onClose={() => setEditingSetlistPhoto(null)}
        setlistName={editingSetlistPhoto?.nome || ''}
        currentPhotoUrl={editingSetlistPhoto?.cover_image}
        onSavePhoto={handleSaveSetlistCover}
      />
    </div>
  );
}

export default App;
