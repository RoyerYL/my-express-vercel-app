const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

const db = drizzle(client);
module.exports = db;