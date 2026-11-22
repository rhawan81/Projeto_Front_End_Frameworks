# 📚 Organizador de Estudos

Projeto acadêmico desenvolvido para a disciplina de **Front-End Frameworks**.

O objetivo é desenvolver uma aplicação web que ajude estudantes a organizar suas atividades acadêmicas, matérias e prazos de forma simples e prática.

> 🚧 Projeto evolutivo AV1/AV2. O backend de Atividades e Estatísticas está documentado abaixo; a integração das telas ainda é necessária.

---

## 🎯 Objetivo

O Organizador de Estudos tem como objetivo facilitar a rotina de estudantes que possuem dificuldade para acompanhar provas, trabalhos, atividades e outros compromissos acadêmicos.

A aplicação permitirá organizar tarefas e acompanhar o que está pendente ou concluído.

---

## 👥 Público-alvo

Estudantes universitários, principalmente aqueles que precisam conciliar:

- Faculdade
- Trabalho ou estágio
- Provas
- Trabalhos acadêmicos
- Atividades
- Prazos de diferentes disciplinas

---

## 💡 Problema

Muitos estudantes possuem dificuldades para acompanhar atividades, provas, trabalhos e prazos de diferentes disciplinas.

Essa dificuldade pode aumentar quando o estudante também precisa conciliar os estudos com trabalho, estágio ou outras responsabilidades.

---

## ✅ Solução proposta

Desenvolver uma aplicação web onde o estudante poderá cadastrar e organizar suas atividades acadêmicas.

Entre as funcionalidades previstas para a AV1 estão:

- Cadastro de atividades
- Listagem de atividades
- Edição de atividades
- Exclusão de atividades
- Marcar atividades como concluídas
- Pesquisa de atividades
- Filtros por situação
- Organização por matéria
- Definição de prioridade
- Definição de prazo
- Persistência de dados no navegador
- Integração com API REST

---

## 🛠️ Tecnologias

O projeto será desenvolvido utilizando:

- React
- JavaScript
- Vite
- React Router
- CSS
- Fetch API
- LocalStorage
- Git
- GitHub

---

## 🌐 API

Na AV2, o módulo de Atividades e Estatísticas utiliza a API REST Spring Boot do próprio projeto.
A URL-base local é `http://localhost:8080`, com JWT obrigatório nas rotas privadas.
Os contratos completos estão documentados na seção **AV2 — Backend Spring Boot** abaixo.


---

## AV2 — Backend Spring Boot: atividades e estatísticas

**URL-base local:** `http://localhost:8080` — API própria do projeto de Back-end (Opção B).
Os endpoints `/atividades`, `/estatisticas` e `/materias` exigem autenticação por JWT:
`Authorization: Bearer <token>`. O token pode ser obtido em `POST /auth/login`.
**Não versionar credenciais ou tokens reais.** As rotas de atividades e estatísticas operam
somente sobre as atividades associadas ao usuário autenticado. IDs de atividades de outros
usuários resultam em `404` (não informamos se o recurso existe para outra pessoa).

### Executar o backend localmente

1. Ter Java 17+ e Maven no PATH.
2. **PowerShell:** gerar uma chave JWT de testes *na máquina local*, em Base64, com pelo menos 32 bytes:

   ```powershell
   $bytes = New-Object byte[] 32
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   $rng.Dispose()
   $env:JWT_SECRET = [Convert]::ToBase64String($bytes)
   ```

3. No diretório raiz do repositório, no **mesmo terminal**:

   ```powershell
   mvn -f backend/pom.xml clean test
   mvn -f backend/pom.xml spring-boot:run
   ```

4. Testar no Postman, importando `postman/Atividades-Estatisticas.postman_collection.json`.
   Preencher as variáveis `emailA`, `senhaA`, `emailB`, `senhaB` com **credenciais fictícias de teste**.
   Executar as requisições em ordem. A coleção captura automaticamente os tokens e IDs criados e contém 28 requisições.
   O banco H2 utiliza `jdbc:h2:file:./data/academico_db` relativo ao diretório em que o
   Maven inicia o processo. Não incluir os arquivos locais do H2 no Git.

A configuração `JWT_SECRET` **não é carregada automaticamente** de um arquivo `.env` pelo Spring;
ela precisa existir como variável de ambiente antes de iniciar o backend. O projeto já
contém `backend/src/main/resources/application.properties` apontando para essa variável.

### Contrato REST — Atividades

Todos os endpoints abaixo aceitam/devolvem JSON, salvo `DELETE` (sem corpo de resposta).
Enums: `prioridade = ALTA | MEDIA | BAIXA`; `status = PENDENTE | EM_ANDAMENTO | CONCLUIDA`.
A data `prazo` usa o formato `AAAA-MM-DD` e não pode estar no passado na criação/edição.
`materiaId` é o identificador de uma matéria existente obtida em `GET /materias`.

| Método | Endpoint | Corpo / consulta | Sucesso |
|---|---|---|---|
| GET | `/atividades` | Filtros opcionais `?materiaId=1`, `?materia=Banco%20de%20Dados` e `?situacao=PENDENTE` (combináveis) | `200` — lista do usuário, ou `[]` |
| GET | `/atividades/{id}` | — | `200` — objeto de atividade |
| POST | `/atividades` | AtividadeRequestDTO abaixo | `201` — objeto criado + cabeçalho `Location` |
| PUT | `/atividades/{id}` | AtividadeRequestDTO abaixo; `status` opcional preserva estado anterior | `200` — objeto atualizado |
| PATCH | `/atividades/{id}/situacao` | `{"status":"EM_ANDAMENTO"}` | `200` — objeto atualizado |
| DELETE | `/atividades/{id}` | — | `204` — sem conteúdo |

