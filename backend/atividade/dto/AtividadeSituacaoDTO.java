package com.organizadorestudos.backend.atividade.dto;

import com.organizadorestudos.backend.atividade.StatusAtividade;
import jakarta.validation.constraints.NotNull;

// Corpo esperado pelo PATCH /atividades/{id}/situacao
public class AtividadeSituacaoDTO {

    @NotNull(message = "A situação é obrigatória.")
    private StatusAtividade status;

    public StatusAtividade getStatus() {
        return status;
    }

    public void setStatus(StatusAtividade status) {
        this.status = status;
    }
}