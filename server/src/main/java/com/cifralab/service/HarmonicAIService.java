package com.cifralab.service;

import com.cifralab.model.HarmonicChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class HarmonicAIService {

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient;

    // Histórico de conversa e contexto tonal por sessão (Spring AI Advisor Pattern em memória)
    private final Map<String, List<Map<String, String>>> sessionHistories = new ConcurrentHashMap<>();

    public HarmonicAIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Flux<String> streamHarmonicAdvice(HarmonicChatRequest request) {
        String session = (request.getSessionId() != null && !request.getSessionId().isBlank())
                ? request.getSessionId()
                : "default-session";

        List<Map<String, String>> history = sessionHistories.computeIfAbsent(session, k -> {
            List<Map<String, String>> initial = new ArrayList<>();
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", "Você é o CIFRALAB Harmonic AI Advisor, mestre e especialista exclusivo em Teoria Musical, Harmonia Funcional, Arranjos de Palco e Repertórios para Cavaquinho (afinação D-G-B-D / Ré-Sol-Si-Ré) e Violão/Guitarra (E-A-D-G-B-E).\n\n"
                    + "=== REGRA CRÍTICA DE ESCOPO (GUARDRAIL RESTRITO) ===\n"
                    + "Você é ESTRITAMENTE PROIBIDO de conversar sobre qualquer assunto que NÃO seja ligado diretamente à MÚSICA (teoria musical, harmonia funcional, arranjo, repertório, afinação, técnica instrumental, história da música e cifras). "
                    + "Se o usuário perguntar sobre culinária, política, esportes, programação geral, notícias ou qualquer outro assunto fora da música, RECUSE EDUCADAMENTE dizendo: "
                    + "'Como assistente harmônico do CIFRALAB, meu foco é 100% dedicado à música, harmonia e repertórios. Como posso te ajudar com suas cifras, teoria musical ou arranjos para palco?'\n\n"
                    + "=== ENSINO PRÁTICO DE TEORIA MUSICAL ===\n"
                    + "Você domina e explica com clareza: Campos Harmônicos (Maior e Menor), Modos Gregos, Cadências Harmônicas (II-V-I, IV-V-I), Dominantes Secundários (V7/V, V7/II, etc.), Substituições Tritonais (SubV7), Empréstimo Modal (AEM), Acordes Diminutos de Passagem e Inversões.\n"
                    + "REGRA DE OURO: Sempre que explicar um conceito teórico, UTILIZE MÚSICAS REAIS como exemplo prático (ex: mostre onde ocorre a cadência II-V-I ou o acorde diminuto em 'Ainda Bem', 'Não Deixe o Samba Morrer', 'Carinhoso', 'O Mundo é um Moinho', 'Garota de Ipanema', etc.), explicando o efeito sonoro e a sensação harmônica gerada.\n\n"
                    + "=== ESTRUTURAÇÃO DE REPERTÓRIO ===\n"
                    + "Analise tons vizinhos pelo ciclo das quintas para transições suaves no palco e gestione a dinâmica energética do show.");
            initial.add(systemMsg);
            return initial;
        });

        // Construir prompt com contexto tonal e instrumental
        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("[Contexto Musical de Palco]:\n");
        if (request.getTomAtual() != null) {
            userPrompt.append("- Tom Atual Transposto: ").append(request.getTomAtual()).append("\n");
        }
        if (request.getInstrumento() != null) {
            userPrompt.append("- Instrumento Ativo: ").append(request.getInstrumento())
                    .append(request.getInstrumento().equalsIgnoreCase("Cavaco") ? " (Afinação D-G-B-D)" : " (Afinação E-A-D-G-B-E)")
                    .append("\n");
        }
        if (request.getChordproSnippet() != null && !request.getChordproSnippet().isBlank()) {
            userPrompt.append("- Trecho da Cifra:\n").append(request.getChordproSnippet()).append("\n");
        }
        userPrompt.append("\n[Pergunta do Músico]:\n").append(request.getPrompt());

        synchronized (history) {
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt.toString());
            history.add(userMsg);

            // Manter no máximo últimas 10 interações para economia de tokens
            if (history.size() > 11) {
                history.subList(1, 3).clear();
            }
        }

        if (apiKey == null || apiKey.isBlank()) {
            return generateSimulatedFallback(request);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("stream", true);
        synchronized (history) {
            payload.put("messages", new ArrayList<>(history));
        }

        StringBuilder responseAccumulator = new StringBuilder();

        return webClient.post()
                .uri(baseUrl + "/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(String.class)
                .flatMap(chunk -> {
                    List<String> tokens = new ArrayList<>();
                    String[] lines = chunk.split("\n");
                    for (String line : lines) {
                        line = line.trim();
                        if (line.startsWith("data: ")) {
                            String data = line.substring(6).trim();
                            if ("[DONE]".equals(data)) {
                                continue;
                            }
                            try {
                                JsonNode node = objectMapper.readTree(data);
                                JsonNode choices = node.get("choices");
                                if (choices != null && choices.isArray() && !choices.isEmpty()) {
                                    JsonNode delta = choices.get(0).get("delta");
                                    if (delta != null && delta.has("content")) {
                                        String text = delta.get("content").asText();
                                        responseAccumulator.append(text);
                                        tokens.add(text);
                                    }
                                }
                            } catch (Exception ignored) {
                            }
                        }
                    }
                    return Flux.fromIterable(tokens);
                })
                .doOnComplete(() -> {
                    if (responseAccumulator.length() > 0) {
                        synchronized (history) {
                            Map<String, String> assistantMsg = new HashMap<>();
                            assistantMsg.put("role", "assistant");
                            assistantMsg.put("content", responseAccumulator.toString());
                            history.add(assistantMsg);
                        }
                    }
                })
                .onErrorResume(e -> generateSimulatedFallback(request));
    }

    private Flux<String> generateSimulatedFallback(HarmonicChatRequest request) {
        String tom = request.getTomAtual() != null ? request.getTomAtual() : "C";
        String inst = request.getInstrumento() != null ? request.getInstrumento() : "Cavaco";

        String advice = String.format(
                "💡 **Sugestão Harmônica para %s no tom de %s**:\n\n" +
                "1. **Cadência de Preparação**: Experimente antecipar a resolução com um acorde diminuto de passagem ou substituto trítone (SubV7).\n" +
                "2. **Dica para %s**: Use inversões na região intermediária do braço para não embolar com o baixo/surdo.\n" +
                "3. **Tensão Rica**: Adicione extensões como 9ª ou 13ª no acorde dominante do tom de %s.",
                inst, tom, inst, tom
        );

        String[] words = advice.split(" ");
        return Flux.fromArray(words)
                .map(w -> w + " ");
    }
}
