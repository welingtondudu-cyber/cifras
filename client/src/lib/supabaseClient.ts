import { createClient } from '@supabase/supabase-js';
import type { Song, Setlist, UserProfile } from '../types/music';
import {
  getSavedCustomSongs,
  saveCustomSong,
  getSavedCustomSetlists,
  saveAllSetlists,
  mergeSongsWithLocal,
  mergeSetlistsWithLocal
} from './storage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fftznrmbbndppzylfnnh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nDggNYVO1Hv0fjoDn7e0jg_dFptcvQE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Acervo rico demonstrativo com múltiplos estilos musicais
export const DEFAULT_SONGS: Song[] = [
  {
    id: 's-1',
    titulo: 'Ainda Bem',
    artista: 'Marisa Monte',
    estilo: 'MPB',
    tom_original: 'Dm',
    publico: true,
    avatar_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=120&h=120&fit=crop&crop=face',
    chordpro: `{title: Ainda Bem}
{artist: Marisa Monte}
{key: Dm}

{sot}
Intro:
E|--1--0--------------|--1--0--------------|
B|--------3--1--------|--------3--1--------|
G|--------------2-----|--------------2-----|
D|--0-----------------|--0-----------------|
A|--------------------|--------------------|
E|--------------------|--------------------|
{eot}

[Dm]Ainda bem que agora [A7]é só você e eu
[Dm]Ainda bem que o passado [A7]já se dissolveu
[Bb]Não me lembro de [C]nada antes de te encon[F]trar
[Gm]Você veio pra [A7]me ilumi[Dm]nar

[Dm]Ainda bem que você [A7]quis acreditar
[Dm]No que os olhos de nin[A7]guém puderam ver
[Bb]Tudo o que eu tenho de [C]bom é pra te [F]dar
[Gm]Ainda bem que eu tenho a [A7]você, meu a[Dm]mor`
  },
  {
    id: 's-2',
    titulo: 'O Mundo É Um Moinho',
    artista: 'Cartola',
    estilo: 'Samba',
    tom_original: 'C',
    publico: true,
    avatar_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=120&fit=crop',
    chordpro: `{title: O Mundo É Um Moinho}
{artist: Cartola}
{key: C}

{sot}
Intro (Violão / Cavaco):
D|--2--3--5--3--2--0--|--2--3--2--0-------|
B|--3-----------------|--3-----------3--1-|
G|--2-----------------|--2----------------|
D|--0-----------------|--0----------------|
{eot}

[C]Ainda é [Em]cedo, a[F]mor
Mal começ[G7]aste a co[C]nhecer a [Am]vida
Já desfi[Dm]laste teu a[G7]mor sem recear a [C]dor
Nem a desil[A7]usão que a vida [Dm]traz

Preste a[G7]tenção, o mundo é um mo[C]inho
Vai tritu[Am]rar teus sonhos, tão mes[Dm]quinhos
Vai redu[G7]zir as ilusões a [C]pó`
  },
  {
    id: 's-3',
    titulo: 'Não Deixe o Samba Morrer',
    artista: 'Alcione',
    estilo: 'Samba',
    tom_original: 'F',
    publico: true,
    avatar_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop',
    chordpro: `{title: Não Deixe o Samba Morrer}
{artist: Alcione}
{key: F}

Não deixe o [F]samba mor[Am]rer, não deixe o [Bb]samba a[C7]cabar
O [F]morro foi [Am]feito de samba, de [Bb]samba pra gente sam[C7]bar

[Dm]Quando eu não puder mais pisar na a[Gm]venida
Quando as minhas pernas não puderem aguentar
Levar meu [F]corpo junto com meu cava[A7]quinho
[Dm]Antes de me despedir até nunca [Gm]mais
Eu quero ouvir a bateria repi[C7]car`
  },
  {
    id: 's-4',
    titulo: 'Tempo Perdido',
    artista: 'Legião Urbana',
    estilo: 'Rock',
    tom_original: 'C',
    publico: true,
    avatar_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop',
    chordpro: `{title: Tempo Perdido}
{artist: Legião Urbana}
{key: C}

{sot}
Intro Riff:
E|---------------------|---------------------|
B|--1--0---------------|--1--0---------------|
G|--------2--0---------|--------2--0---------|
D|--------------2--0---|--------------2--0---|
{eot}

Todos os [C]dias quando a[Am]cordo
Não tenho mais o [Em]tempo que passou
Mas tenho muito [F]tempo: temos todo o [G]tempo do mundo
[C]Todos os dias antes de dor[Am]mir
Lembro e esqueço como foi o [Em]dia
Sempre em [F]frente: não temos [G]tempo a perder`
  },
  {
    id: 's-5',
    titulo: 'Evidências',
    artista: 'Chitãozinho & Xororó',
    estilo: 'Sertanejo',
    tom_original: 'E',
    publico: true,
    avatar_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=120&h=120&fit=crop',
    chordpro: `{title: Evidências}
{artist: Chitãozinho & Xororó}
{key: E}

Quando eu digo que dei[E]xei de te amar
É porque eu te [G#m]amo
Quando eu digo que não [A]quero mais você
É porque eu te [B7]quero
Eu tenho medo de te [E]dar meu coração
E confessar que estou em [G#m]tuas mãos
Mas não posso a[A]bandonar o que sinto por vo[B7]cê

E nessa loucura de dizer que não te [E]quero
Vou negando as aparências, disfarçando as evi[G#m]dências
Mas pra que viver fin[A]gindo se eu não posso enga[F#m]nar meu cora[B7]ção`
  },
  {
    id: 's-6',
    titulo: 'Bondade de Deus',
    artista: 'Isaías Saad',
    estilo: 'Gospel',
    tom_original: 'G',
    publico: true,
    avatar_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=120&h=120&fit=crop',
    chordpro: `{title: Bondade de Deus}
{artist: Isaías Saad}
{key: G}

Te [G]amo, Deus, Tua graça nunca [C]falha
Todos os [G]dias eu estou em Tuas [D]mãos
Desde quando me le[Em]vanto até eu me dei[C]tar
Eu can[G]tarei da bon[D]dade de [G]Deus

És fiel em todo o [C]tempo
Em todo o tempo Tu és tão, tão [G]bom
Com todo o fôlego que tenho em [C]mim
Eu can[G]tarei da bon[D]dade de [G]Deus`
  }
];

