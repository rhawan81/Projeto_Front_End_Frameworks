package com.projeto.academico.repository;

import com.projeto.academico.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
    boolean existsByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

    // Evita excluir matérias referenciadas por atividades com FK obrigatória.
    @Query("select count(a) from Atividade a where a.materia.id = :materiaId")
    long contarAtividadesVinculadas(@Param("materiaId") Long materiaId);
}
