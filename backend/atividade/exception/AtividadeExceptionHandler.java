package com.organizadorestudos.backend.atividade.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

// Tratamento de erro só do pacote "atividade". Quando a Pessoa 4 criar o
// @RestControllerAdvice global da API, esse aqui pode ser removido e as
// exceções passam a ser tratadas lá.
@RestControllerAdvice
public class AtividadeExceptionHandler {

    @ExceptionHandler(AtividadeNaoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> tratarNaoEncontrada(AtividadeNaoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(corpoDeErro(HttpStatus.NOT_FOUND, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> tratarValidacao(MethodArgumentNotValidException ex) {
        String mensagens = ex.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getField() + ": " + erro.getDefaultMessage())
                .reduce((a, b) -> a + " | " + b)
                .orElse("Dados inválidos.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(corpoDeErro(HttpStatus.BAD_REQUEST, mensagens));
    }

    private Map<String, Object> corpoDeErro(HttpStatus status, String mensagem) {
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("status", status.value());
        corpo.put("mensagem", mensagem);
        corpo.put("data", LocalDateTime.now());
        return corpo;
    }
}