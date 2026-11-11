const Joi = require('joi');

// Cadastro: o cliente só envia nome, e-mail e senha.
// O papel não é aceito aqui; todo cadastro público vira "Paciente".
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'any.required': 'Nome é obrigatório',
  }),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'E-mail inválido',
    'any.required': 'E-mail é obrigatório',
    'string.empty': 'E-mail é obrigatório',
  }),
  // bcrypt só considera os primeiros 72 bytes, por isso o limite máximo
  password: Joi.string().min(8).max(72).required().messages({
    'string.min': 'Senha deve ter pelo menos 8 caracteres',
    'string.max': 'Senha deve ter no máximo 72 caracteres',
    'any.required': 'Senha é obrigatória',
    'string.empty': 'Senha é obrigatória',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().required().messages({
    'any.required': 'E-mail é obrigatório',
    'string.empty': 'E-mail é obrigatório',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória',
    'string.empty': 'Senha é obrigatória',
  }),
});

module.exports = { registerSchema, loginSchema };
