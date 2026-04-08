const express = require('express');
const cors    = require('cors');
const app     = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',   // Vite dev
    'http://localhost:3000',   // CRA dev
    // 'https://tu-frontend.vercel.app'  // ← agregá tu dominio de producción
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/articulos',  require('./routes/articulos'));
app.use('/api/marcas',     require('./routes/marcas'));
app.use('/api/categorias', require('./routes/categorias'));

// ─── Error handler global ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;