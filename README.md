# 📚 Organizador de Estudos

Aplicação web desenvolvida em **React + JavaScript + Vite** integrada a um back-end próprio em **Java 17 + Spring Boot 3.2.5 + JWT + H2** para a disciplina de **Front-end Frameworks** (Ciência da Computação — 2026.2, UNINASSAU), seguindo o formato de **Projeto Evolutivo (AV1 → AV2)** em repositório único.

---

## 🎯 1. Problema e Público-alvo

### Problema
Estudantes universitários frequentemente acumulam provas, trabalhos, listas de exercícios e prazos de múltiplas disciplinas em anotações dispersas, o que dificulta priorizar entregas urgentes, acompanhar o progresso por matéria e manter constância nos estudos.

### Público-alvo
Estudantes universitários que precisam conciliar faculdade, trabalho/estágio e rotina de estudos em um único painel organizado, com apoio administrativo opcional para gestão de disciplinas e acompanhamento de indicadores.

---

## 👥 2. Integrantes e Contribuição

| Integrante | Disciplina / Perfil | Contribuições Principais |
| --- | --- | --- |
| **José Rhawan Michel** (`rhawan81`) | Front-end Frameworks | Estrutura inicial React + Vite, Painel Administrativo (`Admin.jsx`), Timer Pomodoro (`Pomodoro.jsx`), vínculo entre atividades e matérias, camada de serviços HTTP/contingência (`http.js`, `fallbackServices.js`, `EstadoRequisicao.jsx`) e pipeline CI/CD. |
| **Emilly Silva** | Front-end / Back-end | Implementação e integração do CRUD de atividades e matérias (`feature/crud-atividades`, `feature/crud-materias`, `atividadesService.js`, `materiasService.js`) e listagens com filtros e busca. |
| **Mylena Oliveira** | Front-end / Back-end | Responsável pelas branches `feature/backend-atividades-estatisticas` e `feature/frontend-paginas`: API de atividades filtrada por usuário autenticado, endpoint `/estatisticas`, testes de integração (`AtividadeApiIntegrationTest`), coleção Postman e páginas de visualização (`Dashboard.jsx`, `Calendario.jsx`, `Prioridades.jsx`, `Estatisticas.jsx`). |
| **Ariely Lopes** | Front-end / Back-end (Pessoa 3 — Autenticação) | Responsável pela branch `feature/pessoa-3-autenticacao`: `AuthController`, autenticação com JWT (`JWT_SECRET`), perfis `ESTUDANTE`/`ADMIN`, respostas `401`/`403` padronizadas em JSON, login/cadastro (`Login.jsx`), sessão (`AuthContext.jsx`) e proteção de rotas (`RotaProtegida.jsx`). |

---

## ✨ 3. Funcionalidades

### Escopo-base
- **Página inicial e Dashboard (`/` e `/dashboard`):** comunicação do propósito do produto, resumo de atividades pendentes, concluídas, atrasadas, total de matérias, próximas entregas e gráfico de distribuição por prioridade.
- **Gestão de Atividades (`/atividades`, `/atividades/nova`, `/atividades/:id/editar`):** listagem, criação, edição, exclusão, alternância de situação (`PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`), busca por título (sincronizada na URL), filtros por matéria e abas por situação, além de formulário controlado com validação de campos obrigatórios.
- **Gestão de Matérias (`/materias`):** cadastro, edição e exclusão de disciplinas com cores personalizadas, barra de progresso, busca, filtros por pendência/conclusão e expansão das atividades vinculadas.
- **Navegação completa e feedback visual:** `Sidebar` (desktop), `Topbar` com busca global e central de alertas de prazos, `BarraInferior` (mobile), mensagens de validação, estados vazios e notificações toast (`ToastContext`).
- **Configurações e Tema (`/configuracoes`):** visualização do perfil autenticado e alternância persistente entre **Modo Claro** e **Modo Escuro** (`ThemeContext`).

### Funcionalidades verticais adicionais
- **Autenticação JWT, Controle de Acesso (RBAC) e Painel Administrativo (`/login`, `/admin`):** autenticação via Spring Security + JWT, isolamento de atividades por usuário autenticado e segundo perfil (`ADMIN`) com rota protegida exclusiva (`RotaProtegida` com `somenteAdmin`), métricas globais, gestão de usuários, cadastro rápido de disciplinas, auditoria de ações e painel de diagnóstico da API.
- **Timer Pomodoro (`/pomodoro`):** ciclos de Foco (25 min), Pausa Curta (5 min) e Pausa Longa (15 min), vínculo com matérias, aviso sonoro sintetizado via Web Audio API e histórico persistido.
- **Calendário Acadêmico (`/calendario`):** grade mensal interativa com marcadores de prioridade, conclusão e atraso, além de painel de detalhes por dia.
- **Central de Prioridades (`/prioridades`):** destaque automático para atividades urgentes (atrasadas ou vencendo em até 3 dias), filtro por situação e organização em colunas (Alta, Média e Baixa).
- **Estatísticas (`/estatisticas`):** gráficos de barras por matéria e gráficos de rosca em SVG por prioridade e situação, apoiados pelo endpoint `/estatisticas`.
- **Operação degradada e contingência (`EstadoRequisicao`, `fallbackServices.js`):** estados visíveis de carregamento, erro, vazio e contingência com botão **Tentar novamente** quando o servidor estiver indisponível.