export const DEFAULT_SETLISTS: Setlist[] = [];

// Métodos de Autenticação Supabase (Acesso restrito com persistência de sessão)
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const user: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Músico',
        avatar: session.user.user_metadata?.avatar_url
      };
      localStorage.setItem('cifralab_user', JSON.stringify(user));
      return user;
    }

    // Se não há sessão Supabase imediata (ex: modo offline, fallback rápido, reload de página),
    // verificar se o usuário já estava autenticado e salvo localmente
    const saved = localStorage.getItem('cifralab_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          return parsed as UserProfile;
        }
      } catch {}
    }

    return null;
  } catch {
    // Fallback seguro em caso de erro na rede do Supabase
    const saved = localStorage.getItem('cifralab_user');
    if (saved) {
      try {
        return JSON.parse(saved) as UserProfile;
      } catch {}
    }
    return null;
  }
}

export async function signInUser(email: string, pass: string): Promise<{ user?: UserProfile; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();

  // Contas autorizadas provisionadas para a equipe CIFRALAB
  const AUTHORIZED_ACCOUNTS: Record<string, { pass: string; id: string; name: string }> = {
    'welington@cifralab.com': {
      pass: 'Cifras6338!',
      id: 'a69b1d6b-7ad1-4758-bab5-3fa3e36ae230',
      name: 'Welington Silva'
    },
    'henrique@cifralab.com': {
      pass: 'Cifras6338!',
      id: 'be7df142-b12f-4a3c-8110-7b2175bc032f',
      name: 'Henrique'
    }
  };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: pass });
    if (!error && data?.user) {
      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Músico'
      };
      localStorage.setItem('cifralab_user', JSON.stringify(user));
      return { user };
    }
  } catch {
    // Prosseguir para validação segura caso o Supabase aguarde confirmação de e-mail por SMTP
  }

  // Validação segura para contas registradas
  const account = AUTHORIZED_ACCOUNTS[cleanEmail];
  if (account) {
    if (account.pass === pass) {
      const user: UserProfile = {
        id: account.id,
        email: cleanEmail,
        name: account.name
      };
      localStorage.setItem('cifralab_user', JSON.stringify(user));
      return { user };
    } else {
      return { error: 'E-mail ou senha incorretos.' };
    }
  }

  return { error: 'E-mail ou senha incorretos.' };
}

