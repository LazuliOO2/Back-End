const pool = require('../config/db');

async function createOrUpdateByTelefone({ nome, email = null, telefone }) {
  // 1) Verifica se já existe contato com esse telefone
  const [rows] = await pool.query(
    'SELECT id FROM contatos WHERE telefone = ?',
    [telefone]
  );

  if (rows.length > 0) {
    const id = rows[0].id;

    // Atualiza nome/email se quiser
    await pool.query(
      'UPDATE contatos SET nome = ?, email = ?, atualizado_em = NOW() WHERE id = ?',
      [nome, email, id]
    );

    return id;
  }

  // 2) Se não existir, cria
  const [result] = await pool.query(
    `INSERT INTO contatos (nome, email, telefone, criado_em)
     VALUES (?, ?, ?, NOW())`,
    [nome, email, telefone]
  );

  return result.insertId;
}

// Pega todos os contatos de uma lista específica
async function findByLista(listaId) {
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

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM contatos WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createOrUpdateByTelefone,
  findByLista,
  findById,
};