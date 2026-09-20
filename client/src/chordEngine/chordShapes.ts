import type { ChordShape, InstrumentType } from '../types/music';

// Formatos reais populares para CAVACO (Afinação D-G-B-D, 4 cordas: da 4ª para a 1ª)
// Cordas: [4ª=D, 3ª=G, 2ª=B, 1ª=D]
const CAVACO_CHORD_DB: Record<string, number[]> = {
  // Maiores
  'C': [2, 0, 1, 2],
  'C#': [3, 1, 2, 3],
  'Db': [3, 1, 2, 3],
  'D': [0, 2, 3, 0],
  'D#': [1, 3, 4, 1],
  'Eb': [1, 3, 4, 1],
  'E': [2, 4, 0, 2],
  'F': [3, 2, 1, 3],
  'F#': [4, 3, 2, 4],
  'Gb': [4, 3, 2, 4],
  'G': [0, 0, 0, 0],
  'G#': [1, 1, 1, 1],
  'Ab': [1, 1, 1, 1],
  'A': [2, 2, 2, 2],
  'A#': [3, 3, 3, 3],
  'Bb': [3, 3, 3, 3],
  'B': [4, 4, 4, 4],

  // Menores
  'Cm': [1, 0, 1, 1],
  'C#m': [2, 1, 2, 2],
  'Dbm': [2, 1, 2, 2],
  'Dm': [3, 2, 3, 0],
  'D#m': [4, 3, 4, 1],
  'Ebm': [4, 3, 4, 1],
  'Em': [2, 0, 0, 2],
  'Fm': [3, 1, 1, 3],
  'F#m': [4, 2, 2, 4],
  'Gbm': [4, 2, 2, 4],
  'Gm': [0, 3, 3, 0],
  'G#m': [1, 4, 4, 1],
  'Abm': [1, 4, 4, 1],
  'Am': [2, 2, 1, 2],
  'A#m': [3, 3, 2, 3],
  'Bbm': [3, 3, 2, 3],
  'Bm': [0, 4, 3, 0],

  // Dominantes com 7ª
  'C7': [2, 3, 1, 2],
  'C#7': [3, 4, 2, 3],
  'Db7': [3, 4, 2, 3],
  'D7': [0, 2, 1, 0],
  'D#7': [1, 3, 2, 1],
  'Eb7': [1, 3, 2, 1],
  'E7': [2, 1, 0, 0],
  'F7': [3, 2, 4, 3],
  'F#7': [4, 3, 5, 4],
  'G7': [0, 0, 0, 3],
  'G#7': [1, 1, 1, 4],
  'Ab7': [1, 1, 1, 4],
  'A7': [2, 0, 2, 2],
  'A#7': [3, 1, 3, 3],
  'Bb7': [3, 1, 3, 3],
  'B7': [4, 2, 0, 1],

  // Com 7ª Maior (maj7 / 7M)
  'Cmaj7': [2, 0, 0, 2],
  'C7M': [2, 0, 0, 2],
  'Fmaj7': [2, 2, 1, 2],
  'F7M': [2, 2, 1, 2],
  'Gmaj7': [0, 0, 0, 4],
  'G7M': [0, 0, 0, 4],
  'Bbmaj7': [0, 2, 3, 3],
  'Bb7M': [0, 2, 3, 3],

  // Menores com 7ª (m7)
  'Cm7': [1, 3, 1, 1],
  'Dm7': [0, 2, 1, 3],
  'Em7': [2, 0, 3, 2],
  'Fm7': [3, 1, 4, 3],
  'Gm7': [0, 3, 3, 3],
  'Am7': [2, 0, 1, 2],
  'Bm7': [0, 2, 3, 0],
  'Em7b5': [2, 0, 3, 0],
};

