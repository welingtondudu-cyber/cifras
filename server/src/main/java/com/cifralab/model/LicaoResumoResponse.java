package com.cifralab.model;

public class LicaoResumoResponse {
    private Integer id;
    private Integer moduloId;
    private Integer ordem;
    private String titulo;
    private String tempoEstimado;
    private Boolean concluida;

    public LicaoResumoResponse() {
    }

    public LicaoResumoResponse(Integer id, Integer moduloId, Integer ordem, String titulo, String tempoEstimado, Boolean concluida) {
        this.id = id;
        this.moduloId = moduloId;
        this.ordem = ordem;
        this.titulo = titulo;
        this.tempoEstimado = tempoEstimado;
        this.concluida = concluida;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getModuloId() {
        return moduloId;
    }

    public void setModuloId(Integer moduloId) {
        this.moduloId = moduloId;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getTempoEstimado() {
        return tempoEstimado;
    }

    public void setTempoEstimado(String tempoEstimado) {
        this.tempoEstimado = tempoEstimado;
    }

    public Boolean getConcluida() {
        return concluida;
    }

    public void setConcluida(Boolean concluida) {
        this.concluida = concluida;
    }
}
