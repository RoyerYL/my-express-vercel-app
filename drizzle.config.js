/** @type { import("drizzle-kit").Config } */
module.exports = {
  dialect: 'turso',
  schema: './db/schema.js',
  out: './drizzle',
  dbCredentials: {
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  },
};