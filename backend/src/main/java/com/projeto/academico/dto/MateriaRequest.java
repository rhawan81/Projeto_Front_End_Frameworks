package com.projeto.academico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MateriaRequest(
        @NotBlank(message = "O nome da matéria é obrigatório")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
        String nome,

        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "A cor deve estar no formato #RRGGBB")
        String cor
) { }
