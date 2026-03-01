const pool = require('../config/db');

async function createLista(nome) {
  const [result] = await pool.query(
    `INSERT INTO listas (nome, criado_em)
     VALUES (?, NOW())`,
    [nome]
  );

  return result.insertId;
}

async function addContatoNaLista(listaId, contatoId) {
  // Evitar duplicado: UNIQUE(lista_id, contato_id) ajuda, mas vamos ser bonzinhos
  await pool.query(
    `
    INSERT IGNORE INTO lista_contatos (lista_id, contato_id, criado_em)
    VALUES (?, ?, NOW())
    `,
    [listaId, contatoId]
  );
}

async function getContatosDaLista(listaId) {
  const [rows] = await pool.query(
    `
    SELECT c.*
    FROM contatos c
    INNER JOIN lista_contatos lc ON lc.contato_id = c.id
    WHERE lc.lista_id = ?
    `,
    [listaId]
  );

  return rows;
}

module.exports = {
  createLista,
  addContatoNaLista,
  getContatosDaLista,
};