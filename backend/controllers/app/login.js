const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const SECRET_KEY = "cuno";

app.post("/mobile-login", async (req, res) => {
    const { ci, password } = req.body;

    if (!ci || !password) {
        return res.status(400).json({ mensaje: "ci y contraseña son requeridos" });
    }

    try {
        const usuario = await prisma.padre.findUnique({
            where: { ci },
        });

        if (!usuario) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
        }

        const token = jwt.sign({ id: usuario.id, ci: usuario.ci }, SECRET_KEY, {
            expiresIn: "24h",
        });

        const { password: _, ...usuarioSinPassword } = usuario;

        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token,
            data: usuarioSinPassword,
        });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ mensaje: "Error del servidor" });
    }
});

module.exports = app;
