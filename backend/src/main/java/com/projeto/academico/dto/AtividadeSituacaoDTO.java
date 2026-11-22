package com.projeto.academico.dto;

import com.projeto.academico.model.StatusAtividade;
import jakarta.validation.constraints.NotNull;

public record AtividadeSituacaoDTO(
        @NotNull(message = "A situação é obrigatória") StatusAtividade status
) {}
