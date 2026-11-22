package com.projeto.academico.repository;

import com.projeto.academico.model.Atividade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AtividadeRepository extends JpaRepository<Atividade, Long> {

    // O filtro pelo dono é feito no banco, não apenas depois da resposta.
    List<Atividade> findByUsuarioIdOrderByPrazoAscIdAsc(Long usuarioId);

    // O mesmo isolamento vale para leitura, atualização e exclusão por ID.
    Optional<Atividade> findByIdAndUsuarioId(Long id, Long usuarioId);
}
