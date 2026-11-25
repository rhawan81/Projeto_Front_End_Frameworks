package com.projeto.academico.dto;

import com.projeto.academico.model.Prioridade;
import com.projeto.academico.model.StatusAtividade;

import java.time.LocalDate;

public record AtividadeResponseDTO(
        Long id,
        String titulo,
        Long materiaId,
        String materia,
        String descricao,
        LocalDate prazo,
        Prioridade prioridade,
        StatusAtividade status
) {}
