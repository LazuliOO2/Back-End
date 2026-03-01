// src/models/campanhaRepository.js
const pool = require('../config/db');

async function createCampanha({ nome, mensagem, delay_min_segundos, delay_max_segundos }) {
  const [result] = await pool.query(
    `
    INSERT INTO campanhas
      (nome, mensagem, delay_min_segundos, delay_max_segundos, status, criado_em)
    VALUES
      (?, ?, ?, ?, 'CRIADA', NOW())
    `,
    [nome, mensagem, delay_min_segundos, delay_max_segundos]
  );

  return result.insertId;
}

async function vincularListas(campanhaId, listaIds) {
  if (!Array.isArray(listaIds)) return;

  for (const listaId of listaIds) {
    await pool.query(
      `
      INSERT IGNORE INTO campanha_listas (campanha_id, lista_id, criado_em)
      VALUES (?, ?, NOW())
      `,
      [campanhaId, listaId]
    );
  }
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM campanhas WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function getListasDaCampanha(campanhaId) {
  const [rows] = await pool.query(
    `
    SELECT lista_id
    FROM campanha_listas
    WHERE campanha_id = ?
    `,
    [campanhaId]
  );
  return rows.map(r => r.lista_id);
}

module.exports = {
  createCampanha,
  vincularListas,
  findById,
  getListasDaCampanha,
};