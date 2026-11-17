import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useUser } from "../../../context/userContext";
import { FaClipboardCheck, FaSearch, FaFilePdf, FaUpload, FaEye, FaChild, FaUserMd, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import PdfViewer from "../../../components/PdfViewer";
import { useInformePsicologico } from "../../../hooks/useInformePsicologico";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAX_PDF_BYTES = 10 * 1024 * 1024;

const formatFecha = (f) => (f ? new Date(f).toLocaleDateString() : "-");

const Psicologo = () => {
  const { user, authFetch } = useUser();
  const [derivaciones, setDerivaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("PENDIENTE");

  // Modales
  const [showInformeModal, setShowInformeModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selected, setSelected] = useState(null);

  // Formulario del informe
  const [observaciones, setObservaciones] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const { pdfViewer, abrirInforme, cerrarInforme } = useInformePsicologico(setError);

  const fetchDerivaciones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/api/psicologia/derivaciones`);
      const data = await response.json();
      if (data.success) {
        setDerivaciones(data.data);
      } else {
        setError(data.mensaje || "Error al cargar los casos derivados");
      }
    } catch (err) {
      setError(err.message || "Error al cargar los casos derivados");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchDerivaciones();
  }, [fetchDerivaciones]);

  const abrirFormulario = (derivacion) => {
    setSelected(derivacion);
    setObservaciones(derivacion.observaciones || "");
    setPdfFile(null);
    setError("");
    setShowDetalleModal(false);
    setShowInformeModal(true);
  };

  const cerrarFormulario = () => {
    if (saving) return;
    setShowInformeModal(false);
    setPdfFile(null);
    setObservaciones("");
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== "application/pdf") {
      setError("El informe debe ser un archivo PDF");
      e.target.value = "";
      return;
    }
    if (file && file.size > MAX_PDF_BYTES) {
      setError("El PDF no puede pesar más de 10 MB");
      e.target.value = "";
      return;
    }
    setError("");
    setPdfFile(file);
  };

  const handleInformeSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setError("Debe adjuntar el informe psicológico en PDF");
      return;
    }

    setSaving(true);
    setError("");
    const formData = new FormData();
    formData.append("informePdf", pdfFile);
    formData.append("observaciones", observaciones);

    try {
      const response = await authFetch(
        `${API_URL}/api/psicologia/derivaciones/${selected.id}/informe`,
        { method: "PUT", body: formData }
      );
      const data = await response.json();
      if (data.success) {
        setSuccess(`Informe psicológico de ${selected.pacienteRegistro.nombreCompletoNino} guardado.`);
        setShowInformeModal(false);
        setPdfFile(null);
        setObservaciones("");
        fetchDerivaciones();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(data.mensaje || "Error al guardar el informe");
      }
    } catch (err) {
      setError(err.message || "Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const pendientes = derivaciones.filter((d) => d.estado === "PENDIENTE");
  const completadas = derivaciones.filter((d) => d.estado === "COMPLETADA");
  const termino = searchTerm.toLowerCase();
  const visibles = (tab === "PENDIENTE" ? pendientes : completadas).filter(
    (d) =>
      d.pacienteRegistro.nombreCompletoNino.toLowerCase().includes(termino) ||
      d.pacienteRegistro.ciTutor.includes(searchTerm)
  );

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
            <FaHourglassHalf />
          </StatIcon>
          <StatInfo>
            <StatNumber>{pendientes.length}</StatNumber>
            <StatLabel>Informes pendientes</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon color="#2e7d32">
            <FaCheckCircle />
          </StatIcon>
          <StatInfo>
            <StatNumber>{completadas.length}</StatNumber>
            <StatLabel>Informes entregados</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsContainer>

      <ContentArea>
        <ContentHeader>
          <Tabs>
            <TabButton $active={tab === "PENDIENTE"} onClick={() => setTab("PENDIENTE")}>
              Pendientes ({pendientes.length})
            </TabButton>
            <TabButton $active={tab === "COMPLETADA"} onClick={() => setTab("COMPLETADA")}>
              Entregados ({completadas.length})
            </TabButton>
          </Tabs>
          <SearchContainer>
            <FaSearch />
            <SearchInput
              placeholder="Buscar por nombre o CI del tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </ContentHeader>

        {loading ? (
          <LoadingSpinner>Cargando casos...</LoadingSpinner>
        ) : visibles.length === 0 ? (
          <EmptyState>
            <FaChild style={{ fontSize: "3rem", color: "#ccc", marginBottom: "16px" }} />
            <p>
              {tab === "PENDIENTE"
                ? "No hay casos derivados pendientes de informe"
                : "Todavía no hay informes entregados"}
            </p>
          </EmptyState>
        ) : (
          <CardsContainer>
            {visibles.map((d) => {
              const caso = d.pacienteRegistro;
              const puedeReemplazar = d.estado === "COMPLETADA" && d.psicologo?.id === user?.id;
              return (
                <CasoCard key={d.id}>
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
                      <InfoLabel>Derivado por:</InfoLabel>
                      <InfoValue>{d.derivadoPor?.nombre} · {formatFecha(d.fechaDerivacion)}</InfoValue>
                    </InfoRow>
                    {d.estado === "COMPLETADA" && (
                      <InfoRow>
                        <InfoLabel>Informe:</InfoLabel>
                        <InfoValue>{d.psicologo?.nombre} · {formatFecha(d.fechaInforme)}</InfoValue>
                      </InfoRow>
                    )}
                    <MotivoBox>
                      <strong>Motivo de la derivación:</strong> {d.motivo}
                    </MotivoBox>
                  </CasoInfo>
                  <CasoActions>
                    <ActionButton onClick={() => { setSelected(d); setShowDetalleModal(true); }}>
                      <FaEye /> Ver detalle
                    </ActionButton>
                    {d.estado === "PENDIENTE" ? (
                      <PrimaryActionButton onClick={() => abrirFormulario(d)}>
                        <FaClipboardCheck /> Subir informe
                      </PrimaryActionButton>
                    ) : (
                      <PrimaryActionButton onClick={() => abrirInforme(d, caso.nombreCompletoNino)}>
                        <FaFilePdf /> Ver informe
                      </PrimaryActionButton>
                    )}
                  </CasoActions>
                  {puedeReemplazar && (
                    <LinkButton onClick={() => abrirFormulario(d)}>
                      <FaUpload /> Reemplazar informe
                    </LinkButton>
                  )}
                </CasoCard>
              );
            })}
          </CardsContainer>
        )}
      </ContentArea>

      {/* Modal Subir Informe */}
      <Modal $show={showInformeModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {selected?.estado === "COMPLETADA" ? "Reemplazar informe psicológico" : "Subir informe psicológico"}
            </ModalTitle>
            <CloseButton onClick={cerrarFormulario}>&times;</CloseButton>
          </ModalHeader>
          {selected && (
            <form onSubmit={handleInformeSubmit}>
              <InfoBox>
                <strong>Paciente:</strong> {selected.pacienteRegistro.nombreCompletoNino}<br />
                <strong>Edad:</strong> {selected.pacienteRegistro.edad} años<br />
                <strong>Diagnóstico:</strong> {selected.pacienteRegistro.diagnostico}
              </InfoBox>

              <NoteBox>
                <strong>Motivo de la derivación ({selected.derivadoPor?.nombre}):</strong> {selected.motivo}
              </NoteBox>

              <FormSection>
                <SectionTitle>Informe Psicológico (PDF) *</SectionTitle>
                <FileInput
                  key={`${selected.id}-${showInformeModal}`}
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={handlePdfChange}
                />
                <FileHint>Adjunte el informe psicológico en formato PDF (máx. 10 MB)</FileHint>
              </FormSection>

              <FormSection>
                <SectionTitle>Observaciones</SectionTitle>
                <TextArea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones para el trabajador social (opcional)..."
                  rows={4}
                  maxLength={2000}
                />
              </FormSection>

              <ModalActions>
                <SecondaryButton type="button" onClick={cerrarFormulario} disabled={saving}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={saving || !pdfFile}>
                  <FaUpload /> {saving ? "Guardando..." : "Guardar informe"}
                </PrimaryButton>
              </ModalActions>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Detalle */}
      <Modal $show={showDetalleModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Detalle del Caso</ModalTitle>
            <CloseButton onClick={() => setShowDetalleModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selected && (
            <DetalleContent>
              <DetalleSection>
                <DetalleSectionTitle>Datos del Niño/a</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Nombre:</strong> {selected.pacienteRegistro.nombreCompletoNino}</DetalleItem>
                  <DetalleItem><strong>Edad:</strong> {selected.pacienteRegistro.edad} años</DetalleItem>
                  <DetalleItem><strong>Fecha Nac.:</strong> {formatFecha(selected.pacienteRegistro.fechaNacimiento)}</DetalleItem>
                  <DetalleItem style={{ gridColumn: "1 / -1" }}><strong>Diagnóstico:</strong> {selected.pacienteRegistro.diagnostico}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              <DetalleSection>
                <DetalleSectionTitle>Datos del Tutor</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Nombre:</strong> {selected.pacienteRegistro.nombreCompletoTutor}</DetalleItem>
                  <DetalleItem><strong>CI:</strong> {selected.pacienteRegistro.ciTutor}</DetalleItem>
                  <DetalleItem><strong>Parentesco:</strong> {selected.pacienteRegistro.parentesco}</DetalleItem>
                  <DetalleItem><strong>Teléfono:</strong> {selected.pacienteRegistro.telefonoTutor}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              <DetalleSection>
                <DetalleSectionTitle>Derivación</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Derivado por:</strong> {selected.derivadoPor?.nombre}</DetalleItem>
                  <DetalleItem><strong>Fecha:</strong> {formatFecha(selected.fechaDerivacion)}</DetalleItem>
                  <DetalleItem style={{ gridColumn: "1 / -1" }}><strong>Motivo:</strong> {selected.motivo}</DetalleItem>
                  {selected.estado === "COMPLETADA" && (
                    <>
                      <DetalleItem><strong>Informe de:</strong> {selected.psicologo?.nombre}</DetalleItem>
                      <DetalleItem><strong>Entregado:</strong> {formatFecha(selected.fechaInforme)}</DetalleItem>
                      {selected.observaciones && (
                        <DetalleItem style={{ gridColumn: "1 / -1" }}><strong>Observaciones:</strong> {selected.observaciones}</DetalleItem>
                      )}
                    </>
                  )}
                </DetalleGrid>
              </DetalleSection>

              <ModalActions>
                <SecondaryButton onClick={() => setShowDetalleModal(false)}>
                  Cerrar
                </SecondaryButton>
                {selected.estado === "PENDIENTE" ? (
                  <PrimaryButton onClick={() => abrirFormulario(selected)}>
                    <FaClipboardCheck /> Subir informe
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={() => abrirInforme(selected, selected.pacienteRegistro.nombreCompletoNino)}>
                    <FaFilePdf /> Ver informe
                  </PrimaryButton>
                )}
              </ModalActions>
            </DetalleContent>
          )}
        </ModalContent>
      </Modal>

      {pdfViewer && (
        <PdfViewer pdfUrl={pdfViewer.url} title={pdfViewer.title} onClose={cerrarInforme} />
      )}
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
  display: ${props => props.$show ? 'flex' : 'none'};
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



const Tabs = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: 2px solid ${(p) => (p.$active ? "#ff6347" : "#e0e0e0")};
  background: ${(p) => (p.$active ? "#ff6347" : "white")};
  color: ${(p) => (p.$active ? "white" : "#666")};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ff6347;
    color: ${(p) => (p.$active ? "white" : "#ff6347")};
  }
`;

const MotivoBox = styled.div`
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  padding: 10px 14px;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 0.88rem;
  color: #5d4037;
  line-height: 1.5;
  word-break: break-word;
`;

const LinkButton = styled.button`
  margin-top: 10px;
  background: none;
  border: none;
  color: #ff6347;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;
