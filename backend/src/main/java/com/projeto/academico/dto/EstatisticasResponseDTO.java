package com.projeto.academico.dto;

import com.projeto.academico.model.Prioridade;

import java.util.List;
import java.util.Map;

public record EstatisticasResponseDTO(
        Totais totais,
        Map<Prioridade, Long> porPrioridade,
        List<PorMateria> porMateria
) {
    public record Totais(long total, long pendentes, long emAndamento, long concluidas) {}

    public record PorMateria(
            Long materiaId,
            String materia,
            long total,
            long pendentes,
            long emAndamento,
            long concluidas
    ) {}
}
