import { normalizeNoteIndex } from './transposer';

// Intervalos da escala maior diatônica (semitons relativos à tônica)
const MAJOR_SCALE_DEGREES: { semitones: number; roman: string; defaultMinor: boolean }[] = [
  { semitones: 0, roman: 'I', defaultMinor: false },
  { semitones: 1, roman: 'bII', defaultMinor: false },
  { semitones: 2, roman: 'II', defaultMinor: true },
  { semitones: 3, roman: 'bIII', defaultMinor: false },
  { semitones: 4, roman: 'III', defaultMinor: true },
  { semitones: 5, roman: 'IV', defaultMinor: false },
  { semitones: 6, roman: '#IV', defaultMinor: false },
  { semitones: 7, roman: 'V', defaultMinor: false },
  { semitones: 8, roman: 'bVI', defaultMinor: false },
  { semitones: 9, roman: 'VI', defaultMinor: true },
  { semitones: 10, roman: 'bVII', defaultMinor: false },
  { semitones: 11, roman: 'VII', defaultMinor: true },
];

/**
 * Converte um acorde para análise harmônica funcional (Graus em algarismos romanos).
 * Exemplo em C:
 *  C -> I
 *  Dm7 -> IIm7
 *  Em7 -> IIIm7
 *  Fmaj7 -> IVmaj7
 *  G7 -> V7
 *  Am7 -> VIm7
 *  Bø -> VIIø
 *  A7 -> V7/II (ou VI7)
 */
export function chordToHarmonicDegree(chord: string, currentKey: string): string {
  if (!chord || !chord.trim()) return '';

  const slashParts = chord.split('/');
  const mainChord = slashParts[0];

  const keyMatch = currentKey.match(/^([A-G][#b]?)(.*)$/);
  if (!keyMatch) return chord;

  const keyRoot = keyMatch[1];

  const chordMatch = mainChord.match(/^([A-G][#b]?)(.*)$/);
  if (!chordMatch) return chord;

  const chordRoot = chordMatch[1];
  let suffix = chordMatch[2] || '';

  const keyIndex = normalizeNoteIndex(keyRoot);
  const chordIndex = normalizeNoteIndex(chordRoot);

  if (keyIndex === -1 || chordIndex === -1) return chord;

  const interval = ((chordIndex - keyIndex) % 12 + 12) % 12;

  const degreeInfo = MAJOR_SCALE_DEGREES.find(d => d.semitones === interval);
  if (!degreeInfo) return chord;

  let roman = degreeInfo.roman;

  // Ajuste visual para acordes menores (ex: Im, IIm, etc.)
  const isChordMinor = suffix.startsWith('m') && !suffix.startsWith('maj');
  if (isChordMinor) {
    // Remover o 'm' duplicado do sufixo se representarmos em minúsculo ou manter padrão IIm
    roman = roman + suffix;
  } else {
    roman = roman + suffix;
  }

  if (slashParts.length > 1) {
    const bassNote = slashParts[1];
    const bassIndex = normalizeNoteIndex(bassNote);
    if (bassIndex !== -1) {
      const bassInterval = ((bassIndex - keyIndex) % 12 + 12) % 12;
      const bassDegree = MAJOR_SCALE_DEGREES.find(d => d.semitones === bassInterval);
      if (bassDegree) {
        roman += '/' + bassDegree.roman;
      } else {
        roman += '/' + bassNote;
      }
    }
  }

  return roman;
}
