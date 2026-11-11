require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET não definida. Verifique o arquivo .env');
  process.exit(1);
}

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Falha ao iniciar o servidor:', err.message);
    process.exit(1);
  });
