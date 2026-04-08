const db = require('../db/client');
const { articulos, marcas, categorias } = require('../db/schema');
const { eq } = require('drizzle-orm');

// GET /api/articulos
// GET /api/articulos?marca_id=2
// GET /api/articulos?categoria_id=3
exports.listar = async (req, res) => {
  try {
    const { marca_id, categoria_id } = req.query;

    let query = db
      .select({
        id:           articulos.id,
        codigo:       articulos.codigo,
        nombre:       articulos.nombre,
        imagen:       articulos.imagen,
        video:        articulos.video,
        precio_pesos: articulos.precio_pesos,
        marca:        marcas.nombre,
        categoria:    categorias.nombre,
      })
      .from(articulos)
      .leftJoin(marcas,     eq(articulos.marca_id,     marcas.id))
      .leftJoin(categorias, eq(articulos.categoria_id, categorias.id));

    if (marca_id)     query = query.where(eq(articulos.marca_id,     Number(marca_id)));
    if (categoria_id) query = query.where(eq(articulos.categoria_id, Number(categoria_id)));

    const resultado = await query;
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/articulos/:id
exports.obtener = async (req, res) => {
  try {
    const [articulo] = await db
      .select({
        id:           articulos.id,
        codigo:       articulos.codigo,
        nombre:       articulos.nombre,
        imagen:       articulos.imagen,
        video:        articulos.video,
        precio_pesos: articulos.precio_pesos,
        marca:        marcas.nombre,
        categoria:    categorias.nombre,
      })
      .from(articulos)
      .leftJoin(marcas,     eq(articulos.marca_id,     marcas.id))
      .leftJoin(categorias, eq(articulos.categoria_id, categorias.id))
      .where(eq(articulos.id, Number(req.params.id)));

    if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json(articulo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/articulos/:id
exports.actualizar = async (req, res) => {
  try {
    const { nombre, imagen, video, precio_pesos, marca_id, categoria_id, codigo } = req.body;

    const campos = {};
    if (nombre       !== undefined) campos.nombre       = nombre;
    if (imagen       !== undefined) campos.imagen       = imagen;
    if (video        !== undefined) campos.video        = video;
    if (precio_pesos !== undefined) campos.precio_pesos = precio_pesos;
    if (marca_id     !== undefined) campos.marca_id     = marca_id;
    if (categoria_id !== undefined) campos.categoria_id = categoria_id;
    if (codigo       !== undefined) campos.codigo       = codigo;

    if (Object.keys(campos).length === 0)
      return res.status(400).json({ error: 'No hay campos para actualizar' });

    await db
      .update(articulos)
      .set(campos)
      .where(eq(articulos.id, Number(req.params.id)));

    res.json({ message: 'Artículo actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};