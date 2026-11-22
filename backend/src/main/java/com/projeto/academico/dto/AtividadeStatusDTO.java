package com.projeto.academico.dto;

import jakarta.validation.constraints.NotBlank;

public record AtividadeStatusDTO(
        @NotBlank(message = "O status é obrigatório")
        String status
) {
}
