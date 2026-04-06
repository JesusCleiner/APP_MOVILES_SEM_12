const { Pool } = require('pg');

// Configuración para el nuevo contenedor Postgres de Marviplast
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'marviplast_db',
  password: 'Marviplast',
  port: 5433, // El puerto que vimos en Docker Desktop
});

// Mensaje para confirmar que la conexión funciona
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL (Puerto 5433)');
  }
});

module.exports = pool;