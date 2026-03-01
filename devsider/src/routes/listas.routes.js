
const express = require('express');
const router = express.Router();

const contatoRepository = require('../models/contatoRepository');
const listaRepository = require('../models/listaRepository');

// POST /listas  -> cria lista
router.post('/listas', async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const listaId = await listaRepository.createLista(nome);

    res.status(201).json({ id: listaId, nome });
  } catch (err) {
    console.error('Erro ao criar lista:', err);
    res.status(500).json({ error: 'Erro interno ao criar lista' });
  }
});

// POST /listas/:id/importar-csv
// body: { csv: "nome;email;telefone\n..." } 
router.post('/listas/:id/importar-csv', async (req, res) => {
  try {
    const listaId = parseInt(req.params.id, 10);
    const { csv } = req.body;

    if (!csv || !listaId) {
      return res.status(400).json({ error: 'listaId e csv são obrigatórios' });
    }

    const linhas = csv.split('\n').map(l => l.trim()).filter(Boolean);

    // Supondo cabeçalho na primeira linha: nome;email;telefone
    const header = linhas.shift(); 

    let importados = 0;
    let ignorados = 0; // NOVA VARIÁVEL: Conta quantos foram ignorados no backend

    for (const linha of linhas) {
      const partes = linha.split(';'); // ou ',' se usar vírgula

      const nome = partes[0]?.trim() || null;
      const email = partes[1]?.trim() || null;
      const telefone = partes[2]?.trim() || null;

      if (!telefone) {
        ignorados++; // Conta que foi ignorado
        continue; // sem telefone, não faz sentido salvar
      }

      const contatoId = await contatoRepository.createOrUpdateByTelefone({
        nome,
        email,
        telefone,
      });

      await listaRepository.addContatoNaLista(listaId, contatoId);
      importados++;
    }

    //  Se iterou por tudo e não salvou ninguém, recusa.
    if (importados === 0) {
      return res.status(400).json({ error: 'Nenhum contato com telefone válido foi encontrado para ser importado.' });
    }

    // Retorna também os ignorados
    res.json({
      message: 'Importação concluída',
      listaId,
      totalLinhas: linhas.length,
      importados,
      ignorados,
    });
  } catch (err) {
    console.error('Erro ao importar CSV:', err);
    res.status(500).json({ error: 'Erro interno ao importar CSV' });
  }
});

router.post('/listas/:id/adicionar-contato', async (req, res) => {
  try {
    const listaId = parseInt(req.params.id, 10);
    const { nome, email, telefone } = req.body;

    if (!telefone) {
      return res.status(400).json({ error: 'Telefone é obrigatório' });
    }

    // Cria ou atualiza o contato pelo telefone e pega o ID dele
    const contatoId = await contatoRepository.createOrUpdateByTelefone({
      nome,
      email,
      telefone,
    });

    // Vincula o contato à lista
    await listaRepository.addContatoNaLista(listaId, contatoId);

    res.status(200).json({ 
      message: 'Contato adicionado à lista com sucesso!', 
      contatoId 
    });
  } catch (err) {
    console.error('Erro ao adicionar contato:', err);
    res.status(500).json({ error: 'Erro interno ao adicionar contato' });
  }
});

module.exports = router;