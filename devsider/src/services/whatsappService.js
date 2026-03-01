const axios = require('axios');

const MOCK = process.env.MOCK_WPP === 'true';

async function sendMessage(telefone, mensagem) {
  if (MOCK) {
    console.log(`[MOCK WPP] Enviando para ${telefone}: ${mensagem}`);
    // simula um pequeno atraso
    await new Promise(res => setTimeout(res, 100));
    return true;
  }

  // Aqui entra chamada real ao WPPConnect
  // Ajusta URL, payload e headers conforme sua instância
  const url = `${process.env.WPPCONNECT_URL}/api/${process.env.WPPCONNECT_SESSION}/send-message`;

  const payload = {
    phone: telefone,
    message: mensagem,
  };

  const response = await axios.post(url, payload);
  // Ajusta essa condição de sucesso conforme o retorno do WPPConnect
  return response.data && response.data.status === 'success';
}

module.exports = {
  sendMessage,
};