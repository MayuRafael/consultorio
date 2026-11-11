const request = require('supertest');

process.env.SESSION_SECRET = 'segredo-de-teste';
const app = require('../src/app');
const { serviceSchema } = require('../src/validators/serviceValidator');
const { appointmentSchema } = require('../src/validators/appointmentValidator');

describe('Validação de serviço', () => {
  test('aceita serviço válido', () => {
    const { error } = serviceSchema.validate({ name: 'Consulta de rotina', durationMinutes: 30 });
    expect(error).toBeUndefined();
  });

  test('rejeita duração fora do limite', () => {
    const { error } = serviceSchema.validate({ name: 'Consulta', durationMinutes: 1 });
    expect(error.details[0].message).toMatch(/mínima/);
  });
});

describe('Validação de agendamento', () => {
  const idValido = '6af4e8a56eef34faad2a5f1e';

  test('aceita serviço e data futura', () => {
    const futuro = new Date(Date.now() + 86400000).toISOString();
    const { error } = appointmentSchema.validate({ serviceId: idValido, date: futuro });
    expect(error).toBeUndefined();
  });

  test('rejeita data no passado', () => {
    const passado = new Date(Date.now() - 86400000).toISOString();
    const { error } = appointmentSchema.validate({ serviceId: idValido, date: passado });
    expect(error.details[0].message).toMatch(/futuro/);
  });

  test('rejeita serviceId que não é um ObjectId', () => {
    const futuro = new Date(Date.now() + 86400000).toISOString();
    const { error } = appointmentSchema.validate({ serviceId: 'abc', date: futuro });
    expect(error).toBeDefined();
  });
});

describe('Rotas protegidas sem login', () => {
  test('GET /api/services sem sessão responde 401', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(401);
  });

  test('POST /api/services sem sessão responde 401', async () => {
    const res = await request(app).post('/api/services').send({});
    expect(res.status).toBe(401);
  });

  test('POST /api/appointments sem sessão responde 401', async () => {
    const res = await request(app).post('/api/appointments').send({});
    expect(res.status).toBe(401);
  });

  test('GET /api/appointments sem sessão responde 401', async () => {
    const res = await request(app).get('/api/appointments');
    expect(res.status).toBe(401);
  });
});
