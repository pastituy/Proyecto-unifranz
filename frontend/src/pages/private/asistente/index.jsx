import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useUser } from "../../../context/userContext";
import {
  FaUsers, FaSearch, FaPlus, FaEye, FaHistory, FaHeartbeat,
  FaCalendarAlt, FaMoneyBillWave, FaPills, FaBus, FaUtensils,
  FaFlask, FaEdit, FaUserShield
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Asistente = () => {
  const { user, token } = useUser();
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Modales
  const [showAyudaModal, setShowAyudaModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [showQuimioModal, setShowQuimioModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
  const [historialAyudas, setHistorialAyudas] = useState([]);

  // Form Ayuda
  const [ayudaForm, setAyudaForm] = useState({
    medicamentos: 0,
    quimioterapia: 0,
    analisisExamenes: 0,
    otros: 0,
    observaciones: ""
  });

  // Form Quimio
  const [quimioForm, setQuimioForm] = useState({
    numeroSesion: 1,
    fechaProgramada: "",
    observaciones: ""
  });

  useEffect(() => {
    fetchBeneficiarios();
  }, []);

  const fetchBeneficiarios = async () => {
    setLoading(true);
    try {
      console.log("=== FRONTEND: Obteniendo beneficiarios del asistente ===");
      console.log("Usuario ID:", user?.id);

      if (!user || !user.id) {
        setError("Error: No se pudo obtener la información del usuario");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/beneficiarios-activos?asignadoAId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("Respuesta beneficiarios:", data);

      if (data.success) {
        setBeneficiarios(data.data);
      } else {
        setError(data.mensaje || "Error al cargar los beneficiarios");
      }
    } catch (err) {
      console.error("Error al cargar beneficiarios:", err);
      setError("Error al cargar los beneficiarios");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorialAyudas = async (beneficiarioId) => {
    try {
      const response = await fetch(`${API_URL}/historial-ayudas/${beneficiarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistorialAyudas(data.data);
      }
    } catch (err) {
      setError("Error al cargar el historial");
    }
  };

  const handleAyudaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const totalAyuda = Object.keys(ayudaForm)
      .filter(k => k !== "observaciones")
      .reduce((sum, key) => sum + Number(ayudaForm[key]), 0);

    try {
      const response = await fetch(`${API_URL}/registrar-ayuda`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          beneficiarioId: selectedBeneficiario.id,
          ...ayudaForm,
          totalAyuda,
          registradoPorId: user.id
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Ayuda registrada exitosamente");
        setShowAyudaModal(false);
        resetAyudaForm();
        fetchBeneficiarios();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Error al registrar la ayuda");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleQuimioSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/sesion-quimioterapia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          beneficiarioId: selectedBeneficiario.id,
          ...quimioForm
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Sesión de quimioterapia programada");
        setShowQuimioModal(false);
        resetQuimioForm();
        fetchBeneficiarios();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Error al programar la sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (beneficiarioId, nuevoEstado) => {
    if (!window.confirm(`¿Está seguro de cambiar el estado a ${nuevoEstado}?`)) return;

    try {
      const response = await fetch(`${API_URL}/estado-beneficiario/${beneficiarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estadoBeneficiario: nuevoEstado })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Estado actualizado correctamente");
        fetchBeneficiarios();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Error al actualizar el estado");
    }
  };

  const resetAyudaForm = () => {
    setAyudaForm({
      medicamentos: 0,
      quimioterapia: 0,
      analisisExamenes: 0,
      otros: 0,
      observaciones: ""
    });
  };

  const resetQuimioForm = () => {
    setQuimioForm({
      numeroSesion: 1,
      fechaProgramada: "",
      observaciones: ""
    });
  };

  const calcularTotalAyuda = () => {
    return Object.keys(ayudaForm)
      .filter(k => k !== "observaciones")
      .reduce((sum, key) => sum + Number(ayudaForm[key]), 0);
  };

  const filteredBeneficiarios = beneficiarios.filter(b => {
    const matchSearch = b.pacienteRegistro?.nombreCompletoNino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       b.codigoBeneficiario.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === "todos" || b.estadoBeneficiario === filterEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'ACTIVO': return '#4caf50';
      case 'INACTIVO': return '#9e9e9e';
      case 'RECUPERADO': return '#2196f3';
      case 'FALLECIDO': return '#f44336';
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
          <Title>Gestión de Beneficiarios</Title>
          <Subtitle>Asistente/Coordinador - {user?.nombre}</Subtitle>
        </HeaderText>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <StatsContainer>
        <StatCard color="#4caf50">
          <StatIcon><FaUsers /></StatIcon>
          <StatInfo>
            <StatNumber>{beneficiarios.filter(b => b.estadoBeneficiario === 'ACTIVO').length}</StatNumber>
            <StatLabel>Activos</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard color="#2196f3">
          <StatIcon><FaHeartbeat /></StatIcon>
          <StatInfo>
            <StatNumber>{beneficiarios.filter(b => b.estadoBeneficiario === 'RECUPERADO').length}</StatNumber>
            <StatLabel>Recuperados</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard color="#ff9800">
          <StatIcon><FaMoneyBillWave /></StatIcon>
          <StatInfo>
            <StatNumber>{beneficiarios.length}</StatNumber>
            <StatLabel>Total Beneficiarios</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsContainer>

      <ContentArea>
        <ContentHeader>
          <ContentTitle>Listado de Beneficiarios</ContentTitle>
          <FiltersContainer>
            <SearchContainer>
              <FaSearch />
              <SearchInput
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
            <FilterSelect value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="RECUPERADO">Recuperado</option>
              <option value="FALLECIDO">Fallecido</option>
            </FilterSelect>
          </FiltersContainer>
        </ContentHeader>

        {loading ? (
          <LoadingSpinner>Cargando beneficiarios...</LoadingSpinner>
        ) : filteredBeneficiarios.length === 0 ? (
          <EmptyState>
            <FaUsers style={{ fontSize: "3rem", color: "#ccc", marginBottom: "16px" }} />
            <p>No hay beneficiarios para mostrar</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Código</TableHeader>
                  <TableHeader>Nombre del Niño/a</TableHeader>
                  <TableHeader>Edad</TableHeader>
                  <TableHeader>Diagnóstico</TableHeader>
                  <TableHeader>Tutor</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </tr>
              </thead>
              <tbody>
                {filteredBeneficiarios.map((beneficiario) => (
                  <TableRow key={beneficiario.id}>
                    <TableCell>
                      <CodigoBadge>{beneficiario.codigoBeneficiario}</CodigoBadge>
                    </TableCell>
                    <TableCell>{beneficiario.pacienteRegistro?.nombreCompletoNino}</TableCell>
                    <TableCell>{beneficiario.pacienteRegistro?.edad} años</TableCell>
                    <TableCell>{beneficiario.pacienteRegistro?.diagnostico}</TableCell>
                    <TableCell>{beneficiario.pacienteRegistro?.nombreCompletoTutor}</TableCell>
                    <TableCell>
                      <EstadoBadge color={getEstadoColor(beneficiario.estadoBeneficiario)}>
                        {beneficiario.estadoBeneficiario}
                      </EstadoBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <IconButton
                          title="Ver detalle"
                          onClick={() => { setSelectedBeneficiario(beneficiario); setShowDetalleModal(true); }}>
                          <FaEye />
                        </IconButton>
                        <IconButton
                          title="Registrar ayuda"
                          onClick={() => { setSelectedBeneficiario(beneficiario); setShowAyudaModal(true); }}>
                          <FaPlus />
                        </IconButton>
                        <IconButton
                          title="Historial de ayudas"
                          onClick={() => {
                            setSelectedBeneficiario(beneficiario);
                            fetchHistorialAyudas(beneficiario.id);
                            setShowHistorialModal(true);
                          }}>
                          <FaHistory />
                        </IconButton>
                        <IconButton
                          title="Programar quimioterapia"
                          onClick={() => { setSelectedBeneficiario(beneficiario); setShowQuimioModal(true); }}>
                          <FaCalendarAlt />
                        </IconButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </ContentArea>

      {/* Modal Registrar Ayuda */}
      <Modal show={showAyudaModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Registrar Ayuda</ModalTitle>
            <CloseButton onClick={() => setShowAyudaModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedBeneficiario && (
            <form onSubmit={handleAyudaSubmit}>
              <InfoBox>
                <strong>Beneficiario:</strong> {selectedBeneficiario.codigoBeneficiario}<br />
                <strong>Nombre:</strong> {selectedBeneficiario.pacienteRegistro?.nombreCompletoNino}
              </InfoBox>

              <SectionTitle>Tipos de Ayuda (Bs.)</SectionTitle>
              <AyudaGrid>
                <AyudaItem>
                  <AyudaIcon><FaPills /></AyudaIcon>
                  <AyudaLabel>Medicamentos</AyudaLabel>
                  <AyudaInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={ayudaForm.medicamentos}
                    onChange={(e) => setAyudaForm({...ayudaForm, medicamentos: Number(e.target.value)})}
                  />
                </AyudaItem>
                <AyudaItem>
                  <AyudaIcon><FaHeartbeat /></AyudaIcon>
                  <AyudaLabel>Quimioterapia</AyudaLabel>
                  <AyudaInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={ayudaForm.quimioterapia}
                    onChange={(e) => setAyudaForm({...ayudaForm, quimioterapia: Number(e.target.value)})}
                  />
                </AyudaItem>
                <AyudaItem>
                  <AyudaIcon><FaFlask /></AyudaIcon>
                  <AyudaLabel>Análisis/Exámenes</AyudaLabel>
                  <AyudaInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={ayudaForm.analisisExamenes}
                    onChange={(e) => setAyudaForm({...ayudaForm, analisisExamenes: Number(e.target.value)})}
                  />
                </AyudaItem>
                <AyudaItem>
                  <AyudaIcon><FaMoneyBillWave /></AyudaIcon>
                  <AyudaLabel>Otros</AyudaLabel>
                  <AyudaInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={ayudaForm.otros}
                    onChange={(e) => setAyudaForm({...ayudaForm, otros: Number(e.target.value)})}
                  />
                </AyudaItem>
              </AyudaGrid>

              <TotalBox>
                <span>Total Ayuda:</span>
                <strong>Bs. {calcularTotalAyuda().toFixed(2)}</strong>
              </TotalBox>

              <FormGroup>
                <Label>Observaciones</Label>
                <TextArea
                  value={ayudaForm.observaciones}
                  onChange={(e) => setAyudaForm({...ayudaForm, observaciones: e.target.value})}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                />
              </FormGroup>

              <ModalActions>
                <SecondaryButton type="button" onClick={() => setShowAyudaModal(false)}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={loading || calcularTotalAyuda() === 0}>
                  {loading ? "Guardando..." : "Registrar Ayuda"}
                </PrimaryButton>
              </ModalActions>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Historial de Ayudas */}
      <Modal show={showHistorialModal}>
        <ModalContentLarge>
          <ModalHeader>
            <ModalTitle>Historial de Ayudas</ModalTitle>
            <CloseButton onClick={() => setShowHistorialModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedBeneficiario && (
            <HistorialContent>
              <InfoBox>
                <strong>Beneficiario:</strong> {selectedBeneficiario.codigoBeneficiario} - {selectedBeneficiario.pacienteRegistro?.nombreCompletoNino}
              </InfoBox>

              {historialAyudas.length === 0 ? (
                <EmptyState>No hay ayudas registradas</EmptyState>
              ) : (
                <HistorialTable>
                  <thead>
                    <tr>
                      <TableHeader>Fecha</TableHeader>
                      <TableHeader>Medicamentos</TableHeader>
                      <TableHeader>Quimioterapia</TableHeader>
                      <TableHeader>Análisis/Exámenes</TableHeader>
                      <TableHeader>Otros</TableHeader>
                      <TableHeader>Total</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {historialAyudas.map((ayuda) => (
                      <TableRow key={ayuda.id}>
                        <TableCell>{new Date(ayuda.fechaAyuda).toLocaleDateString()}</TableCell>
                        <TableCell>Bs. {Number(ayuda.medicamentos).toFixed(2)}</TableCell>
                        <TableCell>Bs. {Number(ayuda.quimioterapia).toFixed(2)}</TableCell>
                        <TableCell>Bs. {Number(ayuda.analisisExamenes).toFixed(2)}</TableCell>
                        <TableCell>Bs. {Number(ayuda.otros).toFixed(2)}</TableCell>
                        <TableCell><strong>Bs. {Number(ayuda.totalAyuda).toFixed(2)}</strong></TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <TableCell colSpan="5"><strong>Total General:</strong></TableCell>
                      <TableCell>
                        <strong>Bs. {historialAyudas.reduce((sum, a) => sum + Number(a.totalAyuda), 0).toFixed(2)}</strong>
                      </TableCell>
                    </tr>
                  </tfoot>
                </HistorialTable>
              )}

              <ModalActions>
                <SecondaryButton onClick={() => setShowHistorialModal(false)}>
                  Cerrar
                </SecondaryButton>
              </ModalActions>
            </HistorialContent>
          )}
        </ModalContentLarge>
      </Modal>

      {/* Modal Programar Quimioterapia */}
      <Modal show={showQuimioModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Programar Sesión de Quimioterapia</ModalTitle>
            <CloseButton onClick={() => setShowQuimioModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedBeneficiario && (
            <form onSubmit={handleQuimioSubmit}>
              <InfoBox>
                <strong>Beneficiario:</strong> {selectedBeneficiario.codigoBeneficiario}<br />
                <strong>Nombre:</strong> {selectedBeneficiario.pacienteRegistro?.nombreCompletoNino}
              </InfoBox>

              <FormSection>
                <FormGroup>
                  <Label>Número de Sesión *</Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={quimioForm.numeroSesion}
                    onChange={(e) => setQuimioForm({...quimioForm, numeroSesion: Number(e.target.value)})}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Fecha Programada *</Label>
                  <Input
                    type="date"
                    required
                    value={quimioForm.fechaProgramada}
                    onChange={(e) => setQuimioForm({...quimioForm, fechaProgramada: e.target.value})}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Observaciones</Label>
                  <TextArea
                    value={quimioForm.observaciones}
                    onChange={(e) => setQuimioForm({...quimioForm, observaciones: e.target.value})}
                    placeholder="Observaciones sobre la sesión..."
                    rows={3}
                  />
                </FormGroup>
              </FormSection>

              <ModalActions>
                <SecondaryButton type="button" onClick={() => setShowQuimioModal(false)}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Programar Sesión"}
                </PrimaryButton>
              </ModalActions>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Detalle Beneficiario */}
      <Modal show={showDetalleModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Detalle del Beneficiario</ModalTitle>
            <CloseButton onClick={() => setShowDetalleModal(false)}>&times;</CloseButton>
          </ModalHeader>
          {selectedBeneficiario && (
            <DetalleContent>
              <DetalleSection>
                <DetalleSectionTitle>Información del Beneficiario</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Código:</strong> {selectedBeneficiario.codigoBeneficiario}</DetalleItem>
                  <DetalleItem>
                    <strong>Estado:</strong>{" "}
                    <EstadoBadge color={getEstadoColor(selectedBeneficiario.estadoBeneficiario)}>
                      {selectedBeneficiario.estadoBeneficiario}
                    </EstadoBadge>
                  </DetalleItem>
                  <DetalleItem><strong>Fecha Aceptación:</strong> {new Date(selectedBeneficiario.fechaAceptacion).toLocaleDateString()}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              <DetalleSection>
                <DetalleSectionTitle>Datos del Niño/a</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Nombre:</strong> {selectedBeneficiario.pacienteRegistro?.nombreCompletoNino}</DetalleItem>
                  <DetalleItem><strong>Edad:</strong> {selectedBeneficiario.pacienteRegistro?.edad} años</DetalleItem>
                  <DetalleItem style={{gridColumn: "1 / -1"}}><strong>Diagnóstico:</strong> {selectedBeneficiario.pacienteRegistro?.diagnostico}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              <DetalleSection>
                <DetalleSectionTitle>Datos del Tutor</DetalleSectionTitle>
                <DetalleGrid>
                  <DetalleItem><strong>Nombre:</strong> {selectedBeneficiario.pacienteRegistro?.nombreCompletoTutor}</DetalleItem>
                  <DetalleItem><strong>Teléfono:</strong> {selectedBeneficiario.pacienteRegistro?.telefonoTutor}</DetalleItem>
                  <DetalleItem><strong>Dirección:</strong> {selectedBeneficiario.pacienteRegistro?.direccion}</DetalleItem>
                </DetalleGrid>
              </DetalleSection>

              <DetalleSection>
                <DetalleSectionTitle>Cambiar Estado</DetalleSectionTitle>
                <EstadoButtons>
                  {['ACTIVO', 'INACTIVO', 'RECUPERADO', 'FALLECIDO'].map(estado => (
                    <EstadoButton
                      key={estado}
                      color={getEstadoColor(estado)}
                      active={selectedBeneficiario.estadoBeneficiario === estado}
                      onClick={() => handleCambiarEstado(selectedBeneficiario.id, estado)}
                      disabled={selectedBeneficiario.estadoBeneficiario === estado}
                    >
                      {estado}
                    </EstadoButton>
                  ))}
                </EstadoButtons>
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
    </Container>
  );
};

export default Asistente;

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

const FiltersContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
  min-width: 280px;

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

const TableContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const HistorialTable = styled(Table)`
  font-size: 0.9rem;
`;

const TableHeader = styled.th`
  background: #ff6347;
  color: white;
  padding: 14px;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
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
  padding: 14px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
`;

const CodigoBadge = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
`;

const EstadoBadge = styled.span`
  background: ${props => props.color}20;
  color: ${props => props.color};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const IconButton = styled.button`
  background: #f5f5f5;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #ff6347;
    color: white;
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

const ModalContentLarge = styled(ModalContent)`
  max-width: 900px;
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

const SectionTitle = styled.h4`
  color: #333;
  font-size: 1rem;
  margin: 20px 24px 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ff6347;
`;

const AyudaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 0 24px;
`;

const AyudaItem = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
`;

const AyudaIcon = styled.div`
  color: #ff6347;
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const AyudaLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
`;

const AyudaInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #ff6347;
  }
`;

const TotalBox = styled.div`
  margin: 20px 24px;
  padding: 16px;
  background: #e8f5e9;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;

  strong {
    color: #2e7d32;
  }
`;

const FormSection = styled.div`
  padding: 0 24px;
`;

const FormGroup = styled.div`
  margin: 0 24px 16px;
`;

const Label = styled.label`
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #ff6347;
  }
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
  transition: background 0.2s;

  &:hover {
    background: #e55a2b;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const HistorialContent = styled.div`
  padding: 0 0 20px;
  overflow-x: auto;
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

const EstadoButtons = styled.div`
  display: flex;
  gap: 10px;
  padding: 0 24px;
  flex-wrap: wrap;
`;

const EstadoButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.color};
  background: ${props => props.active ? props.color : 'white'};
  color: ${props => props.active ? 'white' : props.color};
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.color};
    color: white;
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;
