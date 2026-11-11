const request = require('supertest');

// A sessão exige um segredo; definimos um valor de teste antes de importar o app
process.env.SESSION_SECRET = 'segredo-de-teste';
const app = require('../src/app');

describe('Rota de saúde da API', () => {
  test('GET /api/health responde 200 com status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('rota inexistente responde 404 em JSON', async () => {
    const res = await request(app).get('/rota-que-nao-existe');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('erro');
  });
});
