"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const supertest_1 = __importDefault(require("supertest"));
//Função descibre é usada para agrupar os teste relacionados
describe('GET /saque', () => {
    //a função it define um teste individual no caso estou verificado se a rota /saque responde com um json
    it('responde com json', () => __awaiter(void 0, void 0, void 0, function* () {
        // função get do supertest para fazer uma solicitação GET para a rota /saque. A função get retorna uma Promise, então você usa await para esperar a resposta. A resposta é então armazenada na constante res   
        const res = yield (0, supertest_1.default)(app_1.default).get('/saque');
        //Finalmente, você está usando a função expect do Jest para verificar se a resposta tem o status 200 e se o corpo da resposta tem a propriedade resultado       
        expect(res.statusCode).toEqual(200);
        // A função toEqual verifica se o valor é igual ao esperado. A função toHaveProperty verifica se um objeto tem uma determinada propriedade.
        expect(res.body).toHaveProperty('resultado_saque');
    }));
});
