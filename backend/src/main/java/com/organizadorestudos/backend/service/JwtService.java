
package com.organizadorestudos.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey chaveSecreta;
    private final long tempoExpiracao;

    public JwtService(
            @Value("${jwt.secret}") String segredo,
            @Value("${jwt.expiration}") long tempoExpiracao) {

        this.chaveSecreta = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(segredo)
        );

        this.tempoExpiracao = tempoExpiracao;
    }

    // Gera um token JWT para o usuario
    public String gerarToken(String email) {

        Date agora = new Date();

        Date expiracao = new Date(
                agora.getTime() + tempoExpiracao
        );

        return Jwts.builder()
                .subject(email)
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(chaveSecreta)
                .compact();
    }

    // Extrai o email armazenado no token
    public String extrairEmail(String token) {

        return extrairClaims(token).getSubject();
    }

    // Valida o token JWT
    public boolean validarToken(String token) {

        try {
            extrairClaims(token);
            return true;

        } catch (Exception e) {
            return false;
        }
    }

    // Extrai as informacoes do token e verifica sua assinatura
    private Claims extrairClaims(String token) {

        return Jwts.parser()
                .verifyWith(chaveSecreta)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
