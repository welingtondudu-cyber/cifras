import type { Song, Setlist } from '../types/music';
import { DEFAULT_SONGS, DEFAULT_SETLISTS } from './supabaseClient';

const STORAGE_KEYS = {
  FAVORITES: 'cifralab_favorites',
  CUSTOM_SONGS: 'cifralab_custom_songs',
  CUSTOM_SETLISTS: 'cifralab_setlists_custom',
  TRANSITIONS: 'cifralab_transitions',
  SETTINGS: 'cifralab_user_settings',
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

// 3. Repertórios Customizados e Persistência Híbrida
export function getSavedCustomSetlists(): Setlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETLISTS);
    const list: Setlist[] = raw ? JSON.parse(raw) : DEFAULT_SETLISTS;
    return list.filter(s => s.id !== 'set-1' && s.nome.toLowerCase() !== 'recentes');
  } catch {
    return DEFAULT_SETLISTS;
  }
}

export function saveAllSetlists(setlists: Setlist[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SETLISTS, JSON.stringify(setlists));
  } catch (err) {
    console.error('Erro ao salvar repertórios em cache:', err);
  }
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
