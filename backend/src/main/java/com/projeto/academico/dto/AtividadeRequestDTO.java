package com.projeto.academico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AtividadeRequestDTO(
        @NotBlank(message = "O título é obrigatório")
        String titulo,
        String materia,
        Long materiaId,
        String descricao,
        @NotNull(message = "O prazo é obrigatório")
        LocalDate prazo,
        String prioridade,
        String status
) {
}
