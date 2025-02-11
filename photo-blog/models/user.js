const db = require('../config');
const bcrypt = require('bcrypt');

async function CreateUser(username, email, password) {
//  Aqui, o bcrypt.hash() é usado para criptografar a senha. O número 10 representa o fator de custo, que indica o "nível" de complexidade da criptografia.
    const hashedPassword = await bcrypt.hash(password,10);
// A Promise em JavaScript representa uma operação assíncrona, ou seja, uma operação que pode demorar algum tempo para ser concluída, como buscar dados de um banco de dados ou carregar um arquivo. Ela permite que você defina o que deve acontecer quando essa operação for concluída com sucesso ou se ocorrer um erro.
    return new Promise((resolve,reject) =>{
        const query = 'INSERT INTO users(username, email, password) VALUES (?, ?, ?)';
        db.query (query,[username,email,hashedPassword],(err,results) =>{
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// função para encontrar o usuario do email
function findUserByEmail(email){
    return new Promise((resolve,reject)=>{
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query (query,[email],(err,results)=>{
            if (err) return reject(err);
// results contém o array de resultados retornado pela query SQL SELECT * FROM users WHERE email = ?.
//Como estamos usando WHERE email = ?, esperamos que essa query retorne, no máximo, um único usuário, pois estamos filtrando pelo email, que deve ser único no banco de dados.
//results[0] acessa o primeiro (e, neste caso, único) resultado do array results. Em vez de retornar um array com apenas um elemento, estamos retornando o próprio objeto do usuário, que é mais direto e simplifica o uso dos dados.
            resolve(results[0]);
        });
    });
}

// **Função para atualizar usuário**
async function updateUser(userId, newData) {
    return new Promise(async (resolve, reject) => {
        let { username, email, password } = newData;

        // Se o usuário fornecer uma nova senha, criptografa antes de salvar
        if (password) {
            password = await bcrypt.hash(password, 10);
        }
        // A cláusula SET em SQL é usada para especificar quais colunas você deseja atualizar em uma tabela e quais valores você deseja atribuir a elas
       // A função COALESCE é uma função SQL que retorna o primeiro valor não nulo em uma lista de expressões
        const query = `
            UPDATE users 
            SET username = COALESCE(?, username), 
                email = COALESCE(?, email), 
                password = COALESCE(?, password) 
            WHERE id = ?;
        `;

        db.query(query, [username, email, password, userId], (err, results) => {
            if (err) return reject(err);
            resolve(results.affectedRows > 0); // Retorna `true` se a atualização foi feita
        });
    });
}

// **Função para deletar usuário**
function deleteUser(userId) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM users WHERE id = ?';
        db.query(query, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results.affectedRows > 0); // Retorna `true` se o usuário foi deletado
        });
    });
}

module.exports = { CreateUser, findUserByEmail, updateUser, deleteUser };