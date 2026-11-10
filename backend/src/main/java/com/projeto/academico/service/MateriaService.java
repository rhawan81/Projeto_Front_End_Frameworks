package com.projeto.academico.service;

import com.projeto.academico.dto.MateriaRequestDTO;
import com.projeto.academico.exception.ResourceNotFoundException;
import com.projeto.academico.model.Materia;
import com.projeto.academico.repository.MateriaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class MateriaService {

    private final MateriaRepository repository;

    public MateriaService(MateriaRepository repository) {
        this.repository = repository;
    }

    public List<Materia> listar() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "nome"));
    }

    public Materia buscarPorId(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Matéria com ID " + id + " não encontrada."));
    }

    @Transactional
    public Materia criar(MateriaRequestDTO dados) {
        String nome = dados.nome().trim();
        verificarNomeDisponivel(nome, null);

        Materia materia = new Materia();
        materia.setNome(nome);
        return repository.saveAndFlush(materia);
    }

    @Transactional
    public Materia atualizar(Long id, MateriaRequestDTO dados) {
        Materia materia = buscarPorId(id);
        String nome = dados.nome().trim();
        verificarNomeDisponivel(nome, id);

        materia.setNome(nome);
        return repository.saveAndFlush(materia);
    }

    @Transactional
    public void excluir(Long id) {
        Materia materia = buscarPorId(id);
        long vinculadas = repository.contarAtividadesVinculadas(id);
        if (vinculadas > 0) {
            throw new IllegalArgumentException(
                    "Não é possível excluir esta matéria: existem " + vinculadas
                            + " atividade(s) vinculada(s). Reatribua ou remova essas atividades primeiro."
            );
        }
        repository.delete(materia);
        repository.flush();
    }

    private void verificarNomeDisponivel(String nome, Long idAtual) {
        boolean existe = idAtual == null
                ? repository.existsByNomeIgnoreCase(nome)
                : repository.existsByNomeIgnoreCaseAndIdNot(nome, idAtual);
        if (existe) {
            throw new IllegalArgumentException("Já existe uma matéria cadastrada com esse nome.");
        }
    }
}
