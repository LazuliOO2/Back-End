// Bibliotecas necessárias
// ? Server para criar o servidor
import express from "express";
// ? permitir que a API seja acessada por aplicações web de diferentes origens (domínios)
import cors from "cors";
// ?  Este módulo fornece métodos para interagir com o sistema de arquivos, como ler, escrever, renomear e excluir arquivos
import { promises as fs } from "fs";
// ? ajuda a construir caminhos de forma segura e consistente, independentemente do sistema operacional 
import path from "path";
// ? Esta função converte uma URL de arquivo (como file:///path/to/module.js) em um caminho de arquivo legível pelo sistema operacional
import { fileURLToPath } from "url";
// ? Número máximo de requisição que pode fazer ao serviço
import rateLimit from "express-rate-limit";
// ? um middleware de segurança para aplicações Express.js
import helmet from "helmet";

// ? Obtém o arquivo e converter para um caminho de arquivo padrão do sistema operacional
const __filename = fileURLToPath(import.meta.url);
// ?  extrai o diretório de um caminho completo de arquivo
const __dirname = path.dirname(__filename);
// ? Constrói o caminho completo para um arquivo de dados chamado tasks.json
const DATA_FILE = path.join(__dirname,process.env.DATA_FILE ??  "tasks.json");

const limiter = rateLimit({
// ? 15 (min) * 60 (seg) * 1000 (ms) = 900_000 ms
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP nesse tempo
  standardHeaders: true,   // expõe RateLimit-* headers
  legacyHeaders: false,    // desativa X-RateLimit-*
  message: "Muitas requisições deste IP. Tente novamente mais tarde."
});



// Configurações iniciais
const app = express();

// ? habilita a proteção
app.use(helmet());

// ? Habilita o CORS para todas as rotas.
app.use(cors());

// ? habilita o número maximo de requisição por m
if (process.env.DISABLE_LIMITER !== "true") {
  app.use(limiter);
}

// ? Configura o servidor para entender requisições que enviam dados no formato JSON no corpo 
// ? limit: "200kb" significa:👉 Tamanho máximo do corpo (body) da requisição em JSON que a sua API vai aceitar.200kb = 200 kilobytes (aprox. 0,2 MB ou 200.000 caracteres de texto)
app.use(express.json({ limit: "200kb" }));

// "Banco de dados" em memória
// ? Um array que vai guardar todas as tarefas.
let tasks = [];
// ? Um contador simples para garantir que cada nova tarefa tenha um id único
let nextId = 1;

async function loadTasks() {
  try {
// ?ler o conteúdo do arquivo  
    const raw = await fs.readFile(DATA_FILE, "utf-8");
// ?converte em um objeto ou array JavaScript
    tasks = JSON.parse(raw);

    // garante que nextId continue único
// ? calcula o maior ID existente no array de tarefas,m: É o acumulador,t: É o item da tarefa atual.Compara o ID máximo atual (m) com o ID da tarefa atual (t.id). O ?? 0 (Operador Nullish Coalescing) garante que, se t.id for null ou undefined, ele use 0 para a comparação.
    const maxId = tasks.reduce((m, t) => Math.max(m, t.id ?? 0), 0);
// ? Define a variável global nextId como o próximo ID disponíve
    nextId = maxId + 1;
  } catch (err) {
    // Se o arquivo não existe ainda, começamos vazio
    if (err.code !== "ENOENT") {
      console.error("Erro lendo tasks.json:", err);
    }
    tasks = [];
    nextId = 1;
  }
}

// Grava no disco sempre que mudar (com leve debounce p/ evitar spam de I/O)
let saveTimer = null;
async function saveTasks() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const tmp = DATA_FILE + ".tmp";
    const data = JSON.stringify(tasks, null, 2);
    try {
      await fs.writeFile(tmp, data, "utf-8"); // write atomic (tmp + rename)
      await fs.rename(tmp, DATA_FILE);
    } catch (err) {
      console.error("Erro salvando tasks.json:", err);
    }
  }, 50);
}

// ---------- “Banco em memória” (preenchido pelo load) ----------
await loadTasks();


// Função Auxiliar (Helper)
// ? Uma função interna para encontrar uma tarefa no array tasks pelo seu id
const findTask = (id) => tasks.find((t) => t.id === Number(id));

// Endpoints (As Rotas da API)
// ? Serve apenas para confirmar que a API está no ar e funcionando
app.get("/", (req, res) => {
  res.json({ ok: true, service: "todo-api", version: "1.0.0" });
});

