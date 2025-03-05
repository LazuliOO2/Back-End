# Photo Blog API

## Descrição
Essa API permite o gerenciamento de usuários e fotos em um blog de imagens. Inclui funcionalidades como registro e login de usuários, upload de imagens, atualização e exclusão de fotos.

## Tecnologias Utilizadas
- Node.js
- Express.js
- MySQL
- JWT (JSON Web Token) para autenticação
- Bcrypt para hash de senhas
- Multer para upload de imagens
- Dotenv para gerenciamento de variáveis de ambiente
- Jest e Supertest para testes

## Instalação

1. Clone o repositório:
   ```sh
   git clone  <URL_DO_REPOSITORIO>
   cd <NOME_DO_REPOSITORIO>
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
## 🛑 Atenção: Arquivo `.env`
O arquivo `.env` contém credenciais sensíveis e **não deve ser compartilhado** ou versionado no Git. Para garantir isso, o `.gitignore` já inclui o `.env`.

3. Configure o arquivo `.env` com suas credenciais do MySQL:
   ```env
   MYSQL_DATABASE=photoblog
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_HOST=127.0.0.1
   DB_PORT=3306
   PORT=3000
   JWT_SECRET=asdsallksa
   JWT_SECRET_REFRESH=dadisdsakdks
   ```
5. Inicie o servidor:
   ```sh
   npm start
   ```

## Estrutura do Projeto
```
photo-blog-api/
│── config.js           # Configuração do banco de dados
│── app.js              # Arquivo principal da API
│── .env                # Variáveis de ambiente
│── models/             # Modelos de dados (Usuários e Fotos)
│── controllers/        # Lógica de negócio
│── routes/             # Definição de rotas
│── middleware/         # Middleware de autenticação
│── uploads/            # Diretório para armazenar imagens
│── __tests__/          # Testes unitários e de integração
```

## Rotas

### Autenticação (`/auth`)

- **POST /auth/register** - Registra um novo usuário
  ```json
  {
    "username": "seuNome",
    "email": "seuemail@gmail.com",
    "password": "suaSenha"
  }
  ```
- **POST /auth/login** - Realiza login e retorna um token JWT
  ```json
  {
    "email": "seuemail@gmail.com",
    "password": "suaSenha"
  }
  ```
- **POST /auth/refresh-token** - Gera um novo token de acesso
  ```json
  {
    "refreshToken": "seuRefreshToken"
  }
  ```
- **GET /auth/verify-token** - Verifica se o token é válido
- **PUT /auth/update** - Atualiza dados do usuário (com token)
  ```json
  {
    "username": "novoNome"
  }
  ```
- **DELETE /auth/delete** - Exclui conta do usuário (com token)

### Fotos (`/photos`)

- **POST /photos/upload** - Upload de foto (requer autenticação, multipart/form-data)
- **POST /photos/upload-generated** - Upload de imagem via URL
  ```json
  {
    "title": "Natureza",
    "description": "Foto criada",
    "imageUrl": "/uploads/lindo.webp"
  }
  ```
- **GET /photos** - Lista todas as fotos
- **PUT /photos/update/:id** - Atualiza título e descrição da foto
  ```json
  {
    "title": "Novo Título",
    "description": "Nova Descrição"
  }
  ```
- **PUT /photos/update-image/:id** - Atualiza a imagem (requer autenticação, multipart/form-data)
- **DELETE /photos/delete/:id** - Exclui foto (somente dono da foto pode excluir)

## Testes
Os testes são feitos com Jest e Supertest. Para rodar:
```sh
npm test
```

## Testando com Insomnia/Postman
Para testar as rotas manualmente, siga os passos abaixo:

### Testando Registro de Usuário no Insomnia/Postman
1. Abra o Insomnia/Postman.
2. Crie uma nova requisição **POST**.
3. Insira a URL: `http://localhost:3000/auth/register`.
4. Vá para a aba **Body** e selecione o formato **JSON**.
5. Insira o seguinte conteúdo:
   ```json
   {
     "username": "testeuser",
     "email": "teste@email.com",
     "password": "senha123"
   }
   ```
6. Clique em **Send** e verifique a resposta da API.

### Testando Login de Usuário
1. Crie uma nova requisição **POST** com a URL: `http://localhost:3000/auth/login`.
2. No **Body**, insira:
   ```json
   {
     "email": "teste@email.com",
     "password": "senha123"
   }
   ```
3. Após enviar, a resposta deve conter um **token JWT**.
4. Copie o token e use no cabeçalho das próximas requisições que exigem autenticação.

### Testando Upload de Foto
1. Crie uma nova requisição **POST** com a URL: `http://localhost:3000/photos/upload`.
2. Vá para a aba **Auth** e selecione **Bearer Token**.
3. Cole o token obtido no login.
4. No **Body**, selecione **Multipart** e adicione os seguintes campos:
   - **title**: "Minha Foto"
   - **description**: "Foto de teste"
   - **image**: selecione um arquivo de imagem do seu computador.
5. Clique em **Send** e verifique se a foto foi enviada com sucesso.

## Contribuição
Sinta-se livre para contribuir enviando um **Pull Request** ou abrindo uma **Issue**.

## Licença
Este projeto está sob a licença MIT.
