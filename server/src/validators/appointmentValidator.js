const Joi = require('joi');

const appointmentSchema = Joi.object({
  serviceId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Serviço é obrigatório',
    'string.hex': 'Serviço inválido',
    'string.length': 'Serviço inválido',
  }),
  // Data e hora em formato ISO, sempre no futuro
  date: Joi.date().iso().greater('now').required().messages({
    'any.required': 'Data e hora são obrigatórias',
    'date.format': 'Data deve estar no formato ISO (ex.: 2026-11-20T14:00:00-04:00)',
    'date.greater': 'O horário precisa estar no futuro',
  }),
});

const appointmentUpdateSchema = Joi.object({
  serviceId: Joi.string().hex().length(24),
  date: Joi.date().iso().greater('now'),
  status: Joi.string().valid('agendado', 'cancelado'),
}).min(1).messages({ 'object.min': 'Envie pelo menos um campo para atualizar' });

module.exports = { appointmentSchema, appointmentUpdateSchema };
