const express = require("express");
const cors = require("cors");
const path = require("path");
const Usuario = require("./controllers/usuario");
const Donaciones = require("./controllers/donaciones");
const Evento = require("./controllers/evento");
const Paciente = require("./controllers/paciente");
const Padre = require("./controllers/padre");
const blog = require("./controllers/blog");
const campana = require("./controllers/campana");
const categoria = require("./controllers/categoria");
const comentarios = require("./controllers/comentarios");
const respuesta = require("./controllers/respuesta");
const usuarioCompana = require("./controllers/usuarioCompana");
const login = require("./controllers/login");
const facebook = require("./controllers/facebook");
const psicologo = require("./controllers/psicologo");
const TrabajoSocial = require("./controllers/trabajdoraSocial");
const Beneficiarios = require("./controllers/beneficiarios");
const facebookRoutes = require("./controllers/facebook");
const tiktokRoutes = require("./controllers/tiktok");
const twitterRoutes = require("./controllers/twitter");
const mobile_login = require("./controllers/app/login");
const mobile_data = require("./controllers/app/data_pacientes");
const BNB = require("./controllers/bnb");
const SolicitudesAyuda = require("./controllers/solicitudesAyuda");
const Notificaciones = require("./controllers/notificaciones");
const Reportes = require("./controllers/reportes");
const app = express();

app.use(express.json());
app.use(cors());

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.json({
    message: "API Redes Sociales funcionando",
    endpoints: {
      facebook: {
        "POST /api/facebook/publish": "Publicar en Facebook",
        "GET /api/facebook/test": "Probar conexión",
        "POST /api/facebook/schedule": "Programar publicación",
        "GET /api/facebook/scheduled": "Ver publicaciones programadas",
      },
      tiktok: {
        "POST /api/tiktok/prepare": "Preparar contenido para TikTok",
        "GET /api/tiktok/prepared": "Ver posts preparados",
        "PUT /api/tiktok/published/:id": "Marcar como publicado",
        "DELETE /api/tiktok/:id": "Eliminar post preparado",
      },
      twitter: {
        "POST /api/twitter/publish": "Publicar tweet en X/Twitter",
        "GET /api/twitter/test": "Probar conexión con X API",
        "POST /api/twitter/schedule": "Programar tweet",
        "GET /api/twitter/scheduled": "Ver tweets programados",
        "DELETE /api/twitter/scheduled/:id": "Cancelar tweet programado",
      },
    },
  });
});
app.use("/api/facebook", facebookRoutes);
app.use("/api/tiktok", tiktokRoutes);
app.use("/api/twitter", twitterRoutes);
app.use("/api/bnb", BNB);
app.use(facebook);
app.use(Usuario);
app.use(Donaciones);
app.use(Evento);
app.use(Paciente);
app.use(Padre);
app.use(blog);
app.use(campana);
app.use(categoria);
app.use(comentarios);
app.use(respuesta);
app.use(psicologo);
app.use(TrabajoSocial);
app.use(Beneficiarios);
app.use(usuarioCompana);
app.use(mobile_login);
app.use(mobile_data);
app.use(SolicitudesAyuda);
app.use(Notificaciones);
app.use(Reportes);
app.use(login);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor corriendo en:");
  console.log("  - Local:    http://localhost:3000");
  console.log("  - Red:      http://192.168.100.139:3000");
});
