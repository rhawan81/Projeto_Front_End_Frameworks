package com.projeto.academico.service;

import com.projeto.academico.dto.MateriaRequest;
import com.projeto.academico.dto.MateriaResponse;
import com.projeto.academico.exception.ConflitoException;
import com.projeto.academico.exception.RecursoNaoEncontradoException;
import com.projeto.academico.model.Materia;
import com.projeto.academico.repository.MateriaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class MateriaService {

    private static final String COR_PADRAO = "#8B5CF6";
    private final MateriaRepository repository;

    public MateriaService(MateriaRepository repository) {
        this.repository = repository;
    }

    public List<MateriaResponse> listar() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "nome"))
                .stream()
                .map(MateriaResponse::de)
                .toList();
    }

    public MateriaResponse buscarPorId(Long id) {
        return MateriaResponse.de(obterEntidade(id));
    }

    @Transactional
    public MateriaResponse criar(MateriaRequest dados) {
        String nome = dados.nome().trim();
        verificarNomeDisponivel(nome, null);

        Materia materia = new Materia();
        materia.setNome(nome);
        materia.setCor(dados.cor() == null ? COR_PADRAO : dados.cor());
        return MateriaResponse.de(repository.saveAndFlush(materia));
    }

    @Transactional
    public MateriaResponse atualizar(Long id, MateriaRequest dados) {
        Materia materia = obterEntidade(id);
        String nome = dados.nome().trim();
        verificarNomeDisponivel(nome, id);

        materia.setNome(nome);
        if (dados.cor() != null) {
            materia.setCor(dados.cor());
        }
        return MateriaResponse.de(repository.saveAndFlush(materia));
    }

    @Transactional
    public void excluir(Long id) {
        Materia materia = obterEntidade(id);
        long vinculadas = repository.contarAtividadesVinculadas(id);
        if (vinculadas > 0) {
            throw new ConflitoException(
                    "Não é possível excluir esta matéria: existem " + vinculadas
                            + " atividade(s) vinculada(s). Reatribua ou remova essas atividades primeiro."
            );
        }
        repository.delete(materia);
        repository.flush();
    }

    private Materia obterEntidade(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new RecursoNaoEncontradoException("Matéria com ID " + id + " não encontrada."));
    }

    private void verificarNomeDisponivel(String nome, Long idAtual) {
        boolean existe = idAtual == null
                ? repository.existsByNomeIgnoreCase(nome)
                : repository.existsByNomeIgnoreCaseAndIdNot(nome, idAtual);
        if (existe) {
            throw new ConflitoException("Já existe uma matéria cadastrada com esse nome.");
        }
    }
}
