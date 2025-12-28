const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Obtener todos los templates
const getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.whatsappTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener templates", error: error.message });
  }
};

// Obtener un template por su código
const getTemplateByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const template = await prisma.whatsappTemplate.findUnique({
      where: { codigo },
    });
    if (!template) {
      return res.status(404).json({ success: false, message: "Template no encontrado" });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener template", error: error.message });
  }
};

// Crear un nuevo template
const createTemplate = async (req, res) => {
  try {
    const { codigo, plantilla, descripcion } = req.body;
    if (!codigo || !plantilla) {
      return res.status(400).json({ success: false, message: "El código y la plantilla son requeridos" });
    }
    const nuevoTemplate = await prisma.whatsappTemplate.create({
      data: { codigo, plantilla, descripcion },
    });
    res.status(201).json({ success: true, data: nuevoTemplate, message: "Template creado exitosamente" });
  } catch (error)
{
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: "Error: El código del template ya existe." });
    }
    res.status(500).json({ success: false, message: "Error al crear el template", error: error.message });
  }
};

// Actualizar un template
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { plantilla, descripcion } = req.body;
    const templateActualizado = await prisma.whatsappTemplate.update({
      where: { id: parseInt(id) },
      data: { plantilla, descripcion },
    });
    res.json({ success: true, data: templateActualizado, message: "Template actualizado exitosamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar template", error: error.message });
  }
};

// Eliminar un template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.whatsappTemplate.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: "Template eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar template", error: error.message });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateByCodigo,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
