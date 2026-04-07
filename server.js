const serverless = require('serverless-http');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hola desde Express en Vercel 🚀');
});

module.exports = serverless(app);
  