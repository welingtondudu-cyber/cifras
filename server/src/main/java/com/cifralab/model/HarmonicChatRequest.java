package com.cifralab.model;

public class HarmonicChatRequest {
    private String prompt;
    private String tomAtual;
    private String instrumento; // "Cavaco" ou "Violao"
    private String chordproSnippet;
    private String sessionId;

    public HarmonicChatRequest() {
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getTomAtual() {
        return tomAtual;
    }

    public void setTomAtual(String tomAtual) {
        this.tomAtual = tomAtual;
    }

    public String getInstrumento() {
        return instrumento;
    }

    public void setInstrumento(String instrumento) {
        this.instrumento = instrumento;
    }

    public String getChordproSnippet() {
        return chordproSnippet;
    }

    public void setChordproSnippet(String chordproSnippet) {
        this.chordproSnippet = chordproSnippet;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
