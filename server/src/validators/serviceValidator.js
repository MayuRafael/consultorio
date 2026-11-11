const Joi = require('joi');

const serviceSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Nome do serviço é obrigatório',
    'string.empty': 'Nome do serviço é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
  }),
  description: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
  }),
  durationMinutes: Joi.number().integer().min(5).max(480).required().messages({
    'any.required': 'Duração é obrigatória',
    'number.min': 'Duração mínima é de 5 minutos',
    'number.max': 'Duração máxima é de 480 minutos',
    'number.integer': 'Duração deve ser um número inteiro de minutos',
  }),
});

// Atualização: todos os campos são opcionais, mas precisa enviar pelo menos um
const serviceUpdateSchema = serviceSchema
  .fork(['name', 'durationMinutes'], (campo) => campo.optional())
  .min(1)
  .messages({ 'object.min': 'Envie pelo menos um campo para atualizar' });

module.exports = { serviceSchema, serviceUpdateSchema };
