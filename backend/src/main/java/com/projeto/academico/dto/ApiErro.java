package com.projeto.academico.dto;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import java.time.Instant;
import java.util.Map;

public record ApiErro(
        Instant timestamp,
        int status,
        String erro,
        String mensagem,
        String caminho,
        Map<String, String> detalhes
) {
    public static ApiErro de(HttpStatusCode status, String mensagem,
                             String caminho, Map<String, String> detalhes) {
        HttpStatus httpStatus = HttpStatus.resolve(status.value());
        String descricao = httpStatus == null ? "Erro HTTP" : httpStatus.getReasonPhrase();
        return new ApiErro(Instant.now(), status.value(), descricao, mensagem,
                caminho, detalhes == null ? Map.of() : detalhes);
    }
}
