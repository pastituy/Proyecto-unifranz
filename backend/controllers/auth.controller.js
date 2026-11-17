/**
 * Controlador de Autenticación
 * Arquitectura MVC - Capa de Controladores
 *
 * Responsabilidades:
 * - Lógica de login y autenticación
 * - Verificación 2FA
 * - Generación de tokens JWT
 * - Logout y refresh tokens
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../middleware/auth");
const { enviarCodigoVerificacion } = require("../services/emailService");

const prisma = new PrismaClient();

/**
 * Genera un código de verificación de 6 dígitos
 */
function generarCodigoVerificacion() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/login
 * Inicio de sesión con credenciales
 * Si es administrador, requiere 2FA
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("=== INTENTO DE LOGIN ===");
    console.log("Email:", email);

    // 1. Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      console.log("Usuario no encontrado");
      return res.status(401).json({
        success: false,
        mensaje: "Credenciales incorrectas"
      });
    }

    console.log("Usuario encontrado - Rol:", usuario.rol);

    // 2. Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      console.log("Contraseña inválida");
      return res.status(401).json({
        success: false,
        mensaje: "Credenciales incorrectas"
      });
    }

    console.log("Contraseña válida");

    // 3. Si es administrador, requerir 2FA
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
          success: false,
          mensaje: "Error al enviar el código de verificación"
        });
      }

      console.log("✅ Código 2FA enviado exitosamente");

      return res.status(200).json({
        success: true,
        mensaje: "Código de verificación enviado a tu correo",
        requiere2FA: true,
        email: usuario.email,
      });
    }

    // 4. Para otros roles, login directo (generar tokens)
    console.log("Login directo (sin 2FA) para rol:", usuario.rol);

    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      tipo: usuario.rol.toLowerCase()
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Guardar refresh token en BD (opcional - para invalidación)
    // await prisma.refreshToken.create({ data: { token: refreshToken, userId: usuario.id }});

    // Excluir password de la respuesta
    const { password: _, ...usuarioSinPassword } = usuario;

    return res.status(200).json({
      success: true,
      mensaje: "Inicio de sesión exitoso",
      token: accessToken,
      refreshToken,
      data: usuarioSinPassword,
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error del servidor"
    });
  }
};

/**
 * POST /api/auth/verify-2fa
 * Verificar código 2FA para administradores
 */
const verify2FA = async (req, res) => {
  const { email, codigo } = req.body;

  try {
    // 1. Buscar código válido
    const codigoVerificacion = await prisma.codigoVerificacion.findFirst({
      where: {
        email,
        codigo,
        usado: false,
        expiraEn: {
          gt: new Date(), // No expirado
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!codigoVerificacion) {
      return res.status(401).json({
        success: false,
        mensaje: "Código inválido o expirado"
      });
    }

    // 2. Marcar código como usado
    await prisma.codigoVerificacion.update({
      where: { id: codigoVerificacion.id },
      data: { usado: true },
    });

    // 3. Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado"
      });
    }

    // 4. Generar tokens JWT
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      tipo: usuario.rol.toLowerCase()
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Excluir password de la respuesta
    const { password: _, ...usuarioSinPassword } = usuario;

    return res.status(200).json({
      success: true,
      mensaje: "Verificación exitosa",
      token: accessToken,
      refreshToken,
      data: usuarioSinPassword,
    });

  } catch (error) {
    console.error("Error en verificación 2FA:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error del servidor"
    });
  }
};

/**
 * POST /api/auth/refresh-token
 * Renovar access token usando refresh token
 */
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(401).json({
      success: false,
      mensaje: "Refresh token requerido"
    });
  }

  try {
    const { verifyRefreshToken } = require("../middleware/auth");

    // Verificar refresh token
    const decoded = await verifyRefreshToken(token);

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado"
      });
    }

    // Generar nuevo access token
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      tipo: usuario.rol.toLowerCase()
    };

    const newAccessToken = generateAccessToken(payload);

    return res.status(200).json({
      success: true,
      token: newAccessToken
    });

  } catch (error) {
    console.error("Error al renovar token:", error);
    return res.status(401).json({
      success: false,
      mensaje: "Refresh token inválido o expirado"
    });
  }
};

/**
 * POST /api/auth/logout
 * Cerrar sesión (invalidar tokens)
 */
const logout = async (req, res) => {
  // TODO: Implementar blacklist de tokens o eliminar refresh token de BD
  // Por ahora, el logout se maneja en el frontend eliminando el token

  return res.status(200).json({
    success: true,
    mensaje: "Sesión cerrada exitosamente"
  });
};

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
const getCurrentUser = async (req, res) => {
  try {
    // req.user viene del middleware authenticateToken
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        telefono: true,
        fotoPerfil: true,
        creadoEn: true,
        // NO incluir password
      }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: usuario
    });

  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error del servidor"
    });
  }
};

/**
 * PUT /api/auth/change-password
 * Cambiar contraseña (requiere contraseña actual)
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado"
      });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(currentPassword, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        mensaje: "Contraseña actual incorrecta"
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json({
      success: true,
      mensaje: "Contraseña actualizada exitosamente"
    });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error del servidor"
    });
  }
};

module.exports = {
  login,
  verify2FA,
  refreshToken,
  logout,
  getCurrentUser,
  changePassword
};
