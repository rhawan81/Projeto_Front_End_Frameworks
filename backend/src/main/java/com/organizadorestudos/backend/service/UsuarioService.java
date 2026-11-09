
package com.organizadorestudos.backend.service;

import com.organizadorestudos.backend.dto.CadastroRequest;
import com.organizadorestudos.backend.model.Usuario;
import com.organizadorestudos.backend.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

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
}
