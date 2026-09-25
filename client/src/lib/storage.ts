import type { Song, Setlist } from '../types/music';
import { DEFAULT_SONGS } from './supabaseClient';

const STORAGE_KEYS = {
  FAVORITES: 'cifralab_favorites',
  CUSTOM_SONGS: 'cifralab_custom_songs',
  CUSTOM_SETLISTS: 'cifralab_setlists_custom',
  TRANSITIONS: 'cifralab_transitions',
  SETTINGS: 'cifralab_user_settings',
  ACADEMY_PROGRESS: 'cifralab_academy_progress',
};

// 1. Favoritos
export function getSavedFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [DEFAULT_SONGS[0].id];
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_SONGS[0].id];
  }
}

export function saveFavorites(favoriteIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteIds));
  } catch (err) {
    console.error('Erro ao salvar favoritos:', err);
  }
}

// 2. Músicas Customizadas / Editadas
export function getSavedCustomSongs(): Song[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SONGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomSong(song: Song): Song[] {
  try {
    const current = getSavedCustomSongs();
    const existingIdx = current.findIndex(s => s.id === song.id);
    let updated: Song[];
    if (existingIdx >= 0) {
      updated = current.map(s => (s.id === song.id ? song : s));
    } else {
      updated = [song, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SONGS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Erro ao salvar música customizada:', err);
    return [];
  }
}

export function isRestrictedSetlist(s: { id?: string; nome?: string }): boolean {
  if (!s) return true;
  const id = s.id || '';
  const nome = (s.nome || '').trim().toLowerCase();
  return (
    id === 'set-1' ||
    id === 'set-2' ||
    id === 'set-3' ||
    id === 'set-favoritas' ||
    nome === 'recentes' ||
    nome === 'projeto som' ||
    nome === 'favoritas'
  );
}

export function getSavedCustomSetlists(): Setlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETLISTS);
    const list: Setlist[] = raw ? JSON.parse(raw) : [];
    const clean = list.filter(s => !isRestrictedSetlist(s));
    if (raw && list.length !== clean.length) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SETLISTS, JSON.stringify(clean));
    }
    return clean;
  } catch {
    return [];
  }
}

export function saveAllSetlists(setlists: Setlist[]): void {
  try {
    const clean = setlists.filter(s => !isRestrictedSetlist(s));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SETLISTS, JSON.stringify(clean));
  } catch (err) {
    console.error('Erro ao salvar repertórios em cache:', err);
  }
}

/**
 * Mescla músicas do Supabase com as salvas localmente pelo usuário.
 * Músicas criadas localmente que ainda não estão no banco são PRESERVADAS.
 */
export function mergeSongsWithLocal(dbSongs: Song[], localSongs: Song[]): Song[] {
  const map = new Map<string, Song>();

  // 1. Adiciona músicas vindas do Supabase
  for (const s of dbSongs) {
    if (s && s.id) {
      map.set(s.id, s);
    }
  }

  // 2. Mescla ou sobrepõe com as customizações/músicas locais do usuário
  for (const local of localSongs) {
    if (local && local.id) {
      map.set(local.id, local);
    }
  }

  const result = Array.from(map.values());
  return result.length > 0 ? result : (dbSongs.length > 0 ? dbSongs : DEFAULT_SONGS);
}

/**
 * Mescla repertórios do Supabase com os salvos localmente pelo usuário.
 * 1. Repertórios criados localmente que não estão no Supabase NUNCA são apagados.
 * 2. Músicas/itens adicionados localmente a um repertório NUNCA são perdidos.
 */
export function mergeSetlistsWithLocal(dbSetlists: Setlist[], localSetlists: Setlist[]): Setlist[] {
  const map = new Map<string, Setlist>();

  // 1. Inicia com os repertórios do Supabase (filtrando restritos)
  for (const dbSet of dbSetlists) {
    if (dbSet && dbSet.id && !isRestrictedSetlist(dbSet)) {
      map.set(dbSet.id, { ...dbSet, itens: dbSet.itens || [] });
    }
  }

  // 2. Mescla com os repertórios locais do usuário
  for (const localSet of localSetlists) {
    if (!localSet || !localSet.id || isRestrictedSetlist(localSet)) {
      continue;
    }

    const existingInDb = map.get(localSet.id);
    if (!existingInDb) {
      // Repertório criado localmente que não existe no Supabase: PRESERVA!
      map.set(localSet.id, localSet);
    } else {
      // Repertório existe em ambos: mescla preservando itens adicionados localmente
      const localItens = localSet.itens || [];
      const dbItens = existingInDb.itens || [];

      const itemMap = new Map<string, any>();
      for (const it of dbItens) {
        const key = it.musica_id || it.id;
        itemMap.set(key, it);
      }
      for (const it of localItens) {
        const key = it.musica_id || it.id;
        itemMap.set(key, it);
      }

      const mergedItens = Array.from(itemMap.values()).map((it, idx) => ({
        ...it,
        ordem: idx + 1
      }));

      map.set(localSet.id, {
        ...existingInDb,
        ...localSet,
        cover_image: localSet.cover_image || existingInDb.cover_image,
        itens: mergedItens.length > 0 ? mergedItens : (localItens.length > 0 ? localItens : dbItens)
      });
    }
  }

  return Array.from(map.values());
}


// 4. Balões de Transição e Anotações de Palco (por item de setlist ou par de músicas)
export interface TransitionCue {
  id: string;
  setlistId: string;
  fromSongId: string;
  toSongId: string;
  chords: string[]; // ex: ['A7', 'D7', 'G']
  notes?: string;
}

export function getSavedTransitions(): Record<string, TransitionCue> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSITIONS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveTransitionCue(cue: TransitionCue): void {
  try {
    const all = getSavedTransitions();
    const key = `${cue.setlistId}_${cue.fromSongId}_${cue.toSongId}`;
    all[key] = cue;
    localStorage.setItem(STORAGE_KEYS.TRANSITIONS, JSON.stringify(all));

    // Notificar componentes em tempo real
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cifralab_annotation_updated', { detail: cue }));
    }
  } catch (err) {
    console.error('Erro ao salvar transição:', err);
  }
}

export function getTransitionForSongs(
  setlistId: string,
  fromSongId: string,
  toSongId: string
): TransitionCue | null {
  const all = getSavedTransitions();
  const key = `${setlistId}_${fromSongId}_${toSongId}`;
  return all[key] || null;
}

// 6. CIFRALAB Academy - Progresso dos Módulos/Lições por Usuário
export function getSavedAcademyProgress(userId?: string): Record<number, boolean> {
  try {
    const key = userId ? `${STORAGE_KEYS.ACADEMY_PROGRESS}_${userId}` : STORAGE_KEYS.ACADEMY_PROGRESS;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAcademyProgress(progress: Record<number, boolean>, userId?: string): void {
  try {
    const key = userId ? `${STORAGE_KEYS.ACADEMY_PROGRESS}_${userId}` : STORAGE_KEYS.ACADEMY_PROGRESS;
    localStorage.setItem(key, JSON.stringify(progress));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cifralab_academy_progress_updated', { detail: { progress, userId } }));
    }
  } catch (err) {
    console.error('Erro ao salvar progresso da Academy:', err);
  }
}

export function setModuleCompletion(moduleId: number, completed: boolean, userId?: string): Record<number, boolean> {
  const current = getSavedAcademyProgress(userId);
  const updated = { ...current, [moduleId]: completed };
  saveAcademyProgress(updated, userId);
  return updated;
}

