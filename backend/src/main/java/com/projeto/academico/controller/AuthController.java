
package com.projeto.academico.controller;

import com.projeto.academico.dto.AuthResponse;
import com.projeto.academico.dto.CadastroRequest;
import com.projeto.academico.dto.LoginRequest;
import com.projeto.academico.service.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> cadastrar(
            @Valid @RequestBody CadastroRequest request) {

        AuthResponse resposta = usuarioService.cadastrar(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resposta);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse resposta = usuarioService.autenticar(request);

        return ResponseEntity.ok(resposta);
    }
}

