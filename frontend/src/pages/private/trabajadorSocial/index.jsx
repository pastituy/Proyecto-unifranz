import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useUser } from "../../../context/userContext";
import { FaUserPlus, FaClipboardCheck, FaSearch, FaFilePdf, FaPaperPlane, FaEye, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaEdit, FaTrash } from "react-icons/fa";
import PdfViewer from "../../../components/PdfViewer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TrabajoSocial = () => {
  const { user, token } = useUser();
  const [activeTab, setActiveTab] = useState("registros");
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Modales
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState(null);

  // PDF Viewer
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");

  // Form Registro
  const [registroForm, setRegistroForm] = useState({
    nombreCompletoNino: "",
    fechaNacimiento: "",
    edad: "",
    ciNino: "",
    diagnostico: "",
    nombreCompletoTutor: "",
    ciTutor: "",
    parentesco: "",
    telefonoTutor: "",
    direccion: "",
    emailTutor: ""
  });

  // Form Evaluación Social
  const [evaluacionForm, setEvaluacionForm] = useState({
    ingresoFamiliar: 0,
    numPersonasHogar: 0,
    tipoVivienda: 0,
    situacionLaboralPadres: 0,
    accesoSalud: 0,
    gastosMedicosMensuales: 0
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [analizandoPdf, setAnalizandoPdf] = useState(false);
  const [pdfAnalizado, setPdfAnalizado] = useState(false);
  const [nombreArchivoPdf, setNombreArchivoPdf] = useState(null);
  const [observacionesIA, setObservacionesIA] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchRegistros();
    }
  }, [user]);

  // Calcular edad automáticamente cuando cambia la fecha de nacimiento
  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return "";
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad >= 0 ? edad : 0;
  };

  // Validar solo letras y espacios
  const handleSoloLetras = (e, campo) => {
    const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    setRegistroForm({ ...registroForm, [campo]: valor });
  };

  // Validar solo números
  const handleSoloNumeros = (e, campo) => {
    const valor = e.target.value.replace(/[^0-9]/g, "");
    setRegistroForm({ ...registroForm, [campo]: valor });
  };

  // Manejar cambio de fecha de nacimiento
  const handleFechaNacimiento = (e) => {
    const fecha = e.target.value;
    const edadCalculada = calcularEdad(fecha);
    setRegistroForm({
      ...registroForm,
      fechaNacimiento: fecha,
      edad: edadCalculada
    });
  };

  const fetchRegistros = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/mis-registros/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRegistros(data.data);
      }
    } catch (err) {
      setError("Error al cargar los registros");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validar que la edad esté calculada
    if (!registroForm.edad && registroForm.edad !== 0) {
      setError("Por favor seleccione una fecha de nacimiento válida");
      setLoading(false);
      return;
    }

    try {
      const url = isEditMode
        ? `${API_URL}/paciente-registro/${selectedRegistro.id}`
        : `${API_URL}/registro-paciente`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...registroForm,
          edad: parseInt(registroForm.edad, 10),
          ...(isEditMode ? {} : { creadoPorId: user.id })
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(isEditMode ? "Registro actualizado exitosamente" : "Registro creado exitosamente");
        setShowRegistroModal(false);
        resetRegistroForm();
        fetchRegistros();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.mensaje || data.error || `Error al ${isEditMode ? 'actualizar' : 'crear'} el registro`);
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Solo guardar el archivo PDF cuando se selecciona
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPdfFile(file);
    setPdfAnalizado(false);
    setObservacionesIA("");
    setError("");
    // Reiniciar formulario a ceros
    setEvaluacionForm({
      ingresoFamiliar: 0,
      numPersonasHogar: 0,
      tipoVivienda: 0,
      situacionLaboralPadres: 0,
      accesoSalud: 0,
      gastosMedicosMensuales: 0
    });
  };

  // Analizar PDF con IA cuando se presiona el botón "Evaluar"
  const handleAnalizarPdf = async () => {
    if (!pdfFile) return;

    setAnalizandoPdf(true);
    setError("");

    // Crear FormData para enviar el PDF
    const formData = new FormData();
    formData.append("informeSocialPdf", pdfFile);

    try {
      const response = await fetch(`${API_URL}/analizar-informe-social`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (data.success || data.data) {
        // Pre-llenar el formulario con los puntajes de la IA
        const puntajes = data.data.puntajes;
        setEvaluacionForm({
          ingresoFamiliar: puntajes.ingresoFamiliar || 0,
          numPersonasHogar: puntajes.numPersonasHogar || 0,
          tipoVivienda: puntajes.tipoVivienda || 0,
          situacionLaboralPadres: puntajes.situacionLaboralPadres || 0,
          accesoSalud: puntajes.accesoSalud || 0,
          gastosMedicosMensuales: puntajes.gastosMedicosMensuales || 0
        });
        setObservacionesIA(puntajes.observaciones || "");
        setNombreArchivoPdf(data.data.nombreArchivo);
        setPdfAnalizado(true);
        setSuccess(data.mensaje || "Análisis completado. Revisa y ajusta los puntajes si es necesario.");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError("Hubo un problema al analizar el PDF. Por favor, ingresa los puntajes manualmente.");
      }
    } catch (err) {
      console.error("Error al analizar PDF:", err);
      setError("Error al analizar el PDF. Por favor, ingresa los puntajes manualmente.");
    } finally {
      setAnalizandoPdf(false);
    }
  };

  const handleEvaluacionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validar que se haya subido y analizado el PDF
    if (!pdfFile && !nombreArchivoPdf) {
      setError("El informe social en PDF es obligatorio para poder derivar al psicólogo");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("pacienteRegistroId", selectedRegistro.id);
    formData.append("trabajadorSocialId", user.id);
    Object.keys(evaluacionForm).forEach(key => {
      formData.append(key, evaluacionForm[key]);
    });

    // Si ya se analizó el PDF, enviar el nombre del archivo
    if (nombreArchivoPdf) {
      formData.append("nombreArchivoPdf", nombreArchivoPdf);
    }

    // Enviar las observaciones generadas por la IA
    if (observacionesIA) {
      formData.append("observaciones", observacionesIA);
    }

    try {
      const response = await fetch(`${API_URL}/evaluacion-social`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Evaluación social guardada exitosamente");
        setShowEvaluacionModal(false);
        resetEvaluacionForm();
        fetchRegistros();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Error al guardar la evaluación");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarEvaluacion = async (registroId) => {
    if (!window.confirm("¿Desea enviar este caso a revisión del administrador?")) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/enviar-a-administrador/${registroId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      console.log("=== RESPUESTA DE DERIVACIÓN ===");
      console.log("Success:", data.success);
      console.log("Mensaje:", data.mensaje);
      console.log("Data completa:", data);
      console.log("===============================");

      if (data.success) {
        setSuccess("Caso enviado a revisión del administrador exitosamente");
        fetchRegistros();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.mensaje || data.error || "Error al enviar el caso");
        console.error("Error en derivación:", data);
      }
    } catch (err) {
      console.error("Error al enviar a administrador:", err);
      setError("Error de conexión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el modal de edición
  const handleEditarRegistro = (registro) => {
    setIsEditMode(true);
    setSelectedRegistro(registro);
    // Llenar el formulario con los datos del registro
    setRegistroForm({
      nombreCompletoNino: registro.nombreCompletoNino,
      fechaNacimiento: registro.fechaNacimiento.split('T')[0],
      edad: registro.edad,
      ciNino: registro.ciNino || "",
      diagnostico: registro.diagnostico,
      nombreCompletoTutor: registro.nombreCompletoTutor,
      ciTutor: registro.ciTutor,
      parentesco: registro.parentesco,
      telefonoTutor: registro.telefonoTutor,
      direccion: registro.direccion,
      emailTutor: registro.emailTutor || ""
    });
    setShowRegistroModal(true);
  };

  // Función para confirmar eliminación
  const handleEliminarRegistro = (registro) => {
    setRegistroToDelete(registro);
    setShowDeleteModal(true);
  };

  // Función para confirmar y eliminar
  const confirmarEliminar = async () => {
    if (!registroToDelete) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/paciente-registro/${registroToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Registro eliminado exitosamente");
        fetchRegistros();
        setShowDeleteModal(false);
        setRegistroToDelete(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Error al eliminar el registro");
      }
    } catch (err) {
      console.error("Error al eliminar registro:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const resetRegistroForm = () => {
    setRegistroForm({
      nombreCompletoNino: "",
      fechaNacimiento: "",
      edad: "",
      ciNino: "",
      diagnostico: "",
      nombreCompletoTutor: "",
      ciTutor: "",
      parentesco: "",
      telefonoTutor: "",
      direccion: "",
      emailTutor: ""
    });
    setIsEditMode(false);
    setSelectedRegistro(null);
  };

  const resetEvaluacionForm = () => {
    setEvaluacionForm({
      ingresoFamiliar: 0,
      numPersonasHogar: 0,
      tipoVivienda: 0,
      situacionLaboralPadres: 0,
      accesoSalud: 0,
      gastosMedicosMensuales: 0
    });
    setPdfFile(null);
    setAnalizandoPdf(false);
    setPdfAnalizado(false);
    setNombreArchivoPdf(null);
    setObservacionesIA("");
  };

  const handleCerrarEvaluacionModal = () => {
    resetEvaluacionForm();
    setShowEvaluacionModal(false);
  };

  const calcularPuntajeTotal = () => {
    return Object.values(evaluacionForm).reduce((sum, val) => sum + Number(val), 0);
  };

  const getNivelVulnerabilidad = () => {
    const puntaje = calcularPuntajeTotal();
    if (puntaje >= 60) return "ALTO";
    if (puntaje >= 30) return "MEDIO";
    return "BAJO";
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      REGISTRO_INICIAL: "Registro Inicial",
      PENDIENTE_EVALUACION_PSICOLOGICA: "Pendiente Psicología",
      EN_EVALUACION_ADMINISTRADOR: "En Evaluación Admin",
      BENEFICIARIO_ACTIVO: "Beneficiario Activo",
      CASO_RECHAZADO: "Caso Rechazado"
    };
    return labels[estado] || estado;
  };

  const filteredRegistros = registros.filter(r => {
    const matchSearch = r.nombreCompletoNino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       r.ciTutor.includes(searchTerm);
    const matchEstado = filterEstado === "todos" || r.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const handleViewPdf = (pdfFilename, title) => {
    setPdfUrl(`${API_URL}/pdf/${pdfFilename}`);
    setPdfTitle(title);
    setShowPdfViewer(true);
  };

  return (
    <Container>
      <Header>
        <Title>Gestión de Beneficiarios - Trabajo Social</Title>
        <Subtitle>Bienvenido/a, {user?.nombre}</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <TabContainer>
        <Tab active={activeTab === "registros"} onClick={() => setActiveTab("registros")}>
          <FaUserPlus /> Mis Registros
        </Tab>
        <Tab active={activeTab === "evaluaciones"} onClick={() => setActiveTab("evaluaciones")}>
          <FaClipboardCheck /> Evaluaciones Pendientes
        </Tab>
      </TabContainer>

      <ContentArea>
        <ActionBar>
          <SearchContainer>
            <FaSearch />
            <SearchInput
              placeholder="Buscar por nombre o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <FilterSelect value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="REGISTRO_INICIAL">Registro Inicial</option>
            <option value="PENDIENTE_EVALUACION_PSICOLOGICA">Pendiente Psicología</option>
            <option value="EN_EVALUACION_ADMINISTRADOR">En Evaluación Admin</option>
            <option value="BENEFICIARIO_ACTIVO">Beneficiario Activo</option>
            <option value="CASO_RECHAZADO">Caso Rechazado</option>
          </FilterSelect>
          <PrimaryButton onClick={() => setShowRegistroModal(true)}>
            <FaUserPlus /> Nuevo Registro
          </PrimaryButton>
        </ActionBar>

        {loading ? (
          <LoadingSpinner>Cargando...</LoadingSpinner>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Nombre del Niño/a</TableHeader>
                  <TableHeader>Edad</TableHeader>
                  <TableHeader>Diagnóstico</TableHeader>
                  <TableHeader>Tutor</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Fecha Registro</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </tr>
              </thead>
              <tbody>
                {filteredRegistros.length === 0 ? (
                  <tr>
                    <TableCell colSpan="7" style={{ textAlign: "center" }}>
                      No hay registros para mostrar
                    </TableCell>
                  </tr>
                ) : (
                  filteredRegistros.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell>{registro.nombreCompletoNino}</TableCell>
                      <TableCell>{registro.edad} años</TableCell>
                      <TableCell>{registro.diagnostico}</TableCell>
                      <TableCell>{registro.nombreCompletoTutor}</TableCell>
                      <TableCell>
                        <StatusBadge status={registro.estado}>
                          {getEstadoLabel(registro.estado)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        {new Date(registro.fechaRegistro).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <ActionButtons>
                          <IconButton onClick={() => { setSelectedRegistro(registro); setShowDetalleModal(true); }}>
                            <FaEye title="Ver detalle" />
                          </IconButton>
                          {registro.estado === "REGISTRO_INICIAL" && (
                            <>
                              <IconButton onClick={() => handleEditarRegistro(registro)} style={{ color: '#2196F3' }}>
                                <FaEdit title="Editar registro" />
                              </IconButton>
                              <IconButton onClick={() => handleEliminarRegistro(registro)} style={{ color: '#f44336' }}>
                                <FaTrash title="Eliminar registro" />
                              </IconButton>
                            </>
                          )}
                          {registro.estado === "REGISTRO_INICIAL" && !registro.evaluacionSocial && (
                            <IconButton onClick={() => { setSelectedRegistro(registro); setShowEvaluacionModal(true); }}>
                              <FaClipboardCheck title="Evaluar" />
                            </IconButton>
                          )}
                          {registro.estado === "REGISTRO_INICIAL" && registro.evaluacionSocial && (
                            <IconButton onClick={() => handleSolicitarEvaluacion(registro.id)}>
                              <FaPaperPlane title="Enviar a Administrador" />
                            </IconButton>
                          )}
                          {registro.evaluacionSocial?.informeSocialPdf && (
                            <IconButton onClick={() => handleViewPdf(registro.evaluacionSocial.informeSocialPdf, "Informe Social - " + registro.nombreCompletoNino)}>
                              <FaFilePdf title="Ver PDF Social" />
                            </IconButton>
                          )}
                        </ActionButtons>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </ContentArea>

      {/* Modal Nuevo Registro */}
      <Modal show={showRegistroModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{isEditMode ? 'Editar Registro de Paciente' : 'Nuevo Registro de Paciente'}</ModalTitle>
            <CloseButton onClick={() => setShowRegistroModal(false)}>&times;</CloseButton>
          </ModalHeader>
          <form onSubmit={handleRegistroSubmit}>
            <SectionTitle>Datos del Niño/a</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Nombre Completo * (solo letras)</Label>
                <Input
                  type="text"
                  required
                  value={registroForm.nombreCompletoNino}
                  onChange={(e) => handleSoloLetras(e, "nombreCompletoNino")}
                  placeholder="Ingrese nombre completo"
                />
              </FormGroup>
              <FormGroup>
                <Label>Fecha de Nacimiento *</Label>
                <Input
                  type="date"
                  required
                  value={registroForm.fechaNacimiento}
                  onChange={handleFechaNacimiento}
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormGroup>
              <FormGroup>
                <Label>Edad (auto-calculada)</Label>
                <Input
                  type="number"
                  readOnly
                  value={registroForm.edad}
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  placeholder="Se calcula automáticamente"
                />
              </FormGroup>
              <FormGroup>
                <Label>CI del Niño/a (solo números)</Label>
                <Input
                  type="text"
                  value={registroForm.ciNino}
                  onChange={(e) => handleSoloNumeros(e, "ciNino")}
                  placeholder="Ingrese CI"
                  maxLength={10}
                />
              </FormGroup>
              <FormGroup style={{gridColumn: "1 / -1"}}>
                <Label>Diagnóstico *</Label>
                <TextArea
                  required
                  value={registroForm.diagnostico}
                  onChange={(e) => setRegistroForm({...registroForm, diagnostico: e.target.value})}
                  placeholder="Describa el diagnóstico médico..."
                />
              </FormGroup>
            </FormGrid>

            <SectionTitle>Datos del Tutor/Responsable</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Nombre Completo * (solo letras)</Label>
                <Input
                  type="text"
                  required
                  value={registroForm.nombreCompletoTutor}
                  onChange={(e) => handleSoloLetras(e, "nombreCompletoTutor")}
                  placeholder="Ingrese nombre completo"
                />
              </FormGroup>
              <FormGroup>
                <Label>CI * (solo números)</Label>
                <Input
                  type="text"
                  required
                  value={registroForm.ciTutor}
                  onChange={(e) => handleSoloNumeros(e, "ciTutor")}
                  placeholder="Ingrese CI"
                  maxLength={10}
                />
              </FormGroup>
              <FormGroup>
                <Label>Parentesco *</Label>
                <Select
                  required
                  value={registroForm.parentesco}
                  onChange={(e) => setRegistroForm({...registroForm, parentesco: e.target.value})}
                >
                  <option value="">Seleccione...</option>
                  <option value="Madre">Madre</option>
                  <option value="Padre">Padre</option>
                  <option value="Abuelo/a">Abuelo/a</option>
                  <option value="Tío/a">Tío/a</option>
                  <option value="Hermano/a">Hermano/a</option>
                  <option value="Otro">Otro</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Teléfono * (solo números)</Label>
                <Input
                  type="tel"
                  required
                  value={registroForm.telefonoTutor}
                  onChange={(e) => handleSoloNumeros(e, "telefonoTutor")}
                  placeholder="Ingrese teléfono"
                  maxLength={10}
                />
              </FormGroup>
              <FormGroup>
                <Label>Dirección *</Label>
                <Input
                  type="text"
                  required
                  value={registroForm.direccion}
                  onChange={(e) => setRegistroForm({...registroForm, direccion: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={registroForm.emailTutor}
                  onChange={(e) => setRegistroForm({...registroForm, emailTutor: e.target.value})}
                />
              </FormGroup>
            </FormGrid>

            <ModalActions>
              <SecondaryButton type="button" onClick={() => setShowRegistroModal(false)}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Registro"}
              </PrimaryButton>
            </ModalActions>
          </form>
        </ModalContent>
      </Modal>

      {/* Modal Evaluación Social */}
      <Modal show={showEvaluacionModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Evaluación Social</ModalTitle>
            <CloseButton onClick={handleCerrarEvaluacionModal}>&times;</CloseButton>
          </ModalHeader>
          {selectedRegistro && (
            <form onSubmit={handleEvaluacionSubmit}>
              <InfoBox>
                <strong>Paciente:</strong> {selectedRegistro.nombreCompletoNino} <br />
                <strong>Diagnóstico:</strong> {selectedRegistro.diagnostico}
              </InfoBox>

              <SectionTitle>Criterios de Vulnerabilidad (Puntaje 0-100)</SectionTitle>

              <VulnerabilityGrid>
                <VulnerabilityItem>
                  <VulnerabilityLabel>Ingreso Familiar (0-20 pts)</VulnerabilityLabel>
                  <VulnerabilityInput
                    type="number"
                    min="0"
                    max="20"
                    value={evaluacionForm.ingresoFamiliar}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, ingresoFamiliar: Number(e.target.value)})}
                  />
                  <VulnerabilityHint>Mayor puntaje = menor ingreso</VulnerabilityHint>
                </VulnerabilityItem>

                <VulnerabilityItem>
                  <VulnerabilityLabel>Personas en el Hogar (0-15 pts)</VulnerabilityLabel>
                  <VulnerabilityInput
                    type="number"
                    min="0"
                    max="15"
                    value={evaluacionForm.numPersonasHogar}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, numPersonasHogar: Number(e.target.value)})}
                  />
                  <VulnerabilityHint>Mayor puntaje = más personas dependientes</VulnerabilityHint>
                </VulnerabilityItem>

                <VulnerabilityItem>
                  <VulnerabilityLabel>Tipo de Vivienda (0-15 pts)</VulnerabilityLabel>
                  <VulnerabilityInput
                    type="number"
                    min="0"
                    max="15"
                    value={evaluacionForm.tipoVivienda}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, tipoVivienda: Number(e.target.value)})}
                  />
                  <VulnerabilityHint>Mayor puntaje = peor condición de vivienda</VulnerabilityHint>
                </VulnerabilityItem>

                <VulnerabilityItem>
                  <VulnerabilityLabel>Situación Laboral Padres (0-20 pts)</VulnerabilityLabel>
                  <VulnerabilityInput
                    type="number"
                    min="0"
                    max="20"
                    value={evaluacionForm.situacionLaboralPadres}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, situacionLaboralPadres: Number(e.target.value)})}
                  />
                  <VulnerabilityHint>Mayor puntaje = situación más precaria</VulnerabilityHint>
                </VulnerabilityItem>

                <VulnerabilityItem>
                  <VulnerabilityLabel>Acceso a Salud (0-15 pts)</VulnerabilityLabel>
                  <VulnerabilityInput
                    type="number"
                    min="0"
                    max="15"
                    value={evaluacionForm.accesoSalud}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, accesoSalud: Number(e.target.value)})}
                  />
                  <VulnerabilityHint>Mayor puntaje = menor acceso a salud</VulnerabilityHint>
                </VulnerabilityItem>

                <VulnerabilityItem>
                  <VulnerabilityLabel>Gastos Médicos Mensuales (0-15 pts)</VulnerabilityLabel>
                  <VulnerabilityInput
                    type="number"
                    min="0"
                    max="15"
                    value={evaluacionForm.gastosMedicosMensuales}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, gastosMedicosMensuales: Number(e.target.value)})}
                  />
                  <VulnerabilityHint>Mayor puntaje = mayores gastos</VulnerabilityHint>
                </VulnerabilityItem>
              </VulnerabilityGrid>

              <TotalScoreBox nivel={getNivelVulnerabilidad()}>
                <div>Puntaje Total: <strong>{calcularPuntajeTotal()}/100</strong></div>
                <div>Nivel de Vulnerabilidad: <strong>{getNivelVulnerabilidad()}</strong></div>
              </TotalScoreBox>

              <SectionTitle>Informe Social (PDF) *</SectionTitle>
              <FormGroup>
                <FileInput
                  type="file"
                  accept=".pdf"
                  required
                  onChange={handlePdfChange}
                  disabled={analizandoPdf}
                />
                {!analizandoPdf && !pdfAnalizado && !pdfFile && (
                  <FileHint>Obligatorio - Máximo 5MB, solo archivos PDF. Presione "Evaluar" después de subir.</FileHint>
                )}

                {/* Botón Evaluar - aparece cuando se sube el PDF */}
                {pdfFile && !pdfAnalizado && !analizandoPdf && (
                  <div style={{ margin: '16px 24px' }}>
                    <EvaluarButton onClick={handleAnalizarPdf}>
                      🤖 Evaluar con IA
                    </EvaluarButton>
                  </div>
                )}

                {analizandoPdf && (
                  <FileHint style={{ color: '#2196F3', fontWeight: 'bold' }}>
                    🤖 Analizando PDF con IA... Por favor espere.
                  </FileHint>
                )}
                {pdfAnalizado && !analizandoPdf && (
                  <FileHint style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    ✅ PDF analizado exitosamente. Revise los puntajes sugeridos arriba.
                  </FileHint>
                )}

                {observacionesIA && (
                  <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    backgroundColor: '#F0F7FF',
                    border: '1px solid #BBDEFB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#0D47A1'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#1565C0' }}>📋 Resumen del Análisis IA:</strong>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{observacionesIA}</div>
                  </div>
                )}
              </FormGroup>

              <ModalActions>
                <SecondaryButton type="button" onClick={handleCerrarEvaluacionModal}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Evaluación"}
                </PrimaryButton>
              </ModalActions>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Detalle */}
      <Modal show={showDetalleModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Detalle del Registro</ModalTitle>
            <CloseButton onClick={() => setShowDetalleModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedRegistro && (
            <DetalleContent>
              <DetalleSection>
                <DetalleSectionTitle>Datos del Niño/a</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Nombre:</strong> {selectedRegistro.nombreCompletoNino}</DetalleItem>
                  <DetalleItem><strong>Edad:</strong> {selectedRegistro.edad} años</DetalleItem>
                  <DetalleItem><strong>Fecha Nac.:</strong> {new Date(selectedRegistro.fechaNacimiento).toLocaleDateString()}</DetalleItem>
                  <DetalleItem><strong>CI:</strong> {selectedRegistro.ciNino || "No registrado"}</DetalleItem>
                  <DetalleItem style={{gridColumn: "1 / -1"}}><strong>Diagnóstico:</strong> {selectedRegistro.diagnostico}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              <DetalleSection>
                <DetalleSectionTitle>Datos del Tutor</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Nombre:</strong> {selectedRegistro.nombreCompletoTutor}</DetalleItem>
                  <DetalleItem><strong>CI:</strong> {selectedRegistro.ciTutor}</DetalleItem>
                  <DetalleItem><strong>Parentesco:</strong> {selectedRegistro.parentesco}</DetalleItem>
                  <DetalleItem><strong>Teléfono:</strong> {selectedRegistro.telefonoTutor}</DetalleItem>
                  <DetalleItem><strong>Dirección:</strong> {selectedRegistro.direccion}</DetalleItem>
                  <DetalleItem><strong>Email:</strong> {selectedRegistro.emailTutor || "No registrado"}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              {selectedRegistro.evaluacionSocial && (
                <DetalleSection>
                  <DetalleSectionTitle>Evaluación Social</DetalleSectionTitle>
                  <DetalleGrid>
                    <DetalleItem><strong>Puntaje Total:</strong> {selectedRegistro.evaluacionSocial.puntajeTotal}/100</DetalleItem>
                    <DetalleItem><strong>Nivel:</strong> {selectedRegistro.evaluacionSocial.nivelVulnerabilidad}</DetalleItem>
                    <DetalleItem><strong>Fecha:</strong> {new Date(selectedRegistro.evaluacionSocial.fechaEvaluacion).toLocaleDateString()}</DetalleItem>
                  </DetalleGrid>
                </DetalleSection>
              )}

              <DetalleSection>
                <DetalleSectionTitle>Estado del Caso</DetalleSectionTitle>
                <StatusBadge status={selectedRegistro.estado} style={{fontSize: "1rem", padding: "10px 20px"}}>
                  {getEstadoLabel(selectedRegistro.estado)}
                </StatusBadge>
              </DetalleSection>

              <ModalActions>
                <SecondaryButton onClick={() => setShowDetalleModal(false)}>
                  Cerrar
                </SecondaryButton>
              </ModalActions>
            </DetalleContent>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Confirmación Eliminación */}
      <Modal show={showDeleteModal}>
        <ModalContent style={{ maxWidth: '500px' }}>
          <ModalHeader>
            <ModalTitle>Confirmar Eliminación</ModalTitle>
            <CloseButton onClick={() => setShowDeleteModal(false)}>&times;</CloseButton>
          </ModalHeader>
          <div style={{ padding: '24px' }}>
            <p style={{ marginBottom: '20px', fontSize: '1rem', color: '#333' }}>
              ¿Está seguro que desea eliminar el registro de{' '}
              <strong>{registroToDelete?.nombreCompletoNino}</strong>?
            </p>
            <p style={{ marginBottom: '24px', fontSize: '0.9rem', color: '#666' }}>
              Esta acción no se puede deshacer.
            </p>
            <ModalActions>
              <SecondaryButton type="button" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton
                type="button"
                onClick={confirmarEliminar}
                disabled={loading}
                style={{ backgroundColor: '#f44336' }}
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </PrimaryButton>
            </ModalActions>
          </div>
        </ModalContent>
      </Modal>

      {/* PDF Viewer */}
      {showPdfViewer && (
        <PdfViewer
          pdfUrl={pdfUrl}
          title={pdfTitle}
          onClose={() => setShowPdfViewer(false)}
        />
      )}
    </Container>
  );
};

export default TrabajoSocial;

// Styled Components
const Container = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ff6347;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: ${props => props.active ? '#ff6347' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#ff6347' : '#fff5f2'};
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 0 0 8px 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ActionBar = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
  flex: 1;
  max-width: 400px;

  svg {
    color: #999;
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  padding: 12px;
  font-size: 1rem;
  width: 100%;
  outline: none;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #ff6347;
  }
`;

const PrimaryButton = styled.button`
  background: #ff6347;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: #e55a2b;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #666;
  border: 2px solid #e0e0e0;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ff6347;
    color: #ff6347;
  }
`;

const TableContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background: #ff6347;
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #fef7f5;
  }
  &:hover {
    background: #fff0ed;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  ${props => {
    switch(props.status) {
      case 'REGISTRO_INICIAL':
        return 'background: #e3f2fd; color: #1976d2;';
      case 'PENDIENTE_EVALUACION_PSICOLOGICA':
        return 'background: #fff3e0; color: #f57c00;';
      case 'EN_EVALUACION_ADMINISTRADOR':
        return 'background: #f3e5f5; color: #7b1fa2;';
      case 'BENEFICIARIO_ACTIVO':
        return 'background: #e8f5e9; color: #388e3c;';
      case 'CASO_RECHAZADO':
        return 'background: #ffebee; color: #d32f2f;';
      default:
        return 'background: #f5f5f5; color: #666;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: #f5f5f5;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: #ff6347;
    color: white;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const Modal = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const ModalTitle = styled.h3`
  color: #ff6347;
  font-size: 1.4rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: #ff6347;
  }
`;

const SectionTitle = styled.h4`
  color: #333;
  font-size: 1.1rem;
  margin: 20px 24px 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ff6347;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 0 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #333;
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #ff6347;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  min-height: 80px;
  resize: vertical;

  &:focus {
    border-color: #ff6347;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #ff6347;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
`;

const InfoBox = styled.div`
  background: #fff3e0;
  padding: 16px 24px;
  margin: 16px 24px;
  border-radius: 8px;
  border-left: 4px solid #ff6347;
`;

const VulnerabilityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 0 24px;
`;

const VulnerabilityItem = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const VulnerabilityLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const VulnerabilityInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1.1rem;
  text-align: center;
  outline: none;

  &:focus {
    border-color: #ff6347;
  }
`;

const VulnerabilityHint = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-top: 6px;
`;

const TotalScoreBox = styled.div`
  margin: 24px;
  padding: 20px;
  background: ${props => {
    switch(props.nivel) {
      case 'ALTO': return '#ffebee';
      case 'MEDIO': return '#fff3e0';
      case 'BAJO': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  }};
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  border: 2px solid ${props => {
    switch(props.nivel) {
      case 'ALTO': return '#ef5350';
      case 'MEDIO': return '#ff9800';
      case 'BAJO': return '#4caf50';
      default: return '#e0e0e0';
    }
  }};
`;

const FileInput = styled.input`
  padding: 12px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  margin: 0 24px;
  max-width: calc(100% - 48px);

  &:hover {
    border-color: #ff6347;
  }
`;

const FileHint = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin: 8px 24px;
`;

const EvaluarButton = styled.button`
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DetalleContent = styled.div`
  padding: 0 0 20px;
`;

const DetalleSection = styled.div`
  margin-bottom: 24px;
`;

const DetalleSectionTitle = styled.h4`
  color: #ff6347;
  font-size: 1rem;
  margin: 0 24px 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
`;

const DetalleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 24px;
`;

const DetalleItem = styled.div`
  color: #666;
  font-size: 0.95rem;

  strong {
    color: #333;
  }
`;
