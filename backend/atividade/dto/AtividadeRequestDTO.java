package com.organizadorestudos.backend.atividade.dto;

import com.organizadorestudos.backend.atividade.Prioridade;
import com.organizadorestudos.backend.atividade.StatusAtividade;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

// Dados recebidos do front ao criar ou editar uma atividade
public class AtividadeRequestDTO {

    @NotBlank(message = "O título é obrigatório.")
    private String titulo;

    @NotBlank(message = "A matéria é obrigatória.")
    private String materia;

    private String descricao;

    @NotNull(message = "O prazo é obrigatório.")
    @FutureOrPresent(message = "O prazo não pode estar no passado.")
    private LocalDate prazo;

    @NotNull(message = "A prioridade é obrigatória.")
    private Prioridade prioridade;

    // Opcional: se não vier, o service assume PENDENTE na criação
    private StatusAtividade status;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMateria() {
        return materia;
    }

    public void setMateria(String materia) {
        this.materia = materia;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public void setPrazo(LocalDate prazo) {
        this.prazo = prazo;
    }

    public Prioridade getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(Prioridade prioridade) {
        this.prioridade = prioridade;
    }

    public StatusAtividade getStatus() {
        return status;
    }

    public void setStatus(StatusAtividade status) {
        this.status = status;
    }
}