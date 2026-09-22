const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const ENHARMONIC_MAP: Record<string, number> = {
  'B#': 0, 'C': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'E#': 5, 'F': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11
};

export function normalizeNoteIndex(note: string): number {
  return ENHARMONIC_MAP[note] ?? -1;
}

/**
 * Transpõe uma nota raiz individual (ex: 'C', 'F#', 'Bb') por N semitons.
 */
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const index = normalizeNoteIndex(note);
  if (index === -1) return note;

  const targetIndex = ((index + semitones) % 12 + 12) % 12;
  return preferFlats ? FLAT_SCALE[targetIndex] : SHARP_SCALE[targetIndex];
}

/**
 * Transpõe um acorde completo (ex: 'C#m7(b5)/G', 'Bb7M/D', 'F#dim') por N semitons.
 */
export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
  if (semitones === 0 || !chord.trim()) return chord;

  // Tratar baixos invertidos (ex: C/G, F#m7/A#)
  const slashParts = chord.split('/');
  const mainPart = slashParts[0];
  const bassPart = slashParts.length > 1 ? slashParts[1] : null;

  // Regex para capturar a nota raiz (1 ou 2 caracteres: [A-G][#b]?)
  const rootMatch = mainPart.match(/^([A-G][#b]?)(.*)$/);
  if (!rootMatch) return chord;

  const rootNote = rootMatch[1];
  const suffix = rootMatch[2];
  const transposedRoot = transposeNote(rootNote, semitones, preferFlats);

  let transposedBass = '';
  if (bassPart) {
    const bassMatch = bassPart.match(/^([A-G][#b]?)(.*)$/);
    if (bassMatch) {
      transposedBass = '/' + transposeNote(bassMatch[1], semitones, preferFlats) + bassMatch[2];
    } else {
      transposedBass = '/' + bassPart;
    }
  }

  return transposedRoot + suffix + transposedBass;
}

/**
 * Calcula a distância em semitons entre duas tonalidades.
 */
export function getSemitoneDistance(fromKey: string, toKey: string): number {
  const fromClean = fromKey.match(/^([A-G][#b]?)/)?.[1] || 'C';
  const toClean = toKey.match(/^([A-G][#b]?)/)?.[1] || 'C';

  const i1 = normalizeNoteIndex(fromClean);
  const i2 = normalizeNoteIndex(toClean);
  if (i1 === -1 || i2 === -1) return 0;

  return ((i2 - i1) % 12 + 12) % 12;
}

/**
 * Lista padrão de tons para seleção rápida
 */
export const AVAILABLE_KEYS = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
];

/**
 * Transpõe todas as ocorrências de [Acorde] em um texto no formato ChordPro por N semitons.
 */
export function transposeChordProText(chordProText: string, semitones: number, preferFlats = false): string {
  if (semitones === 0 || !chordProText) return chordProText;

  // 1. Atualizar diretiva {key: ...} se existir
  let updated = chordProText.replace(/\{key:\s*([^}]+)\}/gi, (_, oldKey) => {
    return `{key: ${transposeChord(oldKey.trim(), semitones, preferFlats)}}`;
  });

  // 2. Transpor todos os acordes entre colchetes [Acorde]
  updated = updated.replace(/\[([^\]]+)\]/g, (match, chord) => {
    if (chord.startsWith('tab:') || chord.startsWith('comment:')) return match;
    const transposed = transposeChord(chord.trim(), semitones, preferFlats);
    return `[${transposed}]`;
  });

  return updated;
}
