const { sqliteTable, integer, text, real } = require('drizzle-orm/sqlite-core');

const marcas = sqliteTable('marcas', {
  id:     integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull().unique(),
});

const categorias = sqliteTable('categorias', {
  id:       integer('id').primaryKey({ autoIncrement: true }),
  nombre:   text('nombre').notNull(),
  marca_id: integer('marca_id').references(() => marcas.id),
});

const articulos = sqliteTable('articulos', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  codigo:       text('codigo'),
  nombre:       text('nombre').notNull(),
  imagen:       text('imagen'),
  video:        text('video'),
  precio_pesos: real('precio_pesos'),
  marca_id:     integer('marca_id').references(() => marcas.id),
  categoria_id: integer('categoria_id').references(() => categorias.id),
});

module.exports = { marcas, categorias, articulos };