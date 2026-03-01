const pool = require('../config/db');

async function criarFluxo({ nome, descricao }) {
  const [result] = await pool.query(
    `
    INSERT INTO fluxos (nome, descricao, ativo, criado_em)
    VALUES (?, ?, 1, NOW())
    `,
    [nome, descricao]
  );

  return result.insertId;
}

async function criarEtapa(fluxoId, { ordem, mensagem, offset_segundos }) {
  const [result] = await pool.query(
    `
    INSERT INTO fluxo_etapas (fluxo_id, ordem, mensagem, offset_segundos, criado_em)
    VALUES (?, ?, ?, ?, NOW())
    `,
    [fluxoId, ordem, mensagem, offset_segundos]
  );

  return result.insertId;
}

async function listarEtapas(fluxoId) {
  const [rows] = await pool.query(
    `
    SELECT * FROM fluxo_etapas
    WHERE fluxo_id = ?
    ORDER BY ordem ASC
    `,
    [fluxoId]
  );
  return rows;
}

async function getPrimeiraEtapa(fluxoId) {
  const [rows] = await pool.query(
    `
    SELECT * FROM fluxo_etapas
    WHERE fluxo_id = ?
    ORDER BY ordem ASC
    LIMIT 1
    `,
    [fluxoId]
  );
  return rows[0] || null;
}

async function getEtapaPorOrdemMaiorQue(fluxoId, ordemAtual) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM fluxo_etapas
    WHERE fluxo_id = ?
      AND ordem > ?
    ORDER BY ordem ASC
    LIMIT 1
    `,
    [fluxoId, ordemAtual]
  );
  return rows[0] || null;
}

module.exports = {
  criarFluxo,
  criarEtapa,
  listarEtapas,
  getPrimeiraEtapa,
  getEtapaPorOrdemMaiorQue,
};