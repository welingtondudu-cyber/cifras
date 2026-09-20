import type { ParsedSong, ParsedLine, ParsedLineSegment } from '../types/music';
import { transposeChord } from './transposer';

/**
 * Faz o parsing completo de texto ChordPro com suporte a tablaturas ({sot}/{eot}) e acordes inline.
 */
export function parseChordPro(chordProText: string, semitones: number = 0): ParsedSong {
  let title = 'Sem Título';
  let artist = 'Artista Desconhecido';
  let key = 'C';
  const chordsSet = new Set<string>();
  const parsedLines: ParsedLine[] = [];

  const rawLines = chordProText.split('\n');
  let inTab = false;
  let currentTabBuffer: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i].trimEnd();
    const trimmed = rawLine.trim();

    // Diretivas de início e fim de tablatura {sot} / {eot}
    if (/^\{(sot|start_of_tab)\}/i.test(trimmed)) {
      inTab = true;
      currentTabBuffer = [];
      continue;
    }

    if (/^\{(eot|end_of_tab)\}/i.test(trimmed)) {
      inTab = false;
      parsedLines.push({
        type: 'tab',
        content: currentTabBuffer.join('\n')
      });
      currentTabBuffer = [];
      continue;
    }

    if (inTab) {
      currentTabBuffer.push(rawLine);
      continue;
    }

    // Diretivas de metadados {title: ...}, {key: ...}, etc.
    const directiveMatch = trimmed.match(/^\{([a-zA-Z0-9_-]+):?\s*(.*)\}$/);
    if (directiveMatch) {
      const tag = directiveMatch[1].toLowerCase();
      const val = directiveMatch[2].replace(/\}$/, '').trim();

      if (tag === 'title' || tag === 't') {
        title = val;
      } else if (tag === 'artist' || tag === 'a') {
        artist = val;
      } else if (tag === 'key' || tag === 'k') {
        key = val;
      }

      parsedLines.push({
        type: 'directive',
        content: `${tag}: ${val}`
      });
      continue;
    }

    if (!trimmed) {
      parsedLines.push({ type: 'empty' });
      continue;
    }

    // Linha com acordes e letra
    const segments: ParsedLineSegment[] = [];
    let remaining = rawLine;

    while (remaining.length > 0) {
      const chordOpenIdx = remaining.indexOf('[');
      if (chordOpenIdx === -1) {
        // Apenas letra até o fim
        segments.push({ text: remaining });
        break;
      }

      if (chordOpenIdx > 0) {
        // Texto anterior ao acorde
        segments.push({ text: remaining.slice(0, chordOpenIdx) });
        remaining = remaining.slice(chordOpenIdx);
      }

      const chordCloseIdx = remaining.indexOf(']');
      if (chordCloseIdx === -1) {
        // Sem fechamento, tratar como texto normal
        segments.push({ text: remaining });
        break;
      }

      const rawChord = remaining.slice(1, chordCloseIdx).trim();
      const chord = semitones !== 0 ? transposeChord(rawChord, semitones) : rawChord;
      if (chord) {
        chordsSet.add(chord);
      }

      remaining = remaining.slice(chordCloseIdx + 1);

      // Encontrar próximo colchete ou fim da linha para atribuir texto a este acorde
      const nextChordIdx = remaining.indexOf('[');
      let textSegment = '';
      if (nextChordIdx === -1) {
        textSegment = remaining;
        remaining = '';
      } else {
        textSegment = remaining.slice(0, nextChordIdx);
        remaining = remaining.slice(nextChordIdx);
      }

      segments.push({
        chord: chord,
        text: textSegment
      });
    }

    parsedLines.push({
      type: 'lyric_chord',
      segments: segments
    });
  }

  return {
    title,
    artist,
    key: semitones !== 0 ? transposeChord(key, semitones) : key,
    lines: parsedLines,
    chords: Array.from(chordsSet)
  };
}
