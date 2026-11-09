package com.organizadorestudos.backend.atividade;

import com.organizadorestudos.backend.atividade.dto.AtividadeRequestDTO;
import com.organizadorestudos.backend.atividade.dto.AtividadeResponseDTO;
import com.organizadorestudos.backend.atividade.dto.AtividadeSituacaoDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/atividades")
public class AtividadeController {

    private final AtividadeService service;

    public AtividadeController(AtividadeService service) {
        this.service = service;
    }

    // GET /atividades
    // GET /atividades?materia=Banco de Dados
    // GET /atividades?situacao=PENDENTE
    // GET /atividades?materia=Banco de Dados&situacao=PENDENTE
    @GetMapping
    public List<AtividadeResponseDTO> listar(
            @RequestParam(required = false) String materia,
            @RequestParam(required = false) StatusAtividade situacao
    ) {
        return service.listar(materia, situacao);
    }

    @GetMapping("/{id}")
    public AtividadeResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AtividadeResponseDTO criar(@Valid @RequestBody AtividadeRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public AtividadeResponseDTO atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtividadeRequestDTO dto
    ) {
        return service.atualizar(id, dto);
    }

    // Endpoint separado só pra mudar a situação (concluir/reabrir),
    // sem precisar mandar a atividade inteira de novo.
    @PatchMapping("/{id}/situacao")
    public AtividadeResponseDTO atualizarSituacao(
            @PathVariable Long id,
            @Valid @RequestBody AtividadeSituacaoDTO dto
    ) {
        return service.atualizarSituacao(id, dto.getStatus());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}