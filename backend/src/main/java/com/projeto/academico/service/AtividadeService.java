package com.projeto.academico.service;

import com.projeto.academico.dto.AtividadeRequestDTO;
import com.projeto.academico.dto.AtividadeResponseDTO;
import com.projeto.academico.exception.ResourceNotFoundException;
import com.projeto.academico.model.Atividade;
import com.projeto.academico.model.Materia;
import com.projeto.academico.model.Prioridade;
import com.projeto.academico.model.StatusAtividade;
import com.projeto.academico.repository.AtividadeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class AtividadeService {

    private final AtividadeRepository repository;
    private final MateriaService materiaService;

    public AtividadeService(AtividadeRepository repository, MateriaService materiaService) {
        this.repository = repository;
        this.materiaService = materiaService;
    }

    public List<AtividadeResponseDTO> listar(String materia, String situacao) {
        Sort ordem = Sort.by(Sort.Order.asc("prazo"), Sort.Order.asc("id"));
        return repository.findAll(ordem).stream()
                .filter(a -> materia == null || materia.isBlank()
                        || (a.getMateria() != null && a.getMateria().getNome().equalsIgnoreCase(materia.trim())))
                .filter(a -> situacao == null || situacao.isBlank()
                        || a.getStatus().name().equalsIgnoreCase(situacao.trim()))
                .map(AtividadeResponseDTO::from)
                .toList();
    }

    public AtividadeResponseDTO buscarPorId(Long id) {
        Atividade atividade = encontrarEntidade(id);
        return AtividadeResponseDTO.from(atividade);
    }

    @Transactional
    public AtividadeResponseDTO criar(AtividadeRequestDTO dados) {
        Atividade atividade = new Atividade();
        aplicarDados(atividade, dados);
        return AtividadeResponseDTO.from(repository.saveAndFlush(atividade));
    }

    @Transactional
    public AtividadeResponseDTO atualizar(Long id, AtividadeRequestDTO dados) {
        Atividade atividade = encontrarEntidade(id);
        aplicarDados(atividade, dados);
        return AtividadeResponseDTO.from(repository.saveAndFlush(atividade));
    }

    @Transactional
    public AtividadeResponseDTO atualizarStatus(Long id, String statusStr) {
        Atividade atividade = encontrarEntidade(id);
        atividade.setStatus(parseStatus(statusStr));
        return AtividadeResponseDTO.from(repository.saveAndFlush(atividade));
    }

    @Transactional
    public void excluir(Long id) {
        Atividade atividade = encontrarEntidade(id);
        repository.delete(atividade);
        repository.flush();
    }

    private Atividade encontrarEntidade(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Atividade com ID " + id + " não encontrada."));
    }

    private void aplicarDados(Atividade atividade, AtividadeRequestDTO dados) {
        Materia materia = resolverMateria(dados);
        atividade.setTitulo(dados.titulo().trim());
        atividade.setMateria(materia);
        atividade.setDescricao(dados.descricao() != null ? dados.descricao().trim() : "");
        atividade.setPrazo(dados.prazo());
        atividade.setPrioridade(parsePrioridade(dados.prioridade()));
        atividade.setStatus(parseStatus(dados.status()));
    }

    private Materia resolverMateria(AtividadeRequestDTO dados) {
        if (dados.materiaId() != null) {
            return materiaService.buscarPorId(dados.materiaId());
        }
        return materiaService.buscarOuCriarPorNome(dados.materia());
    }

    private Prioridade parsePrioridade(String valor) {
        if (valor == null || valor.isBlank()) {
            return Prioridade.MEDIA;
        }
        try {
            return Prioridade.valueOf(valor.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Prioridade inválida: " + valor + ". Use ALTA, MEDIA ou BAIXA.");
        }
    }

    private StatusAtividade parseStatus(String valor) {
        if (valor == null || valor.isBlank()) {
            return StatusAtividade.PENDENTE;
        }
        try {
            return StatusAtividade.valueOf(valor.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Status inválido: " + valor + ". Use PENDENTE, EM_ANDAMENTO ou CONCLUIDA."
            );
        }
    }
}
