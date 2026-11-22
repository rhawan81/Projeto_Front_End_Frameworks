package com.projeto.academico.dto;

import com.projeto.academico.model.Atividade;
import com.projeto.academico.model.Prioridade;
import com.projeto.academico.model.StatusAtividade;

import java.time.LocalDate;

public record AtividadeResponseDTO(
        Long id,
        String titulo,
        String materia,
        Long materiaId,
        String materiaCor,
        String descricao,
        LocalDate prazo,
        Prioridade prioridade,
        StatusAtividade status
) {
    public static AtividadeResponseDTO from(Atividade atividade) {
        return new AtividadeResponseDTO(
                atividade.getId(),
                atividade.getTitulo(),
                atividade.getMateria() != null ? atividade.getMateria().getNome() : "",
                atividade.getMateria() != null ? atividade.getMateria().getId() : null,
                atividade.getMateria() != null ? atividade.getMateria().getCor() : null,
                atividade.getDescricao() != null ? atividade.getDescricao() : "",
                atividade.getPrazo(),
                atividade.getPrioridade(),
                atividade.getStatus()
        );
    }
}
