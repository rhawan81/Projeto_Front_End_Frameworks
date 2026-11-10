package com.projeto.academico.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "materias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da matéria é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    @Column(nullable = false, unique = true, length = 120)
    private String nome;

    // A tela React já utiliza cores hexadecimais no padrão #RRGGBB.
    @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "A cor deve estar no formato #RRGGBB")
    @Column(length = 7)
    private String cor = "#8B5CF6";
}
