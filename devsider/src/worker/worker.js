require('dotenv').config();
const filaRepo = require('../models/filaEnvioRepository');
const contatoRepo = require('../models/contatoRepository');
const fluxoRepo = require('../models/fluxoRepository');
const execucaoFluxoRepo = require('../models/execucaoFluxoRepository');
const whatsappService = require('../services/whatsappService');

// node src/worker/worker.js

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function processarItem(item) {
  try {
    await filaRepo.marcarProcessando(item.id);

    const contato = await contatoRepo.findById(item.contato_id);
    if (!contato || !contato.telefone) {
      await filaRepo.marcarErro(item.id, 'Contato sem telefone');
      
      // NOVA LÓGICA: Se for um fluxo, marca a execução com erro também
      if (item.tipo === 'FLUXO' && item.execucao_fluxo_id) {
        await execucaoFluxoRepo.marcarExecucaoComErro(item.execucao_fluxo_id);
      }
      return;
    }

    const ok = await whatsappService.sendMessage(contato.telefone, item.mensagem);

    if (!ok) {
      await filaRepo.marcarErro(item.id, 'Falha no envio WPP');
      
      // NOVA LÓGICA: Atualiza o status do fluxo para ERRO se o disparo falhar
      if (item.tipo === 'FLUXO' && item.execucao_fluxo_id) {
        await execucaoFluxoRepo.marcarExecucaoComErro(item.execucao_fluxo_id);
      }
      return;
    }

    await filaRepo.marcarEnviado(item.id);

    // Se for fluxo, avança para próxima etapa
    if (item.tipo === 'FLUXO' && item.execucao_fluxo_id) {
      const execucao = await execucaoFluxoRepo.findById(item.execucao_fluxo_id);
      if (!execucao) return;

      const etapaAtualOrdem = execucao.etapa_atual_ordem;
      const proximaEtapa = await fluxoRepo.getEtapaPorOrdemMaiorQue(item.fluxo_id, etapaAtualOrdem);

      if (!proximaEtapa) {
        // fluxo acabou para esse contato
        await execucaoFluxoRepo.atualizarExecucaoParaProximaEtapa(
          execucao.id,
          etapaAtualOrdem,
          null,
          'CONCLUIDO'
        );
        return;
      }

      const agora = new Date();
      const proximaExecucao = new Date(
        agora.getTime() + proximaEtapa.offset_segundos * 1000
      );

      await execucaoFluxoRepo.atualizarExecucaoParaProximaEtapa(
        execucao.id,
        proximaEtapa.ordem,
        proximaExecucao,
        'EM_ANDAMENTO'
      );

      // Enfileira próxima etapa
      await filaRepo.enqueueFluxo({
        fluxoId: item.fluxo_id,
        fluxoEtapaId: proximaEtapa.id,
        execucaoFluxoId: execucao.id,
        contatoId: item.contato_id,
        mensagem: proximaEtapa.mensagem,
        agendarPara: proximaExecucao,
      });
    }
  } catch (err) {
    console.error('Erro ao processar item da fila:', err);
    await filaRepo.marcarErro(item.id, err.message || 'Erro inesperado');
    
    // NOVA LÓGICA: Captura exceções não tratadas e trava o fluxo
    if (item && item.tipo === 'FLUXO' && item.execucao_fluxo_id) {
      await execucaoFluxoRepo.marcarExecucaoComErro(item.execucao_fluxo_id);
    }
  }
}

async function loop() {
  console.log('Worker iniciado. Lendo fila...');

  while (true) {
    const itens = await filaRepo.buscarPendentes(50);

    if (itens.length === 0) {
      // nada pra fazer, dorme um pouco
      await sleep(2000);
      continue;
    }

    for (const item of itens) {
      await processarItem(item);
    }
  }
}

loop().catch(err => {
  console.error('Erro fatal no worker:', err);
  process.exit(1);
});