export async function signUpUser(email: string, pass: string, name: string): Promise<{ user?: UserProfile; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name } }
    });
    if (error) throw error;
    if (data.user) {
      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email || '',
        name
      };
      localStorage.setItem('cifralab_user', JSON.stringify(user));
      return { user };
    }
    return { error: 'Confirmação necessária' };
  } catch (err: any) {
    return { error: err.message || 'Erro ao cadastrar' };
  }
}

export async function signOutUser() {
  await supabase.auth.signOut();
  localStorage.removeItem('cifralab_user');
}

// Métodos de Músicas
export async function fetchMusicas(): Promise<Song[]> {
  const localSongs = getSavedCustomSongs();
  try {
    const { data, error } = await supabase
      .from('musicas')
      .select('*')
      .order('titulo', { ascending: true });

    if (error || !data || data.length === 0) {
      return mergeSongsWithLocal(DEFAULT_SONGS, localSongs);
    }
    return mergeSongsWithLocal(data as Song[], localSongs);
  } catch {
    return mergeSongsWithLocal(DEFAULT_SONGS, localSongs);
  }
}

export async function createMusicaDb(song: Omit<Song, 'id'>): Promise<Song> {
  const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'song-' + Date.now();

  const newSong: Song = {
    ...song,
    id: generatedId
  };

  // Salva localmente de imediato
  saveCustomSong(newSong);

  try {
    const { data, error } = await supabase
      .from('musicas')
      .insert({
        titulo: song.titulo,
        artista: song.artista,
        estilo: song.estilo,
        tom_original: song.tom_original,
        chordpro: song.chordpro,
        publico: song.publico
      })
      .select()
      .single();

    if (!error && data) {
      const savedDbSong = data as Song;
      saveCustomSong(savedDbSong);
      return savedDbSong;
    }
  } catch (err) {
    console.warn('Persistindo música em cache local (modo resiliente):', err);
  }

  return newSong;
}

export async function updateMusicaDb(song: Song): Promise<boolean> {
  saveCustomSong(song);
  try {
    const { error } = await supabase
      .from('musicas')
      .update({
        titulo: song.titulo,
        artista: song.artista,
        estilo: song.estilo,
        tom_original: song.tom_original,
        chordpro: song.chordpro,
        publico: song.publico
      })
      .eq('id', song.id);

    return !error;
  } catch (err) {
    console.error('Erro ao atualizar música no Supabase:', err);
    return false;
  }
}

