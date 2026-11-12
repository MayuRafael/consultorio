# Consultório: sistema de agendamento

Aplicação web full stack para agendamento de consultas em um consultório. O paciente se cadastra, escolhe o serviço, o dia e o horário, e acompanha ou cancela as próprias consultas. O administrador gerencia os serviços e a agenda da clínica.

Trabalho final da disciplina **DCC704** (UFRR), feito por **Rafael da Silva**.

## Tecnologias

**Backend (`/server`)**
- Node.js e Express, com arquitetura MVC adaptada para API
- MongoDB com Mongoose
- bcrypt para hash de senhas
- express-session para autenticação por sessão
- Joi para validação de dados de entrada
- express-rate-limit para limitar tentativas de login
- Jest e Supertest para testes

**Frontend (`/client`)**
- React com Vite
- react-router-dom para navegação (SPA)
- fetch para comunicação com a API
- CSS puro, com variáveis de cor e layout responsivo

## Funcionalidades

| Perfil | O que pode fazer |
|---|---|
| Paciente | Criar conta, entrar, escolher serviço, data e horário, ver os próprios agendamentos e cancelá-los |
| Administrador | Tudo que o paciente faz, mais: criar, editar e remover serviços; ver a agenda completa; cancelar ou remover agendamentos |

Regras de negócio:
- Um horário só pode ter um agendamento ativo na clínica.
- Não é possível agendar em horário que já passou.
- Um serviço com agendamentos ativos não pode ser removido.
- O cadastro público sempre cria um paciente. O perfil de administrador é definido no banco de dados.

## Estrutura do projeto

```
consultorio/
├── server/          # API (Express + MongoDB)
│   ├── src/
│   │   ├── config/        # conexão com o banco
│   │   ├── controllers/   # regras das rotas
│   │   ├── middlewares/   # autenticação, papéis e validação
│   │   ├── models/        # User, Service, Appointment
│   │   ├── routes/        # definição das rotas
│   │   └── validators/    # schemas Joi
│   └── tests/             # testes com Jest
└── client/          # Interface (React + Vite)
    └── src/
        ├── components/    # Navbar, ProtectedRoute, CalendarioMes, Spinner
        ├── context/       # estado do usuário logado
        ├── pages/         # Login, Cadastro, Agendar, Meus agendamentos, Admin
        └── services/      # comunicação com a API
```

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) rodando na sua máquina (porta 27017)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env     # no Windows: copy .env.example .env
npm run dev
```

Edite o arquivo `.env` e defina `SESSION_SECRET` com um texto longo e aleatório. O servidor sobe em `http://localhost:3000`.

### 2. Frontend

Em outro terminal:

```bash
cd client
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador. O Vite encaminha as requisições de `/api` para o backend.

### Variáveis de ambiente (`server/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta do servidor | `3000` |
| `MONGO_URI` | Endereço do MongoDB | `mongodb://127.0.0.1:27017/consultorio` |
| `SESSION_SECRET` | Chave usada para assinar a sessão | texto longo e aleatório |

O arquivo `.env` não vai para o GitHub. Use o `.env.example` como modelo.

### Criar um administrador

O perfil de administrador não é criado pela tela de cadastro. Primeiro cadastre uma conta normal pela tela **Cadastrar** e depois, no `mongosh` ou no MongoDB Compass, rode:

```js
use consultorio
db.users.updateOne({ email: "seu-email@exemplo.com" }, { $set: { role: "Admin" } })
```

Depois saia e entre de novo, porque o papel fica guardado na sessão no momento do login.

## Testes

Na pasta `server`:

```bash
npm test
```

Os testes cobrem validações, rotas protegidas e o período de horários ocupados. Eles não precisam do MongoDB rodando.

## Rotas da API

Todas as rotas de `/api/services` e `/api/appointments` exigem login.

**Autenticação**

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastro de paciente |
| POST | `/api/auth/login` | Login (limite de 5 tentativas por minuto) |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET | `/api/auth/me` | Usuário logado |

**Serviços**

| Método | Rota | Quem pode | Descrição |
|---|---|---|---|
| GET | `/api/services` | Logado | Lista os serviços |
| GET | `/api/services/:id` | Logado | Detalhes de um serviço |
| POST | `/api/services` | Admin | Cria um serviço |
| PUT | `/api/services/:id` | Admin | Altera um serviço |
| DELETE | `/api/services/:id` | Admin | Remove um serviço sem agendamentos ativos |

**Agendamentos**

| Método | Rota | Quem pode | Descrição |
|---|---|---|---|
| GET | `/api/appointments/ocupados?inicio=...&fim=...` | Logado | Datas ocupadas no período (sem nomes) |
| GET | `/api/appointments` | Logado | Paciente vê os próprios; Admin vê todos |
| GET | `/api/appointments/:id` | Logado | Detalhes de um agendamento |
| POST | `/api/appointments` | Logado | Cria um agendamento |
| PATCH | `/api/appointments/:id/cancelar` | Logado | Cancela um agendamento |
| PUT | `/api/appointments/:id` | Admin | Altera um agendamento |
| DELETE | `/api/appointments/:id` | Admin | Remove um agendamento |

## Autor

**Rafael da Silva**, estudante da UFRR.

## Licença

Este projeto está sob a licença [MIT](LICENSE).
