// tests/tasks.spec.js

// Importações de módulos necessários
import { tmpdir } from "os"; // Para obter o diretório temporário do sistema operacional
import path from "path"; // Para manipular caminhos de arquivos
import { promises as fs } from "fs"; // Para operações assíncronas de sistema de arquivos
import request from "supertest"; // Para simular requisições HTTP à aplicação
// Importações de funções de teste do Vitest
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"; 

let app; // Variável que irá armazenar a instância da aplicação (express)
let reset;
// Define o caminho para um arquivo de dados temporário, isolando os testes
const DATA_FILE = path.join(tmpdir(), `tasks.${Date.now()}.json`); 

// Hook: Executa uma vez antes de TODOS os testes. Configura o ambiente.
beforeAll(async () => {
  process.env.DATA_FILE = DATA_FILE;
  process.env.DISABLE_LIMITER = "true";
  const mod = await import("../app.js");
  app = mod.app;
  reset = mod.__resetInMemoryForTests; // pega o helper
  await fs.writeFile(DATA_FILE, "[]", "utf-8");
});
//Executa uma vez após TODOS os testes. Limpeza do ambiente.
afterAll(async () => {
    try { await fs.unlink(DATA_FILE); } catch {}
});

// Hook: Executa antes de CADA teste. Garante um estado inicial limpo.

beforeEach(async () => {
  await reset(); // zera memória e arquivo a cada teste
});
// --- Suíte de Testes: Healthcheck ---
describe("Healthcheck", () => {
    // Teste: A rota raiz deve responder com sucesso.
    it("GET / responde ok", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200); // Espera status 200
        expect(res.body.ok).toBe(true); // Espera { ok: true } no corpo
    });
});

