# 📚 Organizador de Estudos

Aplicação web desenvolvida em **React + Vite** para a disciplina de **Front-End Frameworks** (UNINASSAU), criada para ajudar estudantes universitários a gerenciar atividades acadêmicas, disciplinas, prazos, prioridades e sessões de foco.

---

## 🎯 Objetivo e Público-alvo

Facilitar a rotina de estudantes universitários que precisam conciliar faculdade, trabalho/estágio, provas, trabalhos e prazos de múltiplas disciplinas em um único painel organizado.

---

## ✨ Funcionalidades

- **Autenticação e Controle de Acesso (RBAC):** login, cadastro de estudante, proteção de rotas (`RotaProtegida`) e área exclusiva para administradores (`/admin`).
- **Dashboard e Visão Geral:** resumo de atividades pendentes, concluídas, matérias ativas, próximas entregas e distribuição por prioridade.
- **Gestão de Atividades (CRUD completo):** criar, listar, editar, excluir, marcar como concluída/pendente, pesquisar por título, filtrar por matéria e por situação.
- **Gestão de Matérias:** cadastro, edição, exclusão, cores personalizadas, barra de progresso por disciplina e visualização expandida de atividades vinculadas.
- **Timer Pomodoro:** ciclos de Foco (25 min), Pausa Curta (5 min) e Pausa Longa (15 min), vínculo com matéria, alerta sonoro via Web Audio API e histórico persistido.
- **Calendário Acadêmico:** visualização mensal com marcadores de prioridade, atraso e conclusão, além de painel de detalhes por dia.
- **Prioridades:** destaque automático para tarefas urgentes (atrasadas ou com prazo em até 3 dias) e organização em colunas (Alta, Média e Baixa).
- **Estatísticas:** gráficos de barras por matéria e gráficos de rosca (SVG) por prioridade e situação.
- **Painel Administrativo (`/admin`):** métricas globais, gestão de usuários (papéis, bloqueio/desbloqueio e exclusão), gestão de disciplinas, auditoria de ações e testes/importação via API REST.
- **Busca Global e Alertas de Prazo:** barra de pesquisa e central de notificações de prazos na Topbar.
- **Tema Claro / Escuro e Responsividade:** alternância persistente de tema e navegação mobile dedicada.
- **Integração com API REST + Contingência Local:** consumo via Fetch API com timeout e fallback automático para `localStorage`.

---

## 🛠️ Tecnologias

- **React 19** + **Vite 8**
- **React Router DOM 7**
- **JavaScript (ES Modules)** e **CSS3** (variáveis CSS para temas)
- **Fetch API** + **LocalStorage** + **Web Audio API**
- **ESLint 10**
- **GitHub Actions + GitHub Pages**

---

## 🚀 Como executar localmente

### Pré-requisitos
- Node.js 20+ e npm

### Passo a passo

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd Projeto_FrontEndFrameworks

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor local com HMR |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa a verificação de lint com ESLint |

---

## 🔐 Credenciais de Demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@estudos.com` | `admin123` |
| Estudante | `aluno@estudos.com` | `aluno123` |

*(Também é possível criar novas contas de estudante pela tela de cadastro.)*

---

## 🌐 Configuração de API (`.env`)

A URL base da API REST é lida da variável `VITE_API_URL`:

```env
VITE_API_URL=https://jsonplaceholder.typicode.com
```

- Quando os endpoints `/atividades` ou `/materias` não estiverem disponíveis no servidor configurado, a aplicação ativa automaticamente o **modo de contingência**, mantendo a persistência completa no `localStorage`.
- No **Painel Administrativo → Integração API REST**, é possível testar a conectividade com o `JSONPlaceholder` e importar tarefas de exemplo diretamente para o organizador.

---

## 📂 Estrutura do Projeto

```text
src/
├── auth/          # AuthContext e RotaProtegida (RBAC)
├── components/    # Componentes reutilizáveis (EstadoRequisicao)
├── data/          # Persistência local (storage.js, dados.json, dadosContingencia.js)
├── layout/        # AppLayout, Sidebar, Topbar e BarraInferior (mobile)
├── pages/         # Home, Dashboard, Atividades, AtividadeForm, materias, Pomodoro,
│                  # Calendario, Prioridades, Estatisticas, Configuracoes, Login e Admin
├── services/      # Cliente HTTP (http.js, api.js), fallback e serviços de dados
├── theme/         # ThemeContext (claro/escuro)
├── toast/         # ToastContext (feedback visual)
└── utils/         # Utilitários de datas, prazos e ordenação de atividades
```
