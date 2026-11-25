package com.projeto.academico.dto;

public record AuthResponse(
    String token,
    String tipo,
    Long usuarioId,
    String nome,
    String email,
    String papel
) {}