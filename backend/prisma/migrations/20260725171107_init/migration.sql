-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ci" TEXT,
    "rol" TEXT
);

-- CreateTable
CREATE TABLE "Donaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreDonante" TEXT NOT NULL,
    "cantidad" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idCampana" INTEGER,
    CONSTRAINT "Donaciones_idCampana_fkey" FOREIGN KEY ("idCampana") REFERENCES "Campana" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Padre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "tipoCancer" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "idPadre" INTEGER NOT NULL,
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Paciente_idPadre_fkey" FOREIGN KEY ("idPadre") REFERENCES "Padre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recuperados" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idPaciente" INTEGER NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "recovered" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recuperados_idPaciente_fkey" FOREIGN KEY ("idPaciente") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tratamiento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoTratamiento" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "idPaciente" INTEGER,
    "estado" BOOLEAN NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "siguienteCita" DATETIME NOT NULL,
    CONSTRAINT "Tratamiento_idPaciente_fkey" FOREIGN KEY ("idPaciente") REFERENCES "Paciente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "img" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Campana" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "multimedia" TEXT NOT NULL,
    "recaudado" DECIMAL,
    "previstro" DECIMAL
);

-- CreateTable
CREATE TABLE "UsuarioCompana" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" INTEGER,
    "nombreUsuario" TEXT,
    "montoSuscripcion" INTEGER NOT NULL,
    "idCompana" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsuarioCompana_idCompana_fkey" FOREIGN KEY ("idCompana") REFERENCES "Campana" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsuarioCompana_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pacientes_registro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreCompletoNino" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "edad" INTEGER NOT NULL,
    "ciNino" TEXT,
    "diagnostico" TEXT NOT NULL,
    "nombreCompletoTutor" TEXT NOT NULL,
    "ciTutor" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "telefonoTutor" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "emailTutor" TEXT,
    "creadoPorId" INTEGER NOT NULL,
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "motivoRechazo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'REGISTRO_INICIAL',
    CONSTRAINT "pacientes_registro_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluaciones_sociales" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pacienteRegistroId" INTEGER NOT NULL,
    "ingresoFamiliar" INTEGER NOT NULL,
    "numPersonasHogar" INTEGER NOT NULL,
    "tipoVivienda" INTEGER NOT NULL,
    "situacionLaboralPadres" INTEGER NOT NULL,
    "accesoSalud" INTEGER NOT NULL,
    "gastosMedicosMensuales" INTEGER NOT NULL,
    "puntajeTotal" INTEGER NOT NULL,
    "nivelVulnerabilidad" TEXT NOT NULL,
    "informeSocialPdf" TEXT,
    "trabajadorSocialId" INTEGER NOT NULL,
    "fechaEvaluacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "observaciones" TEXT,
    CONSTRAINT "evaluaciones_sociales_pacienteRegistroId_fkey" FOREIGN KEY ("pacienteRegistroId") REFERENCES "pacientes_registro" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evaluaciones_sociales_trabajadorSocialId_fkey" FOREIGN KEY ("trabajadorSocialId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "beneficiarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pacienteRegistroId" INTEGER NOT NULL,
    "codigoBeneficiario" TEXT NOT NULL,
    "estadoBeneficiario" TEXT NOT NULL DEFAULT 'ACTIVO',
    "estadoMedico" TEXT NOT NULL DEFAULT 'EN_TRATAMIENTO',
    "fechaAceptacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aceptadoPorId" INTEGER NOT NULL,
    "asignadoAId" INTEGER,
    "historiaClinica" TEXT,
    "fechaPrimerContacto" DATETIME,
    "nombreMedicoTratante" TEXT,
    "especialidadMedico" TEXT,
    "telefonoMedico" TEXT,
    "institucionMedica" TEXT,
    "faseTratamiento" TEXT,
    "semanaProtocolo" INTEGER,
    "esquemaTratamiento" TEXT,
    "ultimaFechaControl" DATETIME,
    "proximaFechaControl" DATETIME,
    "frecuenciaControl" TEXT,
    "fechaInicioVigilancia" DATETIME,
    "tiempoVigilanciaAnios" INTEGER,
    "fechaUltimaAsistencia" DATETIME,
    "motivoAbandono" TEXT,
    "notificadoDefensoria" BOOLEAN NOT NULL DEFAULT false,
    "fechaNotificacionDefensoria" DATETIME,
    "fechaFallecimiento" DATETIME,
    "causaFallecimiento" TEXT,
    "alergiasMedicamentos" TEXT,
    "complicaciones" TEXT,
    "observacionesMedicas" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "beneficiarios_aceptadoPorId_fkey" FOREIGN KEY ("aceptadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "beneficiarios_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "beneficiarios_pacienteRegistroId_fkey" FOREIGN KEY ("pacienteRegistroId") REFERENCES "pacientes_registro" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ayudas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "beneficiarioId" INTEGER NOT NULL,
    "fechaAyuda" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medicamentos" DECIMAL NOT NULL DEFAULT 0,
    "analisisExamenes" DECIMAL NOT NULL DEFAULT 0,
    "quimioterapia" DECIMAL NOT NULL DEFAULT 0,
    "transporte" DECIMAL NOT NULL DEFAULT 0,
    "alimentacion" DECIMAL NOT NULL DEFAULT 0,
    "otros" DECIMAL NOT NULL DEFAULT 0,
    "totalAyuda" DECIMAL NOT NULL,
    "observaciones" TEXT,
    "registradoPorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ayudas_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ayudas_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sesiones_quimioterapia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "beneficiarioId" INTEGER NOT NULL,
    "numeroSesion" INTEGER NOT NULL,
    "fechaProgramada" DATETIME NOT NULL,
    "fechaRealizada" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'PROGRAMADA',
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sesiones_quimioterapia_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "solicitudes_ayuda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigoSolicitud" TEXT NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "solicitadoPorId" INTEGER NOT NULL,
    "fechaSolicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prioridad" TEXT NOT NULL DEFAULT 'MEDIA',
    "tipoAyuda" TEXT NOT NULL,
    "numeroReceta" TEXT,
    "fechaReceta" DATETIME,
    "medicoPrescriptor" TEXT,
    "recetaPdf" TEXT,
    "detalleSolicitud" TEXT NOT NULL,
    "costoEstimado" DECIMAL,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "revisadoPorId" INTEGER,
    "fechaRevision" DATETIME,
    "motivoRechazo" TEXT,
    "fechaEntrega" DATETIME,
    "lugarEntrega" TEXT,
    "costoReal" DECIMAL,
    "proveedor" TEXT,
    "facturaPdf" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "instruccionesEntrega" TEXT,
    "montoAprobado" DECIMAL,
    CONSTRAINT "solicitudes_ayuda_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "solicitudes_ayuda_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "solicitudes_ayuda_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "emailDestinatario" TEXT,
    "tipo" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL DEFAULT 'normal',
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "relacionadoTipo" TEXT,
    "relacionadoId" INTEGER,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fechaLeida" DATETIME,
    "emailEnviado" BOOLEAN NOT NULL DEFAULT false,
    "fechaEmailEnviado" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "codigos_verificacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "expiraEn" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "whatsapp_templates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "plantilla" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "evaluaciones_sociales_pacienteRegistroId_key" ON "evaluaciones_sociales"("pacienteRegistroId");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiarios_pacienteRegistroId_key" ON "beneficiarios"("pacienteRegistroId");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiarios_codigoBeneficiario_key" ON "beneficiarios"("codigoBeneficiario");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiarios_historiaClinica_key" ON "beneficiarios"("historiaClinica");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_ayuda_codigoSolicitud_key" ON "solicitudes_ayuda"("codigoSolicitud");

-- CreateIndex
CREATE INDEX "codigos_verificacion_email_codigo_idx" ON "codigos_verificacion"("email", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_templates_codigo_key" ON "whatsapp_templates"("codigo");
