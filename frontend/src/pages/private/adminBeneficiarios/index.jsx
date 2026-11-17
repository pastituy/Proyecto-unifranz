import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useUser } from "../../../context/userContext";
import {
  FaSearch, FaCheck, FaTimes, FaEye, FaFilePdf, FaUserShield,
  FaClipboardCheck, FaChartBar, FaUserPlus, FaUsers, FaBell, FaBrain
} from "react-icons/fa";
import PdfViewer from "../../../components/PdfViewer";
import AdminCaseDetail from "./components/AdminCaseDetail";
import NotificationBell from "../../../components/NotificationBell";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AdminBeneficiarios = () => {
  const { user, token } = useUser();
  const [casos, setCasos] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [asistentes, setAsistentes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pendientes");

  // Modales
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showAceptarModal, setShowAceptarModal] = useState(false);
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [selectedCaso, setSelectedCaso] = useState(null);
  const [selectedAsistente, setSelectedAsistente] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // PDF Viewer
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");

  // Resumen IA
  const [showResumenIA, setShowResumenIA] = useState(false);
  const [resumenIA, setResumenIA] = useState(null);
  const [loadingResumen, setLoadingResumen] = useState(false);

  useEffect(() => {
    fetchCasos();
    fetchBeneficiarios();
    fetchAsistentes();
    fetchEstadisticas();
  }, []);

  const fetchCasos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/casos-en-evaluacion`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCasos(data.data);
      }
    } catch (err) {
      setError("Error al cargar los casos");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiarios = async () => {
    try {
      const response = await fetch(`${API_URL}/beneficiarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBeneficiarios(data.data);
      }
    } catch (err) {
      console.error("Error al cargar beneficiarios:", err);
    }
  };

  const fetchAsistentes = async () => {
    try {
      console.log("=== FRONTEND: Cargando asistentes ===");
      console.log("API_URL:", API_URL);
      console.log("Token:", token ? "Presente" : "Ausente");

      const response = await fetch(`${API_URL}/asistentes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);

      const data = await response.json();
      console.log("Data recibida:", data);

      // Verificar si existe el array de asistentes
      if (data.data && Array.isArray(data.data)) {
        console.log("Asistentes cargados:", data.data);
        setAsistentes(data.data);
      } else {
        console.error("Error en respuesta:", data);
      }
    } catch (err) {
      console.error("Error al cargar asistentes:", err);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(`${API_URL}/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  };

  const handleAceptarCaso = async () => {
    if (!selectedAsistente) {
      setError("Debe seleccionar un asistente para asignar el caso");
      return;
    }

    console.log("=== FRONTEND: Aceptar Caso ===");
    console.log("user:", user);
    console.log("user.id:", user?.id);
    console.log("selectedAsistente:", selectedAsistente);

    if (!user || !user.id) {
      setError("Error: No se pudo obtener la información del usuario. Por favor, recargue la página.");
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        adminId: user.id,
        asignadoAId: parseInt(selectedAsistente)
      };

      console.log("Request body:", requestBody);

      const response = await fetch(`${API_URL}/aceptar-caso/${selectedCaso.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(`Caso aceptado. Código de beneficiario: ${data.data.codigoBeneficiario}`);
        setShowAceptarModal(false);
        setSelectedAsistente("");
        fetchCasos();
        fetchEstadisticas();
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "Error al aceptar el caso");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleRechazarCaso = async () => {
    if (!motivoRechazo.trim()) {
      setError("Debe especificar el motivo del rechazo");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/rechazar-caso/${selectedCaso.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ motivo: motivoRechazo })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Caso rechazado correctamente");
        setShowRechazarModal(false);
        setMotivoRechazo("");
        fetchCasos();
        fetchEstadisticas();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Error al rechazar el caso");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = (pdfFilename, title) => {
    setPdfUrl(`${API_URL}/pdf/${pdfFilename}`);
    setPdfTitle(title);
    setShowPdfViewer(true);
  };

  const handleGenerarResumenIA = async () => {
    console.log("=== FRONTEND: Iniciando generación de resumen con IA ===");

    if (!selectedCaso?.evaluacionSocial?.informeSocialPdf) {
      console.error("❌ No hay informe social disponible");
      setError("No hay informe social disponible para generar el resumen");
      return;
    }

    console.log("📄 Archivo PDF:", selectedCaso.evaluacionSocial.informeSocialPdf);
    console.log("👤 Caso seleccionado:", selectedCaso);

    setLoadingResumen(true);
    setShowResumenIA(true);
    setResumenIA(null);

    try {
      console.log("📦 Preparando FormData...");
      const formData = new FormData();

      // Obtener el archivo PDF
      console.log(`🔍 Descargando PDF desde: ${API_URL}/pdf/${selectedCaso.evaluacionSocial.informeSocialPdf}`);
      const pdfResponse = await fetch(`${API_URL}/pdf/${selectedCaso.evaluacionSocial.informeSocialPdf}`);
      console.log("📥 Respuesta del PDF:", pdfResponse.status, pdfResponse.statusText);

      const pdfBlob = await pdfResponse.blob();
      console.log("📦 Blob creado, tamaño:", pdfBlob.size, "bytes");

      formData.append('informeSocialPdf', pdfBlob, selectedCaso.evaluacionSocial.informeSocialPdf);
      console.log("✅ FormData preparado");

      console.log(`🚀 Enviando petición a: ${API_URL}/generar-resumen-caso`);
      const response = await fetch(`${API_URL}/generar-resumen-caso`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      console.log("📨 Respuesta recibida:", response.status, response.statusText);
      const data = await response.json();
      console.log("📊 Data parseada:", data);

      if (data.success) {
        console.log("✅ Resumen generado exitosamente");
        console.log("📄 Resumen IA:", data.data.resumen);
        setResumenIA(data.data.resumen);
        setSuccess("Resumen generado exitosamente con IA");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        console.error("❌ Error en la respuesta:", data.mensaje);
        setError(data.mensaje || "Error al generar el resumen");
        setResumenIA({
          error: true,
          mensaje: data.mensaje || "Error al procesar el documento"
        });
      }
    } catch (error) {
      console.error("❌ Error al generar resumen:", error);
      console.error("Stack:", error.stack);
      setError("Error de conexión al generar el resumen");
      setResumenIA({
        error: true,
        mensaje: "Error de conexión con el servidor"
      });
    } finally {
      console.log("🏁 Finalizando proceso de generación");
      setLoadingResumen(false);
    }
  };

  const filteredCasos = casos.filter(c =>
    c.nombreCompletoNino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ciTutor?.includes(searchTerm)
  );

  const getNivelColor = (nivel) => {
    switch(nivel) {
      case 'ALTO': return '#c62828';
      case 'MEDIO': return '#ef6c00';
      case 'BAJO': return '#2e7d32';
      default: return '#666';
    }
  };

  return (
    <Container>
      <Header>
        <HeaderIcon>
          <FaUserShield />
        </HeaderIcon>
        <HeaderText>
          <Title>Evaluación de Casos</Title>
          <Subtitle>Administrador - {user?.nombre}</Subtitle>
        </HeaderText>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {estadisticas && (
        <StatsContainer>
          <StatCard color="#ff6347">
            <StatIcon><FaClipboardCheck /></StatIcon>
            <StatInfo>
              <StatNumber>{estadisticas.pendientes || 0}</StatNumber>
              <StatLabel>Pendientes</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#4caf50">
            <StatIcon><FaCheck /></StatIcon>
            <StatInfo>
              <StatNumber>{estadisticas.activos || 0}</StatNumber>
              <StatLabel>Beneficiarios Activos</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#2196f3">
            <StatIcon><FaChartBar /></StatIcon>
            <StatInfo>
              <StatNumber>{estadisticas.recuperados || 0}</StatNumber>
              <StatLabel>Recuperados</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#9c27b0">
            <StatIcon><FaUserPlus /></StatIcon>
            <StatInfo>
              <StatNumber>{estadisticas.total || 0}</StatNumber>
              <StatLabel>Total Histórico</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsContainer>
      )}

      <ContentArea>
        <ContentHeader>
          <ContentTitle>Casos Pendientes de Decisión</ContentTitle>
          <SearchContainer>
            <FaSearch />
            <SearchInput
              placeholder="Buscar por nombre o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </ContentHeader>

        {loading ? (
          <LoadingSpinner>Cargando casos...</LoadingSpinner>
        ) : filteredCasos.length === 0 ? (
          <EmptyState>
            <FaClipboardCheck style={{ fontSize: "3rem", color: "#ccc", marginBottom: "16px" }} />
            <p>No hay casos pendientes de evaluación</p>
          </EmptyState>
        ) : (
          <CardsContainer>
            {filteredCasos.map((caso) => (
              <CasoCard key={caso.id}>
                <CasoHeader>
                  <CasoName>{caso.nombreCompletoNino}</CasoName>
                  <CasoBadge>{caso.edad} años</CasoBadge>
                </CasoHeader>

                <CasoInfo>
                  <InfoRow>
                    <InfoLabel>Diagnóstico:</InfoLabel>
                    <InfoValue>{caso.diagnostico}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Tutor:</InfoLabel>
                    <InfoValue>{caso.nombreCompletoTutor}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Teléfono:</InfoLabel>
                    <InfoValue>{caso.telefonoTutor}</InfoValue>
                  </InfoRow>
                </CasoInfo>

                {caso.evaluacionSocial && (
                  <EvaluacionBox>
                    <EvaluacionTitle>Evaluación Social</EvaluacionTitle>
                    <EvaluacionRow>
                      <span>Vulnerabilidad:</span>
                      <VulnerabilityBadge color={getNivelColor(caso.evaluacionSocial.nivelVulnerabilidad)}>
                        {caso.evaluacionSocial.nivelVulnerabilidad}
                      </VulnerabilityBadge>
                    </EvaluacionRow>
                    <EvaluacionRow>
                      <span>Puntaje:</span>
                      <strong>{caso.evaluacionSocial.puntajeTotal}/100</strong>
                    </EvaluacionRow>
                    {caso.evaluacionSocial.informeSocialPdf && (
                      <PdfButton onClick={() => handleViewPdf(caso.evaluacionSocial.informeSocialPdf, "Informe Social - " + caso.nombreCompletoNino)}>
                        <FaFilePdf /> Ver Informe Social
                      </PdfButton>
                    )}
                  </EvaluacionBox>
                )}

                {caso.evaluacionPsicologica && (
                  <EvaluacionBox>
                    <EvaluacionTitle>Evaluación Psicológica</EvaluacionTitle>
                    {caso.evaluacionPsicologica.observaciones && (
                      <EvaluacionRow>
                        <span>Observaciones:</span>
                        <InfoValue>{caso.evaluacionPsicologica.observaciones}</InfoValue>
                      </EvaluacionRow>
                    )}
                    {caso.evaluacionPsicologica.informePsicologicoPdf && (
                      <PdfButton onClick={() => handleViewPdf(caso.evaluacionPsicologica.informePsicologicoPdf, "Informe Psicológico - " + caso.nombreCompletoNino)}>
                        <FaFilePdf /> Ver Informe Psicológico
                      </PdfButton>
                    )}
                  </EvaluacionBox>
                )}

                <CasoActions>
                  <ActionButton onClick={() => { setSelectedCaso(caso); setShowDetalleModal(true); }}>
                    <FaEye /> Ver Detalle
                  </ActionButton>
                  <RejectButton onClick={() => { setSelectedCaso(caso); setShowRechazarModal(true); }}>
                    <FaTimes /> Rechazar
                  </RejectButton>
                  <AcceptButton onClick={() => { setSelectedCaso(caso); setShowAceptarModal(true); }}>
                    <FaCheck /> Aceptar
                  </AcceptButton>
                </CasoActions>
              </CasoCard>
            ))}
          </CardsContainer>
        )}
      </ContentArea>

      {/* Modal Detalle */}
      <Modal show={showDetalleModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Detalle Completo del Caso</ModalTitle>
            <CloseButton onClick={() => setShowDetalleModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedCaso && (
            <DetalleContent>
              <DetalleSection>
                <DetalleSectionTitle>Datos del Niño/a</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Nombre:</strong> {selectedCaso.nombreCompletoNino}</DetalleItem>
                  <DetalleItem><strong>Edad:</strong> {selectedCaso.edad} años</DetalleItem>
                  <DetalleItem><strong>Fecha Nac.:</strong> {new Date(selectedCaso.fechaNacimiento).toLocaleDateString()}</DetalleItem>
                  <DetalleItem><strong>CI:</strong> {selectedCaso.ciNino || "No registrado"}</DetalleItem>
                  <DetalleItem style={{gridColumn: "1 / -1"}}><strong>Diagnóstico:</strong> {selectedCaso.diagnostico}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              <DetalleSection>
                <DetalleSectionTitle>Datos del Tutor</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Nombre:</strong> {selectedCaso.nombreCompletoTutor}</DetalleItem>
                  <DetalleItem><strong>CI:</strong> {selectedCaso.ciTutor}</DetalleItem>
                  <DetalleItem><strong>Parentesco:</strong> {selectedCaso.parentesco}</DetalleItem>
                  <DetalleItem><strong>Teléfono:</strong> {selectedCaso.telefonoTutor}</DetalleItem>
                  <DetalleItem><strong>Dirección:</strong> {selectedCaso.direccion}</DetalleItem>
                  <DetalleItem><strong>Email:</strong> {selectedCaso.emailTutor || "No registrado"}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              {selectedCaso.evaluacionSocial && (
                <DetalleSection>
                  <DetalleSectionTitle>Evaluación Social Completa</DetalleSectionTitle>
                  <DetalleGrid>
                    <DetalleItem><strong>Ingreso Familiar:</strong> {selectedCaso.evaluacionSocial.ingresoFamiliar}/20</DetalleItem>
                    <DetalleItem><strong>Personas Hogar:</strong> {selectedCaso.evaluacionSocial.numPersonasHogar}/15</DetalleItem>
                    <DetalleItem><strong>Tipo Vivienda:</strong> {selectedCaso.evaluacionSocial.tipoVivienda}/15</DetalleItem>
                    <DetalleItem><strong>Sit. Laboral:</strong> {selectedCaso.evaluacionSocial.situacionLaboralPadres}/20</DetalleItem>
                    <DetalleItem><strong>Acceso Salud:</strong> {selectedCaso.evaluacionSocial.accesoSalud}/15</DetalleItem>
                    <DetalleItem><strong>Gastos Médicos:</strong> {selectedCaso.evaluacionSocial.gastosMedicosMensuales}/15</DetalleItem>
                    <DetalleItem>
                      <strong>Puntaje Total:</strong>{" "}
                      <VulnerabilityBadge color={getNivelColor(selectedCaso.evaluacionSocial.nivelVulnerabilidad)}>
                        {selectedCaso.evaluacionSocial.puntajeTotal}/100 - {selectedCaso.evaluacionSocial.nivelVulnerabilidad}
                      </VulnerabilityBadge>
                    </DetalleItem>
                    <DetalleItem><strong>Fecha:</strong> {new Date(selectedCaso.evaluacionSocial.fechaEvaluacion).toLocaleDateString()}</DetalleItem>
                  </DetalleGrid>
                  {selectedCaso.evaluacionSocial.informeSocialPdf && (
                    <PdfButtonLarge onClick={() => handleViewPdf(selectedCaso.evaluacionSocial.informeSocialPdf, "Informe Social - " + selectedCaso.nombreCompletoNino)}>
                      <FaFilePdf /> Ver Informe Social
                    </PdfButtonLarge>
                  )}
                </DetalleSection>
              )}

              {selectedCaso.evaluacionPsicologica && (
                <DetalleSection>
                  <DetalleSectionTitle>Evaluación Psicológica</DetalleSectionTitle>
                  <DetalleGrid>
                    <DetalleItem style={{gridColumn: "1 / -1"}}>
                      <strong>Observaciones:</strong> {selectedCaso.evaluacionPsicologica.observaciones || "Sin observaciones"}
                    </DetalleItem>
                    <DetalleItem><strong>Fecha:</strong> {new Date(selectedCaso.evaluacionPsicologica.fechaEvaluacion).toLocaleDateString()}</DetalleItem>
                  </DetalleGrid>
                  {selectedCaso.evaluacionPsicologica.informePsicologicoPdf && (
                    <PdfButtonLarge onClick={() => handleViewPdf(selectedCaso.evaluacionPsicologica.informePsicologicoPdf, "Informe Psicológico - " + selectedCaso.nombreCompletoNino)}>
                      <FaFilePdf /> Ver Informe Psicológico
                    </PdfButtonLarge>
                  )}
                </DetalleSection>
              )}

              {/* Botón Resumen con IA */}
              {selectedCaso.evaluacionSocial?.informeSocialPdf && (
                <DetalleSection>
                  <ResumenIAButtonContainer>
                    <ResumenIAButton onClick={handleGenerarResumenIA} disabled={loadingResumen}>
                      <FaBrain /> {loadingResumen ? "Generando Resumen con IA..." : "Generar Resumen con IA"}
                    </ResumenIAButton>
                    <ResumenIAHint>
                      La IA analizará ambas evaluaciones y generará un resumen ejecutivo completo del caso
                    </ResumenIAHint>
                  </ResumenIAButtonContainer>
                </DetalleSection>
              )}

              <ModalActions>
                <SecondaryButton onClick={() => setShowDetalleModal(false)}>
                  Cerrar
                </SecondaryButton>
                <RejectButton onClick={() => { setShowDetalleModal(false); setShowRechazarModal(true); }}>
                  <FaTimes /> Rechazar Caso
                </RejectButton>
                <AcceptButton onClick={() => { setShowDetalleModal(false); setShowAceptarModal(true); }}>
                  <FaCheck /> Aceptar Caso
                </AcceptButton>
              </ModalActions>
            </DetalleContent>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Aceptar */}
      <Modal show={showAceptarModal}>
        <ModalContentSmall>
          <ModalHeader>
            <ModalTitle>Aceptar Caso</ModalTitle>
            <CloseButton onClick={() => setShowAceptarModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedCaso && (
            <FormContent>
              <InfoBox>
                <strong>Paciente:</strong> {selectedCaso.nombreCompletoNino}<br />
                <strong>Diagnóstico:</strong> {selectedCaso.diagnostico}
              </InfoBox>

              <FormGroup>
                <Label>Asignar a Asistente/Coordinador *</Label>
                <Select
                  value={selectedAsistente}
                  onChange={(e) => setSelectedAsistente(e.target.value)}
                  required
                >
                  <option value="">Seleccione un asistente...</option>
                  {asistentes.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </Select>
                <FormHint>El asistente será responsable de registrar las ayudas para este beneficiario</FormHint>
              </FormGroup>

              <ModalActions>
                <SecondaryButton onClick={() => setShowAceptarModal(false)}>
                  Cancelar
                </SecondaryButton>
                <AcceptButton onClick={handleAceptarCaso} disabled={loading || !selectedAsistente}>
                  <FaCheck /> {loading ? "Procesando..." : "Confirmar Aceptación"}
                </AcceptButton>
              </ModalActions>
            </FormContent>
          )}
        </ModalContentSmall>
      </Modal>

      {/* Modal Rechazar */}
      <Modal show={showRechazarModal}>
        <ModalContentSmall>
          <ModalHeader>
            <ModalTitle>Rechazar Caso</ModalTitle>
            <CloseButton onClick={() => setShowRechazarModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedCaso && (
            <FormContent>
              <InfoBox>
                <strong>Paciente:</strong> {selectedCaso.nombreCompletoNino}<br />
                <strong>Diagnóstico:</strong> {selectedCaso.diagnostico}
              </InfoBox>

              <WarningBox>
                Esta acción rechazará el caso y no podrá ser revertida.
              </WarningBox>

              <FormGroup>
                <Label>Motivo del Rechazo *</Label>
                <TextArea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Especifique el motivo del rechazo..."
                  rows={4}
                  required
                />
              </FormGroup>

              <ModalActions>
                <SecondaryButton onClick={() => setShowRechazarModal(false)}>
                  Cancelar
                </SecondaryButton>
                <RejectButton onClick={handleRechazarCaso} disabled={loading || !motivoRechazo.trim()}>
                  <FaTimes /> {loading ? "Procesando..." : "Confirmar Rechazo"}
                </RejectButton>
              </ModalActions>
            </FormContent>
          )}
        </ModalContentSmall>
      </Modal>

      {/* PDF Viewer */}
      {showPdfViewer && (
        <PdfViewer
          pdfUrl={pdfUrl}
          title={pdfTitle}
          onClose={() => setShowPdfViewer(false)}
        />
      )}

      {/* Modal Resumen IA */}
      <Modal show={showResumenIA}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle><FaBrain /> Resumen del Caso Generado con IA</ModalTitle>
            <CloseButton onClick={() => setShowResumenIA(false)}>&times;</CloseButton>
          </ModalHeader>
          {loadingResumen ? (
            <LoadingResumen>
              <LoadingSpinner />
              <LoadingText>Analizando documentos con Inteligencia Artificial...</LoadingText>
              <LoadingSubtext>Esto puede tomar unos segundos</LoadingSubtext>
            </LoadingResumen>
          ) : resumenIA && !resumenIA.error ? (
            <ResumenContent>
              {/* Datos del Paciente */}
              {resumenIA.datosDelPaciente && (
                <ResumenSection>
                  <ResumenSectionTitle>👤 Datos del Paciente</ResumenSectionTitle>
                  <ResumenGrid>
                    <ResumenItem><strong>Nombre:</strong> {resumenIA.datosDelPaciente.nombreCompleto}</ResumenItem>
                    <ResumenItem><strong>Edad:</strong> {resumenIA.datosDelPaciente.edad} años</ResumenItem>
                    <ResumenItem><strong>Diagnóstico:</strong> {resumenIA.datosDelPaciente.diagnostico}</ResumenItem>
                    <ResumenItem><strong>Tratamiento:</strong> {resumenIA.datosDelPaciente.tratamiento}</ResumenItem>
                    <ResumenItem style={{gridColumn: "1 / -1"}}><strong>Hospital:</strong> {resumenIA.datosDelPaciente.hospital}</ResumenItem>
                  </ResumenGrid>
                </ResumenSection>
              )}

              {/* Composición Familiar */}
              {resumenIA.composicionFamiliar && (
                <ResumenSection>
                  <ResumenSectionTitle>👨‍👩‍👧‍👦 Composición Familiar</ResumenSectionTitle>
                  <ResumenText><strong>Miembros:</strong> {resumenIA.composicionFamiliar.numeroMiembros} personas</ResumenText>
                  <ResumenText>{resumenIA.composicionFamiliar.descripcion}</ResumenText>
                  {resumenIA.composicionFamiliar.relacionFamiliar && (
                    <ResumenText><strong>Dinámica:</strong> {resumenIA.composicionFamiliar.relacionFamiliar}</ResumenText>
                  )}
                </ResumenSection>
              )}

              {/* Situación Económica */}
              {resumenIA.situacionEconomica && (
                <ResumenSection>
                  <ResumenSectionTitle>💰 Situación Económica</ResumenSectionTitle>
                  <NivelBadge color={
                    resumenIA.situacionEconomica.nivelEconomico === 'BAJO' ? '#c62828' :
                    resumenIA.situacionEconomica.nivelEconomico === 'MEDIO-BAJO' ? '#ef6c00' :
                    resumenIA.situacionEconomica.nivelEconomico === 'MEDIO' ? '#f9a825' : '#2e7d32'
                  }>
                    Nivel: {resumenIA.situacionEconomica.nivelEconomico}
                  </NivelBadge>
                  <ResumenText><strong>Ingresos:</strong> {resumenIA.situacionEconomica.ingresosPrincipales}</ResumenText>
                  {resumenIA.situacionEconomica.trabajoPadre && (
                    <ResumenText><strong>Padre/Tutor:</strong> {resumenIA.situacionEconomica.trabajoPadre}</ResumenText>
                  )}
                  {resumenIA.situacionEconomica.trabajoMadre && (
                    <ResumenText><strong>Madre:</strong> {resumenIA.situacionEconomica.trabajoMadre}</ResumenText>
                  )}
                </ResumenSection>
              )}

              {/* Situación de Vivienda */}
              {resumenIA.situacionVivienda && (
                <ResumenSection>
                  <ResumenSectionTitle>🏠 Situación de Vivienda</ResumenSectionTitle>
                  <TipoBadge>{resumenIA.situacionVivienda.tipo}</TipoBadge>
                  <ResumenText>{resumenIA.situacionVivienda.condiciones}</ResumenText>
                  {resumenIA.situacionVivienda.serviciosBasicos && resumenIA.situacionVivienda.serviciosBasicos.length > 0 && (
                    <ResumenText>
                      <strong>Servicios:</strong> {resumenIA.situacionVivienda.serviciosBasicos.join(', ')}
                    </ResumenText>
                  )}
                </ResumenSection>
              )}

              {/* Necesidad Principal */}
              {resumenIA.necesidadPrincipal && (
                <ResumenSection $highlight>
                  <ResumenSectionTitle>⚠️ Necesidad Principal</ResumenSectionTitle>
                  <ResumenText><strong>Solicitud:</strong> {resumenIA.necesidadPrincipal.solicitud}</ResumenText>
                  {resumenIA.necesidadPrincipal.monto && (
                    <ResumenText><strong>Monto:</strong> {resumenIA.necesidadPrincipal.monto}</ResumenText>
                  )}
                  <ResumenText><strong>Justificación:</strong> {resumenIA.necesidadPrincipal.justificacion}</ResumenText>
                </ResumenSection>
              )}

              {/* Factores de Riesgo */}
              {resumenIA.factoresDeRiesgo && resumenIA.factoresDeRiesgo.length > 0 && (
                <ResumenSection>
                  <ResumenSectionTitle>🔴 Factores de Riesgo</ResumenSectionTitle>
                  <ResumenList>
                    {resumenIA.factoresDeRiesgo.map((factor, idx) => (
                      <ResumenListItem key={idx}>• {factor}</ResumenListItem>
                    ))}
                  </ResumenList>
                </ResumenSection>
              )}

              {/* Fortalezas Familiares */}
              {resumenIA.fortalezasFamiliares && resumenIA.fortalezasFamiliares.length > 0 && (
                <ResumenSection>
                  <ResumenSectionTitle>✅ Fortalezas Familiares</ResumenSectionTitle>
                  <ResumenList>
                    {resumenIA.fortalezasFamiliares.map((fortaleza, idx) => (
                      <ResumenListItem key={idx}>• {fortaleza}</ResumenListItem>
                    ))}
                  </ResumenList>
                </ResumenSection>
              )}

              {/* Recomendaciones */}
              {resumenIA.recomendaciones && (
                <ResumenSection>
                  <ResumenSectionTitle>📋 Recomendaciones</ResumenSectionTitle>
                  <ResumenText>{resumenIA.recomendaciones}</ResumenText>
                </ResumenSection>
              )}

              {/* Resumen Ejecutivo */}
              {resumenIA.resumenEjecutivo && (
                <ResumenSection $highlight>
                  <ResumenSectionTitle>📊 Resumen Ejecutivo</ResumenSectionTitle>
                  <ResumenEjecutivo>{resumenIA.resumenEjecutivo}</ResumenEjecutivo>
                </ResumenSection>
              )}

              <ModalActions>
                <SecondaryButton onClick={() => setShowResumenIA(false)}>
                  Cerrar
                </SecondaryButton>
              </ModalActions>
            </ResumenContent>
          ) : resumenIA && resumenIA.error ? (
            <ErrorResumen>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorText>{resumenIA.mensaje}</ErrorText>
              <ModalActions>
                <SecondaryButton onClick={() => setShowResumenIA(false)}>
                  Cerrar
                </SecondaryButton>
              </ModalActions>
            </ErrorResumen>
          ) : null}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminBeneficiarios;

// Styled Components
const Container = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const HeaderIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff6347, #ff8c69);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
`;

const HeaderText = styled.div``;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 4px solid ${props => props.color || '#ff6347'};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: #f5f5f5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6347;
  font-size: 1.4rem;
`;

const StatInfo = styled.div``;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.div`
  color: #888;
  font-size: 0.9rem;
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const ContentTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
  min-width: 300px;

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

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
`;

const CasoCard = styled.div`
  background: #fefefe;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    border-color: #ff6347;
    box-shadow: 0 4px 12px rgba(255, 99, 71, 0.15);
  }
`;

const CasoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
`;

const CasoName = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0;
`;

const CasoBadge = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const CasoInfo = styled.div`
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 6px;
`;

const InfoLabel = styled.span`
  color: #888;
  font-size: 0.9rem;
  min-width: 100px;
`;

const InfoValue = styled.span`
  color: #333;
  font-size: 0.9rem;
  flex: 1;
`;

const EvaluacionBox = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const EvaluacionTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const EvaluacionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  margin-bottom: 4px;
`;

const VulnerabilityBadge = styled.span`
  background: ${props => props.color}20;
  color: ${props => props.color};
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const PdfLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1976d2;
  font-size: 0.85rem;
  text-decoration: none;
  margin-top: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const PdfLinkLarge = styled(PdfLink)`
  display: flex;
  background: #e3f2fd;
  padding: 10px 16px;
  border-radius: 8px;
  margin: 12px 24px 0;
  justify-content: center;
`;

const PdfButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1976d2;
  background: transparent;
  border: none;
  font-size: 0.85rem;
  margin-top: 8px;
  cursor: pointer;
  padding: 4px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const PdfButtonLarge = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  margin: 12px 24px 0;
  justify-content: center;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #bbdefb;
  }
`;

const CasoActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    border-color: #ff6347;
    color: #ff6347;
  }
`;

const AcceptButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: #4caf50;
  color: white;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #43a047;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const RejectButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: #f44336;
  color: white;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #e53935;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #888;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
`;

const ModalContentSmall = styled(ModalContent)`
  max-width: 500px;
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

const DetalleContent = styled.div`
  padding: 0 0 20px;
`;

const DetalleSection = styled.div`
  margin-bottom: 24px;
`;

const DetalleSectionTitle = styled.h4`
  color: #ff6347;
  font-size: 1rem;
  margin: 16px 24px 12px;
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

const FormContent = styled.div`
  padding: 16px 0;
`;

const InfoBox = styled.div`
  background: #fff3e0;
  padding: 16px 24px;
  margin: 0 24px 16px;
  border-radius: 8px;
  border-left: 4px solid #ff6347;
  line-height: 1.6;
`;

const WarningBox = styled.div`
  background: #ffebee;
  padding: 12px 24px;
  margin: 0 24px 16px;
  border-radius: 8px;
  color: #c62828;
  font-size: 0.9rem;
`;

const FormGroup = styled.div`
  padding: 0 24px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #ff6347;
  }
`;

const FormHint = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-top: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  resize: vertical;
  box-sizing: border-box;

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

// Styled Components para Resumen IA
const ResumenIAButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 16px;
  background: #fef7f5;
  border-radius: 8px;
  border: 1px solid #ffe0d6;
`;

const ResumenIAButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ff6347;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 99, 71, 0.3);

  &:hover:not(:disabled) {
    background: #ff4520;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 99, 71, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 1rem;
  }
`;

const ResumenIAHint = styled.p`
  color: #666;
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
`;

const LoadingResumen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
  margin: 0;
`;

const LoadingSubtext = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const ResumenContent = styled.div`
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
`;

const ResumenSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: ${props => props.$highlight ? '#fff9e6' : '#f8f9fa'};
  border-radius: 12px;
  border-left: 4px solid ${props => props.$highlight ? '#ff9800' : '#667eea'};
`;

const ResumenSectionTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResumenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const ResumenItem = styled.div`
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;

  strong {
    color: #333;
    font-weight: 600;
  }
`;

const ResumenText = styled.p`
  font-size: 0.95rem;
  color: #555;
  line-height: 1.7;
  margin: 8px 0;

  strong {
    color: #333;
    font-weight: 600;
  }
`;

const ResumenList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0;
`;

const ResumenListItem = styled.li`
  font-size: 0.9rem;
  color: #555;
  line-height: 1.8;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ResumenEjecutivo = styled.div`
  font-size: 0.95rem;
  color: #444;
  line-height: 1.8;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  white-space: pre-wrap;
`;

const NivelBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${props => props.color}20;
  color: ${props => props.color};
  margin-bottom: 12px;
`;

const TipoBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #e3f2fd;
  color: #1976d2;
  margin-bottom: 12px;
`;

const ErrorResumen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
`;

const ErrorText = styled.p`
  font-size: 1rem;
  color: #c62828;
  text-align: center;
  margin: 0;
`;
