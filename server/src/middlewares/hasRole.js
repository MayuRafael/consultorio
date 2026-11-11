// Permite a rota só para os papéis informados. Usar depois de isAuth.
function hasRole(...papeisPermitidos) {
  return (req, res, next) => {
    if (req.session && papeisPermitidos.includes(req.session.role)) {
      return next();
    }
    return res.status(403).json({ erro: 'Acesso negado para o seu perfil' });
  };
}

module.exports = hasRole;
