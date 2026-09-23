package com.cifralab.service;

import com.cifralab.model.*;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class TeoriaService {

    private final List<ModuloTeoria> modulos = new ArrayList<>();
    private final List<LicaoTeoria> licoes = new ArrayList<>();
    // userId -> Set<licaoId>
    private final Map<String, Set<Integer>> progressoUsuarios = new ConcurrentHashMap<>();

    public TeoriaService() {
        inicializarDadosSeeds();
    }

    private void inicializarDadosSeeds() {
        // Módulo 1: Fundamentos
        modulos.add(new ModuloTeoria(
                1,
                "Nível 1: Fundamentos & O Início Prático",
                "Sair do zero absoluto, dominar cifras, ritmo e montagem de acordes.",
                "Iniciante",
                "BookOpen",
                1,
                true
        ));
        licoes.add(new LicaoTeoria(
                101,
                1,
                "O Alfabeto Musical e as Cifras Internacionais",
                1,
                "As 7 notas naturais (C, D, E, F, G, A, B) e acidentes (sustenidos e bemóis). Toda cifra indica a nota tônica fundamental e as extensões harmônicas que qualificam o acorde.",
                "Am7 = A (Lá) + m (Menor) + 7 (Sétima menor) -> Lá, Dó, Mi, Sol.",
                "Traduzir 5 cifras complexas para notas por extenso (Ex: C7M, Dm6, Em7, F#m7(b5), B7).",
                "10 min",
                List.of("C", "Am", "Dm", "G7")
        ));
        licoes.add(new LicaoTeoria(
                102,
                1,
                "Montagem Lógica de Acordes",
                2,
                "Acordes como fórmulas matemáticas intervalares. Tríade Maior = Tônica + 4 semitons (3ª Maior) + 3 semitons (5ª Justa). Tríade Menor = Tônica + 3 semitons (3ª Menor) + 4 semitons (5ª Justa).",
                "Em Dó (C): C + 4 semitons (E) + 3 semitons (G). Logo C = C-E-G. No violão ou cavaco, basta encontrar essas 3 notas no braço.",
                "Calcular as notas do acorde de Sol Maior (G) e Ré Menor (Dm) do zero usando a regra dos semitons.",
                "15 min",
                List.of("G", "Em", "C", "D7")
        ));

        // Módulo 2: O Mecanismo da Harmonia
        modulos.add(new ModuloTeoria(
                2,
                "Nível 2: O Mecanismo da Harmonia (Campos e Funções)",
                "Entender a gravidade musical, campos harmônicos e funções.",
                "Intermediário",
                "Sliders",
                2,
                true
        ));
        licoes.add(new LicaoTeoria(
                201,
                2,
                "A Função de Cada Grau",
                1,
                "Tônica (I - repouso/casa), Subdominante (IV e II - afastamento e preparação) e Dominante (V e VII - tensão máxima e instabilidade). A música se move por ciclos de tensão e relaxamento.",
                "Tocar um acorde com sétima dominante (G7) gera urgência física de resolução para a tônica (C). Isso é a gravidade harmônica.",
                "Identificar a resolução de tensão em uma progressão básica (ex: ||: C | Am | Dm | G7 :||) cantando a nota de repouso.",
                "15 min",
                List.of("C7M", "Dm7", "Em7", "F7M", "G7", "Am7")
        ));

        // Módulo 3: Melodia, Escalas e Tabs
        modulos.add(new ModuloTeoria(
                3,
                "Nível 3: Melodia, Escalas, Tablaturas e Mapeamento",
                "Domínio visual do braço, pentatônicas e leitura avançada de tabs.",
                "Avançado",
                "Music",
                3,
                true
        ));
        licoes.add(new LicaoTeoria(
                301,
                3,
                "Leitura Avançada de Tablaturas (TabLab)",
                1,
                "Leitura precisa de cordas, trastes e efeitos de articulação de palco: h (hammer-on), p (pull-off), / (slide ascendente), \\ (slide descendente), ~ (vibrato) e b (bend).",
                "G|---5h7p5--/9~---| significa palhetar a casa 5, martelar a 7 com a mão esquerda, puxar de volta para a 5, deslizar para a casa 9 e aplicar vibrato.",
                "Executar um pequeno riff de introdução no TabLab aplicando a técnica de hammer-on e slide com metrônomo a 80 BPM.",
                "20 min",
                List.of("Am7", "D7(9)", "G7M")
        ));

        // Módulo 4: Maestria e Samba/MPB
        modulos.add(new ModuloTeoria(
                4,
                "Nível 4: Maestria, Harmonias Densas (Samba/MPB) e Ouvido Pro",
                "Harmonias complexas, reharmonização e tirar músicas de ouvido.",
                "Mestre",
                "Sparkles",
                4,
                true
        ));
        licoes.add(new LicaoTeoria(
                401,
                4,
                "Como Tirar Música de Ouvido",
                1,
                "O método de 4 passos do palco: 1. Achar a tônica final (onde a música repousa), 2. Identificar a nota mais grave (baixo de cada compasso), 3. Testar o campo harmônico correspondente, 4. Detectar tensões e acordes de empréstimo modal.",
                "Ao ouvir o final de um refrão, identifique onde a voz repousa naturalmente. Se repousar em Fá, teste o Campo Harmônico de Fá Maior (F, Gm, Am, Bb, C7, Dm).",
                "Tirar a progressão harmônica de uma música de 3 ou 4 acordes em menos de 5 minutos apenas seguindo o baixo.",
                "25 min",
                List.of("F7M", "Gm7", "C7(9)", "Dm7")
        ));
        licoes.add(new LicaoTeoria(
                402,
                4,
                "A Harmonia do Samba e da MPB",
                2,
                "Dominantes secundários encadeados (V7/II, V7/V), acordes diminutos de passagem com função de sensível e condução cromática de vozes no baixo.",
                "C7M -> C#dim -> Dm7 -> G7(9) -> C7M. O acorde C#dim funciona como um elevador estético perfeito preparando a chegada no Dm7.",
                "Analisar a condução de vozes em um final de frase de clássico do samba (Cartola / Noel Rosa) e rearmonizar usando um diminuto de passagem.",
                "30 min",
                List.of("C7M", "C#dim", "Dm7", "G7(9)", "G#dim", "Am7")
        ));
    }

    private String normalizeUser(String userId) {
        return (userId != null && !userId.isBlank()) ? userId : "guest_user";
    }

    public Flux<ModuloResponse> listarModulos(String userId) {
        String effectiveUser = normalizeUser(userId);
        Set<Integer> concluidas = progressoUsuarios.getOrDefault(effectiveUser, Collections.emptySet());

        List<ModuloResponse> result = modulos.stream()
                .filter(ModuloTeoria::getAtivo)
                .sorted(Comparator.comparingInt(ModuloTeoria::getOrdem))
                .map(m -> toModuloResponse(m, concluidas, false))
                .collect(Collectors.toList());

        return Flux.fromIterable(result);
    }

    public Mono<ModuloResponse> buscarModuloPorId(Integer id, String userId) {
        String effectiveUser = normalizeUser(userId);
        Set<Integer> concluidas = progressoUsuarios.getOrDefault(effectiveUser, Collections.emptySet());

        return Mono.justOrEmpty(
                modulos.stream()
                        .filter(m -> m.getId().equals(id))
                        .findFirst()
                        .map(m -> toModuloResponse(m, concluidas, true))
        );
    }

    public Mono<LicaoDetalheResponse> buscarLicaoPorId(Integer id, String userId) {
        String effectiveUser = normalizeUser(userId);
        Set<Integer> concluidas = progressoUsuarios.getOrDefault(effectiveUser, Collections.emptySet());

        Optional<LicaoTeoria> licaoOpt = licoes.stream().filter(l -> l.getId().equals(id)).findFirst();
        if (licaoOpt.isEmpty()) {
            return Mono.empty();
        }

        LicaoTeoria licao = licaoOpt.get();
        ModuloTeoria modulo = modulos.stream()
                .filter(m -> m.getId().equals(licao.getModuloId()))
                .findFirst()
                .orElse(null);

        // Achar anterior e próxima dentro do catálogo ordenado
        List<LicaoTeoria> todasOrdenadas = licoes.stream()
                .sorted(Comparator.comparingInt(LicaoTeoria::getModuloId).thenComparingInt(LicaoTeoria::getOrdem))
                .toList();

        int currentIndex = todasOrdenadas.indexOf(licao);
        Integer anteriorId = currentIndex > 0 ? todasOrdenadas.get(currentIndex - 1).getId() : null;
        Integer proximoId = currentIndex < todasOrdenadas.size() - 1 ? todasOrdenadas.get(currentIndex + 1).getId() : null;

        LicaoDetalheResponse resp = new LicaoDetalheResponse();
        resp.setId(licao.getId());
        resp.setModuloId(licao.getModuloId());
        resp.setModuloTitulo(modulo != null ? modulo.getTitulo() : "");
        resp.setOrdem(licao.getOrdem());
        resp.setTitulo(licao.getTitulo());
        resp.setConceito(licao.getConceito());
        resp.setExemploPratico(licao.getExemploPratico());
        resp.setExercicio(licao.getExercicio());
        resp.setTempoEstimado(licao.getTempoEstimado());
        resp.setAcordesChave(licao.getAcordesChave());
        resp.setConcluida(concluidas.contains(licao.getId()));
        resp.setAnteriorId(anteriorId);
        resp.setProximoId(proximoId);

        return Mono.just(resp);
    }

    public Mono<LicaoDetalheResponse> atualizarConclusaoLicao(Integer id, Boolean concluido, String userId) {
        String effectiveUser = normalizeUser(userId);
        Set<Integer> set = progressoUsuarios.computeIfAbsent(effectiveUser, k -> ConcurrentHashMap.newKeySet());

        if (Boolean.TRUE.equals(concluido)) {
            set.add(id);
        } else {
            set.remove(id);
        }

        return buscarLicaoPorId(id, effectiveUser);
    }

    private ModuloResponse toModuloResponse(ModuloTeoria m, Set<Integer> concluidas, boolean incluirLicoes) {
        List<LicaoTeoria> moduloLicoes = licoes.stream()
                .filter(l -> l.getModuloId().equals(m.getId()))
                .sorted(Comparator.comparingInt(LicaoTeoria::getOrdem))
                .toList();

        int total = moduloLicoes.size();
        int concluidasCount = (int) moduloLicoes.stream()
                .filter(l -> concluidas.contains(l.getId()))
                .count();

        double percentual = total > 0 ? ((double) concluidasCount / total) * 100.0 : 0.0;
        boolean cemPorCento = total > 0 && concluidasCount == total;

        ModuloResponse resp = new ModuloResponse();
        resp.setId(m.getId());
        resp.setTitulo(m.getTitulo());
        resp.setDescricao(m.getDescricao());
        resp.setNivel(m.getNivel());
        resp.setIcone(m.getIcone());
        resp.setOrdem(m.getOrdem());
        resp.setAtivo(m.getAtivo());
        resp.setTotalLicoes(total);
        resp.setLicoesConcluidas(concluidasCount);
        resp.setPercentualConclusao(Math.round(percentual * 10.0) / 10.0);
        resp.setConcluido(cemPorCento);

        if (incluirLicoes) {
            resp.setLicoes(moduloLicoes.stream()
                    .map(l -> new LicaoResumoResponse(
                            l.getId(),
                            l.getModuloId(),
                            l.getOrdem(),
                            l.getTitulo(),
                            l.getTempoEstimado(),
                            concluidas.contains(l.getId())
                    ))
                    .collect(Collectors.toList()));
        }

        return resp;
    }
}
