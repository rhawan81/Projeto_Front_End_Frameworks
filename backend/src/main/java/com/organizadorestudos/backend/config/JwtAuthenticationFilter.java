
package com.organizadorestudos.backend.config;

import com.organizadorestudos.backend.model.Usuario;
import com.organizadorestudos.backend.repository.UsuarioRepository;
import com.organizadorestudos.backend.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

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
            FilterChain filterChain)
            throws ServletException, IOException {

        // Captura o cabecalho Authorization
        String authorizationHeader = request.getHeader("Authorization");

        // Verifica se o cabecalho possui o formato Bearer
        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // Extrai o token removendo o prefixo Bearer
        String token = authorizationHeader.substring(7);

        // Verifica se o token e valido
        if (!jwtService.validarToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extrai o email armazenado no token
        String email = jwtService.extrairEmail(token);

        // Busca o usuario correspondente no banco de dados
        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElse(null);

        // Registra o usuario como autenticado
        if (usuario != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            UsernamePasswordAuthenticationToken autenticacao =
                    new UsernamePasswordAuthenticationToken(
                            usuario,
                            null,
                            Collections.emptyList()
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(autenticacao);
        }

        // Continua a execucao da requisicao
        filterChain.doFilter(request, response);
    }
}
