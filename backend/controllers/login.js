const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { enviarCodigoVerificacion } = require("../services/emailService");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const SECRET_KEY = "cunu";

// Genera un código de 6 dígitos
function generarCodigoVerificacion() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint de login con 2FA para administradores
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Email y contraseña son requeridos" });
  }

  try {
    console.log("=== INTENTO DE LOGIN ===");
    console.log("Email:", email);

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      console.log("Usuario no encontrado");
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    console.log("Usuario encontrado - Rol:", usuario.rol);

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      console.log("Contraseña inválida");
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    console.log("Contraseña válida");

    // Si es administrador, requiere 2FA
    if (usuario.rol === "ADMINISTRADOR") {
      console.log("🔒 Detectado ADMINISTRADOR - Iniciando 2FA");
      // Generar código de verificación
      const codigo = generarCodigoVerificacion();
      const expiraEn = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Guardar código en la base de datos
      await prisma.codigoVerificacion.create({
        data: {
          email: usuario.email,
          codigo,
          expiraEn,
        },
      });

      // Enviar código por correo
      const emailEnviado = await enviarCodigoVerificacion(usuario.email, codigo);

      if (!emailEnviado) {
        console.log("❌ Error al enviar código por correo");
        return res.status(500).json({
          mensaje: "Error al enviar el código de verificación"
        });
      }

      console.log("✅ Código 2FA enviado exitosamente");
      console.log("Respuesta: requiere2FA=true");

      return res.status(200).json({
        mensaje: "Código de verificación enviado a tu correo",
        requiere2FA: true,
        email: usuario.email,
      });
    }

    // Para otros roles, login directo sin 2FA
    console.log("Login directo (sin 2FA) para rol:", usuario.rol);
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY, {
      expiresIn: "2h",
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

// Endpoint para verificar el código 2FA
app.post("/verify-2fa", async (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({
      mensaje: "Email y código son requeridos"
    });
  }

  try {
    // Buscar código válido
    const codigoVerificacion = await prisma.codigoVerificacion.findFirst({
      where: {
        email,
        codigo,
        usado: false,
        expiraEn: {
          gt: new Date(), // Mayor que la fecha actual (no expirado)
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!codigoVerificacion) {
      return res.status(401).json({
        mensaje: "Código inválido o expirado"
      });
    }

    // Marcar código como usado
    await prisma.codigoVerificacion.update({
      where: { id: codigoVerificacion.id },
      data: { usado: true },
    });

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY, {
      expiresIn: "2h",
    });

    const { password: _, ...usuarioSinPassword } = usuario;

    return res.status(200).json({
      mensaje: "Verificación exitosa",
      token,
      data: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en verificación 2FA:", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
});

module.exports = app;
