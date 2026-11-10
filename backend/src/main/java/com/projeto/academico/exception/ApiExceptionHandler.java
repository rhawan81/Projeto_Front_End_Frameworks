package com.projeto.academico.exception;

import com.projeto.academico.dto.ApiErro;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ApiErro> naoEncontrado(RecursoNaoEncontradoException ex,
                                                   HttpServletRequest request) {
        return erro(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ApiErro> conflito(ConflitoException ex, HttpServletRequest request) {
        return erro(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErro> violacaoDeIntegridade(DataIntegrityViolationException ex,
                                                           HttpServletRequest request) {
        return erro(HttpStatus.CONFLICT, "Operação em conflito com dados existentes.",
                request.getRequestURI());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErro> restricaoInvalida(ConstraintViolationException ex,
                                                      HttpServletRequest request) {
        return erro(HttpStatus.BAD_REQUEST, "Dados fornecidos violam uma regra de validação.",
                request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErro> falhaInesperada(Exception ex, HttpServletRequest request) {
        logger.error("Falha inesperada na API", ex);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro interno no servidor.",
                request.getRequestURI());
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(campo ->
                campos.putIfAbsent(campo.getField(), campo.getDefaultMessage()));
        ApiErro corpo = ApiErro.de(status, "Erro de validação dos dados enviados.",
                caminho(request), campos);
        return handleExceptionInternal(ex, corpo, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ApiErro corpo = ApiErro.de(status, "JSON inválido ou campos com tipos incorretos.",
                caminho(request), Map.of());
        return handleExceptionInternal(ex, corpo, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> handleTypeMismatch(
            org.springframework.beans.TypeMismatchException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String mensagem = ex instanceof MethodArgumentTypeMismatchException
                ? "Parâmetro informado possui um tipo inválido."
                : "Um valor da requisição possui tipo inválido.";
        ApiErro corpo = ApiErro.de(status, mensagem, caminho(request), Map.of());
        return handleExceptionInternal(ex, corpo, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, Object body, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        Object resposta = body instanceof ApiErro ? body : ApiErro.de(status,
                mensagemPadrao(status), caminho(request), Map.of());
        return super.handleExceptionInternal(ex, resposta, headers, status, request);
    }

    private ResponseEntity<ApiErro> erro(HttpStatus status, String mensagem, String caminho) {
        return ResponseEntity.status(status)
                .body(ApiErro.de(status, mensagem, caminho, Map.of()));
    }

    private String caminho(WebRequest request) {
        return request instanceof ServletWebRequest servlet
                ? servlet.getRequest().getRequestURI()
                : request.getDescription(false);
    }

    private String mensagemPadrao(HttpStatusCode status) {
        return switch (status.value()) {
            case 400 -> "Requisição inválida.";
            case 404 -> "Rota não encontrada.";
            case 405 -> "Método HTTP não permitido nesta rota.";
            case 406 -> "Formato de resposta não aceito.";
            case 415 -> "Tipo de conteúdo não suportado.";
            default -> "Não foi possível processar a requisição.";
        };
    }
}
