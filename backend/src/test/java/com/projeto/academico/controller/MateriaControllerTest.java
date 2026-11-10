package com.projeto.academico.controller;

import com.projeto.academico.model.Atividade;
import com.projeto.academico.model.Materia;
import com.projeto.academico.model.Prioridade;
import com.projeto.academico.model.StatusAtividade;
import com.projeto.academico.repository.MateriaRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Isola os registros entre os testes.
class MateriaControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private MateriaRepository repository;
    @Autowired private EntityManager entityManager;

    private Materia criarMateria(String nome) {
        Materia m = new Materia();
        m.setNome(nome);
        m.setCor("#3B82F6");
        return repository.saveAndFlush(m);
    }

    @Test
    void deveCriarEConsultarMateria() throws Exception {
        mvc.perform(post("/materias").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"  Cálculo  ","cor":"#8B5CF6"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/materias/")))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome", is("Cálculo")))
                .andExpect(jsonPath("$.cor", is("#8B5CF6")));

        mvc.perform(get("/materias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome", is("Cálculo")));
    }

    @Test
    void deveAplicarCorPadrao() throws Exception {
        mvc.perform(post("/materias").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Física\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cor", is("#8B5CF6")));
    }

    @Test
    void deveAtualizarMateria() throws Exception {
        Materia materia = criarMateria("Matemática");
        mvc.perform(put("/materias/{id}", materia.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Matemática Aplicada\",\"cor\":\"#10B981\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Matemática Aplicada")))
                .andExpect(jsonPath("$.cor", is("#10B981")));
    }

    @Test
    void deveExcluirMateriaSemVinculos() throws Exception {
        Materia materia = criarMateria("Redes");
        mvc.perform(delete("/materias/{id}", materia.getId()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/materias/{id}", materia.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.caminho", is("/materias/" + materia.getId())));
    }

    @Test
    void deveRetornarErroParaNomeVazio() throws Exception {
        mvc.perform(post("/materias").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":" ","cor":"laranja"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.detalhes.nome").exists())
                .andExpect(jsonPath("$.detalhes.cor").exists());
    }

    @Test
    void deveImpedirNomeDuplicadoIndependenteDeMaiusculas() throws Exception {
        criarMateria("Algoritmos");
        mvc.perform(post("/materias").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"ALGORITMOS\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)));
    }

    @Test
    void deveImpedirExclusaoSeHouverAtividades() throws Exception {
        Materia materia = criarMateria("Engenharia");
        Atividade atividade = new Atividade();
        atividade.setMateria(materia);
        atividade.setTitulo("Trabalho final");
        atividade.setPrazo(LocalDate.now().plusDays(5));
        atividade.setPrioridade(Prioridade.ALTA);
        atividade.setStatus(StatusAtividade.PENDENTE);
        entityManager.persist(atividade);
        entityManager.flush();

        mvc.perform(delete("/materias/{id}", materia.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem", org.hamcrest.Matchers.containsString("atividade(s)")));
    }

    @Test
    void devePadronizarJsonInvalidoERotaComIdInvalido() throws Exception {
        mvc.perform(post("/materias").contentType(MediaType.APPLICATION_JSON)
                        .content("{ sem json }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.detalhes").isMap());
        mvc.perform(get("/materias/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    @Test
    void devePermitirPreflightCorsDaAplicacaoReact() throws Exception {
        mvc.perform(options("/materias")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void devePadronizarErroDeAutenticacaoDeOutrasRotas() throws Exception {
        mvc.perform(get("/rota-protegida"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.caminho", is("/rota-protegida")));
    }
}
