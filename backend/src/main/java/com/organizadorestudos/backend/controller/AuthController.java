
package com.organizadorestudos.backend.controller;

import com.organizadorestudos.backend.dto.AuthResponse;
import com.organizadorestudos.backend.dto.CadastroRequest;
import com.organizadorestudos.backend.dto.LoginRequest;
import com.organizadorestudos.backend.model.Usuario;
import com.organizadorestudos.backend.service.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Endpoint para cadastro de usuarios
    @PostMapping("/register")
    public ResponseEntity<?> cadastrar(
            @Valid @RequestBody CadastroRequest dados) {

        try {
            Usuario usuario = usuarioService.cadastrar(dados);

            Map<String, Object> resposta = Map.of(
                    "id", usuario.getId(),
                    "nome", usuario.getNome(),
                    "email", usuario.getEmail(),
                    "mensagem", "Usuário cadastrado com sucesso!"
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(resposta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("mensagem", e.getMessage()));
        }
    }

    // Endpoint para login de usuarios
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest dados) {

        try {
            AuthResponse resposta = usuarioService.autenticar(dados);

            return ResponseEntity.ok(resposta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensagem", e.getMessage()));
        }
    }
}
