const oracledb = require('oracledb');

const dbConfig = {
  user: "system",
  password: "Marvi2024",
  connectString: "localhost:1522/FREEPDB1"
};

async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Conexión física establecida con Oracle");
    return connection;
  } catch (err) {
    console.error("❌ Error en getConnection:", err.message);
    throw err;
  }
}

// ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ:
module.exports = { getConnection };