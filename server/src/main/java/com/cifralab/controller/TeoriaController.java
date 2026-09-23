package com.cifralab.controller;

import com.cifralab.model.ConclusaoRequest;
import com.cifralab.model.LicaoDetalheResponse;
import com.cifralab.model.ModuloResponse;
import com.cifralab.service.TeoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/teoria")
@CrossOrigin(origins = "*")
public class TeoriaController {

    private final TeoriaService teoriaService;

    public TeoriaController(TeoriaService teoriaService) {
        this.teoriaService = teoriaService;
    }

    /**
     * GET /api/teoria/modulos
     * Lista todos os módulos disponíveis ordenados com progresso do usuário
     */
    @GetMapping("/modulos")
    public Flux<ModuloResponse> listarModulos(
            @RequestParam(value = "userId", required = false) String userId) {
        return teoriaService.listarModulos(userId);
    }

    /**
     * GET /api/teoria/modulos/{id}
     * Retorna o módulo com suas lições ordenadas e o status de cada lição
     */
    @GetMapping("/modulos/{id}")
    public Mono<ResponseEntity<ModuloResponse>> buscarModuloPorId(
            @PathVariable("id") Integer id,
            @RequestParam(value = "userId", required = false) String userId) {
        return teoriaService.buscarModuloPorId(id, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/teoria/licoes/{id}
     * Retorna os detalhes e o conteúdo completo da lição, status de conclusão e anterior/próxima
     */
    @GetMapping("/licoes/{id}")
    public Mono<ResponseEntity<LicaoDetalheResponse>> buscarLicaoPorId(
            @PathVariable("id") Integer id,
            @RequestParam(value = "userId", required = false) String userId) {
        return teoriaService.buscarLicaoPorId(id, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/teoria/licoes/{id}/concluir
     * Alterna ou define o status de conclusão ({ "concluido": true }). Atualiza o progresso do usuário logado.
     */
    @PostMapping("/licoes/{id}/concluir")
    public Mono<ResponseEntity<LicaoDetalheResponse>> concluirLicao(
            @PathVariable("id") Integer id,
            @RequestBody(required = false) ConclusaoRequest request) {
        Boolean concluido = request != null && request.getConcluido() != null ? request.getConcluido() : true;
        String userId = request != null ? request.getUserId() : null;

        return teoriaService.atualizarConclusaoLicao(id, concluido, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
