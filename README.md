# 📚 Organizador de Estudos

Aplicação web desenvolvida em **React + JavaScript + Vite** para a disciplina de **Front-end Frameworks** (Ciência da Computação — 2026.2, UNINASSAU), seguindo o formato de **Projeto Evolutivo (AV1 → AV2)** em repositório único.

---

## 🎯 1. Problema e Público-alvo

### Problema
Estudantes universitários frequentemente acumulam provas, trabalhos, listas de exercícios e prazos de múltiplas disciplinas em anotações dispersas, o que dificulta priorizar entregas urgentes, acompanhar o progresso por matéria e manter constância nos estudos.

### Público-alvo
Estudantes universitários que precisam conciliar faculdade, trabalho/estágio e rotina de estudos em um único painel organizado, com apoio administrativo opcional para gestão de disciplinas e acompanhamento de indicadores.

---

## 👥 2. Integrantes e Contribuição

> **Nota para a equipe:** confirme os nomes completos, os papéis e ajuste a coluna de contribuições conforme o histórico de commits de cada integrante antes de criar a tag final.

| Integrante | Disciplina / Perfil | Contribuições Principais |
| --- | --- | --- |
| **José Rhawan Michel** (`rhawan81`) | Front-end Frameworks | Estrutura inicial React + Vite, autenticação e controle de acesso (`AuthContext`, `RotaProtegida`), Painel ADM, Timer Pomodoro, vínculo entre atividades e matérias, integração inicial com API e deploy CI/CD. |
| **Emilly Silva** | Front-end Frameworks | *(Preencher com os módulos/páginas/commits assumidos)* |
| **Mylena Oliveira** | Front-end Frameworks | *(Preencher com os módulos/páginas/commits assumidos)* |

*(Se a equipe for interdisciplinar de 4 ou 5 integrantes com Back-end, adicionar os demais membros nesta tabela.)*

---

## ✨ 3. Funcionalidades

### Escopo-base
- **Página inicial e Dashboard (`/` e `/dashboard`):** comunicação do propósito do produto, resumo de atividades pendentes, concluídas, atrasadas, total de matérias, próximas entregas e gráfico de distribuição por prioridade.
- **Gestão de Atividades (`/atividades`, `/atividades/nova`, `/atividades/:id/editar`):** listagem, criação, edição, exclusão, alternância de status (pendente/concluída), busca por título (sincronizada na URL), filtros por matéria e abas por situação, além de formulário controlado com validação de campos obrigatórios.
- **Gestão de Matérias (`/materias`):** cadastro, edição e exclusão de disciplinas com cores personalizadas, barra de progresso, busca, filtros por pendência/conclusão e expansão das atividades vinculadas.
- **Navegação completa e feedback visual:** `Sidebar` (desktop), `Topbar` com busca global e central de alertas de prazos, `BarraInferior` (mobile), mensagens de validação, estados vazios e notificações toast (`ToastContext`).
- **Configurações e Tema (`/configuracoes`):** visualização do perfil autenticado e alternância persistente entre **Modo Claro** e **Modo Escuro** (`ThemeContext`).

### Funcionalidades verticais adicionais
- **Controle de Acesso e Painel Administrativo (`/login`, `/admin`):** segundo perfil (`admin`) com rota protegida exclusiva (`RotaProtegida` com `somenteAdmin`), métricas globais, gestão de usuários (papéis, bloqueio/desbloqueio, cadastro e exclusão), cadastro rápido de disciplinas, auditoria de ações e painel de teste de API.
- **Timer Pomodoro (`/pomodoro`):** ciclos de Foco (25 min), Pausa Curta (5 min) e Pausa Longa (15 min), vínculo com matérias, aviso sonoro sintetizado via Web Audio API e histórico persistido.
- **Calendário Acadêmico (`/calendario`):** grade mensal interativa com marcadores de prioridade, conclusão e atraso, além de painel de detalhes por dia.
- **Central de Prioridades (`/prioridades`):** destaque automático para atividades urgentes (atrasadas ou vencendo em até 3 dias), filtro por situação e organização em colunas (Alta, Média e Baixa).
- **Estatísticas (`/estatisticas`):** gráficos de barras por matéria e gráficos de rosca em SVG por prioridade e situação.
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

- **React 19** (componentes funcionais e hooks)
- **JavaScript (ES Modules)**
- **Vite 8**
- **React Router DOM 7**
- **CSS tradicional** (variáveis CSS para temas claro/escuro e folhas por módulo)
- **Fetch API** (centralizada em `src/services/`)
- **Web Storage (`localStorage`)** e **Web Audio API**
- **ESLint 10**
- **Git / GitHub** (com `package-lock.json` versionado)

---

## 🚀 6. Como Executar

### Pré-requisitos
- **Node.js 20+** e **npm**
- *(Opcional — Opção B)* Back-end Java Spring Boot em execução na porta `8080` (ou na URL configurada em `.env`)

### Front-end

