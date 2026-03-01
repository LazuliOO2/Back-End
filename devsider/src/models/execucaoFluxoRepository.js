const pool = require('../config/db');

async function criarExecucaoFluxo({ fluxo_id, contato_id, etapa_atual_ordem, inicio_em, proxima_execucao_em }) {
  const [result] = await pool.query(
    `
    INSERT INTO execucao_fluxo
      (fluxo_id, contato_id, inicio_em, ultimo_envio_em, etapa_atual_ordem, status, proxima_execucao_em, criado_em)
    VALUES
      (?, ?, ?, NULL, ?, 'EM_ANDAMENTO', ?, NOW())
    `,
    [fluxo_id, contato_id, inicio_em, etapa_atual_ordem, proxima_execucao_em]
  );

  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM execucao_fluxo WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function atualizarExecucaoParaProximaEtapa(execucaoId, novaOrdem, proximaExecucao, status = 'EM_ANDAMENTO') {
  await pool.query(
    `
    UPDATE execucao_fluxo
    SET etapa_atual_ordem = ?, proxima_execucao_em = ?, ultimo_envio_em = NOW(), status = ?, atualizado_em = NOW()
    WHERE id = ?
    `,
    [novaOrdem, proximaExecucao, status, execucaoId]
  );
}

async function marcarExecucaoComErro(execucaoId) {
  await pool.query(
    `
    UPDATE execucao_fluxo
    SET status = 'CANCELADO', atualizado_em = NOW()
    WHERE id = ?
    `,
    [execucaoId]
  );
}

module.exports = {
  criarExecucaoFluxo,
  findById,
  atualizarExecucaoParaProximaEtapa,
  marcarExecucaoComErro,
};