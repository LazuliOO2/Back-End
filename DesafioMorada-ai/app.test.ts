import app from './app';
import request from 'supertest';
//Função descibre é usada para agrupar os teste relacionados
describe('GET /saque', () => {
//a função it define um teste individual no caso estou verificado se a rota /saque responde com um json
    it('responde com json', async () => {
// função get do supertest para fazer uma solicitação GET para a rota /saque. A função get retorna uma Promise, então você usa await para esperar a resposta. A resposta é então armazenada na constante res   
        const res = await
        request (app).get ('/saque');
//Finalmente, você está usando a função expect do Jest para verificar se a resposta tem o status 200 e se o corpo da resposta tem a propriedade resultado       
        expect(res.statusCode).toEqual(200);
// A função toEqual verifica se o valor é igual ao esperado. A função toHaveProperty verifica se um objeto tem uma determinada propriedade.
        expect(res.body).toHaveProperty('resultado_saque');
    });
});