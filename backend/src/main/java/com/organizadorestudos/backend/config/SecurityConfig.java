
package com.organizadorestudos.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // Configuração do CORS para permitir a comunicação com o React
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuracao = new CorsConfiguration();

        configuracao.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuracao.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuracao.setAllowedHeaders(
                List.of("Authorization", "Content-Type")
        );

        configuracao.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource origem =
                new UrlBasedCorsConfigurationSource();

        origem.registerCorsConfiguration("/**", configuracao);

        return origem;
    }

    // Configuração principal de segurança do Spring Security
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // Ativa o CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Desabilita CSRF, pois a autenticação utiliza JWT
            .csrf(AbstractHttpConfigurer::disable)

            // Define quais rotas são públicas e protegidas
            .authorizeHttpRequests(auth -> auth

                // Cadastro e login podem ser acessados sem autenticação
                .requestMatchers(
                    HttpMethod.POST,
                    "/auth/register",
                    "/auth/login"
                ).permitAll()

                // Todas as demais rotas exigem autenticação
                .anyRequest().authenticated()
            )

            // Desabilita o formulário padrão de login
            .formLogin(AbstractHttpConfigurer::disable)

            // Desabilita autenticação HTTP Basic
            .httpBasic(AbstractHttpConfigurer::disable)

            // Não utiliza sessões no servidor
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Adiciona o filtro JWT antes da autenticação padrão
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
