const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const db = require('./db');
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'MARVIPLAST_KEY_2026';
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE NODEMAILER ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- RUTAS DE BIENVENIDA ---
app.get('/', (req, res) => {
    res.send('🚀 Servidor de Marviplast (PostgreSQL) funcionando correctamente');
});

// --- ENDPOINT: CATÁLOGO DE PRODUCTOS ---
app.get('/api/productos', async (req, res) => {
    try {
        let queryText = 'SELECT id, nombre, capacidad, gramaje, rosca, embalaje, precio, imagen_url FROM productos ORDER BY id ASC';
        const result = await db.query(queryText);
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error al cargar productos:", err.message);
        res.status(500).json({ error: "Error al cargar el catálogo" });
    }
});

// --- ENDPOINT: LOGIN ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const queryText = 'SELECT id, password_hash, rol FROM staff_marviplast WHERE username = $1';
        const result = await db.query(queryText, [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (match) {
                const token = jwt.sign({ id: user.id, user: username, role: user.rol }, JWT_SECRET, { expiresIn: '8h' });
                // IMPORTANTE: Enviamos el ID y el objeto user para que la App los guarde
                res.json({ success: true, token, id: user.id, user: { id: user.id, username, role: user.rol }, message: "Bienvenido" });
            } else {
                res.status(401).json({ success: false, message: "Contraseña incorrecta" });
            }
        } else {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "Error interno" });
    }
});

// --- ENDPOINT: GUARDAR PEDIDOS (CORREGIDO) ---
app.post('/api/pedidos', async (req, res) => {
    const { clienteId, items, total, clienteNombre } = req.body; 
    try {
        // CORRECCIÓN CRÍTICA: 
        // Usamos clienteId (el ID del usuario logueado enviado desde React Native) 
        // para llenar la columna staff_id, que es la que rastrea quién hizo el pedido.
        const headerQuery = 'INSERT INTO pedidos (cliente_id, staff_id, fecha, total) VALUES ($1, $2, NOW(), $3) RETURNING id';
        const headerRes = await db.query(headerQuery, [
            null,                // cliente_id (opcional si usas staff_id)
            clienteId || null,   // staff_id <- AQUÍ SE GUARDA EL ID DEL USUARIO
            total || 0           // total
        ]);
    
        const pedidoId = headerRes.rows[0].id;
        let detalleTexto = "";

        // 2. Guardar en tabla 'detalle_pedidos'
        for (const item of items) {
            const subtotalItem = item.totalItem || (item.cantidadBultos * (item.precio || 0));
            const detailQuery = 'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)';
            await db.query(detailQuery, [
                pedidoId,
                item.id,
                item.cantidadBultos, 
                item.precio || 0,    
                subtotalItem         
            ]);
            detalleTexto += `- ${item.nombre}: ${item.cantidadBultos} bultos ($${subtotalItem.toFixed(2)})\n`;
        }

        // 3. ENVÍO DE EMAIL
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECEIVER,
            subject: `📦 Nuevo Pedido Marviplast #${pedidoId} - ${clienteNombre || 'Usuario'}`,
            text: `Se ha registrado un nuevo pedido en el sistema.\n\n` +
                  `ID Pedido: ${pedidoId}\n` +
                  `Usuario/Vendedor: ${clienteNombre}\n` +
                  `Total: $${total.toFixed(2)}\n\n` +
                  `Detalle:\n${detalleTexto}\n` +
                  `Por favor, ingrese al sistema administrativo para procesarlo.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log("⚠️ Error enviando email:", error);
            else console.log("📧 Email enviado: " + info.response);
        });

        res.json({
            success: true,
            message: "Pedido guardado y notificado con éxito",
            pedidoId
        });

    } catch (err) {
        console.error("❌ Error al guardar pedido:", err.message);
        res.status(500).json({
            success: false,
            error: "Error al procesar el pedido",
            details: err.message
        });
    }
});

// --- ENDPOINT: OBTENER DATOS DE CLIENTE POR ID ---
app.get('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const queryText = 'SELECT id, nombre, identificacion, telefono, ciudad FROM clientes WHERE id = $1';
        const result = await db.query(queryText, [id]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ success: false, message: "Cliente no encontrado" });
        }
    } catch (err) {
        console.error("❌ Error al obtener datos del cliente:", err.message);
        res.status(500).json({ success: false, error: "Error al consultar cliente" });
    }
});

// --- ENDPOINT: HISTORIAL DE PEDIDOS DE UN STAFF ---
app.get('/api/mis-pedidos/:staffId', async (req, res) => {
    try {
        const { staffId } = req.params;
        const queryText = 'SELECT id, fecha, total FROM pedidos WHERE staff_id = $1 ORDER BY fecha DESC';
        const result = await db.query(queryText, [staffId]);
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error al cargar historial de pedidos:", err.message);
        res.status(500).json({ success: false, error: "Error al cargar pedidos" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR ACTIVO EN PUERTO ${PORT}`);
});