// --- Suíte de Testes: Tasks CRUD ---
describe("Tasks CRUD", () => {
    // Teste: Criação de Tarefa
    it("POST /tasks cria tarefa e retorna 201 + Location", async () => {
        const res = await request(app)
            .post("/tasks")
            .send({ title: "Comprar pão", done: false }); // Envia o corpo da requisição

        expect(res.status).toBe(201); // Espera status 201 (Created)
        // Espera que o header 'Location' contenha o caminho para o novo recurso
        expect(res.headers.location).toMatch(/\/tasks\/\d+/); 
        // Espera que o corpo da resposta contenha as propriedades esperadas
        expect(res.body).toMatchObject({
            id: expect.any(Number),
            title: "Comprar pão",
            done: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
    });

    // Teste: Listagem de Tarefas
    it("GET /tasks lista tarefas", async () => {
        // Cria duas tarefas para popular a lista
        await request(app).post("/tasks").send({ title: "A", done: false });
        await request(app).post("/tasks").send({ title: "B", done: true });

        const res = await request(app).get("/tasks"); // Faz a requisição de listagem
        expect(res.status).toBe(200); // Espera status 200
        expect(res.body.length).toBe(2); // Espera que o array tenha 2 itens
    });

    // Teste: Suporte a Filtros (q e done)
    it("GET /tasks suporta filtro q e done", async () => {
        // Cria 3 tarefas com títulos e status variados
        await request(app).post("/tasks").send({ title: "Comprar pão", done: false });
        await request(app).post("/tasks").send({ title: "Estudar Node", done: true });
        await request(app).post("/tasks").send({ title: "Pão de queijo", done: true });

        // Teste de filtro por 'q' (busca por título)
        const res1 = await request(app).get("/tasks").query({ q: "pão" });
        // Espera que a lista contenha tarefas que incluam "pão" no título
        expect(res1.body.map(t => t.title)).toEqual(expect.arrayContaining(["Comprar pão", "Pão de queijo"]));

        // Teste de filtro por 'done'
        const res2 = await request(app).get("/tasks").query({ done: "true" });
        // Espera que TODAS as tarefas retornadas tenham done: true
        expect(res2.body.every(t => t.done === true)).toBe(true);
    });

    // Teste: Leitura de Tarefa Inexistente
    it("GET /tasks/:id retorna 404 se não existir", async () => {
        const res = await request(app).get("/tasks/999"); // ID que não existe
        expect(res.status).toBe(404); // Espera status 404 (Not Found)
    });

    // Teste: Atualização Completa (PUT)
    it("PUT /tasks/:id edita título e done", async () => {
        // Cria uma tarefa e obtém o ID
        const created = await request(app).post("/tasks").send({ title: "A", done: false });
        const id = created.body.id;

        // Atualiza a tarefa
        const res = await request(app).put(`/tasks/${id}`).send({ title: "A+", done: true });
        expect(res.status).toBe(200); // Espera status 200
        // Espera que as propriedades tenham sido atualizadas corretamente
        expect(res.body).toMatchObject({ id, title: "A+", done: true }); 
    });

    // Teste: Alternância de Status (PATCH /done) sem corpo
    it("PATCH /tasks/:id/done alterna done quando não enviado", async () => {
        // Cria uma tarefa com done: false
        const created = await request(app).post("/tasks").send({ title: "A", done: false });
        const id = created.body.id;

        // 1ª Chamada: deve inverter de false para true
        const res = await request(app).patch(`/tasks/${id}/done`).send({});
        expect(res.status).toBe(200);
        expect(res.body.done).toBe(true); // Verificando a inversão

        // 2ª Chamada: deve inverter de true para false
        const res2 = await request(app).patch(`/tasks/${id}/done`).send({});
        expect(res2.body.done).toBe(false); // Verificando a nova inversão
    });

    // Teste: Alternância de Status (PATCH /done) com corpo explícito
    it("PATCH /tasks/:id/done aceita done explícito", async () => {
        // Cria uma tarefa com done: false
        const created = await request(app).post("/tasks").send({ title: "B", done: false });
        const id = created.body.id;

        // Envia explicitamente done: true
        const res = await request(app).patch(`/tasks/${id}/done`).send({ done: true });
        expect(res.status).toBe(200);
        expect(res.body.done).toBe(true);
    });

    // Teste: Remoção de Tarefa
    it("DELETE /tasks/:id remove tarefa", async () => {
        // Cria uma tarefa
        const created = await request(app).post("/tasks").send({ title: "C", done: false });
        const id = created.body.id;

        const res = await request(app).delete(`/tasks/${id}`); // Deleta a tarefa
        expect(res.status).toBe(200); // Espera status 200
        expect(res.body).toMatchObject({ deleted: true }); // Espera confirmação de exclusão
    });
});

// --- Suíte de Testes: Validações e Erros ---
describe("Validações e erros", () => {
    // Teste: Validação dos campos 'title' e 'done' na criação
    it("POST /tasks valida title e done", async () => {
        // Caso 1: title ausente
        const r1 = await request(app).post("/tasks").send({ done: false });
        expect(r1.status).toBe(400); // Espera status 400 (Bad Request)

        // Caso 2: title vazio
        const r2 = await request(app).post("/tasks").send({ title: "", done: false });
        expect(r2.status).toBe(400);

        // Caso 3: done com tipo inválido (string em vez de boolean)
        const r3 = await request(app).post("/tasks").send({ title: "ok", done: "nope" });
        expect(r3.status).toBe(400);
    });

    // Teste: Validação dos tipos na atualização (PUT)
    it("PUT /tasks/:id valida tipos", async () => {
        // Cria uma tarefa para testar a atualização
        const created = await request(app).post("/tasks").send({ title: "A", done: false });
        const id = created.body.id;

        // Caso 1: title vazio
        const r1 = await request(app).put(`/tasks/${id}`).send({ title: "" });
        expect(r1.status).toBe(400);

        // Caso 2: done com tipo inválido
        const r2 = await request(app).put(`/tasks/${id}`).send({ done: "x" });
        expect(r2.status).toBe(400);
    });

    // Teste: Erro de JSON inválido no corpo da requisição
    it("retorna 400 para JSON inválido (body quebrado)", async () => {
        const res = await request(app)
            .post("/tasks")
            .set("Content-Type", "application/json")
            .send('{"title": "quebrado"'); // Envia JSON truncado/inválido
        expect(res.status).toBe(400); // Espera status 400
    });
});