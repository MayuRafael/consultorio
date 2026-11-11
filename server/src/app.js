const express = require('express');
const session = require('express-session');

const app = express();

// Lê o corpo das requisições: JSON (API) e formulários (urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessão guardada no servidor; o cookie só carrega o ID da sessão
app.use(
  session({
    name: 'consultorio.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2, // 2 horas
    },
  })
);

// Rota de verificação para testar se a API está no ar
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rotas de autenticação
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// 404: rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratador de erros: nunca expõe detalhes internos ao cliente
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ erro: err.expose ? err.message : 'Erro interno do servidor' });
});

module.exports = app;