```bash
# 1. Clone o repositório
git clone https://github.com/rhawan81/Projeto_Front_End_Frameworks.git
cd Projeto_Front_End_Frameworks

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de variáveis de ambiente a partir do exemplo
cp .env.example .env

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor local Vite com HMR |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa a verificação de lint com ESLint |

### Back-end (Opção B — se utilizado pela equipe)
- **Repositório do Back-end:** *(inserir link do repositório do back-end aqui)*
- **Instruções para iniciar o Back-end:** *(inserir comandos, ex.: `./mvnw spring-boot:run`, porta `8080` e configuração de CORS para `http://localhost:5173`)*

---

## 💾 7. Dados e Persistência

A aplicação separa claramente dados iniciais, dados persistidos localmente no navegador e dados consumidos da API:

| Origem / Chave | Tipo | Conteúdo e Finalidade |
| --- | --- | --- |
| `src/data/dados.json` | Arquivo local inicial (AV1 / semente) | Conjunto inicial de 4 atividades acadêmicas usado na primeira carga quando não há dados no `localStorage`. |
| `src/data/dadosContingencia.js` | Contingência local | Conjunto alternativo estruturado de matérias e atividades compatível com a interface. |
| `organizador-estudos:atividades` | `localStorage` | Cache/persistência local das atividades (atualizado após retorno da API ou em modo contingência). |
| `organizador-estudos:materias` | `localStorage` | Cache/persistência local das matérias e suas cores personalizadas. |
| `organizador-estudos:pomodoro-historico` | `localStorage` | Histórico de ciclos Pomodoro concluídos (dado local do estudante). |
| `organizador-estudos:tema` | `localStorage` | Preferência de tema (`claro` ou `escuro`). |
| `organizador-estudos:auth` | `localStorage` | Sessão autenticada ativa (preservada após refresh, sem armazenar a senha no objeto de sessão). |
| API REST (`VITE_API_URL`) | Remoto (AV2) | Fonte principal de `/atividades` e `/materias` via `fetch` centralizado em `src/services/`. |

---

## 🌐 8. Contrato da API (AV2)

### Configuração centralizada
- **Arquivo:** `src/services/http.js` e `.env.example`
- **Variável de ambiente:** `VITE_API_URL` (padrão local: `http://localhost:8080`)
- **Formato:** HTTP + JSON (`Content-Type: application/json`) com CORS habilitado no back-end para o ambiente de desenvolvimento.

### Endpoints mapeados em `src/services/`

#### Atividades (`src/services/atividadesService.js`)

| Operação | Método | Endpoint | Corpo / Parâmetros | Resposta Esperada |
| --- | --- | --- | --- | --- |
| Listar atividades | `GET` | `/atividades` | Query opcional: `?materia=...&situacao=...` | `200 OK` — Array JSON de atividades |
| Buscar por ID | `GET` | `/atividades/:id` | Path param `id` | `200 OK` — Objeto de atividade |
| Criar atividade | `POST` | `/atividades` | `{ titulo, materia, materiaId, descricao, prazo, prioridade, status }` | `201 Created` — Atividade criada |
| Atualizar atividade | `PUT` | `/atividades/:id` | `{ titulo, materia, materiaId, descricao, prazo, prioridade, status }` | `200 OK` — Atividade atualizada |
| Atualizar status | `PATCH` | `/atividades/:id/status` | `{ status: "PENDENTE" \| "CONCLUIDA" }` | `200 OK` — Atividade atualizada |
| Excluir atividade | `DELETE` | `/atividades/:id` | Path param `id` | `204 No Content` |

**Exemplo de resposta (`GET /atividades`):**
```json
[
  {
    "id": 1,
    "titulo": "Trabalho de Banco de Dados",
    "materia": "Banco de Dados",
    "descricao": "Desenvolver o trabalho sobre SQL.",
    "prazo": "2026-11-20",
    "prioridade": "ALTA",
    "status": "PENDENTE"
  }
]
```

#### Matérias (`src/services/materiasService.js`)

| Operação | Método | Endpoint | Corpo / Parâmetros | Resposta Esperada |
| --- | --- | --- | --- | --- |
| Listar matérias | `GET` | `/materias` | — | `200 OK` — Array JSON de matérias |
| Criar matéria | `POST` | `/materias` | `{ nome, cor }` | `201 Created` — Matéria criada |
| Atualizar matéria | `PUT` | `/materias/:id` | `{ nome, cor }` | `200 OK` — Matéria atualizada |
| Excluir matéria | `DELETE` | `/materias/:id` | Path param `id` | `204 No Content` |

**Exemplo de resposta (`GET /materias`):**
```json
[
  {
    "id": 1,
    "nome": "Banco de Dados",
    "cor": "#3B82F6"
  }
]
```

#### Tratamento de Erros HTTP
- Erros HTTP (`!response.ok`) em `src/services/http.js` tentam extrair `{ "message": "..." }` do corpo JSON e propagam um `Error` com `status` e `isHttpError = true`.
- Falhas de rede ou timeout (`3000ms` em `src/services/fallbackServices.js`) ativam o modo de contingência exibindo aviso visual com botão **Tentar novamente**.
- *(Pendente de finalização antes da tag `entrega-av2`: integrar endpoint de autenticação da API escolhida e adicionar tratamento explícito de status `401` e `403` no cliente HTTP.)*

