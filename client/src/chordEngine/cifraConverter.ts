/**
 * Utilitário para detecção e conversão do formato padrão Cifra Club
 * (acordes em linhas separadas acima das letras) para o formato interno ChordPro.
 */

// Expressão regular para reconhecer um acorde musical típico
const CHORD_REGEX = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G][#b]?)?$/;

/**
 * Verifica se uma linha é composta predominantemente por acordes
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Ignorar linhas de marcação como [Intro], [Refrão], etc.
  if (/^\[.*\]$/.test(trimmed)) return false;

  // Linhas de tablatura (ex: E|---1---) não são linhas de acordes simples
  if (/^[eEaAdDgGbB]\|/.test(trimmed)) return false;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  for (const token of tokens) {
    const cleanToken = token.replace(/[(),]/g, '');
    if (CHORD_REGEX.test(cleanToken)) {
      chordCount++;
    }
  }

  return chordCount / tokens.length >= 0.5;
}

/**
 * Converte texto no formato padrão do Cifra Club para ChordPro
 */
export function convertStandardCifraToChordPro(rawText: string): {
  chordpro: string;
  title?: string;
  artist?: string;
  key?: string;
} {
  const lines = rawText.split('\n');
  let detectedTitle = '';
  let detectedArtist = '';
  let detectedKey = '';

  const outputLines: string[] = [];
  let inTab = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Detectar cabeçalho estilo "Artista - Título" ou "Título - Artista"
    if (i === 0 && trimmed.includes(' - ')) {
      const parts = trimmed.split(' - ');
      detectedArtist = parts[0].trim();
      detectedTitle = parts[1].trim();
      outputLines.push(`{title: ${detectedTitle}}`);
      outputLines.push(`{artist: ${detectedArtist}}`);
      continue;
    }

    // 2. Detectar tom e afinação
    if (/^tom:\s*([A-G][#b]?m?)/i.test(trimmed)) {
      const match = trimmed.match(/^tom:\s*([A-G][#b]?m?)/i);
      if (match) {
        detectedKey = match[1];
        outputLines.push(`{key: ${detectedKey}}`);
      }
      continue;
    }

    if (/^afina[çc][ãa]o:/i.test(trimmed)) {
      // Ignorar metadado de afinação no corpo
      continue;
    }

    // 3. Detectar seção de acordes finais ("--- Acordes ---") e parar ou ignorar
    if (/^-+\s*Acordes\s*-+/i.test(trimmed)) {
      break;
    }

    // 4. Detectar linhas de tablatura
    if (/^[eEaAdDgGbB]\|/.test(trimmed)) {
      if (!inTab) {
        inTab = true;
        outputLines.push('{sot}');
      }
      outputLines.push(line);
      continue;
    } else if (inTab) {
      inTab = false;
      outputLines.push('{eot}');
    }

    // 5. Linhas de seções como [Intro], [Primeira Parte], [Refrão]
    if (/^\[.*\]$/.test(trimmed)) {
      // Tratar acordes na mesma linha (ex: [Intro] Dm)
      const introMatch = trimmed.match(/^\[(.*?)\]\s*(.*)$/);
      if (introMatch && introMatch[2]) {
        const chordsPart = introMatch[2].split(/\s+/).map(c => `[${c}]`).join(' ');
        outputLines.push(chordsPart);
      }
      continue;
    }

    // 6. Verificar se esta linha é de acordes e a próxima é a letra correspondente
    if (isChordLine(line)) {
      const nextLine = (i + 1 < lines.length && !isChordLine(lines[i + 1])) ? lines[i + 1] : '';

      if (nextLine && !nextLine.trim().startsWith('[') && !/^[eEaAdDgGbB]\|/.test(nextLine.trim())) {
        // Intercalar os acordes na letra baseado nos índices de caractere
        let merged = '';
        let lastLyricIndex = 0;

        // Encontrar posições dos acordes na linha
        const chordMatches: { chord: string; index: number }[] = [];
        const regex = /\S+/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          chordMatches.push({ chord: match[0], index: match.index });
        }

        chordMatches.forEach(({ chord, index }) => {
          if (index > lastLyricIndex) {
            merged += nextLine.slice(lastLyricIndex, index);
          }
          merged += `[${chord}]`;
          lastLyricIndex = index;
        });

        if (lastLyricIndex < nextLine.length) {
          merged += nextLine.slice(lastLyricIndex);
        }

        outputLines.push(merged);
        i++; // Pular a linha de letra já consumida
      } else {
        // Apenas acordes sem letra abaixo (ex: introdução ou solo)
        const chordTokens = trimmed.split(/\s+/).map(c => `[${c}]`).join(' ');
        outputLines.push(chordTokens);
      }
      continue;
    }

    // Linha de texto comum
    outputLines.push(line);
  }

  if (inTab) {
    outputLines.push('{eot}');
  }

  return {
    chordpro: outputLines.join('\n'),
    title: detectedTitle,
    artist: detectedArtist,
    key: detectedKey || 'C'
  };
}
