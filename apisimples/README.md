
# 📝 Todo API

## 📌 Descrição
Esta é uma API simples para gerenciamento de tarefas (*To-Do List*) desenvolvida em **Node.js** com **Express.js**.  
Ela permite **criar, listar, atualizar, filtrar, concluir e excluir tarefas**, utilizando um “banco de dados” em memória com persistência em arquivo JSON.

> 💡 Esta versão foi criada de forma simples e didática.  
> Caso deseje uma API mais completa,veja aqui:  
> 👉 [Photo Blog API Completa](https://github.com/LazuliOO2/Back-End/tree/main/photo-blog)

---

## 🚀 Tecnologias Utilizadas
- Node.js  
- Express.js  
- Helmet — Cabeçalhos de segurança  
- CORS — Permitir acesso externo  
- Express-rate-limit — Limitação de requisições  
- Vitest + Supertest — Testes automatizados  

---

## ⚙️ Instalação

1. Clone o repositório:
   ```sh
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DO_REPOSITORIO>
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. (Opcional) Crie um arquivo `.env` para personalizar variáveis:
   ```env
   PORT=3000
   DATA_FILE=tasks.json
   DISABLE_LIMITER=true
   ```

4. Inicie o servidor:
   ```sh
   npm start
   ```
   Ou em modo de desenvolvimento:
   ```sh
   npm run dev
   ```

---

## 📂 Estrutura do Projeto
```
📂 todo-api
├── 📄 README.md              → Documentação principal
├── 📄 server.js              → Inicializa o servidor
├── 📄 app.js                 → Configuração e rotas da API
├── 📂 __tests__/             → Testes automatizados
│   ├── security.spec.js      → Testes de segurança
│   └── tasks.spec.js         → Testes de CRUD e validações
├── 📄 tasks.json             → "Banco de dados" em arquivo
└── 📄 .gitignore             → Arquivos ignorados pelo Git
```

---

## 📡 Rotas Disponíveis

### ✅ Healthcheck
- **GET /** — Verifica se a API está online
  ```json
  {
    "ok": true,
    "service": "todo-api",
    "version": "1.0.0"
  }
  ```

---

### 📋 Tarefas (`/tasks`)

- **GET /tasks** — Lista todas as tarefas  
  - Filtros opcionais:
    - `?q=` — busca por título  
    - `?done=true|false` — filtra por status  

- **GET /tasks/:id** — Retorna uma tarefa específica

- **POST /tasks** — Cria uma nova tarefa  
  ```json
  {
    "title": "Estudar Node.js",
    "done": false
  }
  ```

- **PUT /tasks/:id** — Atualiza título e status  
  ```json
  {
    "title": "Estudar Express.js",
    "done": true
  }
  ```

- **PATCH /tasks/:id/done** — Alterna ou define status de conclusão  
  ```json
  {
    "done": true
  }
  ```

- **DELETE /tasks/:id** — Remove uma tarefa

---

## 🧪 Testes

Execute todos os testes automatizados com:
```sh
npm test
```

Os testes cobrem:
- Headers de segurança (Helmet)  
- Limite de requisições  
- CRUD completo de tarefas  
- Validações de entrada  
- Manipulação de erros  

---

## 📬 Testando com Insomnia ou Postman

### Criar Tarefa
**POST** `http://localhost:3000/tasks`
```json
{
  "title": "Ler documentação do Express",
  "done": false
}
```

### Atualizar Status
**PATCH** `http://localhost:3000/tasks/1/done`
```json
{
  "done": true
}
```

### Deletar Tarefa
**DELETE** `http://localhost:3000/tasks/1`

---

## 🤝 Contribuição
Sinta-se livre para contribuir enviando um **Pull Request** ou abrindo uma **Issue** com sugestões e melhorias.

---

## 📜 Licença
Este projeto está sob a licença MIT.
