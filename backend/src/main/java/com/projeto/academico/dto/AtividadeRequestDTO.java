package com.projeto.academico.dto;

import com.projeto.academico.model.Prioridade;
import com.projeto.academico.model.StatusAtividade;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AtividadeRequestDTO(
        @NotBlank(message = "O título é obrigatório")
        @Size(max = 255, message = "O título deve ter no máximo 255 caracteres")
        String titulo,

        @NotNull(message = "A matéria é obrigatória")
        @Positive(message = "O ID da matéria deve ser positivo")
        Long materiaId,

        String descricao,

        @NotNull(message = "O prazo é obrigatório")
        @FutureOrPresent(message = "O prazo não pode estar no passado")
        LocalDate prazo,

        @NotNull(message = "A prioridade é obrigatória")
        Prioridade prioridade,

        // Se omitido na criação, o status inicial será PENDENTE.
        StatusAtividade status
) {}
