const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const app = express();
const prisma = new PrismaClient();

// Roles permitidos en el sistema (deben coincidir con el enum Rol en Prisma)
const ROLES_PERMITIDOS = ["ADMINISTRADOR", "PSICOLOGO", "TRABAJADOR_SOCIAL", "BENEFICIARIO"];

// Middleware para validar roles
const validarRol = (rol) => {
  if (!ROLES_PERMITIDOS.includes(rol)) {
    return false;
  }
  return true;
};

app.get("/usuario", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({});
    res.json({
      data: usuarios,
      mensaje: "Usuarios obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al traer usuarios",
      error: error.message,
    });
  }
});

app.get("/usuario/:id", async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    res.json({
      data: usuario,
      mensaje: "Usuario obtenido correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al traer usuario",
      error: error.message,
    });
  }
});

app.post("/usuario", async (req, res) => {
  try {
    const { nombre, email, telefono, pais, ci, rol, password } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !email || !telefono || !pais || !rol || !password) {
      return res.status(400).json({
        mensaje: "Los campos nombre, email, teléfono, país, rol y password son obligatorios",
      });
    }

    // Validación del rol
    if (!validarRol(rol)) {
      return res.status(400).json({
        mensaje: `Rol no permitido. Los roles válidos son: ${ROLES_PERMITIDOS.join(", ")}`,
      });
    }

    // Validación de correo electrónico
    const correoValidador = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!correoValidador.test(email)) {
      return res.status(400).json({
        mensaje: "El correo tiene un formato inválido",
      });
    }

    // Verificar si el correo ya existe
    const usuarioExist = await prisma.usuario.findUnique({
      where: {
        email: email,
      },
    });

    if (usuarioExist) {
      return res.status(400).json({
        mensaje: "El correo ya existe en el sistema",
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Hashear la contraseña
    const ROUNDS = 10;
    const salt = bcrypt.genSaltSync(ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const usuarioCreado = await prisma.usuario.create({
      data: {
        nombre,
        email,
        telefono,
        pais,
        ci: ci || null, // CI es opcional
        rol,
        password: hashedPassword,
      },
    });

    // No devolver la contraseña en la respuesta
    const { password: _, ...usuarioSinPassword } = usuarioCreado;

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      data: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({
      mensaje: "Error al crear usuario",
      error: error.message,
    });
  }
});

app.put("/usuario/:id", async (req, res) => {
  try {
    const { nombre, email, telefono, pais, ci, rol, password } = req.body;
    const userId = Number(req.params.id);

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    // Si se está actualizando el rol, validarlo
    if (rol && !validarRol(rol)) {
      return res.status(400).json({
        mensaje: `Rol no permitido. Los roles válidos son: ${ROLES_PERMITIDOS.join(", ")}`,
      });
    }

    // Si se envía email, validar formato
    if (email) {
      const correoValidador = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!correoValidador.test(email)) {
        return res.status(400).json({
          mensaje: "El correo tiene un formato inválido",
        });
      }

      // Verificar que el email no esté en uso por otro usuario
      const emailEnUso = await prisma.usuario.findFirst({
        where: {
          email: email,
          NOT: {
            id: userId,
          },
        },
      });

      if (emailEnUso) {
        return res.status(400).json({
          mensaje: "El correo ya está siendo utilizado por otro usuario",
        });
      }
    }

    // Preparar datos para actualizar
    const dataToUpdate = {
      ...(nombre && { nombre }),
      ...(email && { email }),
      ...(telefono && { telefono }),
      ...(pais && { pais }),
      ...(ci !== undefined && { ci }),
      ...(rol && { rol }),
    };

    // Si se envía password, hashearlo
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          mensaje: "La contraseña debe tener al menos 6 caracteres",
        });
      }
      const ROUNDS = 10;
      const salt = bcrypt.genSaltSync(ROUNDS);
      dataToUpdate.password = await bcrypt.hash(password, salt);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    // No devolver la contraseña en la respuesta
    const { password: _, ...usuarioSinPassword } = usuarioActualizado;

    res.json({
      mensaje: "Usuario actualizado correctamente",
      data: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).json({
      mensaje: "Error al editar usuario",
      error: error.message,
    });
  }
});

app.delete("/usuario/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    await prisma.usuario.delete({
      where: { id: userId },
    });

    res.json({
      mensaje: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      mensaje: "Error al eliminar usuario",
      error: error.message,
    });
  }
});

// ================================
// LOGIN MÓVIL PARA BENEFICIARIOS
// ================================
app.post("/mobile-beneficiario-login", async (req, res) => {
  try {
    const { codigoBeneficiario, ci } = req.body;

    console.log("=== LOGIN MÓVIL BENEFICIARIO ===");
    console.log("Código beneficiario:", codigoBeneficiario);
    console.log("CI:", ci);

    // Validar campos requeridos
    if (!codigoBeneficiario || !ci) {
      return res.status(400).json({
        success: false,
        mensaje: "El código de beneficiario y el CI son requeridos",
      });
    }

    // Buscar el beneficiario por código
    const beneficiario = await prisma.beneficiario.findUnique({
      where: { codigoBeneficiario: codigoBeneficiario.toUpperCase() },
      include: {
        pacienteRegistro: {
          include: {
            evaluacionSocial: true,
            evaluacionPsicologica: true,
          },
        },
      },
    });

    if (!beneficiario) {
      return res.status(404).json({
        success: false,
        mensaje: "Código de beneficiario no encontrado",
      });
    }

    // Verificar que el CI coincida con el CI del tutor
    if (beneficiario.pacienteRegistro.ciTutor !== ci) {
      return res.status(401).json({
        success: false,
        mensaje: "CI incorrecto",
      });
    }

    // Buscar el usuario asociado al beneficiario
    const usuario = await prisma.usuario.findFirst({
      where: {
        ci: beneficiario.pacienteRegistro.ciTutor,
        rol: 'BENEFICIARIO'
      }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado. Por favor contacta al administrador.",
      });
    }

    // Generar token (simulado, en producción usar JWT)
    const token = `beneficiario_${beneficiario.id}_${Date.now()}`;

    res.json({
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono,
          rol: usuario.rol,
        },
        beneficiario: {
          id: beneficiario.id,
          codigoBeneficiario: beneficiario.codigoBeneficiario,
          estadoBeneficiario: beneficiario.estadoBeneficiario,
          estadoMedico: beneficiario.estadoMedico,
          paciente: {
            id: beneficiario.pacienteRegistro.id,
            nombreCompletoNino: beneficiario.pacienteRegistro.nombreCompletoNino,
            fechaNacimiento: beneficiario.pacienteRegistro.fechaNacimiento,
            edad: beneficiario.pacienteRegistro.edad,
            diagnostico: beneficiario.pacienteRegistro.diagnostico,
            nombreCompletoTutor: beneficiario.pacienteRegistro.nombreCompletoTutor,
            telefonoTutor: beneficiario.pacienteRegistro.telefonoTutor,
            direccion: beneficiario.pacienteRegistro.direccion,
          },
        },
      },
      token,
      mensaje: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("Error en login móvil beneficiario:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al iniciar sesión",
      error: error.message,
    });
  }
});

module.exports = app;