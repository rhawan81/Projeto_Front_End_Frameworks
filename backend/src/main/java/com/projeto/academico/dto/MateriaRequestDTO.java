package com.projeto.academico.dto;

import jakarta.validation.constraints.NotBlank;

public record MateriaRequestDTO(
        @NotBlank(message = "O nome da matéria é obrigatório")
        String nome
) {
}

