require('dotenv').config();
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { marcas, categorias, articulos } = require('../db/schema');

// ─── Config ───────────────────────────────────────────────
const SHEET_ID = '1zAdqkuP0MWF7MKpHqB4IoWidSTuQz0_ORX8-TVMcDOk';
const API_KEY  = 'AIzaSyAStpB3GNAAGlmAM7nBVvFp5wcsKlyEtCE';

// Posibles nombres de columna → campo destino
const COL_MAP = {
  nombre: ['MAQUINAS', 'NOMBRE', 'NOMBRE ARTICULO', 'name', 'Name'],
  precio: ['PRECIO FINAL EN PESOS', 'PRECIO PESOS', 'PRECIO FINAL PESOS'],
  codigo: ['CODIGO', 'COD', 'CODE', 'Código'],
  fotos:  ['FOTOS', 'FOTO', 'IMAGEN', 'IMAGE'],
  videos: ['VIDEOS', 'VIDEO', 'URL VIDEO'],
};

// ─── Helpers ──────────────────────────────────────────────

// Encuentra el valor de una fila según posibles nombres de columna
const getCol = (headers, row, posibles) => {
  for (const posible of posibles) {
    const idx = headers.findIndex(
      h => h?.toString().trim().toUpperCase() === posible.toUpperCase()
    );
    if (idx !== -1 && row[idx] !== undefined) return row[idx]?.toString().trim() ?? null;
  }
  return null;
};

const limpiarPrecio = (valor) => {
  if (!valor) return null;
  const num = parseFloat(valor.toString().replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : num;
};

// ─── Fetch sheets ─────────────────────────────────────────
const fetchSheetNames = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  return json.sheets.map(s => s.properties.title);
};

const fetchSheetData = async (sheetName) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}!A1:J200?key=${API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  return json.values ?? [];
};

// ─── Migración ────────────────────────────────────────────
const migrate = async () => {
  const client = createClient({
    url:       process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  });
  const db = drizzle(client);

  const sheetNames = await fetchSheetNames();
  console.log(`📋 Hojas encontradas: ${sheetNames.join(', ')}\n`);

  for (const sheetName of sheetNames) {
    const values = await fetchSheetData(sheetName);
    if (!values || values.length < 3) {
      console.warn(`⚠️  Hoja "${sheetName}" vacía o sin datos, se omite.`);
      continue;
    }

    // Fila 1 = título de marca (ej: "JACK"), fila 2 = headers
    const headers = values[1];

    // 1. Insertar marca
    const [marcaInsertada] = await db
      .insert(marcas)
      .values({ nombre: sheetName })
      .onConflictDoNothing()
      .returning();

    const marcaId = marcaInsertada?.id;
    if (!marcaId) {
      console.warn(`⚠️  Marca "${sheetName}" ya existía, se omite.`);
      continue;
    }
    console.log(`✅ Marca insertada: ${sheetName} (id: ${marcaId})`);

    // 2. Recorrer filas desde fila 3 en adelante
    let categoriaId = null;

    for (let i = 2; i < values.length; i++) {
      const row = values[i];

      // Fila con 1 sola celda = categoría
      if (row.length === 1 && row[0]?.trim() !== '') {
        const nombreCat = row[0].trim();

        const [catInsertada] = await db
          .insert(categorias)
          .values({ nombre: nombreCat, marca_id: marcaId })
          .returning();

        categoriaId = catInsertada.id;
        console.log(`  📁 Categoría: ${nombreCat} (id: ${categoriaId})`);
        continue;
      }

      // Fila con datos = artículo
      if (row.length > 1 && categoriaId) {
        const nombre = getCol(headers, row, COL_MAP.nombre);
        if (!nombre) continue; // fila vacía o sin nombre, se salta

        const precio = limpiarPrecio(getCol(headers, row, COL_MAP.precio));
        const codigo = getCol(headers, row, COL_MAP.codigo);
        const fotos  = getCol(headers, row, COL_MAP.fotos);
        const videos = getCol(headers, row, COL_MAP.videos);

        await db.insert(articulos).values({
          nombre,
          codigo,
          precio_pesos: precio,
          imagen:       fotos,
          video:        videos,
          marca_id:     marcaId,
          categoria_id: categoriaId,
        });
      }
    }
  }

  console.log('\n🎉 Migración completada.');
  process.exit(0);
};

migrate().catch(err => {
  console.error('❌ Error en migración:', err);
  process.exit(1);
}); 