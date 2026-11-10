package com.projeto.academico.dto;

import com.projeto.academico.model.Materia;

public record MateriaResponse(Long id, String nome, String cor) {
    public static MateriaResponse de(Materia materia) {
        return new MateriaResponse(materia.getId(), materia.getNome(), materia.getCor());
    }
}
