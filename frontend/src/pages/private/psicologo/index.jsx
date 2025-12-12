import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useUser } from "../../../context/userContext";
import { FaClipboardCheck, FaSearch, FaFilePdf, FaPaperPlane, FaEye, FaChild, FaUserMd } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Psicologo = () => {
  const { user, token } = useUser();
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedCaso, setSelectedCaso] = useState(null);

  // Form Evaluación Psicológica
  const [observaciones, setObservaciones] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetchCasosPendientes();
  }, []);

  const fetchCasosPendientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/casos-pendientes-psicologia`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCasos(data.data);
      }
    } catch (err) {
      setError("Error al cargar los casos pendientes");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluacionSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setError("Debe adjuntar el informe psicológico en PDF");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("pacienteRegistroId", selectedCaso.id);
    formData.append("psicologoId", user.id);
    formData.append("observaciones", observaciones);
    formData.append("informePsicologicoPdf", pdfFile);

    try {
      const response = await fetch(`${API_URL}/evaluacion-psicologica`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Evaluación psicológica guardada. Caso enviado a Administración.");
        setShowEvaluacionModal(false);
        resetForm();
        fetchCasosPendientes();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(data.error || "Error al guardar la evaluación");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setObservaciones("");
    setPdfFile(null);
  };

  const filteredCasos = casos.filter(c =>
    c.nombreCompletoNino.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ciTutor.includes(searchTerm)
  );

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <Container>
      <Header>
        <HeaderIcon>
          <FaUserMd />
        </HeaderIcon>
        <HeaderText>
          <Title>Evaluación Psicológica</Title>
          <Subtitle>Bienvenido/a, {user?.nombre}</Subtitle>
        </HeaderText>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <StatsContainer>
        <StatCard>
          <StatIcon color="#ff6347">
            <FaClipboardCheck />
          </StatIcon>
          <StatInfo>
            <StatNumber>{casos.length}</StatNumber>
            <StatLabel>Casos Pendientes</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsContainer>

      <ContentArea>
        <ContentHeader>
          <ContentTitle>Casos Pendientes de Evaluación Psicológica</ContentTitle>
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
            <FaChild style={{ fontSize: "3rem", color: "#ccc", marginBottom: "16px" }} />
            <p>No hay casos pendientes de evaluación psicológica</p>
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
                  <InfoRow>
                    <InfoLabel>Fecha Registro:</InfoLabel>
                    <InfoValue>{new Date(caso.fechaRegistro).toLocaleDateString()}</InfoValue>
                  </InfoRow>
                  {caso.evaluacionSocial && (
                    <VulnerabilityBox nivel={caso.evaluacionSocial.nivelVulnerabilidad}>
                      <span>Vulnerabilidad:</span>
                      <strong>{caso.evaluacionSocial.nivelVulnerabilidad}</strong>
                      <span>({caso.evaluacionSocial.puntajeTotal}/100)</span>
                    </VulnerabilityBox>
                  )}
                </CasoInfo>
                <CasoActions>
                  <ActionButton onClick={() => { setSelectedCaso(caso); setShowDetalleModal(true); }}>
                    <FaEye /> Ver Detalle
                  </ActionButton>
                  <PrimaryActionButton onClick={() => { setSelectedCaso(caso); setShowEvaluacionModal(true); }}>
                    <FaClipboardCheck /> Evaluar
                  </PrimaryActionButton>
                </CasoActions>
              </CasoCard>
            ))}
          </CardsContainer>
        )}
      </ContentArea>

      {/* Modal Evaluación Psicológica */}
      <Modal show={showEvaluacionModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Evaluación Psicológica</ModalTitle>
            <CloseButton onClick={() => setShowEvaluacionModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedCaso && (
            <form onSubmit={handleEvaluacionSubmit}>
              <InfoBox>
                <strong>Paciente:</strong> {selectedCaso.nombreCompletoNino}<br />
                <strong>Edad:</strong> {selectedCaso.edad} años<br />
                <strong>Diagnóstico:</strong> {selectedCaso.diagnostico}
              </InfoBox>

              <NoteBox>
                <strong>Nota:</strong> Por privacidad, no se muestra el informe social del Trabajador Social.
                Usted debe realizar su evaluación psicológica de forma independiente.
              </NoteBox>

              <FormSection>
                <SectionTitle>Informe Psicológico (PDF) *</SectionTitle>
                <FileInput
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
                <FileHint>Adjunte el informe psicológico en formato PDF (máx. 5MB)</FileHint>
              </FormSection>

              <FormSection>
                <SectionTitle>Observaciones Adicionales</SectionTitle>
                <TextArea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Escriba observaciones adicionales sobre el caso (opcional)..."
                  rows={4}
                />
              </FormSection>

              <WarningBox>
                <strong>Importante:</strong> Al guardar esta evaluación, el caso será enviado automáticamente
                al Administrador para su revisión y decisión final.
              </WarningBox>

              <ModalActions>
                <SecondaryButton type="button" onClick={() => setShowEvaluacionModal(false)}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={loading}>
                  <FaPaperPlane /> {loading ? "Enviando..." : "Guardar y Enviar a Administración"}
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
            <ModalTitle>Detalle del Caso</ModalTitle>
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
                  <DetalleSectionTitle>Evaluación Social (Resumen)</DetalleSectionTitle>
                  <DetalleGrid>
                    <DetalleItem>
                      <strong>Nivel de Vulnerabilidad:</strong>{" "}
                      <VulnerabilityBadge nivel={selectedCaso.evaluacionSocial.nivelVulnerabilidad}>
                        {selectedCaso.evaluacionSocial.nivelVulnerabilidad}
                      </VulnerabilityBadge>
                    </DetalleItem>
                    <DetalleItem><strong>Puntaje:</strong> {selectedCaso.evaluacionSocial.puntajeTotal}/100</DetalleItem>
                    <DetalleItem><strong>Fecha Evaluación:</strong> {new Date(selectedCaso.evaluacionSocial.fechaEvaluacion).toLocaleDateString()}</DetalleItem>
                  </DetalleGrid>
                  <PrivacyNote>
                    El informe social completo no está disponible para mantener la independencia de su evaluación.
                  </PrivacyNote>
                </DetalleSection>
              )}

              <ModalActions>
                <SecondaryButton onClick={() => setShowDetalleModal(false)}>
                  Cerrar
                </SecondaryButton>
                <PrimaryButton onClick={() => { setShowDetalleModal(false); setShowEvaluacionModal(true); }}>
                  <FaClipboardCheck /> Realizar Evaluación
                </PrimaryButton>
              </ModalActions>
            </DetalleContent>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Psicologo;

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
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.color || '#ff6347'}15;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || '#ff6347'};
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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
  margin-bottom: 8px;
`;

