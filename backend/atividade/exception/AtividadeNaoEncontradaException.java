package com.organizadorestudos.backend.atividade.exception;

public class AtividadeNaoEncontradaException extends RuntimeException {

    public AtividadeNaoEncontradaException(Long id) {
        super("Atividade com id " + id + " não foi encontrada.");
    }
}