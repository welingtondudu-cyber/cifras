package com.cifralab.model;

import java.util.List;

public class LicaoTeoria {
    private Integer id;
    private Integer moduloId;
    private String titulo;
    private Integer ordem;
    private String conceito;
    private String exemploPratico;
    private String exercicio;
    private String tempoEstimado;
    private List<String> acordesChave;

    public LicaoTeoria() {
    }

    public LicaoTeoria(Integer id, Integer moduloId, String titulo, Integer ordem, String conceito, 
                       String exemploPratico, String exercicio, String tempoEstimado, List<String> acordesChave) {
        this.id = id;
        this.moduloId = moduloId;
        this.titulo = titulo;
        this.ordem = ordem;
        this.conceito = conceito;
        this.exemploPratico = exemploPratico;
        this.exercicio = exercicio;
        this.tempoEstimado = tempoEstimado;
        this.acordesChave = acordesChave;
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

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
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
}
