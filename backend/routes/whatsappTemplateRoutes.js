const express = require("express");
const router = express.Router();
const {
  getAllTemplates,
  getTemplateByCodigo,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/whatsappTemplateController");

// Rutas para los templates
router.get("/", getAllTemplates);
router.get("/:codigo", getTemplateByCodigo);
router.post("/", createTemplate);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

module.exports = router;
