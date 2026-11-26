package com.projeto.academico.config;

import com.projeto.academico.model.Materia;
import com.projeto.academico.model.Usuario;
import com.projeto.academico.repository.MateriaRepository;
import com.projeto.academico.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final MateriaRepository materiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String senhaAdminInicial;
    private final String senhaAlunoInicial;

    public DataSeeder(
            MateriaRepository materiaRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.admin-password:admin123}") String senhaAdminInicial,
            @Value("${app.seed.student-password:aluno123}") String senhaAlunoInicial) {
        this.materiaRepository = materiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.senhaAdminInicial = senhaAdminInicial;
        this.senhaAlunoInicial = senhaAlunoInicial;
    }

    @Override
    public void run(String... args) {
        if (materiaRepository.count() == 0) {
            materiaRepository.saveAll(List.of(
                    new Materia(null, "Banco de Dados", "#8B5CF6"),
                    new Materia(null, "Engenharia de Software", "#3B82F6"),
                    new Materia(null, "Algoritmos e Programação", "#10B981"),
                    new Materia(null, "Sistemas Operacionais", "#F59E0B")
            ));
        }

        if (!usuarioRepository.existsByEmail("admin@estudos.com")) {
            Usuario admin = new Usuario(
                    "Prof. Henrique (ADM)",
                    "admin@estudos.com",
                    passwordEncoder.encode(senhaAdminInicial)
            );
            admin.setPapel("ADMIN");
            usuarioRepository.save(admin);
        }

        if (!usuarioRepository.existsByEmail("aluno@estudos.com")) {
            Usuario aluno = new Usuario(
                    "Aluno Teste",
                    "aluno@estudos.com",
                    passwordEncoder.encode(senhaAlunoInicial)
            );
            aluno.setPapel("ESTUDANTE");
            usuarioRepository.save(aluno);
        }
    }
}