app.get("/tasks", (req, res) => {
// ? q: texto para busca;done: string que indica se quer só tarefas concluídas ("true") ou não ("false"
  const { q, done } = req.query;
// ? Copia o array original tasks para result usando slice().Assim você trabalha em cima de uma cópia e não altera o array original.
  let result = tasks.slice();
// ? Verifica se q é uma string e não é vazia depois de trim() (remove espaços no começo/fim)
  if (typeof q === "string" && q.trim()) {
// ? pega q, tira espaços nas pontas e põe em minúsculas para fazer busca case-insensitive
    const needle = q.trim().toLowerCase();
// ? Filtra result para manter apenas tarefas cujo title, em minúsculas, contém o texto needle.includes faz busca por substring
    result = result.filter((t) => t.title.toLowerCase().includes(needle));
  }

  if (done === "true" || done === "false") {
    const flag = done === "true";
// ? Filtra result mantendo só as tarefas cujo campo booleano t.done bate com flag.Ex.: se flag é true, ficam só as concluídas
    result = result.filter((t) => t.done === flag);
  }

  res.json(result);
});

app.get("/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task não encontrada" });
  res.json(task);
});

app.post("/tasks", (req, res) => {
// ? Extrai 'title' e 'done' do corpo; se req.body for undefined, usa {};'done = false' define valor padrão (se não vier no body)
  const { title, done = false } = req.body || {};
// ? Valida: title precisa existir, ser string e não ser vazio
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title é obrigatório (string)" });
  }
// ? Valida: 'done' precisa ser boolean
  if (typeof done !== "boolean") {
    return res.status(400).json({ error: "done deve ser boolean" });
  }
// ? Monta o objeto da nova tarefa
  const task = {
    id: nextId++,
    title: title.trim(),
    done,
// ? Timestamp de criação em ISO
    createdAt: new Date().toISOString(),
// ? Timestamp de atualização
    updatedAt: new Date().toISOString(),
  };
// ? Adiciona a nova tarefa ao array em memória 'tasks'
  tasks.push(task);
  saveTasks();
  res.status(201)
// ? Define o header Location apontando para o recurso recém-criado
    .location(`/tasks/${task.id}`)
// ? Devolve a tarefa criada em JSON no corpo da resposta
    .json(task);
});


app.put("/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task não encontrada" });

  const { title, done } = req.body || {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title deve ser string não vazia" });
    }
    task.title = title.trim();
  }
  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "done deve ser boolean" });
    }
    task.done = done;
  }
// ? new Date() – Cria um novo objeto de data/hora com o momento atual (agora).toISOString() – Converte essa data para uma string no formato ISO 8601
  task.updatedAt = new Date().toISOString();
  saveTasks();
  res.json(task);
});


app.patch("/tasks/:id/done", (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task não encontrada" });

  const { done } = req.body || {};
  if (done === undefined) {
    task.done = !task.done;
  } else {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "done deve ser boolean" });
    }
    task.done = done;
  }
  task.updatedAt = new Date().toISOString();
  saveTasks();
  res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Task não encontrada" });

  const [removed] = tasks.splice(idx, 1);
  saveTasks();
  res.json({ deleted: true, task: removed });
});

// --- Rota de rate limit para testes (apenas em NODE_ENV=test) ---
if (process.env.NODE_ENV === "test") {
  const unitTestLimiter = rateLimit({
    windowMs: 10_000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    // 👇 troque de string para objeto para sair application/json
    message: { message: "Too many requests (test limiter)." },
    keyGenerator: () => "test-key",
  });

  app.get("/__rl/ping", unitTestLimiter, (req, res) => res.json({ ok: true }));
}


app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição" });
  }
  return next(err);
});

// -------- Middlewares de erro (DEPOIS das rotas) --------

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

process.on("SIGINT", async () => {
  try {
    if (saveTimer) clearTimeout(saveTimer);
    const tmp = DATA_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(tasks, null, 2), "utf-8");
    await fs.rename(tmp, DATA_FILE);
  } catch (e) {
    console.error("Falha ao salvar no shutdown:", e);
  } finally {
    process.exit(0);
  }
});

// --- helper de reset p/ testes ---
async function __resetInMemoryForTests() {
  tasks = [];
  nextId = 1;
  try {
    const tmp = DATA_FILE + ".tmp";
    await fs.writeFile(tmp, "[]", "utf-8");
    await fs.rename(tmp, DATA_FILE);
  } catch (e) {
    // ok se o arquivo não existir
  }
}

// Exporte 
export { app, __resetInMemoryForTests };