---

## 🗺️ 4. Rotas da Aplicação

| Rota | Página / Componente | Acesso | Descrição |
| --- | --- | --- | --- |
| `/login` | `Login` | Pública | Tela de login e cadastro de novos estudantes. |
| `/` | `Home` | Protegida (autenticado) | Página inicial com resumo, próximas atividades e gráfico de prioridades. |
| `/dashboard` | `Dashboard` | Protegida (autenticado) | Painel de visão geral com progresso geral, atividades atrasadas e matérias. |
| `/atividades` | `Atividades` | Protegida (autenticado) | Listagem de atividades com busca, filtros por matéria/situação e ações rápidas. |
| `/atividades/nova` | `AtividadeForm` | Protegida (autenticado) | Formulário controlado com validação para cadastrar nova atividade. |
| `/atividades/:id/editar` | `AtividadeForm` | Protegida (autenticado) | Edição ou exclusão de uma atividade existente. |
| `/materias` | `Materias` | Protegida (autenticado) | Cadastro, edição, exclusão e acompanhamento de progresso por disciplina. |
| `/pomodoro` | `Pomodoro` | Protegida (autenticado) | Cronômetro Pomodoro com seleção de matéria, som e histórico de ciclos. |
| `/calendario` | `Calendario` | Protegida (autenticado) | Visualização mensal de prazos e detalhes das atividades por dia. |
| `/prioridades` | `Prioridades` | Protegida (autenticado) | Painel de atividades urgentes e colunas por nível de prioridade. |
| `/estatisticas` | `Estatisticas` | Protegida (autenticado) | Gráficos analíticos por matéria, prioridade e situação. |
| `/configuracoes` | `Configuracoes` | Protegida (autenticado) | Dados do perfil conectado e seleção de tema claro/escuro. |
| `/admin` | `Admin` | Protegida (`admin`) | Painel administrativo exclusivo (métricas, usuários, matérias e API). |
| `*` | `Navigate` → `/` | — | Redirecionamento de rotas inexistentes para a página inicial. |

---

## 🛠️ 5. Tecnologias

### Front-end
- **React 19** (componentes funcionais e hooks)
- **JavaScript (ES Modules)** + **Vite 8**
- **React Router DOM 7**
- **CSS tradicional** (variáveis CSS para temas claro/escuro e folhas por módulo)
- **Fetch API** (centralizada em `src/services/`)
- **Web Storage (`localStorage`)** e **Web Audio API**
- **ESLint 10**

### Back-end (`backend/` — Opção B)
- **Java 17** + **Spring Boot 3.2.5** (Spring Web, Spring Data JPA, Spring Security, Bean Validation)
- **JWT (`com.auth0:java-jwt`)** e **BCryptPasswordEncoder**
- **Banco de Dados H2** em arquivo (`jdbc:h2:file:./data/academico_db`) + suporte opcional a PostgreSQL
- **JUnit 5 + MockMvc** (`AtividadeApiIntegrationTest`) e coleção **Postman** (`postman/Atividades-Estatisticas.postman_collection.json`)

---

## 🚀 6. Como Executar

### Pré-requisitos
- **Node.js 20+** e **npm** (para o Front-end)
- **Java 17+** e **Maven** no `PATH` (para o Back-end Spring Boot)

### Passo 1 — Executar o Back-end Spring Boot (`backend/`)

O back-end exige a variável de ambiente `JWT_SECRET` (sem segredo fixo versionado no repositório). No **PowerShell**, gere uma chave temporária de 32 bytes em Base64 e inicie o servidor no mesmo terminal:

```powershell
# 1. Gerar JWT_SECRET na sessão atual do PowerShell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)

# 2. (Opcional) Rodar os testes automatizados de integração do back-end
mvn -f backend/pom.xml clean test

# 3. Iniciar o servidor Spring Boot na porta 8080
mvn -f backend/pom.xml spring-boot:run
```

