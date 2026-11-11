const request = require('supertest');

process.env.SESSION_SECRET = 'segredo-de-teste';
const app = require('../src/app');
const { registerSchema, loginSchema } = require('../src/validators/authValidator');
const isAuth = require('../src/middlewares/isAuth');
const hasRole = require('../src/middlewares/hasRole');

describe('Validação de cadastro', () => {
  test('aceita dados válidos', () => {
    const { error } = registerSchema.validate({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      password: 'senha12345',
    });
    expect(error).toBeUndefined();
  });

  test('rejeita senha curta', () => {
    const { error } = registerSchema.validate({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      password: '123',
    });
    expect(error.details[0].message).toMatch(/8 caracteres/);
  });

  test('rejeita e-mail inválido', () => {
    const { error } = registerSchema.validate({
      name: 'Ana Souza',
      email: 'nao-e-email',
      password: 'senha12345',
    });
    expect(error.details[0].message).toMatch(/E-mail inválido/);
  });

  test('ignora role enviado pelo cliente (não aceita escalar privilégio)', () => {
    const { value, error } = registerSchema.validate(
      { name: 'Ana Souza', email: 'ana@exemplo.com', password: 'senha12345', role: 'Admin' },
      { stripUnknown: true }
    );
    expect(error).toBeUndefined();
    expect(value).not.toHaveProperty('role');
  });
});

describe('Validação de login', () => {
  test('exige e-mail e senha', () => {
    const { error } = loginSchema.validate({});
    expect(error).toBeDefined();
  });
});

describe('Rotas de autenticação sem banco', () => {
  test('POST /api/auth/register com dados inválidos responde 400 com detalhes', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Dados inválidos');
    expect(Array.isArray(res.body.detalhes)).toBe(true);
  });

  test('GET /api/auth/me sem sessão responde 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  test('POST /api/auth/logout sem sessão responde 200 e não quebra', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
  });
});

describe('Middlewares de acesso', () => {
  function criarRespostaFalsa() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }

  test('isAuth deixa passar com userId na sessão', () => {
    const next = jest.fn();
    isAuth({ session: { userId: 'abc' } }, criarRespostaFalsa(), next);
    expect(next).toHaveBeenCalled();
  });

  test('isAuth bloqueia sem userId na sessão', () => {
    const res = criarRespostaFalsa();
    const next = jest.fn();
    isAuth({ session: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('hasRole deixa passar o papel permitido', () => {
    const next = jest.fn();
    hasRole('Admin')({ session: { role: 'Admin' } }, criarRespostaFalsa(), next);
    expect(next).toHaveBeenCalled();
  });

  test('hasRole bloqueia papel não permitido com 403', () => {
    const res = criarRespostaFalsa();
    const next = jest.fn();
    hasRole('Admin')({ session: { role: 'Paciente' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
