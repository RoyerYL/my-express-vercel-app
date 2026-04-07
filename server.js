const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hola desde Express en Vercel 🚀');
});

// Si se ejecuta directamente (npm start / desarrollo), levanta el servidor normal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

// Si lo importa Vercel, exporta el handler directamente
module.exports = app;