package com.organizadorestudos.backend.atividade.dto;

import com.organizadorestudos.backend.atividade.Prioridade;
import com.organizadorestudos.backend.atividade.StatusAtividade;

import java.time.LocalDate;

// Dados devolvidos ao front. Não expõe a entidade JPA diretamente.
public class AtividadeResponseDTO {

    private Long id;
    private String titulo;
    private String materia;
    private String descricao;
    private LocalDate prazo;
    private Prioridade prioridade;
    private StatusAtividade status;

    public AtividadeResponseDTO(Long id, String titulo, String materia, String descricao,
                                 LocalDate prazo, Prioridade prioridade, StatusAtividade status) {
        this.id = id;
        this.titulo = titulo;
        this.materia = materia;
        this.descricao = descricao;
        this.prazo = prazo;
        this.prioridade = prioridade;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getMateria() {
        return materia;
    }

    public String getDescricao() {
        return descricao;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public Prioridade getPrioridade() {
        return prioridade;
    }

    public StatusAtividade getStatus() {
        return status;
    }
}