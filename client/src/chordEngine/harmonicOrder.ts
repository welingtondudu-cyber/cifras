import type { SetlistItem } from '../types/music';

// Mapeamento das notas no Ciclo das Quintas (0 a 11)
// C = 0, G = 1, D = 2, A = 3, E = 4, B = 5, F#/Gb = 6, Db/C# = 7, Ab/G# = 8, Eb/D# = 9, Bb/A# = 10, F = 11
const CIRCLE_OF_FIFTHS: Record<string, number> = {
  // Maiores e Relativos Menores compartilham a mesma armadura
  'C': 0, 'Am': 0,
  'G': 1, 'Em': 1,
  'D': 2, 'Bm': 2,
  'A': 3, 'F#m': 3,
  'E': 4, 'C#m': 4,
  'B': 5, 'G#m': 5,
  'F#': 6, 'Gb': 6, 'D#m': 6, 'Ebm': 6,
  'Db': 7, 'C#': 7, 'Bbm': 7,
  'Ab': 8, 'G#': 8, 'Fm': 8,
  'Eb': 9, 'D#': 9, 'Cm': 9,
  'Bb': 10, 'A#': 10, 'Gm': 10,
  'F': 11, 'Dm': 11
};

/**
 * Calcula a distância circular no ciclo das quintas entre dois tons (0 a 6).
 * Distâncias menores (0 ou 1) geram transições extremamente suaves.
 */
export function getHarmonicDistance(keyA: string, keyB: string): number {
  const cleanA = keyA.trim();
  const cleanB = keyB.trim();

  const posA = CIRCLE_OF_FIFTHS[cleanA] ?? 0;
  const posB = CIRCLE_OF_FIFTHS[cleanB] ?? 0;

  const diff = Math.abs(posA - posB);
  return Math.min(diff, 12 - diff);
}

/**
 * Reordena uma lista de itens de repertório otimizando para a melhor
 * sequência musical e transição harmônica de palco.
 */
export function optimizeHarmonicOrder(items: SetlistItem[]): SetlistItem[] {
  if (items.length <= 2) return items;

  const unvisited = [...items];
  const ordered: SetlistItem[] = [];

  // Começar com a primeira música ou a mais enérgica
  ordered.push(unvisited.shift()!);

  while (unvisited.length > 0) {
    const lastItem = ordered[ordered.length - 1];
    const lastKey = lastItem.musica?.tom_original || 'C';

    let bestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const candidateKey = unvisited[i].musica?.tom_original || 'C';
      const dist = getHarmonicDistance(lastKey, candidateKey);

      if (dist < minDistance) {
        minDistance = dist;
        bestIdx = i;
      }
    }

    ordered.push(unvisited.splice(bestIdx, 1)[0]);
  }

  return ordered;
}
