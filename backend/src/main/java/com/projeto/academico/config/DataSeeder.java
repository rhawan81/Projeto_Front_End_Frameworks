package com.projeto.academico.config;

import com.projeto.academico.model.Materia;
import com.projeto.academico.repository.MateriaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final MateriaRepository materiaRepository;

    public DataSeeder(MateriaRepository materiaRepository) {
        this.materiaRepository = materiaRepository;
    }

    @Override
    public void run(String... args) {
        if (materiaRepository.count() > 0) {
            return;
        }

        materiaRepository.saveAll(List.of(
                new Materia(null, "Banco de Dados", "#8B5CF6"),
                new Materia(null, "Engenharia de Software", "#3B82F6"),
                new Materia(null, "Algoritmos e Programação", "#10B981"),
                new Materia(null, "Sistemas Operacionais", "#F59E0B")
        ));
    }
}
