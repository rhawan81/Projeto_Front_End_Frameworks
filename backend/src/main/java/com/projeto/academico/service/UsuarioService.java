
package com.projeto.academico.service;

import com.projeto.academico.dto.AuthResponse;
import com.projeto.academico.dto.CadastroRequest;
import com.projeto.academico.dto.LoginRequest;
import com.projeto.academico.model.Usuario;
import com.projeto.academico.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public AuthResponse cadastrar(CadastroRequest request) {

        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este e-mail já está cadastrado."
            );
        }

        String senhaCriptografada =
                passwordEncoder.encode(request.senha());

        Usuario usuario = new Usuario(
                request.nome(),
                request.email(),
                senhaCriptografada
        );

        usuario.setPapel("ESTUDANTE");

        usuario = usuarioRepository.save(usuario);

        return gerarResposta(usuario);
    }

    public AuthResponse autenticar(LoginRequest request) {

        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "E-mail ou senha inválidos."
                ));

        if (!passwordEncoder.matches(
                request.senha(),
                usuario.getSenha())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "E-mail ou senha inválidos."
            );
        }

        return gerarResposta(usuario);
    }

    private AuthResponse gerarResposta(Usuario usuario) {

        String token = jwtService.gerarToken(usuario.getEmail());

        return new AuthResponse(
                token,
                "Bearer",
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPapel()
        );
    }
}
