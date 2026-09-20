export type InstrumentType = 'cavaco' | 'violao';

export type ViewMode = 'chordpro' | 'leadSheet' | 'degrees';

export type ScreenView = 'home' | 'songs_list' | 'setlist' | 'stage';

export interface Song {
  id: string;
  user_id?: string | null;
  titulo: string;
  artista: string;
  estilo: string; // 'Samba', 'Sertanejo', 'Rock', 'MPB', 'Gospel', etc.
  tom_original: string;
  chordpro: string;
  publico: boolean;
  avatar_url?: string;
  created_at?: string;
}

export interface SetlistItem {
  id: string;
  setlist_id: string;
  musica_id: string;
  ordem: number;
  tom_customizado?: string;
  musica?: Song;
}

export interface Setlist {
  id: string;
  user_id?: string | null;
  nome: string;
  descricao?: string;
  owner_name?: string;
  publico: boolean;
  arquivado?: boolean;
  cover_gradient?: string;
  itens: SetlistItem[];
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface ChordShape {
  chord: string;
  instrument: InstrumentType;
  frets: number[];
  fingers?: number[];
  baseFret?: number;
  barres?: number[];
}

export interface ParsedLineSegment {
  chord?: string;
  text?: string;
}

export interface ParsedLine {
  type: 'directive' | 'lyric_chord' | 'tab' | 'empty';
  segments?: ParsedLineSegment[];
  content?: string;
}

export interface ParsedSong {
  title: string;
  artist: string;
  key: string;
  lines: ParsedLine[];
  chords: string[];
}
