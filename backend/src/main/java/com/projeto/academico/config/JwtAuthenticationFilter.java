package com.projeto.academico.config;

import com.projeto.academico.model.Usuario;
import com.projeto.academico.repository.UsuarioRepository;
import com.projeto.academico.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {

            String token = authorization.substring(7);
            String email = jwtService.validarToken(token);

            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

                if (usuario != null) {
                    var autenticacao = new UsernamePasswordAuthenticationToken(
                            usuario.getEmail(),
                            null,
                            List.of(new SimpleGrantedAuthority(
                                    "ROLE_" + usuario.getPapel().toUpperCase()
                            ))
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(autenticacao);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}