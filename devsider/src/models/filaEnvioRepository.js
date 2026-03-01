const pool = require('../config/db');

async function enqueueCampanha({ campanhaId, contatoId, mensagem, agendarPara }) {
  const [result] = await pool.query(
    `
    INSERT INTO fila_envio
      (contato_id, mensagem, tipo, campanha_id, agendar_para, status, criado_em)
    VALUES
      (?, ?, 'CAMPANHA', ?, ?, 'PENDENTE', NOW())
    `,
    [contatoId, mensagem, campanhaId, agendarPara]
  );

  return result.insertId;
}

async function enqueueFluxo({ fluxoId, fluxoEtapaId, execucaoFluxoId, contatoId, mensagem, agendarPara }) {
  const [result] = await pool.query(
    `
    INSERT INTO fila_envio
      (contato_id, mensagem, tipo, fluxo_id, fluxo_etapa_id, execucao_fluxo_id, agendar_para, status, criado_em)
    VALUES
      (?, ?, 'FLUXO', ?, ?, ?, ?, 'PENDENTE', NOW())
    `,
    [contatoId, mensagem, fluxoId, fluxoEtapaId, execucaoFluxoId, agendarPara]
  );

  return result.insertId;
}

async function buscarPendentes(limit = 50) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM fila_envio
    WHERE status = 'PENDENTE'
      AND agendar_para <= NOW()
    ORDER BY agendar_para ASC
    LIMIT ?
    `,
    [limit]
  );
  return rows;
}

async function marcarProcessando(id) {
  await pool.query(
    `
    UPDATE fila_envio
    SET status = 'PROCESSANDO', atualizado_em = NOW()
    WHERE id = ?
    `,
    [id]
  );
}

async function marcarEnviado(id) {
  await pool.query(
    `
    UPDATE fila_envio
    SET status = 'ENVIADO', enviado_em = NOW(), tentativas = tentativas + 1, atualizado_em = NOW()
    WHERE id = ?
    `,
    [id]
  );
}

async function marcarErro(id, erroMsg) {
  await pool.query(
    `
    UPDATE fila_envio
    SET status = 'ERRO', tentativas = tentativas + 1, erro_msg = ?, atualizado_em = NOW()
    WHERE id = ?
    `,
    [erroMsg, id]
  );
}


module.exports = {
  enqueueCampanha,
  enqueueFluxo,
  buscarPendentes,
  marcarProcessando,
  marcarEnviado,
  marcarErro,
};