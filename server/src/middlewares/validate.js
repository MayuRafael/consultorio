// Valida req.body com um schema Joi antes de chegar ao controller
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const erros = error.details.map((d) => d.message);
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros });
    }

    req.body = value; // usa os dados já limpos e convertidos
    next();
  };
}

module.exports = validate;
