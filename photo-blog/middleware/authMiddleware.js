// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
// req (requisição do cliente),
//res (resposta que será enviada ao cliente),
//next (função que permite seguir para o próximo middleware ou rota, se a verificação for bem-sucedida).
module.exports = (req, res, next) => {
// req.header('Authorization'): Obtém o valor do cabeçalho Authorization da requisição, onde o token geralmente é passado.
//.replace('Bearer ', ''): Remove a palavra "Bearer" do início do token, caso o cabeçalho contenha o prefixo "Bearer ", deixando apenas o token em si.
//Obs: Esse formato ("Bearer token") é comum em APIs REST para enviar o token no cabeçalho.
  const token = req.header('Authorization').replace('Bearer ', '');
// Aqui, o código verifica se o token existe. Caso esteja ausente, envia uma resposta com o status 401 (não autorizado) e uma mensagem "Acesso negado"
  if (!token) return res.status(401).json({ message: 'Acesso negado' });

  try {
//  Verifica o token com o método verify. Isso garante que o token foi criado usando o segredo JWT_SECRET armazenado em uma variável de ambiente (process.env.JWT_SECRET). Se for válido, o conteúdo do token é decodificado e retornado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
//  Armazena o conteúdo decodificado (decoded) no objeto
    req.user = decoded;
// Passa o controle para o próximo middleware ou rota protegida
// Se next() não fosse chamado, a requisição pararia nesse middleware. Ou seja, mesmo que o token fosse válido, o usuário não conseguiria acessar a rota protegida
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token inválido' });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization; // O token geralmente vem no cabeçalho Authorization

  if (!token) {
      return res.status(401).json({ message: 'Token ausente' });
  }

  // Remova 'Bearer ' do token se estiver presente
  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(403).json({ message: 'Token inválido ou expirado' });
      }

      req.user = decoded; // Adiciona os dados do usuário ao req para uso posterior
      next(); // Permite continuar para a próxima função
  });
};

module.exports = verifyToken;