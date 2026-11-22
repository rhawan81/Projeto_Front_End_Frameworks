package com.projeto.academico.controller;

import com.projeto.academico.dto.EstatisticasResponseDTO;
import com.projeto.academico.service.EstatisticasService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/estatisticas")
public class EstatisticasController {

    private final EstatisticasService service;

    public EstatisticasController(EstatisticasService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<EstatisticasResponseDTO> buscar(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(service.buscar(email));
    }
}
