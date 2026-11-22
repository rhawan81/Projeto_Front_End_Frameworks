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

    private static final List<String> CORES_PADRAO = List.of(
            "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
            "#EC4899", "#06B6D4", "#6366F1", "#14B8A6"
    );

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
    public Materia buscarOuCriarPorNome(String nomeBruto) {
        if (nomeBruto == null || nomeBruto.trim().isEmpty()) {
            throw new IllegalArgumentException("A matéria é obrigatória.");
        }
        String nome = nomeBruto.trim();
        return repository.findByNomeIgnoreCase(nome).orElseGet(() -> {
            Materia nova = new Materia();
            nova.setNome(nome);
            int idx = (int) (repository.count() % CORES_PADRAO.size());
            nova.setCor(CORES_PADRAO.get(idx));
            return repository.saveAndFlush(nova);
        });
    }

    @Transactional
    public Materia criar(MateriaRequestDTO dados) {
        String nome = dados.nome().trim();
        verificarNomeDisponivel(nome, null);

        Materia materia = new Materia();
        materia.setNome(nome);
        materia.setCor(normalizarCor(dados.cor(), (int) repository.count()));
        return repository.saveAndFlush(materia);
    }

    @Transactional
    public Materia atualizar(Long id, MateriaRequestDTO dados) {
        Materia materia = buscarPorId(id);
        String nome = dados.nome().trim();
        verificarNomeDisponivel(nome, id);

        materia.setNome(nome);
        if (dados.cor() != null && !dados.cor().trim().isEmpty()) {
            materia.setCor(dados.cor().trim());
        }
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

    private String normalizarCor(String cor, int fallbackIndex) {
        if (cor != null && !cor.trim().isEmpty()) {
            return cor.trim();
        }
        return CORES_PADRAO.get(Math.abs(fallbackIndex) % CORES_PADRAO.size());
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
