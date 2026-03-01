const express = require('express');
const router = express.Router();

const campanhaService = require('../services/campanhaService');

// POST /campanhas
router.post('/campanhas', async (req, res) => {
  try {
    const { nome, mensagem, delay_min_segundos, delay_max_segundos, listaIds } = req.body;

    if (!nome || !mensagem || !delay_min_segundos || !delay_max_segundos || !Array.isArray(listaIds)) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, mensagem, delay_min_segundos, delay_max_segundos, listaIds[]' });
    }

    const campanhaId = await campanhaService.criarCampanhaComListas(
      { nome, mensagem, delay_min_segundos, delay_max_segundos },
      listaIds
    );

    res.status(201).json({ id: campanhaId });
  } catch (err) {
    console.error('Erro ao criar campanha:', err);
    res.status(500).json({ error: 'Erro interno ao criar campanha' });
  }
});

// POST /campanhas/:id/disparar
router.post('/campanhas/:id/disparar', async (req, res) => {
  try {
    const campanhaId = parseInt(req.params.id, 10);
    const resultado = await campanhaService.dispararCampanha(campanhaId);

    res.json({
      message: 'Campanha enfileirada',
      campanhaId,
      ...resultado,
    });
  } catch (err) {
    console.error('Erro ao disparar campanha:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao disparar campanha' });
  }
});

module.exports = router;