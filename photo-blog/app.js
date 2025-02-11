// app.js
const express = require('express');
// Um ORM (Object-Relational Mapping) para Node.js que permite interagir com bancos de dados SQL usando JavaScript. Ele converte objetos JavaScript em consultas SQL e facilita o trabalho com bancos como MySQL, PostgreSQL, etc
//const { Sequelize } = require('sequelize');
// Carrega variáveis de ambiente de um arquivo .env, mantendo informações sensíveis (como senhas e strings de conexão) fora do código. mantendo o código mais seguro e fácil de configurar em diferentes ambientes.
const dotenv = require('dotenv');
// authRoutes e photoRoutes: Arquivos que contêm as rotas de autenticação e de fotos, respectivamente.
const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const path = require('path');
dotenv.config();
// Inicializa uma instância do servidor Express.
const app = express();
// Configura o servidor para aceitar requisições com o corpo em JSON, o que facilita o envio de dados em formato JSON.
app.use(express.json());

// Configuração do Sequelize para conexão com o MySQL
// Aqui, Sequelize é configurado para se conectar ao banco de dados MySQL, utilizando as variáveis de ambiente definidas no .env:
//MYSQL_DATABASE: O nome do banco de dados.
//MYSQL_USER: O nome do usuário do banco.
//MYSQL_PASSWORD: A senha do usuário.
//MYSQL_HOST: O endereço do servidor do banco de dados (ex: localhost).
//dialect: 'mysql': Especifica que o banco de dados utilizado é MySQL.
// process fornece informações e funcionalidades sobre o próprio processo em execução, como o ambiente do sistema, o diretório de trabalho atual
//const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
// host: process.env.MYSQL_HOST,
//  port:process.env.DB_PORT,
//  dialect: 'mysql'
//});

// Teste de conexão com o MySQL
// Tenta estabelecer uma conexão com o banco de dados.
//sequelize.authenticate()
// Se a conexão for bem-sucedida, imprime "Conectado ao MySQL".
//  .then(() => console.log("Conectado ao MySQL"))
//  Caso haja erro, captura o erro e imprime uma mensagem de erro com os detalhes.
//  .catch(err => console.error("Erro ao conectar ao MySQL", err));

// Rotas
//  Define o prefixo /auth para as rotas de autenticação importadas de ./routes/auth
app.use('/auth', authRoutes);
// faz o mesmo porem para as rota photo
app.use('/photos', photoRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  Define a porta do servidor usando a variável PORT do .env. Se a variável não estiver definida, a porta padrão será 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

//module.exports = sequelize;




