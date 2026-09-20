import { createClient } from '@supabase/supabase-js';
import type { Song, Setlist, UserProfile } from '../types/music';

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

export const DEFAULT_SETLISTS: Setlist[] = [
  {
    id: 'set-1',
    nome: 'Recentes',
    descricao: 'Últimas músicas tocadas no palco',
    owner_name: 'Welington_sc',
    publico: true,
    cover_gradient: 'from-orange-500 to-amber-600',
    itens: [
      { id: 'item-1', setlist_id: 'set-1', musica_id: 's-1', ordem: 1, musica: DEFAULT_SONGS[0] },
      { id: 'item-2', setlist_id: 'set-1', musica_id: 's-2', ordem: 2, musica: DEFAULT_SONGS[1] },
      { id: 'item-3', setlist_id: 'set-1', musica_id: 's-3', ordem: 3, musica: DEFAULT_SONGS[2] }
    ]
  },
  {
    id: 'set-2',
    nome: 'Favoritas',
    descricao: 'Clássicos que não podem faltar no show',
    owner_name: 'Welington_sc',
    publico: false,
    cover_gradient: 'from-amber-500 to-orange-700',
    itens: [
      { id: 'item-4', setlist_id: 'set-2', musica_id: 's-2', ordem: 1, musica: DEFAULT_SONGS[1] },
      { id: 'item-5', setlist_id: 'set-2', musica_id: 's-5', ordem: 2, musica: DEFAULT_SONGS[4] },
      { id: 'item-6', setlist_id: 'set-2', musica_id: 's-4', ordem: 3, musica: DEFAULT_SONGS[3] }
    ]
  },
  {
    id: 'set-3',
    nome: 'Projeto Som',
    descricao: 'Arranjos ao vivo para Cavaco e Violão',
    owner_name: 'Welington_sc',
    publico: true,
    cover_gradient: 'from-rose-600 to-orange-600',
    itens: [
      { id: 'item-7', setlist_id: 'set-3', musica_id: 's-1', ordem: 1, musica: DEFAULT_SONGS[0] },
      { id: 'item-8', setlist_id: 'set-3', musica_id: 's-3', ordem: 2, musica: DEFAULT_SONGS[2] }
    ]
  }
];

// Métodos de Autenticação Supabase
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      // Retornar perfil demo se não autenticado
      const cached = localStorage.getItem('cifralab_user');
      return cached ? JSON.parse(cached) : {
        id: 'demo-user',
        email: 'welington@cifralab.pro',
        name: 'Welington Silva',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      };
    }
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Músico',
      avatar: session.user.user_metadata?.avatar_url
    };
  } catch {
    return null;
  }
}

export async function signInUser(email: string, pass: string): Promise<{ user?: UserProfile; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    const user: UserProfile = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Músico'
    };
    localStorage.setItem('cifralab_user', JSON.stringify(user));
    return { user };
  } catch (err: any) {
    return { error: err.message || 'Erro ao autenticar' };
  }
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
  try {
    const { data, error } = await supabase
      .from('musicas')
      .select('*')
      .order('titulo', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_SONGS;
    }
    return data as Song[];
  } catch {
    return DEFAULT_SONGS;
  }
}

export async function createMusicaDb(song: Omit<Song, 'id'>): Promise<Song | null> {
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

    if (error || !data) return null;
    return data as Song;
  } catch (err) {
    console.error('Erro ao inserir música no Supabase:', err);
    return null;
  }
}

export async function updateMusicaDb(song: Song): Promise<boolean> {
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
  try {
    const { data, error } = await supabase
      .from('setlists')
      .select('*, setlist_itens(*, musicas(*))')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_SETLISTS;
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
    }));

    return mapped;
  } catch {
    return DEFAULT_SETLISTS;
  }
}

export async function createSetlistDb(setlist: {
  nome: string;
  descricao?: string;
  publico?: boolean;
  songIds: string[];
}): Promise<Setlist | null> {
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

    if (sError || !setlistData) return null;

    if (setlist.songIds && setlist.songIds.length > 0) {
      const itemsToInsert = setlist.songIds.map((sid, idx) => ({
        setlist_id: setlistData.id,
        musica_id: sid,
        ordem: idx + 1
      }));

      await supabase.from('setlist_itens').insert(itemsToInsert);
    }

    // Retornar o setlist recém-criado já populado
    const allSetlists = await fetchSetlists();
    return allSetlists.find(s => s.id === setlistData.id) || null;
  } catch (err) {
    console.error('Erro ao criar setlist no Supabase:', err);
    return null;
  }
}

/**
 * Atualiza a ordem dos itens do repertório no Supabase
 */
export async function updateSetlistItemsOrderDb(reorderedItemIds: string[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    for (let idx = 0; idx < reorderedItemIds.length; idx++) {
      const itemId = reorderedItemIds[idx];
      await supabase
        .from('setlist_itens')
        .update({ ordem: idx + 1 })
        .eq('id', itemId);
    }
    return true;
  } catch (err) {
    console.error('Erro ao atualizar ordenação no Supabase:', err);
    return false;
  }
}

