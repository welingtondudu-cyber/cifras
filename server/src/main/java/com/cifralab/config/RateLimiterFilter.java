package com.cifralab.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(-1)
public class RateLimiterFilter implements WebFilter {

    @Value("${cifralab.rate-limit.requests-per-minute:30}")
    private int maxRequests;

    private static class Counter {
        long timestamp = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(1);
    }

    private final Map<String, Counter> clientCounts = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (!path.startsWith("/api/ai/")) {
            return chain.filter(exchange);
        }

        String clientIp = exchange.getRequest().getRemoteAddress() != null
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                : "default-client";

        long now = System.currentTimeMillis();
        Counter counter = clientCounts.compute(clientIp, (key, current) -> {
            if (current == null || (now - current.timestamp) > 60000) {
                return new Counter();
            }
            current.count.incrementAndGet();
            return current;
        });

        if (counter.count.get() > maxRequests) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }
}