const InfoLabel = styled.span`
  color: #888;
  font-size: 0.9rem;
  min-width: 120px;
`;

const InfoValue = styled.span`
  color: #333;
  font-size: 0.9rem;
  flex: 1;
`;

const VulnerabilityBox = styled.div`
  background: ${props => {
    switch(props.nivel) {
      case 'ALTO': return '#ffebee';
      case 'MEDIO': return '#fff3e0';
      case 'BAJO': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.nivel) {
      case 'ALTO': return '#c62828';
      case 'MEDIO': return '#ef6c00';
      case 'BAJO': return '#2e7d32';
      default: return '#666';
    }
  }};
  padding: 10px 16px;
  border-radius: 8px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
`;

const CasoActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 8px;
  font-size: 0.9rem;
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

const PrimaryActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: #ff6347;
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #e55a2b;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #888;
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
  width: 90%;
  max-width: 600px;
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

const InfoBox = styled.div`
  background: #fff3e0;
  padding: 16px 24px;
  margin: 16px 24px;
  border-radius: 8px;
  border-left: 4px solid #ff6347;
  line-height: 1.6;
`;

const NoteBox = styled.div`
  background: #e3f2fd;
  padding: 12px 24px;
  margin: 0 24px 16px;
  border-radius: 8px;
  color: #1565c0;
  font-size: 0.9rem;
`;

const WarningBox = styled.div`
  background: #fff8e1;
  padding: 12px 24px;
  margin: 16px 24px;
  border-radius: 8px;
  color: #f57c00;
  font-size: 0.9rem;
  border: 1px solid #ffcc02;
`;

const FormSection = styled.div`
  padding: 0 24px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  color: #333;
  font-size: 1rem;
  margin: 0 0 12px 0;
`;

const FileInput = styled.input`
  padding: 12px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    border-color: #ff6347;
  }
`;

const FileHint = styled.div`
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

const VulnerabilityBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  ${props => {
    switch(props.nivel) {
      case 'ALTO':
        return 'background: #ffebee; color: #c62828;';
      case 'MEDIO':
        return 'background: #fff3e0; color: #ef6c00;';
      case 'BAJO':
        return 'background: #e8f5e9; color: #2e7d32;';
      default:
        return 'background: #f5f5f5; color: #666;';
    }
  }}
`;

const PrivacyNote = styled.div`
  background: #f5f5f5;
  padding: 12px 24px;
  margin: 12px 24px 0;
  border-radius: 8px;
  color: #888;
  font-size: 0.85rem;
  font-style: italic;
`;
