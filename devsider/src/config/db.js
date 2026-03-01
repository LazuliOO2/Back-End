// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true, // Quando todas as conexões estiverem ocupadas, novas requisições vão esperar em fila em vez de explodir tudo.
  connectionLimit: 10, //Máximo de 10 conexões simultâneas no pool.
  queueLimit: 0, // Zero significa "fila infinita"
});


module.exports = pool;