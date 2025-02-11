const db = require('../config');

async function CreatePhoto(title, description, imageUrl, user_id) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO photos (title, description, imageUrl, user_id) VALUES (?, ?, ?, ?)';
        db.query(query, [title, description, imageUrl, user_id], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

async function UpdatePhoto(id, title, description, user_id){
  return new Promise((resolve,reject) => {
      const query = 'UPDATE photos SET title = ?,description = ? WHERE id = ? AND user_id = ?';
      console.log("Query SQL:", query, [title, description, id, user_id]); 
      db.query(query,[title,description,id,user_id], (err,results) => {
          if(err) return reject(err);
          resolve(results);
      });
  });
}
async function DeletePhoto(id,user_id){
  return new Promise((resolve,reject) => {
    const query = 'Delete FROM photos WHERE id = ? AND user_id = ?';
    db.query(query,[id,user_id],(err,results) => {
      if(err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = { CreatePhoto, UpdatePhoto, DeletePhoto };