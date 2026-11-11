const mongoose = require('mongoose');

// Conecta ao MongoDB usando a variável MONGO_URI do arquivo .env
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI não definida. Verifique o arquivo .env');
  }

  await mongoose.connect(uri);
  console.log(`MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
