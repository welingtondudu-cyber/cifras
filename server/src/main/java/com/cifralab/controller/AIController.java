package com.cifralab.controller;

import com.cifralab.model.HarmonicChatRequest;
import com.cifralab.service.HarmonicAIService;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final HarmonicAIService harmonicAIService;

    public AIController(HarmonicAIService harmonicAIService) {
        this.harmonicAIService = harmonicAIService;
    }

    @PostMapping(value = "/harmonic-chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamHarmonicChat(@RequestBody HarmonicChatRequest request) {
        return harmonicAIService.streamHarmonicAdvice(request)
                .map(token -> ServerSentEvent.<String>builder()
                        .data(token)
                        .build());
    }
}
