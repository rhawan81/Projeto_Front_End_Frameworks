package com.projeto.academico.controller;

import com.projeto.academico.dto.AtividadeRequestDTO;
import com.projeto.academico.dto.AtividadeResponseDTO;
import com.projeto.academico.dto.AtividadeSituacaoDTO;
import com.projeto.academico.model.StatusAtividade;
import com.projeto.academico.service.AtividadeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/atividades")
public class AtividadeController {

    private final AtividadeService service;

    public AtividadeController(AtividadeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AtividadeResponseDTO>> listar(
            @AuthenticationPrincipal String email,
            @RequestParam(required = false) Long materiaId,
            @RequestParam(required = false) String materia,
            @RequestParam(required = false) StatusAtividade situacao) {
        return ResponseEntity.ok(service.listar(email, materiaId, materia, situacao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtividadeResponseDTO> buscarPorId(
            @AuthenticationPrincipal String email, @PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(email, id));
    }

    @PostMapping
    public ResponseEntity<AtividadeResponseDTO> criar(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody AtividadeRequestDTO dados) {
        AtividadeResponseDTO criada = service.criar(email, dados);
        URI localizacao = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(localizacao).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtividadeResponseDTO> atualizar(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @Valid @RequestBody AtividadeRequestDTO dados) {
        return ResponseEntity.ok(service.atualizar(email, id, dados));
    }

    @PatchMapping({"/{id}/situacao", "/{id}/status"})
    public ResponseEntity<AtividadeResponseDTO> atualizarSituacao(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @Valid @RequestBody AtividadeSituacaoDTO dados) {
        return ResponseEntity.ok(service.atualizarSituacao(email, id, dados.status()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal String email, @PathVariable Long id) {
        service.excluir(email, id);
        return ResponseEntity.noContent().build();
    }
}