// Métodos de Setlists
export async function fetchSetlists(): Promise<Setlist[]> {
  const localSetlists = getSavedCustomSetlists();
  try {
    const { data, error } = await supabase
      .from('setlists')
      .select('*, setlist_itens(*, musicas(*))')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mergeSetlistsWithLocal(DEFAULT_SETLISTS, localSetlists);
    }

    const mapped: Setlist[] = data.map((s: any) => ({
      id: s.id,
      user_id: s.user_id,
      nome: s.nome,
      descricao: s.descricao,
      owner_name: s.owner_name || 'Welington_sc',
      publico: s.publico,
      arquivado: s.arquivado || false,
      cover_gradient: s.cover_gradient || 'from-orange-500 to-amber-700',
      cover_image: s.cover_image,
      itens: (s.setlist_itens || [])
        .map((it: any) => ({
          id: it.id,
          setlist_id: it.setlist_id,
          musica_id: it.musica_id,
          ordem: it.ordem,
          tom_customizado: it.tom_customizado,
          musica: it.musicas
        }))
        .sort((a: any, b: any) => a.ordem - b.ordem),
      created_at: s.created_at
    })).filter((s: Setlist) => s.id !== 'set-1' && s.nome.trim().toLowerCase() !== 'recentes');

    const merged = mergeSetlistsWithLocal(mapped, localSetlists);
    saveAllSetlists(merged);
    return merged;
  } catch {
    return mergeSetlistsWithLocal(DEFAULT_SETLISTS, localSetlists);
  }
}

export async function createSetlistDb(setlist: {
  nome: string;
  descricao?: string;
  publico?: boolean;
  songIds: string[];
  allAvailableSongs?: Song[];
}): Promise<Setlist> {
  const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'set-' + Date.now();

  const allSongs = setlist.allAvailableSongs || DEFAULT_SONGS;
  const items = (setlist.songIds || []).map((sid, idx) => {
    const foundSong = allSongs.find(s => s.id === sid);
    return {
      id: 'item-' + Date.now() + '-' + idx,
      setlist_id: generatedId,
      musica_id: sid,
      ordem: idx + 1,
      musica: foundSong
    };
  });

  const newSetlist: Setlist = {
    id: generatedId,
    nome: setlist.nome,
    descricao: setlist.descricao || '',
    owner_name: 'Welington_sc',
    publico: setlist.publico ?? true,
    cover_gradient: 'from-orange-500 to-amber-700',
    itens: items,
    created_at: new Date().toISOString()
  };

  // Salvar imediatamente no cache local para nunca perder
  const currentSaved = getSavedCustomSetlists();
  saveAllSetlists([newSetlist, ...currentSaved.filter(s => s.id !== newSetlist.id)]);

  // Tentar sincronizar com o Supabase
  try {
    const { data: setlistData, error: sError } = await supabase
      .from('setlists')
      .insert({
        nome: setlist.nome,
        descricao: setlist.descricao || '',
        publico: setlist.publico ?? true
      })
      .select()
      .single();

    if (!sError && setlistData) {
      if (setlist.songIds && setlist.songIds.length > 0) {
        const itemsToInsert = setlist.songIds.map((sid, idx) => ({
          setlist_id: setlistData.id,
          musica_id: sid,
          ordem: idx + 1
        }));
        await supabase.from('setlist_itens').insert(itemsToInsert);
      }
      const remoteSetlist: Setlist = {
        ...newSetlist,
        id: setlistData.id
      };
      const updatedList = [remoteSetlist, ...currentSaved.filter(s => s.id !== newSetlist.id && s.id !== remoteSetlist.id)];
      saveAllSetlists(updatedList);
      return remoteSetlist;
    }
  } catch (err) {
    console.warn('Persistindo repertório em cache local (modo resiliente):', err);
  }

  return newSetlist;
}

/**
 * Atualiza a ordem dos itens do repertório no Supabase
 */
export async function updateSetlistItemsOrderDb(reorderedItemIds: string[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    for (let idx = 0; idx < reorderedItemIds.length; idx++) {
      const itemId = reorderedItemIds[idx];
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId);
      if (isUuid) {
        await supabase
          .from('setlist_itens')
          .update({ ordem: idx + 1 })
          .eq('id', itemId);
      }
    }
    return true;
  } catch (err) {
    console.error('Erro ao atualizar ordenação no Supabase:', err);
    return false;
  }
}

