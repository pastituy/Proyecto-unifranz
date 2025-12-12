import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaHandHoldingHeart,
  FaSearch,
  FaFilter,
  FaPills,
  FaUtensils,
  FaBus,
  FaHome,
  FaCheck,
  FaTimes,
  FaClock,
  FaFileAlt,
  FaUser
} from 'react-icons/fa';

const getTipoAyudaIcon = (tipo) => {
  switch (tipo) {
    case 'MEDICAMENTOS': return FaPills;
    case 'ALIMENTOS': return FaUtensils;
    case 'TRANSPORTE': return FaBus;
    case 'VIVIENDA': return FaHome;
    default: return FaHandHoldingHeart;
  }
};

const getTipoAyudaColor = (tipo) => {
  switch (tipo) {
    case 'MEDICAMENTOS': return '#FF6B6B';
    case 'ALIMENTOS': return '#4ECDC4';
    case 'TRANSPORTE': return '#FFD93D';
    case 'VIVIENDA': return '#6BCF7F';
    default: return '#A084DC';
  }
};

const getPrioridadColor = (prioridad) => {
  switch (prioridad) {
    case 'URGENTE': return '#D32F2F';
    case 'ALTA': return '#F57C00';
    case 'MEDIA': return '#FBC02D';
    case 'BAJA': return '#388E3C';
    default: return '#757575';
  }
};