**Exemplo POST `/atividades`** (`materiaId` precisa existir; substituir a data por uma futura):

```json
{
  "titulo": "Entrega do relatório",
  "materiaId": 1,
  "descricao": "Relatório da disciplina",
  "prazo": "2099-12-31",
  "prioridade": "ALTA",
  "status": "PENDENTE"
}
```

`status` pode ser omitido no POST, assumindo `PENDENTE`.

**Resposta `201 Created`** (exemplo):

```json
{
  "id": 7,
  "titulo": "Entrega do relatório",
  "materiaId": 1,
  "materia": "Banco de Dados",
  "descricao": "Relatório da disciplina",
  "prazo": "2099-12-31",
  "prioridade": "ALTA",
  "status": "PENDENTE"
}
```

O campo `materia` na resposta é o **nome** da matéria, enquanto `materiaId` é o vínculo
persistido. O `usuarioId` não é aceito do cliente: o backend define o proprietário a
partir do JWT, impedindo que a pessoa crie uma atividade em nome de outro usuário.

### Contrato REST — Estatísticas

| Método | Endpoint | Corpo / consulta | Sucesso |
|---|---|---|---|
| GET | `/estatisticas` | Nenhum; cabeçalho `Authorization: Bearer <token>` | `200` — totais, por prioridade e por matéria, **somente do usuário autenticado** |

**Exemplo resposta `200 OK`** (dados ilustrativos):

```json
{
  "totais": { "total": 3, "pendentes": 1, "emAndamento": 1, "concluidas": 1 },
  "porPrioridade": { "ALTA": 1, "MEDIA": 1, "BAIXA": 1 },
  "porMateria": [
    {
      "materiaId": 1,
      "materia": "Banco de Dados",
      "total": 3,
      "pendentes": 1,
      "emAndamento": 1,
      "concluidas": 1
    }
  ]
}
```

Quando não houver atividades, `total`, contadores e prioridades são `0` e `porMateria`
é `[]`. O endpoint contabiliza **atividades**, e não o número de matérias cadastradas.

### Erros e autenticação (contrato AV2)

| HTTP | Quando acontece | Exemplo de requisição |
|---|---|---|
| `400 Bad Request` | Falha de validação, JSON malformado, prioridade/status inválido, campo ausente ou data no passado | `POST /atividades` sem `materiaId` |
| `401 Unauthorized` | Sem token, token inválido ou expirado | `GET /estatisticas` sem Bearer |
| `403 Forbidden` | Perfil sem permissão para uma rota restrita da API (ex.: `/admin/**`) | `GET /admin/...` com conta ESTUDANTE |
| `404 Not Found` | Matéria não cadastrada, atividade inexistente ou atividade de outro usuário | `GET /atividades/999999` |
| `409 Conflict` | Conflito de dados, como tentativa de duplicar matéria, conforme handler global | `POST /materias` com nome repetido |

**Exemplo de erro de validação `400`:**

```json
{
  "timestamp": "2026-11-22T11:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação dos dados enviados.",
  "path": "/atividades",
  "details": { "materiaId": "A matéria é obrigatória" }
}
```

Os erros reutilizam `GlobalExceptionHandler`/`ApiErrorDTO` existentes no backend.

### Evolução e limitações da integração

| Aspecto | AV1 | Nesta implementação da AV2 |
|---|---|---|
| Atividades | Dados locais no navegador | CRUD REST persistido em H2 e vinculado ao usuário autenticado |
| Situação | Pendente/concluída no protótipo | `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA` na API |
| Matérias | Nome em texto nas atividades locais | Relacionamento com entidade `Materia` via `materiaId` |
| Indicadores | Calculados sobre armazenamento local | `GET /estatisticas` agregado no backend por usuário |
| Segurança | Operações locais | JWT e bloqueio de acesso a atividades de terceiros |
| Erros | Feedback local | Códigos HTTP/JSON consistentes via handler global |

**Integração do front-end pendente neste recorte:** no ZIP utilizado como base, telas como
`Home`, `Atividades`, `AtividadeForm` e `materias` ainda consultam `localStorage`, e a rota
`/estatisticas` ainda exibe `EmBreve`. Para usarem esta API, essas telas deverão consumir
`fetch` a partir de `src/services`, enviar o JWT, converter enums maiúsculos quando
necessário e exibir estados de carregamento, vazio, erro e opção de tentar novamente.
Os dados locais permanecem como contingência para a apresentação, mas **não substituem** a API.

**Limitação fora deste módulo:** o CRUD de `Materia` enviado no ZIP utiliza matérias compartilhadas
entre usuários. Esta implementação restringe **atividades e estatísticas** por usuário,
mas não altera a política de acesso a matérias, que deve ser avaliada pela equipe.

**Atenção a bancos existentes:** a entidade `Atividade` agora possui o campo obrigatório
`usuario_id`. Antes de usar um banco H2 legado contendo atividades sem dono, fazer backup
e migrar esses registros para usuários corretos. A atualização automática do Hibernate
(`ddl-auto=update`) não garante a migração de linhas legadas. Não apagar dados reais sem backup.

**Evidências de teste:** testes de integração em
`backend/src/test/java/com/projeto/academico/AtividadeApiIntegrationTest.java` e coleção
Postman em `postman/`. O teste automatizado requer Maven e valida criação, edição,
exclusão, filtros, estatísticas, autenticação, validação e isolamento entre usuários.
A execução manual no Postman deve ser feita na máquina com o backend iniciado.

**Uso de IA:** o módulo de Atividades/Estatísticas foi elaborado com assistência de IA
para análise de estrutura, proposta de código, documentação e cenários de teste. A equipe
deve revisar, executar e ser capaz de explicar as alterações antes da entrega.
