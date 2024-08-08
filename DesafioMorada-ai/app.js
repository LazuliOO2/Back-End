"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//importa framework necessaria para funciona
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
// criamos uma nova aplicação Express e atribuímos a uma constante app com o tipo Application
const app = (0, express_1.default)();
//Definimos a porta 3000 para o servidor ouvir.
const port = 3000;
//Definimos uma rota GET para o caminho /saque. Quando essa rota é acessada, a função callback com os parâmetros req (Request) e res (Response) é chamada.
app.get('/saque', (req, res) => {
    //Dentro da função callback, usamos exec para executar o comando python app.py 168. Isso executa o script Python com o argumento 168. A função callback do exec recebe error, stdout e stderr.
    (0, child_process_1.exec)('python app.py 167', (error, stdout, stderr) => {
        //Se houver um erro na execução do script Python, enviamos uma resposta com status 500 e uma mensagem de erro.
        if (error) {
            return res.status(500).send('Erro ao executar o script Python');
        }
        //Tentamos analisar a saída padrão (stdout) como JSON. Se for bem-sucedido, enviamos o resultado como uma resposta JSON. Se ocorrer um erro na análise, enviamos uma resposta com status 500 e uma mensagem de erro.
        try {
            const resultado = JSON.parse(stdout);
            res.json(resultado);
        }
        catch (e) {
            res.status(500).send('Erro ao analisar a saída do script Python');
        }
    });
});
exports.default = app;
