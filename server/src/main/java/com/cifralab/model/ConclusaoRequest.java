package com.cifralab.model;

public class ConclusaoRequest {
    private Boolean concluido;
    private String userId;

    public ConclusaoRequest() {
    }

    public ConclusaoRequest(Boolean concluido) {
        this.concluido = concluido;
    }

    public Boolean getConcluido() {
        return concluido;
    }

    public void setConcluido(Boolean concluido) {
        this.concluido = concluido;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
