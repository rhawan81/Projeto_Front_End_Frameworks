
package com.organizadorestudos.backend.service;

import com.organizadorestudos.backend.dto.AuthResponse;
import com.organizadorestudos.backend.dto.CadastroRequest;
import com.organizadorestudos.backend.dto.LoginRequest;
import com.organizadorestudos.backend.model.Usuario;
import com.organizadorestudos.backend.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Realiza o cadastro de um usuario
    public Usuario cadastrar(CadastroRequest dados) {

        if (usuarioRepository.existsByEmail(dados.email())) {
            throw new IllegalArgumentException(
                    "Este e-mail já está cadastrado."
            );
        }

        Usuario usuario = new Usuario(
                dados.nome(),
                dados.email(),
                passwordEncoder.encode(dados.senha())
        );

        return usuarioRepository.save(usuario);
    }

    // Realiza a autenticacao do usuario
    public AuthResponse autenticar(LoginRequest dados) {

        Usuario usuario = usuarioRepository
                .findByEmail(dados.email())
                .orElseThrow(() -> new IllegalArgumentException(
                        "E-mail ou senha inválidos."
                ));

        boolean senhaCorreta = passwordEncoder.matches(
                dados.senha(),
                usuario.getSenha()
        );

        if (!senhaCorreta) {
            throw new IllegalArgumentException(
                    "E-mail ou senha inválidos."
            );
        }

        String token = jwtService.gerarToken(usuario.getEmail());

        return new AuthResponse(
                token,
                "Bearer",
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail()
        );
    }
}
