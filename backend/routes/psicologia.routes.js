/**
 * Rutas de Derivaciones Psicológicas
 * Arquitectura MVC - Capa de Rutas
 *
 * Todas requieren JWT. Los permisos por rol se aplican con requireRole.
 */

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();

const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const {
  INFORMES_DIR,
  crearDerivacion,
  listarDerivaciones,
  subirInforme,
  descargarInforme,
} = require("../controllers/psicologia.controller");

fs.mkdirSync(INFORMES_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, INFORMES_DIR),
    filename: (req, file, cb) =>
      cb(null, `informe-psicologico-${parseInt(req.params.id) || 0}-${Date.now()}.pdf`),
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "informePdf"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10MB
});

const manejarSubida = (req, res, next) => {
  upload.single("informePdf")(req, res, (err) => {
    if (!err) return next();

    let mensaje = "Error al procesar el archivo";
    if (err.code === "LIMIT_FILE_SIZE") {
      mensaje = "El PDF no puede pesar más de 10 MB";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      mensaje = "Solo se permiten archivos PDF";
    }
    return res.status(400).json({ success: false, mensaje });
  });
};

router.use(authenticateToken);

// Trabajador social deriva uno de sus casos
router.post(
  "/derivaciones",
  requireRole(["TRABAJADOR_SOCIAL"]),
  crearDerivacion
);

// Listado (el controlador filtra según el rol)
router.get(
  "/derivaciones",
  requireRole(["PSICOLOGO", "TRABAJADOR_SOCIAL", "ADMINISTRADOR"]),
  listarDerivaciones
);

// Psicólogo sube (o reemplaza) el informe
router.put(
  "/derivaciones/:id/informe",
  requireRole(["PSICOLOGO"]),
  manejarSubida,
  subirInforme
);

// Ver el PDF del informe
router.get(
  "/derivaciones/:id/informe",
  requireRole(["PSICOLOGO", "TRABAJADOR_SOCIAL", "ADMINISTRADOR"]),
  descargarInforme
);

module.exports = router;
