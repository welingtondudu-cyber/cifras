package com.cifralab.model;

import java.util.List;

public class LicaoDetalheResponse {
    private Integer id;
    private Integer moduloId;
    private String moduloTitulo;
    private Integer ordem;
    private String titulo;
    private String conceito;
    private String exemploPratico;
    private String exercicio;
    private String tempoEstimado;
    private List<String> acordesChave;
    private Boolean concluida;
    private Integer anteriorId;
    private Integer proximoId;

    public LicaoDetalheResponse() {
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

    public String getModuloTitulo() {
        return moduloTitulo;
    }

    public void setModuloTitulo(String moduloTitulo) {
        this.moduloTitulo = moduloTitulo;
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

    public String getConceito() {
        return conceito;
    }

    public void setConceito(String conceito) {
        this.conceito = conceito;
    }

    public String getExemploPratico() {
        return exemploPratico;
    }

    public void setExemploPratico(String exemploPratico) {
        this.exemploPratico = exemploPratico;
    }

    public String getExercicio() {
        return exercicio;
    }

    public void setExercicio(String exercicio) {
        this.exercicio = exercicio;
    }

    public String getTempoEstimado() {
        return tempoEstimado;
    }

    public void setTempoEstimado(String tempoEstimado) {
        this.tempoEstimado = tempoEstimado;
    }

    public List<String> getAcordesChave() {
        return acordesChave;
    }

    public void setAcordesChave(List<String> acordesChave) {
        this.acordesChave = acordesChave;
    }

    public Boolean getConcluida() {
        return concluida;
    }

    public void setConcluida(Boolean concluida) {
        this.concluida = concluida;
    }

    public Integer getAnteriorId() {
        return anteriorId;
    }

    public void setAnteriorId(Integer anteriorId) {
        this.anteriorId = anteriorId;
    }

    public Integer getProximoId() {
        return proximoId;
    }

    public void setProximoId(Integer proximoId) {
        this.proximoId = proximoId;
    }
}
