export interface HarmonicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChatParams {
  prompt: string;
  tomAtual: string;
  instrumento: string;
  chordproSnippet: string;
  sessionId?: string;
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: any) => void;
}

const BFF_URL = import.meta.env.VITE_BFF_URL || 'http://localhost:8080';
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

/**
 * Realiza streaming de chat harmônico priorizando o BFF Java WebFlux (SSE)
 * com fallback direto via OpenAI caso o BFF esteja offline.
 */
export async function streamHarmonicChat({
  prompt,
  tomAtual,
  instrumento,
  chordproSnippet,
  sessionId = 'stage-session',
  onChunk,
  onComplete,
  onError
}: StreamChatParams): Promise<void> {
  let bffSuccess = false;

  // 1. Tentar BFF Spring Boot via SSE
  try {
    const response = await fetch(`${BFF_URL}/api/ai/harmonic-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        prompt,
        tomAtual,
        instrumento,
        chordproSnippet,
        sessionId
      })
    });

    if (response.ok && response.body) {
      bffSuccess = true;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim();
            if (data) {
              onChunk(data);
            }
          }
        }
      }

      onComplete();
      return;
    }
  } catch (err) {
    console.info('BFF offline ou indisponível, usando fallback seguro direto:', err);
  }

  // 2. Fallback direto via OpenAI API se fornecida
  if (!bffSuccess && OPENAI_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          stream: true,
          messages: [
            {
              role: 'system',
              content: `Você é o CIFRALAB Harmonic AI Advisor, mestre e especialista exclusivo em Teoria Musical, Harmonia Funcional, Arranjos de Palco e Repertórios para Cavaquinho (afinação D-G-B-D) e Violão (afinação E-A-D-G-B-E). O usuário está no instrumento ${instrumento} e tom ${tomAtual}.

=== REGRA CRÍTICA DE ESCOPO (GUARDRAIL RESTRITO) ===
Você é ESTRITAMENTE PROIBIDO de conversar sobre qualquer assunto que NÃO seja ligado diretamente à MÚSICA (teoria musical, harmonia funcional, arranjo, repertório, afinação, técnica instrumental, história da música e cifras). Se o usuário perguntar sobre culinária, política, esportes, programação geral, notícias ou qualquer outro assunto fora da música, RECUSE EDUCADAMENTE dizendo:
"Como assistente musical do CIFRALAB, meu foco exclusivo é em música, harmonia e repertório. Como posso te ajudar com suas cifras, teoria musical ou arranjos para palco?"

=== ENSINO PRÁTICO DE TEORIA MUSICAL ===
Domine e explique com profundidade e didática: Campos Harmônicos (Maior e Menor), Modos Gregos, Cadências Harmônicas (II-V-I, IV-V-I), Dominantes Secundários (V7/V, V7/II, etc.), Substituições Tritonais (SubV7), Empréstimo Modal, Acordes Diminutos de Passagem e Inversões de Baixo.
REGRA DE OURO: Sempre que explicar um conceito teórico, UTILIZE MÚSICAS REAIS como exemplo prático (ex: mostre onde ocorre o II-V-I ou acorde diminuto em músicas consagradas como 'Ainda Bem', 'Não Deixe o Samba Morrer', 'Carinhoso', 'O Mundo é um Moinho', etc.), explicando o efeito sonoro e a sensação harmônica na música.

=== ESTRUTURAÇÃO DE REPERTÓRIO ===
Auxilie a organizar repertórios harmônicos por ciclo das quintas e dinâmica de palco.`
            },
            {
              role: 'user',
              content: `Música em ${tomAtual}. Trecho:\n${chordproSnippet}\n\nDúvida/Pedido: ${prompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream não legível');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Ignore partial json parse errors
            }
          }
        }
      }

      onComplete();
      return;
    } catch (err) {
      console.warn('Erro na chamada direta OpenAI:', err);
      onError(err);
    }
  }

  // 3. Fallback harmônico inteligente simulado
  const mockTokens = [
    `🎵 Dica rápida para ${instrumento} em ${tomAtual}:\n`,
    `No compasso dominante, experimente substituir o acorde por um SubV7 com nona menor. `,
    `Isso cria uma tensão sofisticada que resolve suavemente no I grau. `,
    `Para ${instrumento === 'Cavaco' ? 'Cavaco' : 'Violão'}, explore tocar o acorde na 3ª ou 5ª casa para dar espaço aos graves da banda.`
  ];

  for (const token of mockTokens) {
    await new Promise(r => setTimeout(r, 120));
    onChunk(token);
  }

  onComplete();
}
