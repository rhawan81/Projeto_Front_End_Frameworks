package com.projeto.academico.controller;

import com.projeto.academico.dto.AtividadeRequestDTO;
import com.projeto.academico.dto.AtividadeResponseDTO;
import com.projeto.academico.dto.AtividadeStatusDTO;
import com.projeto.academico.service.AtividadeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
            @RequestParam(required = false) String materia,
            @RequestParam(required = false) String situacao) {
        return ResponseEntity.ok(service.listar(materia, situacao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtividadeResponseDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<AtividadeResponseDTO> criar(@Valid @RequestBody AtividadeRequestDTO dados) {
        AtividadeResponseDTO criada = service.criar(dados);
        URI localizacao = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(localizacao).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtividadeResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtividadeRequestDTO dados) {
        return ResponseEntity.ok(service.atualizar(id, dados));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AtividadeResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody AtividadeStatusDTO dados) {
        return ResponseEntity.ok(service.atualizarStatus(id, dados.status()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
