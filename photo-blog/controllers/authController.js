const { CreateUser, findUserByEmail, updateUser, deleteUser } = require('../models/user'); // Importa as funções corretas
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Registro de usuário
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verifica se o email já está registrado
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Cria o usuário usando a função CreateUser do arquivo user.js
    await CreateUser(username, email, password);

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

  // Função para gerar token
  const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token de 1 hora
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_REFRESH, { expiresIn: '7d' }); // Refresh para gerar um novo token expirar em 7 dias 
    return { accessToken, refreshToken };
  };
  
  // Login de usuário
  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Busca o usuário pelo email
      const user = await findUserByEmail(email);
  
      // Verifica se o usuário existe e se a senha está correta
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }
  
      // Gera um token
      const { accessToken, refreshToken } = generateTokens(user.id);
  
      // Retorna os tokens
      res.json({ accessToken, refreshToken });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // REFRESH TOKEN - Gera um novo accessToken sem precisar logar novamente
  exports.refreshToken = (req, res) => {
    try {
      const { refreshToken } = req.body;
  
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh Token ausente' });
      }
  
      // Verifica se o Refresh Token é válido
      jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Refresh Token inválido ou expirado' });
        }
  
        // Gera um novo Access Token (1h)
        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
        res.json({ accessToken: newAccessToken });
      });
  
    } catch (err) {
      res.status(400).json({ message: 'Erro ao processar o Refresh Token' });
    }
  };
  
  // Atualizar dados do usuário (somente o próprio usuário pode atualizar seus dados)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // Obtém o ID do usuário autenticado
    const { username, email, password } = req.body;

    // Hash da nova senha se for fornecida
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Atualiza o usuário
    const updatedUser = await updateUser(userId, { 
      username, 
      email, 
      password: password ? hashedPassword : undefined // Evita sobrescrever com 'null'
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário atualizado com sucesso', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deletar conta do usuário (somente o próprio usuário pode deletar)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id; // Obtém o ID do usuário autenticado

    // Exclui o usuário
    const deleted = await deleteUser(userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


