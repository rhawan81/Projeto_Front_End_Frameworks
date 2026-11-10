package com.organizadorestudos.backend.atividade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AtividadeRepository extends JpaRepository<Atividade, Long> {

    List<Atividade> findByStatus(StatusAtividade status);

    List<Atividade> findByMateriaIgnoreCase(String materia);

    List<Atividade> findByMateriaIgnoreCaseAndStatus(String materia, StatusAtividade status);
}