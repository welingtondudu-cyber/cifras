package com.cifralab.model;

import java.util.List;

public class ModuloResponse {
    private Integer id;
    private String titulo;
    private String descricao;
    private String nivel;
    private String icone;
    private Integer ordem;
    private Boolean ativo;
    private Integer totalLicoes;
    private Integer licoesConcluidas;
    private Double percentualConclusao;
    private Boolean concluido;
    private List<LicaoResumoResponse> licoes;

    public ModuloResponse() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
        this.nivel = nivel;
    }

    public String getIcone() {
        return icone;
    }

    public void setIcone(String icone) {
        this.icone = icone;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Integer getTotalLicoes() {
        return totalLicoes;
    }

    public void setTotalLicoes(Integer totalLicoes) {
        this.totalLicoes = totalLicoes;
    }

    public Integer getLicoesConcluidas() {
        return licoesConcluidas;
    }

    public void setLicoesConcluidas(Integer licoesConcluidas) {
        this.licoesConcluidas = licoesConcluidas;
    }

    public Double getPercentualConclusao() {
        return percentualConclusao;
    }

    public void setPercentualConclusao(Double percentualConclusao) {
        this.percentualConclusao = percentualConclusao;
    }

    public Boolean getConcluido() {
        return concluido;
    }

    public void setConcluido(Boolean concluido) {
        this.concluido = concluido;
    }

    public List<LicaoResumoResponse> getLicoes() {
        return licoes;
    }

    public void setLicoes(List<LicaoResumoResponse> licoes) {
        this.licoes = licoes;
    }
}
