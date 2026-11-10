package com.organizadorestudos.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

// TEMPORARIO: libera todos os endpoints so para testar o CRUD de atividades
// enquanto a autenticacao (login e JWT) nao esta pronta.
// Quando a Pessoa 2 entregar a seguranca de verdade, APAGAR este arquivo
// para nao ficar com duas configuracoes de seguranca conflitando.
@Configuration
public class SecurityConfigTemporaria {

    @Bean
    public SecurityFilterChain filtro(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}