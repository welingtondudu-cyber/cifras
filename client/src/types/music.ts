export type InstrumentType = 'cavaco' | 'violao';

export type ViewMode = 'chordpro' | 'leadSheet' | 'degrees';

export type ScreenView = 'home' | 'songs_list' | 'setlist' | 'stage' | 'academy';

export interface AcademyModule {
  id: number;
  number: number;
  title: string;
  concept: string;
  practical_example: string;
  exercise: string;
  time_estimate?: string;
  key_chords?: string[];
}

export interface AcademyLevel {
  level: number;
  title: string;
  description: string;
  levelBadge: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Mestre' | string;
  badgeColor?: string;
  modules: AcademyModule[];
}

export interface UserModuleProgress {
  id?: number;
  user_id?: string;
  module_id: number;
  completed: boolean;
  updated_at?: string;
}

export interface Song {
  id: string;
  user_id?: string | null;
  titulo: string;
  artista: string;
  estilo: string; // 'Samba', 'Sertanejo', 'Rock', 'MPB', 'Gospel', etc.
  tom_original: string;
  chordpro: string;
  publico: boolean;
  arquivado?: boolean;
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
  cover_image?: string;
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
  variationIndex?: number;
  totalVariations?: number;
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
