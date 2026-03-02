const campanhaRepo = require('../models/campanhaRepository');
const listaRepo = require('../models/listaRepository');
const contatoRepo = require('../models/contatoRepository');
const filaRepo = require('../models/filaEnvioRepository');

function randomDelaySegundos(min, max) {
  const minInt = parseInt(min, 10);
  const maxInt = parseInt(max, 10);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}

async function criarCampanhaComListas(dadosCampanha, listaIds) {
  const campanhaId = await campanhaRepo.createCampanha(dadosCampanha);
  await campanhaRepo.vincularListas(campanhaId, listaIds);
  return campanhaId;
}

async function dispararCampanha(campanhaId) {
  const campanha = await campanhaRepo.findById(campanhaId);
  if (!campanha) {
    throw new Error('Campanha não encontrada');
  }

  const listaIds = await campanhaRepo.getListasDaCampanha(campanhaId);

  // pega todos os contatos de todas as listas (sem deduplicar)
  let contatos = [];
  for (const listaId of listaIds) {
    const contatosLista = await contatoRepo.findByLista(listaId);
    contatos = contatos.concat(contatosLista);
  }

  //  remover duplicados pelo id
  const vistos = new Set();
  const contatosUnicos = [];
  for (const c of contatos) {
    if (!vistos.has(c.id)) {
      vistos.add(c.id);
      contatosUnicos.push(c);
    }
  }
  
let momentoAgendamento = new Date();

for (const contato of contatosUnicos) {
  const delaySeg = randomDelaySegundos(
    campanha.delay_min_segundos,
    campanha.delay_max_segundos
  );

  momentoAgendamento = new Date(momentoAgendamento.getTime() + delaySeg * 1000);

  await filaRepo.enqueueCampanha({
    campanhaId,
    contatoId: contato.id,
    mensagem: campanha.mensagem,
    agendarPara: momentoAgendamento,
  });
}

  return {
    totalContatos: contatosUnicos.length,
  };
}

module.exports = {
  criarCampanhaComListas,
  dispararCampanha,
};