*(Caso utilize **Git Bash**, defina `export JWT_SECRET="chave-local-temporaria-com-pelo-menos-32-bytes-2026"` e rode `mvn -f backend/pom.xml spring-boot:run`.)*

### Passo 2 — Executar o Front-end (em outro terminal)

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo .env a partir do exemplo
cp .env.example .env

# 3. Iniciar o servidor Vite (http://localhost:5173)
npm run dev
```

### Scripts disponíveis no Front-end

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor local Vite com HMR |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa a verificação de lint com ESLint |

---

## 💾 7. Dados e Persistência

| Origem / Chave | Tipo | Conteúdo e Finalidade |
| --- | --- | --- |
| `backend/` (Banco H2) | Remoto / Banco de Dados (AV2) | Persistência relacional via JPA/H2 (`usuarios`, `materias`, `atividades`) isolada por usuário autenticado via JWT. |
| `src/data/dados.json` | Arquivo local inicial (AV1 / semente) | Conjunto inicial de 4 atividades acadêmicas usado na primeira carga local quando não há dados no `localStorage`. |
| `src/data/dadosContingencia.js` | Contingência local | Conjunto estruturado de matérias e atividades compatível com a interface para demonstração offline. |
| `organizador-estudos:atividades` | `localStorage` | Cache/persistência local das atividades (atualizado após retorno da API ou em modo contingência). |
| `organizador-estudos:materias` | `localStorage` | Cache/persistência local das matérias e suas cores personalizadas. |
| `organizador-estudos:pomodoro-historico` | `localStorage` | Histórico de ciclos Pomodoro concluídos (dado local do estudante). |
| `organizador-estudos:tema` | `localStorage` | Preferência de tema (`claro` ou `escuro`). |
| `organizador-estudos:auth` | `localStorage` | Sessão autenticada ativa e token JWT (preservada após refresh, sem armazenar senha). |

---

## 🌐 8. Contrato da API (AV2 — Back-end Spring Boot)

- **URL-base local:** `http://localhost:8080` (`VITE_API_URL` em `.env.example` e `src/services/http.js`).
- **Autenticação:** endpoints `/atividades`, `/materias` e `/estatisticas` exigem `Authorization: Bearer <token>`, obtido em `POST /auth/login`. As atividades e estatísticas são isoladas por usuário autenticado.

### 8.1. Autenticação (`/auth`)

