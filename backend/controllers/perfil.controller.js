/**
 * Controlador de Perfil de Usuario
 * Arquitectura MVC - Capa de Controladores
 *
 * Maneja la foto de perfil del usuario autenticado.
 * El archivo se guarda en disco (uploads/perfiles) y en la BD solo se guarda su nombre.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const PERFILES_DIR = path.join(__dirname, "../uploads/perfiles");

/**
 * Elimina un archivo de foto de perfil sin lanzar error si no existe.
 * Usa path.basename para impedir rutas fuera de la carpeta de perfiles.
 */
function eliminarFoto(nombreArchivo) {
  if (!nombreArchivo) return;
  const ruta = path.join(PERFILES_DIR, path.basename(nombreArchivo));
  fs.unlink(ruta, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("No se pudo eliminar la foto anterior:", err.message);
    }
  });
}

/**
 * PUT /api/perfil/foto
 * Sube o reemplaza la foto de perfil del usuario autenticado
 */
const subirFotoPerfil = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      mensaje: "No se recibió ninguna imagen",
    });
  }

  try {
    const anterior = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { fotoPerfil: true },
    });

    if (!anterior) {
      eliminarFoto(req.file.filename);
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado",
      });
    }

    const usuario = await prisma.usuario.update({
      where: { id: req.user.id },
      data: { fotoPerfil: req.file.filename },
      select: { id: true, fotoPerfil: true },
    });

    eliminarFoto(anterior.fotoPerfil);

    return res.status(200).json({
      success: true,
      mensaje: "Foto de perfil actualizada",
      data: usuario,
    });
  } catch (error) {
    console.error("Error al subir foto de perfil:", error);
    eliminarFoto(req.file.filename);
    return res.status(500).json({
      success: false,
      mensaje: "Error al actualizar la foto de perfil",
    });
  }
};

/**
 * DELETE /api/perfil/foto
 * Quita la foto de perfil del usuario autenticado
 */
const eliminarFotoPerfil = async (req, res) => {
  try {
    const anterior = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { fotoPerfil: true },
    });

    if (!anterior) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado",
      });
    }

    await prisma.usuario.update({
      where: { id: req.user.id },
      data: { fotoPerfil: null },
    });

    eliminarFoto(anterior.fotoPerfil);

    return res.status(200).json({
      success: true,
      mensaje: "Foto de perfil eliminada",
      data: { id: req.user.id, fotoPerfil: null },
    });
  } catch (error) {
    console.error("Error al eliminar foto de perfil:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error al eliminar la foto de perfil",
    });
  }
};

module.exports = {
  PERFILES_DIR,
  subirFotoPerfil,
  eliminarFotoPerfil,
};
