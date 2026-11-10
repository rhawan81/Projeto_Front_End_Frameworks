package com.projeto.academico.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projeto.academico.exception.ApiErrorDTO;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper mapper)
            throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/materias", "/materias/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, cause) ->
                                escreverErro(response, mapper, HttpStatus.UNAUTHORIZED,
                                        "Autenticação necessária para acessar este recurso.",
                                        request.getRequestURI()))
                        .accessDeniedHandler((request, response, cause) ->
                                escreverErro(response, mapper, HttpStatus.FORBIDDEN,
                                        "Acesso negado ao recurso solicitado.",
                                        request.getRequestURI())))
                .build();
    }

    private void escreverErro(HttpServletResponse response, ObjectMapper mapper,
                              HttpStatus status, String mensagem, String caminho) throws IOException {
        response.setStatus(status.value());
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        ApiErrorDTO erro = new ApiErrorDTO(
                status.value(),
                status.getReasonPhrase(),
                mensagem,
                caminho
        );
        mapper.writeValue(response.getWriter(), erro);
    }
}