| Método | Endpoint | Corpo | Resposta de Sucesso |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ "nome": "...", "email": "...", "senha": "..." }` | `201 Created` — `{ token, tipo: "Bearer", usuarioId, nome, email, papel }` |
| `POST` | `/auth/login` | `{ "email": "...", "senha": "..." }` | `200 OK` — `{ token, tipo: "Bearer", usuarioId, nome, email, papel }` |

### 8.2. Matérias (`/materias`)

| Método | Endpoint | Corpo / Parâmetros | Resposta de Sucesso |
| --- | --- | --- | --- |
| `GET` | `/materias` | — | `200 OK` — Lista de matérias |
| `POST` | `/materias` | `{ "nome": "Banco de Dados", "cor": "#3B82F6" }` | `201 Created` — Matéria criada |
| `PUT` | `/materias/{id}` | `{ "nome": "...", "cor": "..." }` | `200 OK` — Matéria atualizada |
| `DELETE` | `/materias/{id}` | — | `204 No Content` |

### 8.3. Atividades (`/atividades`)

Enums aceitos: `prioridade = ALTA | MEDIA | BAIXA`; `status = PENDENTE | EM_ANDAMENTO | CONCLUIDA`.

| Método | Endpoint | Corpo / Consulta | Resposta de Sucesso |
| --- | --- | --- | --- |
| `GET` | `/atividades` | Opcionais: `?materiaId=1`, `?materia=Banco%20de%20Dados`, `?situacao=PENDENTE` | `200 OK` — Lista de atividades do usuário autenticado |
| `GET` | `/atividades/{id}` | — | `200 OK` — Objeto da atividade |
| `POST` | `/atividades` | `{ "titulo": "...", "materiaId": 1, "descricao": "...", "prazo": "2099-12-31", "prioridade": "ALTA", "status": "PENDENTE" }` | `201 Created` — Objeto criado + header `Location` |
| `PUT` | `/atividades/{id}` | Mesmo corpo do `POST` (`status` opcional preserva o anterior) | `200 OK` — Objeto atualizado |
| `PATCH` | `/atividades/{id}/situacao` | `{ "status": "CONCLUIDA" }` | `200 OK` — Objeto atualizado |
| `DELETE` | `/atividades/{id}` | — | `204 No Content` |

**Exemplo de resposta (`200 OK` / `201 Created` em `/atividades`):**
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

### 8.4. Estatísticas (`/estatisticas`)

| Método | Endpoint | Resposta de Sucesso |
| --- | --- | --- |
| `GET` | `/estatisticas` | `200 OK` — `{ totais: { total, pendentes, emAndamento, concluidas }, porPrioridade: { ALTA, MEDIA, BAIXA }, porMateria: [...] }` |

### 8.5. Padrão de Erros HTTP (`GlobalExceptionHandler` + `SecurityConfig`)

| Código HTTP | Situação | Tratamento no Front-end (`http.js` / `EstadoRequisicao.jsx`) |
| --- | --- | --- |
| `400 Bad Request` | Falha de validação (`@Valid`), enum inválido ou prazo no passado | Exibe a mensagem detalhada retornada pela API |
| `401 Unauthorized` | Token ausente, inválido ou expirado | Dispara `auth:nao-autorizado`, limpa sessão local e redireciona para `/login` |
| `403 Forbidden` | Perfil sem permissão para rota administrativa (`/admin/**`) | Dispara `auth:acesso-negado` e exibe feedback de acesso restrito |
| `404 Not Found` | Recurso inexistente ou pertencente a outro usuário | Exibe erro amigável ao usuário |
| `409 Conflict` | Violação de unicidade (ex.: matéria duplicada ou com atividades vinculadas) | Exibe mensagem de conflito no toast/formulário |

---

## 📈 9. Evolução da AV1 para a AV2

| Aspecto | Situação na AV1 | Evolução na AV2 | Evidência |
| --- | --- | --- | --- |
| **Dados** | JSON local (`src/data/dados.json`) e `localStorage` | API REST Spring Boot + H2 consumida via `fetch` centralizado, isolada por usuário, com fallback de contingência | `backend/`, `src/services/http.js`, `src/services/atividadesService.js`, `src/services/materiasService.js` |
| **Autenticação** | Não implementada / fluxo aberto | Login e cadastro com JWT (`POST /auth/login` e `/auth/register`), sessão persistida no refresh sem senha, logout e rotas protegidas (`ESTUDANTE` e `ADMIN`) | `AuthController.java`, `SecurityConfig.java`, `src/auth/AuthContext.jsx`, `src/auth/RotaProtegida.jsx`, `src/pages/Login.jsx` |
| **Estados da interface** | Listagem, validação de formulário e lista vazia | Estados visíveis de carregamento, erro, vazio, aviso de contingência e botão **Tentar novamente** | `src/components/EstadoRequisicao.jsx`, `src/services/fallbackServices.js` |
| **Organização e Testes** | Estrutura inicial de páginas, dados locais e estilos | Separação em `auth/`, `components/`, `data/`, `layout/`, `pages/`, `services/`, `theme/`, `toast/`, `utils/`, `backend/` e `postman/` | `AtividadeApiIntegrationTest.java`, `postman/Atividades-Estatisticas.postman_collection.json` |

---

## ⚠️ 10. Limitações e Contingência

1. **Estratégia de Contingência para Indisponibilidade:** todas as leituras passam por `executarComFallback()` (`src/services/fallbackServices.js`) com timeout de 3 segundos. Caso o servidor Spring Boot esteja desligado, a aplicação não exibe tela em branco: apresenta o banner *"Servidor indisponível. Mostrando dados de demonstração."* (`EstadoRequisicao.jsx`) com o botão **Tentar novamente** e mantém a navegação e demonstração operantes com dados locais.
2. **Matérias compartilhadas:** no back-end, as atividades e estatísticas são estritamente isoladas por usuário autenticado (`usuario_id`), enquanto o catálogo de matérias (`/materias`) é compartilhado entre os estudantes cadastrados.
3. **Dados exclusivamente locais no navegador:** o histórico de ciclos do Timer Pomodoro (`organizador-estudos:pomodoro-historico`) e a preferência de tema claro/escuro (`organizador-estudos:tema`) permanecem salvos no `localStorage`.

---

## 🤖 11. Uso de Inteligência Artificial

Em conformidade com as diretrizes de integridade acadêmica da disciplina, registramos o uso de ferramentas de Inteligência Artificial como apoio ao desenvolvimento:

- **Finalidades utilizadas:** análise de estrutura e integração entre front-end e back-end, implementação e revisão de componentes React e serviços `fetch`, elaboração de cenários de teste de integração (`AtividadeApiIntegrationTest`), coleção Postman e revisão da documentação (`README.md`).
- **Revisão pela equipe:** todo código e documentação sugeridos foram revisados, executados e validados pelos integrantes da equipe, que mantêm domínio e responsabilidade integral para explicar cada parte na apresentação presencial.
