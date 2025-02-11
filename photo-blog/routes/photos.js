const express = require('express');
const { uploadPhoto, getPhotos, uploadGeneratedPhoto, updatePhoto, deletePhoto, updatePhotoImage } = require('../controllers/photoController');
console.log({ updatePhoto });
const { DeletePhoto } = require('../models/photo');
const auth = require('../middleware/authMiddleware');
const db = require('../config');
const fs = require('fs');
const path = require('path');
//  Importa a biblioteca multer, que facilita o processo de upload de arquivos em servidores Node.js.
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });  // Define o diretório de destino para uploads

const router = express.Router();

router.post('/upload', auth, upload.single('image'), uploadPhoto);
router.post('/upload-generated', auth, uploadGeneratedPhoto);
router.get('/', getPhotos);
router.put('/update/:id', auth, updatePhoto);
router.put('/update-image/:id', auth, upload.single('image'), updatePhotoImage); // Nova rota para atualizar a imagem
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Pegando o ID do usuário autenticado

        // Primeiro, verificamos se a foto existe e pertence ao usuário
        const query = 'SELECT imageUrl FROM photos WHERE id = ? AND user_id = ?';
        db.query(query, [id, userId], async (err, results) => {
            if (err) {
                console.error('Erro ao buscar foto:', err);
                return res.status(500).json({ error: 'Erro ao buscar a foto' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Foto não encontrada ou não pertence ao usuário' });
            }

            // Obtendo o caminho da imagem para deletar o arquivo
            const filePath = path.join(__dirname, '../', results[0].imageUrl);

            try {
                // Tenta deletar o arquivo, mas não interrompe a execução se o arquivo não existir
                await fs.promises.unlink(filePath);
            } catch (unlinkErr) {
                if (unlinkErr.code !== 'ENOENT') {
                    console.error('Erro ao excluir a imagem:', unlinkErr);
                    return res.status(500).json({ error: 'Erro ao excluir o arquivo' });
                }
            }

            try {
                // Agora deletamos a entrada no banco de dados
                const result = await DeletePhoto(id, userId);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Foto não encontrada ou não pertence ao usuário' });
                }

                // Enviamos a resposta apenas após garantir que tudo foi excluído corretamente
                res.json({ message: 'Foto deletada com sucesso' });
            } catch (deleteErr) {
                console.error('Erro ao deletar a foto do banco:', deleteErr);
                return res.status(500).json({ error: 'Erro ao deletar a foto do banco' });
            }
        });
    } catch (err) {
        console.error('Erro inesperado:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
