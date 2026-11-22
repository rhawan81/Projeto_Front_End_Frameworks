package com.projeto.academico;

import com.projeto.academico.model.*;
import com.projeto.academico.repository.*;
import com.projeto.academico.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:atividades_api_test;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "api.security.token.secret=Q0hBVkUtU09NRU5URS1QQVJBLVRFU1RFUy1ERS1JTlRFR1JBQ0FPLTIwMjY="
})
@AutoConfigureMockMvc
class AtividadeApiIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired UsuarioRepository usuarios;
    @Autowired MateriaRepository materias;
    @Autowired AtividadeRepository atividades;
    @Autowired JwtService jwt;

    private Usuario usuarioA;
    private Usuario usuarioB;
    private Materia materia;

    @BeforeEach
    void preparar() {
        atividades.deleteAll();
        materias.deleteAll();
        usuarios.deleteAll();

        usuarioA = usuarios.save(new Usuario("Teste A", "teste-a@exemplo.invalid", "senha-hash-ficticia"));
        usuarioB = usuarios.save(new Usuario("Teste B", "teste-b@exemplo.invalid", "senha-hash-ficticia"));
        Materia nova = new Materia();
        nova.setNome("Matéria exclusiva do teste");
        materia = materias.save(nova);
    }

    @Test
    void crudEEstatisticasFuncionam() throws Exception {
        String corpo = corpoCriacao(materia.getId());
        String localizacao = mvc.perform(post("/atividades")
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Trabalho final"))
                .andExpect(jsonPath("$.materiaId").value(materia.getId().intValue()))
                .andExpect(jsonPath("$.materia").value(materia.getNome()))
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andReturn().getResponse().getHeader("Location");

        mvc.perform(get("/atividades/{id}", localizacao.substring(localizacao.lastIndexOf('/') + 1))
                        .header("Authorization", bearer(usuarioA)))
                .andExpect(status().isOk());

        mvc.perform(get("/atividades")
                        .param("materiaId", materia.getId().toString())
                        .param("situacao", "PENDENTE")
                        .header("Authorization", bearer(usuarioA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mvc.perform(get("/atividades")
                        .param("materia", materia.getNome())
                        .header("Authorization", bearer(usuarioA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        String id = localizacao.substring(localizacao.lastIndexOf('/') + 1);
        mvc.perform(patch("/atividades/{id}/situacao", id)
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"EM_ANDAMENTO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EM_ANDAMENTO"));

        mvc.perform(get("/estatisticas").header("Authorization", bearer(usuarioA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totais.total").value(1))
                .andExpect(jsonPath("$.totais.pendentes").value(0))
                .andExpect(jsonPath("$.totais.emAndamento").value(1))
                .andExpect(jsonPath("$.porPrioridade.ALTA").value(1))
                .andExpect(jsonPath("$.porPrioridade.MEDIA").value(0))
                .andExpect(jsonPath("$.porMateria[0].materiaId").value(materia.getId().intValue()));

        mvc.perform(put("/atividades/{id}", id)
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo.replace("Trabalho final", "Trabalho editado")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Trabalho editado"))
                // PUT sem status preserva o valor atual.
                .andExpect(jsonPath("$.status").value("EM_ANDAMENTO"));

        mvc.perform(patch("/atividades/{id}/situacao", id)
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONCLUIDA\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"));
        mvc.perform(get("/estatisticas").header("Authorization", bearer(usuarioA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totais.concluidas").value(1))
                .andExpect(jsonPath("$.totais.emAndamento").value(0));

        mvc.perform(delete("/atividades/{id}", id)
                        .header("Authorization", bearer(usuarioA)))
                .andExpect(status().isNoContent());
        mvc.perform(get("/atividades/{id}", id)
                        .header("Authorization", bearer(usuarioA)))
                .andExpect(status().isNotFound());
    }

    @Test
    void usuarioNaoVeNemManipulaAtividadesDeOutro() throws Exception {
        Atividade deB = criarAtividadeDireta(usuarioB);
        mvc.perform(get("/atividades").header("Authorization", bearer(usuarioA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/estatisticas").header("Authorization", bearer(usuarioA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totais.total").value(0))
                .andExpect(jsonPath("$.porPrioridade.ALTA").value(0))
                .andExpect(jsonPath("$.porMateria", hasSize(0)));

        mvc.perform(get("/atividades/{id}", deB.getId()).header("Authorization", bearer(usuarioA)))
                .andExpect(status().isNotFound());
        mvc.perform(patch("/atividades/{id}/situacao", deB.getId())
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CONCLUIDA\"}"))
                .andExpect(status().isNotFound());
        mvc.perform(put("/atividades/{id}", deB.getId())
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON).content(corpoCriacao(materia.getId())))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/atividades/{id}", deB.getId()).header("Authorization", bearer(usuarioA)))
                .andExpect(status().isNotFound());
        mvc.perform(get("/atividades/{id}", deB.getId()).header("Authorization", bearer(usuarioB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDENTE"));
    }

    @Test
    void endpointsExigemJwtEValidamDados() throws Exception {
        mvc.perform(get("/atividades")).andExpect(status().isUnauthorized());
        mvc.perform(get("/estatisticas")).andExpect(status().isUnauthorized());
        mvc.perform(post("/atividades")
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCriacao(materia.getId()).replace("\"materiaId\": " + materia.getId() + ",", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.materiaId").exists());
        mvc.perform(post("/atividades")
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCriacao(materia.getId()).replace("\"ALTA\"", "\"URGENTISSIMA\"")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/atividades")
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCriacao(materia.getId()).replace(
                                LocalDate.now().plusDays(7).toString(), LocalDate.now().minusDays(1).toString())))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/atividades")
                        .header("Authorization", bearer(usuarioA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCriacao(999999L)))
                .andExpect(status().isNotFound());
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwt.gerarToken(usuario.getEmail());
    }

    private String corpoCriacao(Long materiaId) {
        return """
                {"titulo":"Trabalho final", "materiaId": %d,
                 "descricao":"Descrição de teste", "prazo":"%s", "prioridade":"ALTA"}
                """.formatted(materiaId, LocalDate.now().plusDays(7));
    }

    private Atividade criarAtividadeDireta(Usuario usuario) {
        Atividade atividade = new Atividade();
        atividade.setTitulo("Atividade de outro usuário");
        atividade.setMateria(materia);
        atividade.setUsuario(usuario);
        atividade.setPrazo(LocalDate.now().plusDays(8));
        atividade.setPrioridade(Prioridade.ALTA);
        atividade.setStatus(StatusAtividade.PENDENTE);
        return atividades.saveAndFlush(atividade);
    }
}