---

## 📈 9. Evolução da AV1 para a AV2

| Aspecto | Situação na AV1 | Evolução na AV2 | Evidência |
| --- | --- | --- | --- |
| **Dados** | JSON local (`src/data/dados.json`) e `localStorage` | Consumo de API REST via `fetch` centralizado com normalização e fallback de contingência | `src/services/http.js`, `src/services/atividadesService.js`, `src/services/materiasService.js`, `.env.example` |
| **Autenticação** | Não implementada / fluxo aberto | Tela de login com validação, contexto de sessão persistida no refresh, logout e rotas protegidas (incluindo perfil ADM) | `src/auth/AuthContext.jsx`, `src/auth/RotaProtegida.jsx`, `src/pages/Login.jsx`, `src/pages/Admin.jsx` |
| **Estados da interface** | Listagem, validação de formulário e lista vazia | Estados visíveis de carregamento, erro, vazio, aviso de contingência e ação de tentar novamente | `src/components/EstadoRequisicao.jsx`, `src/services/fallbackServices.js` |
| **Organização** | Estrutura inicial de páginas, dados locais e estilos | Separação consolidada em `auth/`, `components/`, `data/`, `layout/`, `pages/`, `services/`, `theme/`, `toast/` e `utils/` | Estrutura de pastas em `src/` |

---

## ⚠️ 10. Limitações e Contingência

### Estratégia de Contingência
- Todas as leituras remotas (`buscarAtividades` e `buscarMaterias`) passam por `executarComFallback()` (`src/services/fallbackServices.js`) com timeout de 3 segundos.
- Caso o servidor da API esteja offline ou ocorra falha de rede, a aplicação **não exibe tela em branco**: carrega automaticamente os dados locais compatíveis, exibe o banner *"Servidor indisponível. Mostrando dados de demonstração."* (`EstadoRequisicao.jsx`) e disponibiliza o botão **Tentar novamente** para recuperação imediata quando o serviço retornar.

### Limitações Conhecidas (estado atual do repositório)
1. **Autenticação ainda local:** o fluxo atual em `src/auth/AuthContext.jsx` realiza autenticação em memória/`localStorage` e ainda precisa ser conectado ao endpoint real de autenticação da opção escolhida (Back-end próprio na Opção B ou DummyJSON na Opção A), removendo senhas fixas do código-fonte e tratando `401`/`403` em `src/services/http.js`.
2. **Mutações nas páginas:** embora as funções de escrita (`POST`, `PUT`, `PATCH`, `DELETE`) já existam em `atividadesService.js` e `materiasService.js`, as telas `AtividadeForm.jsx`, `Atividades.jsx` e `materias.jsx` ainda persistem alterações diretamente no `localStorage` e devem ser conectadas às funções assíncronas dos serviços.
3. **Integração auxiliar no Painel ADM:** `src/services/api.js` (usado na aba *Integração API REST* de `Admin.jsx`) ainda aponta para `JSONPlaceholder` como demonstração; antes da entrega final da AV2, deve ser unificado com a opção de integração aprovada pela equipe.
4. **Dados exclusivamente locais:** o histórico do Timer Pomodoro e a preferência de tema claro/escuro são mantidos apenas no `localStorage` do navegador.

---

## 🤖 11. Uso de Inteligência Artificial

Em conformidade com as diretrizes de integridade acadêmica da disciplina, registramos o uso de ferramentas de Inteligência Artificial como apoio ao desenvolvimento:

- **Finalidades utilizadas:** revisão de arquitetura e organização de componentes React, diagnóstico de bugs, apoio na estilização CSS, revisão dos requisitos da disciplina e atualização da documentação (`README.md`).
- **Revisão pela equipe:** todo código e documentação sugeridos foram revisados, adaptados ao contexto do projeto e testados pela equipe, mantendo responsabilidade integral sobre a explicação técnica durante a apresentação presencial.

---

## 📂 Estrutura do Projeto

```text
src/
├── auth/          # AuthContext e RotaProtegida (controle de acesso)
├── components/    # Componentes reutilizáveis (EstadoRequisicao)
├── data/          # Dados iniciais (dados.json), contingência e storage.js
├── layout/        # AppLayout, Sidebar, Topbar e BarraInferior (mobile)
├── pages/         # Home, Dashboard, Atividades, AtividadeForm, materias, Pomodoro,
│                  # Calendario, Prioridades, Estatisticas, Configuracoes, Login e Admin
├── services/      # Cliente HTTP (http.js), fallbackServices.js, atividadesService.js,
│                  # materiasService.js e api.js
├── theme/         # ThemeContext (modo claro/escuro)
├── toast/         # ToastContext (notificações visuais)
└── utils/         # Utilitários de datas, prazos e ordenação (atividades.js)
```
