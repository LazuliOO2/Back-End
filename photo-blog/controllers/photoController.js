const { CreatePhoto, UpdatePhoto, DeletePhoto  } = require('../models/photo');
const fs = require('fs');
const path = require('path');
const db = require('../config');  // Importa a conexão com o MySQL
// Esta função é chamada quando uma nova foto é enviada
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
        }

        const { title, description } = req.body;

        // Salva a foto no banco de dados
        const result = await CreatePhoto(title, description, `/uploads/${req.file.filename}`, req.user.id);

        res.status(201).json({ message: 'Foto enviada com sucesso', result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Função para upload de fotos geradas
exports.uploadGeneratedPhoto = async (req, res) => {
    try {
        const { title, description, imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'URL da imagem gerada é obrigatória' });
        }

        // Salva a foto no banco de dados
        const result = await CreatePhoto(title, description, imageUrl, req.user.id);

        res.status(201).json({
            message: "Foto gerada enviada com sucesso",
            photo: {
                id: result.insertId,
                title,
                description,
                imageUrl,
                user_id: req.user.id
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Função para buscar todas as fotos
exports.getPhotos = async (req, res) => {
    try {
        const query = 'SELECT * FROM photos';
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updatePhotoImage = async (req, res) => {
    try {
        const { id } = req.params; // ID da foto
        const userId = req.user.id; // Obtém o ID do usuário autenticado do token

        // Verifica se um arquivo foi enviado
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma nova imagem foi enviada' });
        }

        // Busca a foto atual para garantir que ela pertence ao usuário
        const query = 'SELECT imageUrl FROM photos WHERE id = ? AND user_id = ?';
        db.query(query, [id, userId], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length === 0) {
                return res.status(404).json({ error: 'Foto não encontrada ou não pertence ao usuário' });
            }

            const oldImagePath = path.join(__dirname, '../', results[0].imageUrl);

            // Remove a imagem antiga, se existir
            if (fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Erro ao excluir imagem antiga:', unlinkErr);
                });
            }

            // Define o novo caminho da imagem
            const newImagePath = `/uploads/${req.file.filename}`;

            // Atualiza o caminho da imagem no banco de dados
            const updateQuery = 'UPDATE photos SET imageUrl = ? WHERE id = ? AND user_id = ?';
            db.query(updateQuery, [newImagePath, id, userId], (updateErr, updateResults) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });

                if (updateResults.affectedRows === 0) {
                    return res.status(404).json({ error: 'Erro ao atualizar a foto' });
                }

                res.json({ message: 'Imagem da foto atualizada com sucesso', newImagePath });
            });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Função para atualizar uma foto enviada
// A propriedade req.params contém os parâmetros de rota que vêm da URL.
// affectedRows vem do resultado de uma operação no banco de dados.o banco retorna um objeto que inclui affectedRows, indicando quantas linhas foram modificadas
exports.updatePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        console.log("ID da foto:", id);
        console.log("ID do usuário:", req.user.id);
        console.log("Título:", title);
        console.log("Descrição:", description);
        const result = await UpdatePhoto(id, title, description, req.user.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Foto não encontrada ou não pertence ao usuário' });
        res.json({ message: 'Foto atualizada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Função para deletar uma foto enviada
exports.deletePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await DeletePhoto(id, req.user.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Foto não encontrada ou não pertence ao usuário' });
        res.json({ message: 'Foto deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    uploadPhoto: exports.uploadPhoto,
    uploadGeneratedPhoto: exports.uploadGeneratedPhoto,
    getPhotos: exports.getPhotos,
    updatePhoto: exports.updatePhoto,
    updatePhotoImage: exports.updatePhotoImage, // Adicionado
    deletePhoto: exports.deletePhoto
};

