const fluxoRepo = require('../models/fluxoRepository');
const execucaoFluxoRepo = require('../models/execucaoFluxoRepository');
const listaRepo = require('../models/listaRepository');
const contatoRepo = require('../models/contatoRepository');
const filaRepo = require('../models/filaEnvioRepository');

async function criarFluxo({ nome, descricao }) {
  return fluxoRepo.criarFluxo({ nome, descricao });
}

async function criarEtapa(fluxoId, dadosEtapa) {
  return fluxoRepo.criarEtapa(fluxoId, dadosEtapa);
}

async function adicionarListaAoFluxo(fluxoId, listaId) {
  // 1) Busca contatos da lista
  const contatos = await contatoRepo.findByLista(listaId);

  // 2) Busca etapa 1 (primeira ordem)
  const primeiraEtapa = await fluxoRepo.getPrimeiraEtapa(fluxoId);
  if (!primeiraEtapa) {
    throw new Error('Fluxo não possui etapas');
  }

  const agora = new Date();
  const offsetMs = primeiraEtapa.offset_segundos * 1000;

  for (const contato of contatos) {
    const proximaExecucao = new Date(agora.getTime() + offsetMs);

    // 3) Cria uma linha em execucao_fluxo
    const execucaoId = await execucaoFluxoRepo.criarExecucaoFluxo({
      fluxo_id: fluxoId,
      contato_id: contato.id,
      etapa_atual_ordem: primeiraEtapa.ordem,
      inicio_em: agora,
      proxima_execucao_em: proximaExecucao,
    });

    // 4) Insere na fila_envio para a primeira etapa
    await filaRepo.enqueueFluxo({
      fluxoId,
      fluxoEtapaId: primeiraEtapa.id,
      execucaoFluxoId: execucaoId,
      contatoId: contato.id,
      mensagem: primeiraEtapa.mensagem,
      agendarPara: proximaExecucao,
    });
  }

  return { totalContatos: contatos.length };
}

module.exports = {
  criarFluxo,
  criarEtapa,
  adicionarListaAoFluxo,
};