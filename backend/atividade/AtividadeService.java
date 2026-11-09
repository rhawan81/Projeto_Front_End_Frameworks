package com.organizadorestudos.backend.atividade;

import com.organizadorestudos.backend.atividade.dto.AtividadeRequestDTO;
import com.organizadorestudos.backend.atividade.dto.AtividadeResponseDTO;
import com.organizadorestudos.backend.atividade.exception.AtividadeNaoEncontradaException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AtividadeService {

    private final AtividadeRepository repository;

    public AtividadeService(AtividadeRepository repository) {
        this.repository = repository;
    }

    // Lista atividades, aplicando os filtros opcionais de matéria e situação.
    // Os dois parâmetros podem vir nulos (sem filtro nenhum).
    public List<AtividadeResponseDTO> listar(String materia, StatusAtividade status) {
        List<Atividade> atividades;

        if (materia != null && status != null) {
            atividades = repository.findByMateriaIgnoreCaseAndStatus(materia, status);
        } else if (materia != null) {
            atividades = repository.findByMateriaIgnoreCase(materia);
        } else if (status != null) {
            atividades = repository.findByStatus(status);
        } else {
            atividades = repository.findAll();
        }

        return atividades.stream().map(this::paraResponseDTO).toList();
    }

    public AtividadeResponseDTO buscarPorId(Long id) {
        Atividade atividade = buscarEntidadePorId(id);
        return paraResponseDTO(atividade);
    }

    public AtividadeResponseDTO criar(AtividadeRequestDTO dto) {
        Atividade atividade = new Atividade(
                dto.getTitulo(),
                dto.getMateria(),
                dto.getDescricao(),
                dto.getPrazo(),
                dto.getPrioridade(),
                dto.getStatus() != null ? dto.getStatus() : StatusAtividade.PENDENTE
        );

        Atividade salva = repository.save(atividade);
        return paraResponseDTO(salva);
    }

    public AtividadeResponseDTO atualizar(Long id, AtividadeRequestDTO dto) {
        Atividade atividade = buscarEntidadePorId(id);

        atividade.setTitulo(dto.getTitulo());
        atividade.setMateria(dto.getMateria());
        atividade.setDescricao(dto.getDescricao());
        atividade.setPrazo(dto.getPrazo());
        atividade.setPrioridade(dto.getPrioridade());
        if (dto.getStatus() != null) {
            atividade.setStatus(dto.getStatus());
        }

        Atividade atualizada = repository.save(atividade);
        return paraResponseDTO(atualizada);
    }

    public AtividadeResponseDTO atualizarSituacao(Long id, StatusAtividade novoStatus) {
        Atividade atividade = buscarEntidadePorId(id);
        atividade.setStatus(novoStatus);
        Atividade atualizada = repository.save(atividade);
        return paraResponseDTO(atualizada);
    }

    public void excluir(Long id) {
        Atividade atividade = buscarEntidadePorId(id);
        repository.delete(atividade);
    }

    private Atividade buscarEntidadePorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new AtividadeNaoEncontradaException(id));
    }

    private AtividadeResponseDTO paraResponseDTO(Atividade atividade) {
        return new AtividadeResponseDTO(
                atividade.getId(),
                atividade.getTitulo(),
                atividade.getMateria(),
                atividade.getDescricao(),
                atividade.getPrazo(),
                atividade.getPrioridade(),
                atividade.getStatus()
        );
    }
}