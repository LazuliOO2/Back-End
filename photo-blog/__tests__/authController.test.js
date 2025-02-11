const { register } = require('../controllers/authController');
const { findUserByEmail, CreateUser } = require('../models/user');
// Simula (mocka) o módulo ../models/user.Substitui as funções findUserByEmail e CreateUser por mocks (funções falsas) usando jest.fn(). Isso permite testar a lógica da função 
// sem realmente acessar o banco de dados.
jest.mock('../models/user', () => ({
  findUserByEmail: jest.fn(),
  CreateUser: jest.fn(),
}));
// describe: Agrupa os testes relacionados ao AuthController.afterEach: Após cada teste, limpa os mocks (jest.clearAllMocks()) para que não haja interferência entre os testes.
describe('Testes do AuthController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
// Criamos um objeto req (requisição) que simula um usuário tentando se registrar.
  test('Deve registrar um novo usuário', async () => {
    const req = {
      body: {
        username: 'TesteUser',
        email: 'teste@email.com',
        password: 'senha123',
      },
    };
// Criamos um objeto res (resposta), simulando a resposta da API. status e json são mocks.
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    findUserByEmail.mockResolvedValue(null); //Mockamos a resposta da função findUserByEmail para null, indicando que o email não está cadastrado.
    CreateUser.mockResolvedValue({ id: 1 }); // Mockamos a função CreateUser para simular a criação de um novo usuário.
// Chamamos register(req, res), simulando a execução da função real.
    await register(req, res);

    expect(findUserByEmail).toHaveBeenCalledWith('teste@email.com');
    expect(CreateUser).toHaveBeenCalledWith('TesteUser', 'teste@email.com', 'senha123');
// No Express.js, normalmente usamos res.status() antes de res.json() para garantir que a resposta tenha:Um código de status correto → Para que o cliente saiba se a requisição
//foi bem-sucedida ou falhou.Um JSON explicativo → Para que o cliente entenda o motivo da resposta.
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário criado com sucesso' });
  });
// Criamos um objeto req com um email já cadastrado.
  test('Deve retornar erro se o email já estiver cadastrado', async () => {
    const req = {
      body: { username: 'Teste', email: 'existente@email.com', password: 'senha123' },
    };
//Criamos um objeto res simulando a resposta
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
// Mockamos findUserByEmail para simular que o email já está cadastrado.
    findUserByEmail.mockResolvedValue({ id: 1 }); // Simula usuário já cadastrado

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email já está em uso' });
  });
});

