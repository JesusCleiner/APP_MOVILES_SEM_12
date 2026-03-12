const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const { getConnection } = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURACIÓN DE IMÁGENES (RUTA ORIGINAL) ---
// Apuntando de nuevo a la carpeta dentro de assets de tu App
const rutaProductos = 'C:\\MarviPlast\\APP_MARVIPLAST\\assets\\productos';
app.use('/productos', express.static(rutaProductos));

const JWT_SECRET = 'MARVIPLAST_KEY_2026';

// Mensaje de bienvenida en la raíz para confirmar que el servidor responde
app.get('/', (req, res) => {
    res.send('🚀 Servidor de Marviplast funcionando correctamente');
});

// Endpoint de Login (Tarea 12)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT ID_STAFF, PASSWORD_HASH, ROL FROM STAFF_MARVIPLAST WHERE USERNAME = :un`,
            { un: username }
        );

        if (result.rows.length > 0) {
            const [idStaff, hash, rol] = result.rows[0];
            const match = await bcrypt.compare(password, hash);
            if (match) {
                const token = jwt.sign(
                    { id: idStaff, user: username, role: rol },
                    JWT_SECRET,
                    { expiresIn: '1h' }
                );
                res.json({ success: true, message: "Autenticación exitosa", token });
            } else {
                res.status(401).json({ success: false, message: "Contraseña incorrecta" });
            }
        } else {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }
});

// --- ARRANQUE DEL SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n==============================================`);
    console.log(`🚀 MARVISOFT INDICA BACKEND INICIADO CORRECTAMENTE`);
    console.log(`📡 Escuchando en: http://localhost:${PORT}`);
    console.log(`📂 Vinculado a: ${rutaProductos}`);
    console.log(`==============================================\n`);
});