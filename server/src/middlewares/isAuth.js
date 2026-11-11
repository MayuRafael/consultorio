// Bloqueia a rota se não houver usuário logado na sessão
function isAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ erro: 'Não autenticado. Faça login.' });
}

module.exports = isAuth;
