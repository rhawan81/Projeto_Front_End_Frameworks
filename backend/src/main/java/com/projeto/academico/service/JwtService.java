package com.projeto.academico.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    private final Algorithm algorithm;

    public JwtService(
            @Value("${api.security.token.secret}") String secret) {

        byte[] secretBytes = Base64.getDecoder().decode(secret);

        if (secretBytes.length < 32) {
            throw new IllegalArgumentException(
                    "A chave JWT deve possuir pelo menos 32 bytes."
            );
        }

        this.algorithm = Algorithm.HMAC256(secretBytes);
    }

    public String gerarToken(String email) {

        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + 86400000);

        return JWT.create()
                .withSubject(email)
                .withIssuedAt(agora)
                .withExpiresAt(expiracao)
                .sign(algorithm);
    }

    public String validarToken(String token) {

        try {
            return JWT.require(algorithm)
                    .build()
                    .verify(token)
                    .getSubject();

        } catch (JWTVerificationException e) {
            return null;
        }
    }
}