/**
 * Rutas de Perfil de Usuario
 * Arquitectura MVC - Capa de Rutas
 *
 * Todas las rutas requieren JWT: cada usuario solo modifica su propia foto.
 */

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const { authenticateToken } = require("../middleware/auth");
const {
  PERFILES_DIR,
  subirFotoPerfil,
  eliminarFotoPerfil,
} = require("../controllers/perfil.controller");

fs.mkdirSync(PERFILES_DIR, { recursive: true });

const TIPOS_PERMITIDOS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PERFILES_DIR),
  filename: (req, file, cb) => {
    // La extensión sale del tipo MIME validado, no del nombre que envía el cliente
    const ext = TIPOS_PERMITIDOS[file.mimetype];
    cb(null, `perfil-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "foto"));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB
});

// Traduce los errores de multer a respuestas JSON claras
const manejarSubida = (req, res, next) => {
  upload.single("foto")(req, res, (err) => {
    if (!err) return next();

    let mensaje = "Error al procesar la imagen";
    if (err.code === "LIMIT_FILE_SIZE") {
      mensaje = "La imagen no puede pesar más de 2 MB";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      mensaje = "Solo se permiten imágenes JPG, PNG o WEBP";
    }

    return res.status(400).json({ success: false, mensaje });
  });
};

/**
 * PUT /api/perfil/foto
 * Body: multipart/form-data con el campo "foto"
 */
router.put("/foto", authenticateToken, manejarSubida, subirFotoPerfil);

/**
 * DELETE /api/perfil/foto
 */
router.delete("/foto", authenticateToken, eliminarFotoPerfil);

module.exports = router;
