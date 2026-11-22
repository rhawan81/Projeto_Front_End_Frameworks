package com.projeto.academico.config;

import com.projeto.academico.model.Atividade;
import com.projeto.academico.model.Materia;
import com.projeto.academico.model.Prioridade;
import com.projeto.academico.model.StatusAtividade;
import com.projeto.academico.repository.AtividadeRepository;
import com.projeto.academico.repository.MateriaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final MateriaRepository materiaRepository;
    private final AtividadeRepository atividadeRepository;

    public DataSeeder(MateriaRepository materiaRepository, AtividadeRepository atividadeRepository) {
        this.materiaRepository = materiaRepository;
        this.atividadeRepository = atividadeRepository;
    }

    @Override
    public void run(String... args) {
        if (materiaRepository.count() > 0 || atividadeRepository.count() > 0) {
            return;
        }

        Materia bd = materiaRepository.save(new Materia(null, "Banco de Dados", "#8B5CF6"));
        Materia es = materiaRepository.save(new Materia(null, "Engenharia de Software", "#3B82F6"));
        Materia alg = materiaRepository.save(new Materia(null, "Algoritmos e Programação", "#10B981"));
        Materia so = materiaRepository.save(new Materia(null, "Sistemas Operacionais", "#F59E0B"));

        LocalDate hoje = LocalDate.now();

        atividadeRepository.saveAll(List.of(
                new Atividade(null, "Trabalho de Banco de Dados", bd,
                        "Desenvolver o modelo relacional e consultas SQL.",
                        hoje.plusDays(2), Prioridade.ALTA, StatusAtividade.PENDENTE),
                new Atividade(null, "Prova de Engenharia de Software", es,
                        "Revisar requisitos, UML e metodologias ágeis.",
                        hoje.plusDays(4), Prioridade.ALTA, StatusAtividade.PENDENTE),
                new Atividade(null, "Lista de Algoritmos", alg,
                        "Resolver exercícios de estruturas de repetição e listas.",
                        hoje.plusDays(6), Prioridade.MEDIA, StatusAtividade.PENDENTE),
                new Atividade(null, "Resumo de Sistemas Operacionais", so,
                        "Revisar escalonamento de processos e gerenciamento de memória.",
                        hoje.minusDays(1), Prioridade.BAIXA, StatusAtividade.CONCLUIDA)
        ));
    }
}
