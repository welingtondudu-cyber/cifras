export interface HarmonicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChatParams {
  prompt: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
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
 * Realiza streaming de chat harmônico com histórico multiturn,
 * priorizando BFF Spring Boot via SSE ou fallback direto via OpenAI.
 */
export async function streamHarmonicChat({
  prompt,
  history = [],
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
        history,
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

  // 2. Fallback direto via OpenAI API com histórico multiturn e prompt especializado
  if (!bffSuccess && OPENAI_KEY) {
    try {
      // Filtrar e preparar histórico da conversa (últimas 10 mensagens para contexto ágil)
      const formattedHistory = history
        .slice(-10)
        .filter(h => h.content && h.content.trim())
        .map(h => ({
          role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: h.content
        }));

      const systemPrompt = `Você é o CIFRALAB Harmonic AI Advisor, mestre e especialista em Teoria Musical, Harmonia Funcional, Arranjos de Palco e Repertórios para Cavaquinho (afinação D-G-B-D) e Violão/Guitarra (afinação E-A-D-G-B-E).
Instrumento ativo do músico: ${instrumento}. Tom atual: ${tomAtual}.

=== DIÁLOGO E CONTEXTO MULTITURN (MEMÓRIA) ===
- Você está em uma conversa contínua. LEMBRE-SE SEMPRE das mensagens anteriores, das músicas sugeridas e das preferências do usuário.
- Se o usuário fizer uma crítica, correção ou ajuste (ex: "tem músicas que você colocou que não são de samba", ou "mude a ordem", ou "troque essa música"), NUNCA recuse o assunto nem dê respostas genéricas! Ouça com atenção, acolha o feedback ("Tem toda razão!", "Perfeito, vamos ajustar!") e forneça imediatamente a lista corrigida e coerente.

=== CRIAÇÃO E ESTRUTURAÇÃO DE REPERTÓRIOS ===
Quando o usuário pedir sugestão, montagem ou ajuste de um repertório:
1. Respeite com RIGOR o gênero ou estilo solicitado (ex: se pediu Samba/Pagode, coloque APENAS Samba e Pagode; se pediu Sertanejo, coloque apenas Sertanejo; se pediu Gospel, apenas Gospel).
2. PRIORIZE as músicas pertencentes ao catálogo do usuário informadas no prompt.
3. Crie sempre um NOME CRIATIVO, INSPIRADOR E PERSONALIZADO para o repertório (ex: "Samba de Raiz & Roda de Pagode", "Noite Acústica & MPB", "Clássicos Sertanejos Ao Vivo", "Louvor & Adoração Intimista"). NUNCA use "Setlist Sugerido pela IA".
4. Explique a ordem das músicas com base em harmonia (transição suave de tons pelo ciclo das quintas) e dinâmica de show.
5. OBRIGATÓRIO AO SUGERIR REPERTÓRIO: No final da sua resposta, adicione SEMPRE o bloco abaixo para permitir a criação automática do repertório no sistema:
[SETLIST_DATA]
TITLE: <Nome Criativo do Repertório>
SONGS: <Nome Exato da Música 1>, <Nome Exato da Música 2>, ...
[/SETLIST_DATA]

=== ENSINO PRÁTICO DE TEORIA MUSICAL ===
Explique com didática profunda: Campos Harmônicos, Modos Gregos, Cadências (II-V-I, IV-V-I), Dominantes Secundários, SubV7, Empréstimo Modal e Diminutos de Passagem, sempre com exemplos práticos em músicas conhecidas.

=== ESCOPO ===
Mantenha seu foco em música, cifras, acordes, instrumentos, arranjos e repertórios. Caso o usuário pergunte sobre assuntos completamente alheios à música (como culinária ou notícias gerais), gentilmente traga o foco de volta para a música.`;

      const currentPromptContent = `Contexto: ${instrumento} | Tom: ${tomAtual}${
        chordproSnippet ? `\nCifra:\n${chordproSnippet.slice(0, 200)}` : ''
      }\n\nMensagem do usuário: ${prompt}`;

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
              content: systemPrompt
            },
            ...formattedHistory,
            {
              role: 'user',
              content: currentPromptContent
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
