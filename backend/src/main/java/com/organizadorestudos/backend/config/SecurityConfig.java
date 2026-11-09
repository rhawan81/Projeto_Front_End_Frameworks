
package com.organizadorestudos.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // Desabilita CSRF para nossa API REST
            .csrf(AbstractHttpConfigurer::disable)

            // Define as permissões das rotas
            .authorizeHttpRequests(auth -> auth

                // Cadastro e login são públicos
                .requestMatchers(
                    HttpMethod.POST,
                    "/auth/register",
                    "/auth/login"
                ).permitAll()

                // Todas as outras rotas exigem autenticação
                .anyRequest().authenticated()
            )

            // Desabilita login por formulário e autenticação básica
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            // Nossa autenticação utilizará tokens, não sessões
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }
}
