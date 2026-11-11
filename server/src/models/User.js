const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false -> a senha não volta em consultas comuns
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['Admin', 'Paciente'], default: 'Paciente' },
  },
  { timestamps: true }
);

// Antes de salvar, transforma a senha em hash (nunca guarda o texto puro)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Compara a senha digitada com o hash guardado
userSchema.methods.comparePassword = function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.password);
};

// Remove a senha ao converter o usuário para JSON (resposta da API)
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