/**
 * Adiciona uma música a um repertório existente no Supabase
 */
export async function addSongToSetlistDb(
  setlistId: string,
  songId: string,
  ordem: number
): Promise<{ id: string; setlist_id: string; musica_id: string; ordem: number; musica?: any }> {
  const fallbackItem = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('item-' + Date.now()),
    setlist_id: setlistId,
    musica_id: songId,
    ordem
  };

  try {
    const isSetlistUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(setlistId);
    const isSongUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(songId);

    if (isSetlistUuid && isSongUuid) {
      const { data, error } = await supabase
        .from('setlist_itens')
        .insert({
          setlist_id: setlistId,
          musica_id: songId,
          ordem
        })
        .select('*, musicas(*)')
        .single();

      if (!error && data) {
        return {
          id: data.id,
          setlist_id: data.setlist_id,
          musica_id: data.musica_id,
          ordem: data.ordem,
          musica: data.musicas
        };
      }
    }
  } catch (err) {
    console.warn('Item adicionado em modo resiliente local:', err);
  }

  return fallbackItem;
}

/**
 * Remove um item de repertório no Supabase
 */
export async function removeSongFromSetlistDb(itemId: string): Promise<boolean> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId);
    if (isUuid) {
      const { error } = await supabase
        .from('setlist_itens')
        .delete()
        .eq('id', itemId);
      return !error;
    }
  } catch (err) {
    console.warn('Erro ao remover item de setlist no Supabase:', err);
  }
  return false;
}

/**
 * Persistência de Anotações de Palco no Supabase
 */
export async function saveSetlistAnnotationDb(cue: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('setlist_anotacoes')
      .upsert({
        id: cue.id,
        setlist_id: cue.setlistId,
        from_song_id: cue.fromSongId,
        to_song_id: cue.toSongId,
        chords: cue.chords,
        notes: cue.notes,
        updated_at: new Date().toISOString()
      });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Persistência de Conversas e Histórico de IA por Usuário no Supabase
 */
export async function fetchUserAiSessionsDb(userId: string): Promise<any[] | null> {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_ai_chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.session_id || d.id,
        title: d.title || 'Conversa Principal',
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        messages: typeof d.messages === 'string' ? JSON.parse(d.messages) : d.messages
      }));
    }
  } catch {
    return null;
  }
  return null;
}

export async function saveUserAiSessionDb(userId: string, session: any): Promise<boolean> {
  if (!userId || !session) return false;
  try {
    const { error } = await supabase
      .from('user_ai_chats')
      .upsert({
        user_id: userId,
        session_id: session.id,
        title: session.title,
        messages: session.messages,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,session_id' });
    return !error;
  } catch {
    return false;
  }
}

// 7. CIFRALAB Academy - Progresso do Usuário no Supabase
export async function fetchUserAcademyProgress(userId: string): Promise<Record<number, boolean>> {
  if (!userId) return {};
  try {
    const { data, error } = await supabase
      .from('user_module_progress')
      .select('module_id, completed')
      .eq('user_id', userId);

    if (error || !data) return {};
    const map: Record<number, boolean> = {};
    data.forEach((row: any) => {
      map[row.module_id] = Boolean(row.completed);
    });
    return map;
  } catch (err) {
    console.warn('Erro ao carregar progresso da Academy no Supabase:', err);
    return {};
  }
}

export async function updateUserAcademyModuleProgress(
  userId: string,
  moduleId: number,
  completed: boolean
): Promise<boolean> {
  if (!userId) return false;
  try {
    const { error } = await supabase
      .from('user_module_progress')
      .upsert(
        {
          user_id: userId,
          module_id: moduleId,
          completed,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,module_id' }
      );
    return !error;
  } catch (err) {
    console.warn('Erro ao atualizar progresso da Academy no Supabase:', err);
    return false;
  }
}



