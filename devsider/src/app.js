require('dotenv').config();
const express = require('express');
const listasRoutes = require('./routes/listas.routes');
const campanhasRoutes = require('./routes/campanhas.routes');
const fluxosRoutes = require('./routes/fluxos.routes');
const path = require('path');

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) next(err); // se der erro, passa pro tratamento
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', listasRoutes);
app.use('/api', campanhasRoutes);
app.use('/api', fluxosRoutes);

app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).send('Algo deu errado no servidor ');
});

module.exports = app;