
package com.organizadorestudos.backend.dto;

public record AuthResponse(
    String token,
    String tipo,
    Long usuarioId,
    String nome,
    String email
) {}