// Formatos reais populares para VIOLÃO/GUITARRA (Afinação E-A-D-G-B-E, 6 cordas: 6ª para a 1ª)
// Cordas: [6ª=E, 5ª=A, 4ª=D, 3ª=G, 2ª=B, 1ª=E]
// -1 = Mute (não tocar), 0 = Solta
const VIOLAO_CHORD_DB: Record<string, number[]> = {
  // Maiores
  'C': [-1, 3, 2, 0, 1, 0],
  'C#': [-1, 4, 3, 1, 2, 1],
  'Db': [-1, 4, 3, 1, 2, 1],
  'D': [-1, -1, 0, 2, 3, 2],
  'D#': [-1, 6, 5, 3, 4, 3],
  'Eb': [-1, 6, 5, 3, 4, 3],
  'E': [0, 2, 2, 1, 0, 0],
  'F': [1, 3, 3, 2, 1, 1],
  'F#': [2, 4, 4, 3, 2, 2],
  'Gb': [2, 4, 4, 3, 2, 2],
  'G': [3, 2, 0, 0, 0, 3],
  'G#': [4, 6, 6, 5, 4, 4],
  'Ab': [4, 6, 6, 5, 4, 4],
  'A': [-1, 0, 2, 2, 2, 0],
  'A#': [-1, 1, 3, 3, 3, 1],
  'Bb': [-1, 1, 3, 3, 3, 1],
  'B': [-1, 2, 4, 4, 4, 2],

  // Menores
  'Cm': [-1, 3, 5, 5, 4, 3],
  'C#m': [-1, 4, 6, 6, 5, 4],
  'Dbm': [-1, 4, 6, 6, 5, 4],
  'Dm': [-1, -1, 0, 2, 3, 1],
  'D#m': [-1, 6, 8, 8, 7, 6],
  'Ebm': [-1, 6, 8, 8, 7, 6],
  'Em': [0, 2, 2, 0, 0, 0],
  'Fm': [1, 3, 3, 1, 1, 1],
  'F#m': [2, 4, 4, 2, 2, 2],
  'Gbm': [2, 4, 4, 2, 2, 2],
  'Gm': [3, 5, 5, 3, 3, 3],
  'G#m': [4, 6, 6, 4, 4, 4],
  'Abm': [4, 6, 6, 4, 4, 4],
  'Am': [-1, 0, 2, 2, 1, 0],
  'A#m': [-1, 1, 3, 3, 2, 1],
  'Bbm': [-1, 1, 3, 3, 2, 1],
  'Bm': [-1, 2, 4, 4, 3, 2],

  // Dominantes com 7ª
  'C7': [-1, 3, 2, 3, 1, 0],
  'C#7': [-1, 4, 3, 4, 2, -1],
  'Db7': [-1, 4, 3, 4, 2, -1],
  'D7': [-1, -1, 0, 2, 1, 2],
  'D#7': [-1, 6, 5, 6, 4, -1],
  'Eb7': [-1, 6, 5, 6, 4, -1],
  'E7': [0, 2, 0, 1, 0, 0],
  'F7': [1, 3, 1, 2, 1, 1],
  'F#7': [2, 4, 2, 3, 2, 2],
  'G7': [3, 2, 0, 0, 0, 1],
  'G#7': [4, 6, 4, 5, 4, 4],
  'Ab7': [4, 6, 4, 5, 4, 4],
  'A7': [-1, 0, 2, 0, 2, 0],
  'A#7': [-1, 1, 3, 1, 3, 1],
  'Bb7': [-1, 1, 3, 1, 3, 1],
  'B7': [-1, 2, 1, 2, 0, 2],

  // Menores com 7ª
  'Cm7': [-1, 3, 5, 3, 4, 3],
  'Dm7': [-1, -1, 0, 2, 1, 1],
  'Em7': [0, 2, 0, 0, 0, 0],
  'Gm7': [3, 5, 3, 3, 3, 3],
  'Am7': [-1, 0, 2, 0, 1, 0],
  'Bm7': [-1, 2, 4, 2, 3, 2],
  'Em7b5': [0, 1, 2, 0, 3, 0],

  // 7M / maj7
  'Cmaj7': [-1, 3, 2, 0, 0, 0],
  'C7M': [-1, 3, 2, 0, 0, 0],
  'Fmaj7': [1, -1, 2, 2, 1, 0],
  'F7M': [1, -1, 2, 2, 1, 0],
  'Gmaj7': [3, 2, 0, 0, 0, 2],
  'G7M': [3, 2, 0, 0, 0, 2],
  'Bbmaj7': [-1, 1, 3, 2, 3, 1],
  'Bb7M': [-1, 1, 3, 2, 3, 1],
};

/**
 * Normaliza a string do acorde removendo baixos invertidos ou caracteres especiais
 * para busca no banco de digitações.
 */
function cleanChordName(chord: string): string {
  const slashParts = chord.split('/');
  return slashParts[0].trim();
}

/**
 * Retorna o desenho do acorde (posições de trastes) para o instrumento escolhido.
 */
export function getChordShape(chord: string, instrument: InstrumentType): ChordShape {
  const clean = cleanChordName(chord);
  const db = instrument === 'cavaco' ? CAVACO_CHORD_DB : VIOLAO_CHORD_DB;

  let frets = db[clean];

  if (!frets) {
    // Tentar fallback simplificando sufixo (ex: C9 -> C7 -> C)
    const baseMatch = clean.match(/^([A-G][#b]?)(m?)/);
    if (baseMatch) {
      const fallback = baseMatch[1] + (baseMatch[2] || '');
      frets = db[fallback];
    }
  }

  // Se ainda não encontrado, usar formato neutro aberto ou pestana
  if (!frets) {
    frets = instrument === 'cavaco' ? [0, 0, 0, 0] : [0, 2, 2, 0, 0, 0];
  }

  return {
    chord,
    instrument,
    frets
  };
}
