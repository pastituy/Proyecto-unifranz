const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const app = express();
const prisma = new PrismaClient();
const formatDate = require("../utils/formatDate");
app.get("/tags", async (req, res) => {
  try {
    const respuesta = await prisma.tag.findMany({});
    res.json({
      data: respuesta,
      mensaje: "Tags obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al traer tags",
      error: error.mensaje,
    });
  }
});
app.get("/blog", async (req, res) => {
  try {
    const blog = await prisma.blog.findMany({
      include: {
        categoria: true,
        contenidos: {
          orderBy: {
            orden: "asc",
          },
        },
        tags: true,
        comentarios: {
          include: {
            respuesta: true,
          },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({
        mensaje: "Blog no encontrado",
      });
    }

    res.json({
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener blog",
      error: error.message,
    });
  }
});
app.post("/blog", async (req, res) => {
  try {
    const {
      titulo,
      excerpt,
      fecha,
      autor,
      imagen,
      idCategoria,
      contenidos = [],
      tags = [],
    } = req.body;

    const blogCreado = await prisma.blog.create({
      data: {
        titulo,
        excerpt,
        fecha: fecha ? new Date(fecha) : new Date(),
        autor,
        imagen,
        idCategoria: idCategoria ? Number(idCategoria) : null,
        contenidos: {
          create: contenidos.map((contenido, index) => ({
            titulo: contenido.titulo,
            texto: contenido.texto,
            orden: contenido.orden || index + 1,
          })),
        },
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { nombre: tag },
            create: { nombre: tag },
          })),
        },
      },
      include: {
        categoria: true,
        contenidos: true,
        tags: true,
      },
    });

    res.json({
      mensaje: "Blog creado correctamente",
      data: blogCreado,
    });
  } catch (error) {
    console.error("Error al crear blog:", error);
    res.status(500).json({
      mensaje: "Error al crear blog",
      error: error.message,
    });
  }
});
app.put("/blog/:id", async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const {
      titulo,
      excerpt,
      fecha,
      autor,
      imagen,
      idCategoria,
      contenidos = [],
      tags = [],
    } = req.body;

    if (contenidos.length > 0) {
      await prisma.contenido.deleteMany({
        where: { blogId },
      });
    }

    const blog = await prisma.blog.update({
      where: {
        id: blogId,
      },
      data: {
        titulo,
        excerpt,
        fecha: fecha ? new Date(fecha) : undefined,
        autor,
        imagen,
        idCategoria: idCategoria ? Number(idCategoria) : null,
        contenidos:
          contenidos.length > 0
            ? {
                create: contenidos.map((contenido, index) => ({
                  titulo: contenido.titulo,
                  texto: contenido.texto,
                  orden: contenido.orden || index + 1,
                })),
              }
            : undefined,
        tags:
          tags.length > 0
            ? {
                set: [],
                connectOrCreate: tags.map((tag) => ({
                  where: { nombre: tag },
                  create: { nombre: tag },
                })),
              }
            : undefined,
      },
      include: {
        categoria: true,
        contenidos: true,
        tags: true,
      },
    });

    res.json({
      mensaje: "Blog actualizado correctamente",
      data: blog,
    });
  } catch (error) {
    console.error("Error al editar blog:", error);
    res.status(500).json({
      mensaje: "Error al editar blog",
      error: error.message,
    });
  }
});
app.delete("/blog/:id", async (req, res) => {
  try {
    await prisma.blog.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      mensaje: "blog eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar blog",
      error: error.mensaje,
    });
  }
});
app.get("/blog/:id", async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        categoria: true,
        contenidos: {
          orderBy: {
            orden: "asc",
          },
        },
        tags: true,
        comentarios: {
          include: {
            respuesta: true,
          },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({
        mensaje: "Blog no encontrado",
      });
    }

    res.json({
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener blog",
      error: error.message,
    });
  }
});

module.exports = app;
