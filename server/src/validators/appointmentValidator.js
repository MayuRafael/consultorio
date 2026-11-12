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

// Período de consulta de horários ocupados (usado pelo calendário do frontend)
const DIAS_MAXIMOS = 62;
const ocupadosQuerySchema = Joi.object({
  inicio: Joi.date().iso().required().messages({
    'any.required': 'Início do período é obrigatório',
    'date.format': 'Início deve estar no formato ISO',
    'date.base': 'Início deve estar no formato ISO',
  }),
  fim: Joi.date()
    .iso()
    .greater(Joi.ref('inicio'))
    .max(Joi.ref('inicio', { adjust: (v) => new Date(v).getTime() + DIAS_MAXIMOS * 24 * 60 * 60 * 1000 }))
    .required()
    .messages({
      'any.required': 'Fim do período é obrigatório',
      'date.format': 'Fim deve estar no formato ISO',
      'date.base': 'Fim deve estar no formato ISO',
      'date.greater': 'O fim precisa ser depois do início',
      'date.max': `O período não pode passar de ${DIAS_MAXIMOS} dias`,
    }),
});

module.exports.ocupadosQuerySchema = ocupadosQuerySchema;
