package com.projeto.academico.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiErrorDTO(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> details
) {
    public ApiErrorDTO(int status, String error, String message, String path) {
        this(LocalDateTime.now(), status, error, message, path, Map.of());
    }

    public ApiErrorDTO(int status, String error, String message, String path, Map<String, String> details) {
        this(LocalDateTime.now(), status, error, message, path, details);
    }
}

