// basicamente o objetivo desse arquivo seria definir as ordem da operações para ajudar deixa mais organizado
// routes/auth.js
const express = require('express');
const { register, login, refreshToken, updateUser, deleteUser } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
// express.Router() cria uma nova instância de roteador. Esse roteador vai lidar com as rotas de autenticação da aplicação e será exportado para ser usado em outro lugar
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
// Nova rota para verificar se o token é válido
router.get('/verify-token', verifyToken, (req, res) => {
    res.json({ message: 'Token válido', user: req.user });
});
router.put('/update', verifyToken, updateUser); // Atualizar usuário
router.delete('/delete', verifyToken, deleteUser); // Deletar usuário
// Esse código exporta o roteador configurado, permitindo que ele seja importado e usado em outros arquivos da aplicação, geralmente no arquivo principal
module.exports = router;