const RequestList = ({ usuarioId }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEntregarModal, setShowEntregarModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [costoReal, setCostoReal] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [facturaPdf, setFacturaPdf] = useState(null);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/solicitudes-ayuda');
      const data = await response.json();

      if (data.success) {
        setSolicitudes(data.data);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    try {
      const response = await fetch(`http://localhost:3000/solicitudes-ayuda/${selectedSolicitud.id}/aprobar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          revisadoPorId: usuarioId,
          instruccionesEntrega: observaciones.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Solicitud recepcionada correctamente');
        setShowApproveModal(false);
        setSelectedSolicitud(null);
        setObservaciones('');
        fetchSolicitudes();
      } else {
        alert(data.mensaje || 'Error al recepcionar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const handleEntregar = async () => {
    if (!facturaPdf) {
      alert('Debe cargar la factura en PDF');
      return;
    }

    if (!costoReal || parseFloat(costoReal) <= 0) {
      alert('Debe ingresar el costo real');
      return;
    }

    try {
      // Usar FormData para enviar archivos
      const formData = new FormData();
      formData.append('facturaPdf', facturaPdf);
      formData.append('costoReal', parseFloat(costoReal));

      if (proveedor.trim()) {
        formData.append('proveedor', proveedor.trim());
      }

      if (observaciones.trim()) {
        formData.append('instruccionesEntrega', observaciones.trim());
      }

      console.log('Enviando entrega con factura...');

      const response = await fetch(`http://localhost:3000/solicitudes-ayuda/${selectedSolicitud.id}/entregar`, {
        method: 'PUT',
        body: formData
        // NO incluir Content-Type header - el navegador lo configura automáticamente
      });

      const data = await response.json();

      if (data.success) {
        alert('Entrega registrada correctamente');
        setShowEntregarModal(false);
        setSelectedSolicitud(null);
        setCostoReal('');
        setProveedor('');
        setObservaciones('');
        setFacturaPdf(null);
        fetchSolicitudes();
      } else {
        alert(data.mensaje || 'Error al registrar la entrega');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Debe proporcionar un motivo de rechazo');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/solicitudes-ayuda/${selectedSolicitud.id}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rechazadoPorId: usuarioId,
          motivoRechazo: motivoRechazo
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Solicitud rechazada correctamente');
        setShowRejectModal(false);
        setSelectedSolicitud(null);
        setMotivoRechazo('');
        fetchSolicitudes();
      } else {
        alert(data.mensaje || 'Error al rechazar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const filteredSolicitudes = solicitudes
    .filter(s => s.estado === filtroEstado)
    .filter(s => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        s.codigoSolicitud.toLowerCase().includes(searchLower) ||
        s.beneficiario.codigoBeneficiario.toLowerCase().includes(searchLower) ||
        s.beneficiario.pacienteRegistro.nombreCompletoNino.toLowerCase().includes(searchLower) ||
        s.tipoAyuda.toLowerCase().includes(searchLower)
      );
    });

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Cargando solicitudes...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestión de Solicitudes de Ayuda</Title>
        <Subtitle>Como asistente, eres responsable de revisar y aprobar/recepcionar las solicitudes de ayuda que llegan de los trabajadores sociales y psicólogos</Subtitle>
      </Header>

      <FilterBar>
        <FilterButtons>
          <FilterButton
            $active={filtroEstado === 'PENDIENTE'}
            onClick={() => setFiltroEstado('PENDIENTE')}
          >
            <FaClock /> Pendientes ({solicitudes.filter(s => s.estado === 'PENDIENTE').length})
          </FilterButton>
          <FilterButton
            $active={filtroEstado === 'RECEPCIONADO'}
            onClick={() => setFiltroEstado('RECEPCIONADO')}
          >
            <FaCheck /> Recepcionadas ({solicitudes.filter(s => s.estado === 'RECEPCIONADO').length})
          </FilterButton>
          <FilterButton
            $active={filtroEstado === 'ENTREGADO'}
            onClick={() => setFiltroEstado('ENTREGADO')}
          >
            <FaCheck /> Entregadas ({solicitudes.filter(s => s.estado === 'ENTREGADO').length})
          </FilterButton>
        </FilterButtons>

        <SearchBar>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Buscar por código, beneficiario, tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </FilterBar>

      {filteredSolicitudes.length === 0 ? (
        <EmptyState>
          <FaHandHoldingHeart style={{ fontSize: '64px', color: '#ddd', marginBottom: '16px' }} />
          <p>No hay solicitudes {filtroEstado.toLowerCase()}s</p>
        </EmptyState>
      ) : (
        <SolicitudesList>
          {filteredSolicitudes.map((solicitud) => {
            const TipoIcon = getTipoAyudaIcon(solicitud.tipoAyuda);
            const tipoColor = getTipoAyudaColor(solicitud.tipoAyuda);

            return (
              <SolicitudCard key={solicitud.id}>
                <CardHeader>
                  <CodigoSolicitud>{solicitud.codigoSolicitud}</CodigoSolicitud>
                  <PrioridadBadge $prioridad={solicitud.prioridad}>
                    {solicitud.prioridad}
                  </PrioridadBadge>
                </CardHeader>

                <CardBody>
                  <TipoAyudaSection $color={tipoColor}>
                    <TipoIcon style={{ fontSize: '24px' }} />
                    <span>{solicitud.tipoAyuda}</span>
                  </TipoAyudaSection>

                  <BeneficiarioInfo>
                    <strong>Beneficiario:</strong> {solicitud.beneficiario.pacienteRegistro.nombreCompletoNino}
                    <CodigoBeneficiario>({solicitud.beneficiario.codigoBeneficiario})</CodigoBeneficiario>
                  </BeneficiarioInfo>

                  <Descripcion>{solicitud.detalleSolicitud}</Descripcion>

                  {solicitud.costoEstimado && (
                    <MontoInfo>
                      <Label>Costo Estimado:</Label>
                      <Monto>Bs {Number(solicitud.costoEstimado).toFixed(2)}</Monto>
                    </MontoInfo>
                  )}

                  {solicitud.estado === 'ENTREGADO' && solicitud.costoReal && (
                    <MontoInfo>
                      <Label>Costo Real:</Label>
                      <Monto $approved>Bs {Number(solicitud.costoReal).toFixed(2)}</Monto>
                    </MontoInfo>
                  )}

                  <SolicitanteInfo>
                    <FaUser />
                    <span>Solicitado por: {solicitud.solicitadoPor.nombre}</span>
                  </SolicitanteInfo>

                  <FechaSolicitud>
                    Fecha: {new Date(solicitud.createdAt).toLocaleDateString('es-BO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </FechaSolicitud>

                  {solicitud.recetaPdf && (
                    <DocumentoLink
                      href={`http://localhost:3000/uploads/${solicitud.recetaPdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFileAlt /> Ver Receta/Documento PDF
                    </DocumentoLink>
                  )}

                  {solicitud.observaciones && (
                    <Observaciones>
                      <strong>Observaciones:</strong> {solicitud.observaciones}
                    </Observaciones>
                  )}

                  {solicitud.motivoRechazo && (
                    <MotivoRechazo>
                      <strong>Motivo de Rechazo:</strong> {solicitud.motivoRechazo}
                    </MotivoRechazo>
                  )}
                </CardBody>

                {solicitud.estado === 'PENDIENTE' && (
                  <CardActions>
                    <ApproveButton
                      onClick={() => {
                        setSelectedSolicitud(solicitud);
                        setShowApproveModal(true);
                      }}
                    >
                      <FaCheck /> Recepcionar Solicitud
                    </ApproveButton>
                  </CardActions>
                )}

                {solicitud.estado === 'RECEPCIONADO' && (
                  <CardActions>
                    <EntregarButton
                      onClick={() => {
                        setSelectedSolicitud(solicitud);
                        setCostoReal(solicitud.costoEstimado ? solicitud.costoEstimado.toString() : '0');
                        setShowEntregarModal(true);
                      }}
                    >
                      <FaCheck /> Marcar como Entregado
                    </EntregarButton>
                  </CardActions>
                )}
              </SolicitudCard>
            );
          })}
        </SolicitudesList>
      )}

      {/* Modal de Aprobación */}
      {showApproveModal && selectedSolicitud && (
        <ModalOverlay onClick={() => setShowApproveModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Recepcionar Solicitud</h3>
              <CloseButton onClick={() => setShowApproveModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <p><strong>Código:</strong> {selectedSolicitud.codigoSolicitud}</p>
              <p><strong>Beneficiario:</strong> {selectedSolicitud.beneficiario.pacienteRegistro.nombreCompletoNino}</p>
              <p><strong>Tipo de Ayuda:</strong> {selectedSolicitud.tipoAyuda}</p>
              {selectedSolicitud.costoEstimado && (
                <p><strong>Costo Estimado:</strong> Bs {Number(selectedSolicitud.costoEstimado).toFixed(2)}</p>
              )}

              <FormGroup>
                <Label>Instrucciones de Entrega (opcional)</Label>
                <TextArea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Pasar a farmacia a recoger con la receta médica..."
                  rows={3}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={() => setShowApproveModal(false)}>
                Cancelar
              </CancelButton>
              <ConfirmButton onClick={handleAprobar}>
                Recepcionar Solicitud
              </ConfirmButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}

      {/* Modal de Rechazo */}
      {showRejectModal && selectedSolicitud && (
        <ModalOverlay onClick={() => setShowRejectModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Rechazar Solicitud</h3>
              <CloseButton onClick={() => setShowRejectModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <p><strong>Código:</strong> {selectedSolicitud.codigoSolicitud}</p>

              <FormGroup>
                <Label>Motivo de Rechazo *</Label>
                <TextArea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Explique detalladamente el motivo del rechazo..."
                  rows={5}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={() => setShowRejectModal(false)}>
                Cancelar
              </CancelButton>
              <ConfirmButton $reject onClick={handleRechazar}>
                Confirmar Rechazo
              </ConfirmButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}

      {/* Modal de Entrega */}
      {showEntregarModal && selectedSolicitud && (
        <ModalOverlay onClick={() => setShowEntregarModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Registrar Entrega</h3>
              <CloseButton onClick={() => setShowEntregarModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <p><strong>Código:</strong> {selectedSolicitud.codigoSolicitud}</p>
              <p><strong>Beneficiario:</strong> {selectedSolicitud.beneficiario.pacienteRegistro.nombreCompletoNino}</p>
              {selectedSolicitud.costoEstimado && (
                <p><strong>Costo Estimado:</strong> Bs {Number(selectedSolicitud.costoEstimado).toFixed(2)}</p>
              )}

              <FormGroup>
                <Label>Factura (PDF) *</Label>
                <FileInputWrapper>
                  <FileInput
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFacturaPdf(e.target.files[0])}
                    id="facturaPdf"
                  />
                  <FileLabel htmlFor="facturaPdf">
                    {facturaPdf ? facturaPdf.name : 'Seleccionar factura PDF...'}
                  </FileLabel>
                </FileInputWrapper>
                <HelpText>Sube la factura de compra en formato PDF</HelpText>
              </FormGroup>

              <FormGroup>
                <Label>Costo Real (Bs) *</Label>
                <Input
                  type="number"
                  value={costoReal}
                  onChange={(e) => setCostoReal(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="Ingrese el monto real gastado"
                />
              </FormGroup>

              <FormGroup>
                <Label>Proveedor/Farmacia (opcional)</Label>
                <Input
                  type="text"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  placeholder="Ej: Farmacia San Juan"
                />
              </FormGroup>

              <FormGroup>
                <Label>Observaciones adicionales (opcional)</Label>
                <TextArea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ingrese observaciones adicionales sobre la entrega..."
                  rows={3}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={() => setShowEntregarModal(false)}>
                Cancelar
              </CancelButton>
              <ConfirmButton onClick={handleEntregar}>
                Confirmar Entrega
              </ConfirmButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default RequestList;

// Styled Components
const Container = styled.div`
  width: 100%;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const FilterBar = styled.div`
  margin-bottom: 24px;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid ${props => props.$active ? '#667eea' : '#ddd'};
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: ${props => props.$active ? '#5568d3' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;

  svg {
    color: #999;
    font-size: 18px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;

  &::placeholder {
    color: #999;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    color: #999;
    font-size: 16px;
    margin: 0;
  }
`;

const SolicitudesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SolicitudCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
`;

const CodigoSolicitud = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
  letter-spacing: 0.5px;
`;

const PrioridadBadge = styled.div`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => getPrioridadColor(props.$prioridad)};
  color: white;
`;

const CardBody = styled.div`
  padding: 20px;
`;

const TipoAyudaSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => `${props.$color}15`};
  border-left: 4px solid ${props => props.$color};
  border-radius: 6px;
  margin-bottom: 16px;
  color: ${props => props.$color};
  font-weight: 600;
  font-size: 15px;
`;

const BeneficiarioInfo = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;

  strong {
    color: #667eea;
  }
`;

const CodigoBeneficiario = styled.span`
  color: #999;
  font-size: 13px;
  margin-left: 4px;
`;

const Descripcion = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 16px 0;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
`;

const MontoInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Label = styled.span`
  font-size: 13px;
  color: #666;
`;

const Monto = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$approved ? '#4CAF50' : '#333'};
`;

const SolicitanteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  margin-top: 12px;

  svg {
    color: #667eea;
  }
`;

const FechaSolicitud = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 8px;
  font-style: italic;
`;

const DocumentoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 6px;
  text-decoration: none;
  font-size: 13px;
  margin-top: 12px;
  transition: background 0.2s;

  &:hover {
    background: #bbdefb;
  }
`;

const Observaciones = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #e8f5e9;
  border-left: 3px solid #4CAF50;
  border-radius: 4px;
  font-size: 13px;
  color: #2e7d32;

  strong {
    display: block;
    margin-bottom: 4px;
  }
`;

const MotivoRechazo = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #ffebee;
  border-left: 3px solid #f44336;
  border-radius: 4px;
  font-size: 13px;
  color: #c62828;

  strong {
    display: block;
    margin-bottom: 4px;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
`;

const RejectButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: #f44336;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #d32f2f;
  }
`;

const ApproveButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: #4CAF50;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #388e3c;
  }
`;

const EntregarButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: #2196F3;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1976D2;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 24px;

  p {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #666;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #eee;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: ${props => props.$reject ? '#f44336' : '#4CAF50'};
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$reject ? '#d32f2f' : '#388e3c'};
  }
`;

const FileInputWrapper = styled.div`
  position: relative;
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const FileLabel = styled.label`
  display: block;
  padding: 12px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  font-size: 14px;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: #999;
  margin: 6px 0 0 0;
  font-style: italic;
`;
