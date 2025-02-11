// Agora vamos testa o login
const { login } = require('../controllers/authController');
const { findUserByEmail } = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// simula o modelo no models/users.Substitutei a função findEmail por uma falsa
jest.mock('../models/user', () => ({
  findUserByEmail: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fakeToken'),
}));
// describe agrupas os teste relacionado ao login.Apos cada teste limpa os mocks para que não tenha nenhuma interferencia 
describe('Testes de login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
// simula uma req do usuario
  test('Deve fazer login com sucesso e retornar um token', async () => {
    const req = {
      body: { email: 'teste@email.com', password: 'senha123' },
    };
// simula a resposta a requisição
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    findUserByEmail.mockResolvedValue({ id: 1, password: 'hashedPassword' });
    bcrypt.compare.mockResolvedValue(true); // Simula senha correta

    await login(req, res);
// Verifica se a resposta esperada é retornada se teste passa se o login retornar corretamente os tokens.
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'fakeToken',
      refreshToken: 'fakeToken',
    });
  });

  test('Deve retornar erro se a senha estiver errada', async () => {
    const req = {
      body: { email: 'teste@email.com', password: 'senhaErrada' },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
// Simula o banco de dados (findUserByEmail.mockResolvedValue(...)) para retornar um usuário fictício
    findUserByEmail.mockResolvedValue({ id: 1, password: 'hashedPassword' });
    bcrypt.compare.mockResolvedValue(false); // simula como se a senha fosse incorreta

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Credenciais inválidas' });
  });
});