const User = require('../models/User');

// Dados do usuário que podem ir para o cliente (sem senha)
function dadosPublicos(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

// Cadastro de paciente
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });
    }

    const user = await User.create({ name, email, password, role: 'Paciente' });
    return res.status(201).json({ mensagem: 'Cadastro realizado', usuario: dadosPublicos(user) });
  } catch (err) {
    // Trata corrida: dois cadastros com o mesmo e-mail ao mesmo tempo
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });
    }
    next(err);
  }
};

// Login: cria a sessão no servidor
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // A senha está marcada como select:false, então pedimos explicitamente
    const user = await User.findOne({ email }).select('+password');

    // Mensagem genérica: não revela se o e-mail existe
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    // Gera um novo ID de sessão a cada login (evita fixação de sessão)
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user._id.toString();
      req.session.role = user.role;

      return res.status(200).json({ mensagem: 'Login realizado', usuario: dadosPublicos(user) });
    });
  } catch (err) {
    next(err);
  }
};

// Logout: destrói a sessão no servidor e limpa o cookie no navegador
exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    // O nome precisa ser o mesmo definido em app.js ("consultorio.sid")
    res.clearCookie('consultorio.sid');
    return res.status(200).json({ mensagem: 'Logout realizado' });
  });
};

// Usuário logado atual (o frontend usa para saber se há login e qual o papel)
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      // Sessão aponta para usuário que não existe mais
      return req.session.destroy(() => res.status(401).json({ erro: 'Não autenticado. Faça login.' }));
    }
    return res.status(200).json({ usuario: dadosPublicos(user) });
  } catch (err) {
    next(err);
  }
};
