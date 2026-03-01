const express = require('express');
const router = express.Router();

const fluxoService = require('../services/fluxoService');

// POST /fluxos
router.post('/fluxos', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const fluxoId = await fluxoService.criarFluxo({ nome, descricao });
    res.status(201).json({ id: fluxoId });
  } catch (err) {
    console.error('Erro ao criar fluxo:', err);
    res.status(500).json({ error: 'Erro interno ao criar fluxo' });
  }
});

// POST /fluxos/:id/etapas
router.post('/fluxos/:id/etapas', async (req, res) => {
  try {
    const fluxoId = parseInt(req.params.id, 10);
    const { ordem, mensagem, offset_segundos } = req.body;

    if (!ordem || !mensagem || offset_segundos == null) {
      return res.status(400).json({ error: 'Campos obrigatórios: ordem, mensagem, offset_segundos' });
    }

    const etapaId = await fluxoService.criarEtapa(fluxoId, {
      ordem,
      mensagem,
      offset_segundos,
    });

    res.status(201).json({ id: etapaId });
  } catch (err) {
    console.error('Erro ao criar etapa:', err);
    res.status(500).json({ error: 'Erro interno ao criar etapa' });
  }
});

// POST /fluxos/:id/adicionar-lista
router.post('/fluxos/:id/adicionar-lista', async (req, res) => {
  try {
    const fluxoId = parseInt(req.params.id, 10);
    const { listaId } = req.body;

    if (!listaId) {
      return res.status(400).json({ error: 'listaId é obrigatório' });
    }

    const resultado = await fluxoService.adicionarListaAoFluxo(fluxoId, listaId);

    res.json({
      message: 'Lista adicionada ao fluxo e mensagens enfileiradas',
      fluxoId,
      listaId,
      ...resultado,
    });
  } catch (err) {
    console.error('Erro ao adicionar lista ao fluxo:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao adicionar lista ao fluxo' });
  }
});

module.exports = router;