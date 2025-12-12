import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaClipboardList, FaClock, FaCheckCircle, FaTruck, FaTimesCircle, FaFileAlt, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ESTADO_CONFIG = {
  PENDIENTE: {
    label: 'Pendiente',
    color: '#FFA726',
    icon: FaClock,
    description: 'La solicitud está pendiente de revisión por el asistente coordinador'
  },
  RECEPCIONADO: {
    label: 'Recepcionado',
    color: '#29B6F6',
    icon: FaCheckCircle,
    description: 'La solicitud ha sido recepcionada y está en proceso'
  },
  ENTREGADO: {
    label: 'Entregado',
    color: '#66BB6A',
    icon: FaTruck,
    description: 'La ayuda ha sido entregada. El beneficiario puede recogerla'
  },
  RECHAZADO: {
    label: 'Rechazado',
    color: '#EF5350',
    icon: FaTimesCircle,
    description: 'La solicitud fue rechazada'
  }
};

const TIPO_AYUDA_LABELS = {
  MEDICAMENTOS: 'Medicamentos',
  QUIMIOTERAPIA: 'Quimioterapia',
  ANALISIS_EXAMENES: 'Análisis/Exámenes',
  OTRO: 'Otros'
};

const MySolicitudesList = ({ usuarioId }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstado, setSelectedEstado] = useState('TODAS');

  useEffect(() => {
    if (usuarioId) {
      fetchSolicitudes();
    }
  }, [usuarioId]);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/solicitudes-ayuda?solicitadoPorId=${usuarioId}`);
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

  const solicitudesFiltradas = selectedEstado === 'TODAS'
    ? solicitudes
    : solicitudes.filter(s => s.estado === selectedEstado);

  const contarPorEstado = (estado) => {
    return solicitudes.filter(s => s.estado === estado).length;
  };

  if (loading) {
    return <LoadingContainer>Cargando solicitudes...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <FaClipboardList style={{ fontSize: '24px', color: '#ff9800' }} />
        <HeaderText>
          <Title>Mis Solicitudes de Ayuda</Title>
          <Subtitle>Total de solicitudes: {solicitudes.length}</Subtitle>
        </HeaderText>
      </Header>

      <FilterTabs>
        <FilterTab
          $active={selectedEstado === 'TODAS'}
          onClick={() => setSelectedEstado('TODAS')}
        >
          Todas ({solicitudes.length})
        </FilterTab>
        <FilterTab
          $active={selectedEstado === 'PENDIENTE'}
          $color={ESTADO_CONFIG.PENDIENTE.color}
          onClick={() => setSelectedEstado('PENDIENTE')}
        >
          Pendientes ({contarPorEstado('PENDIENTE')})
        </FilterTab>
        <FilterTab
          $active={selectedEstado === 'RECEPCIONADO'}
          $color={ESTADO_CONFIG.RECEPCIONADO.color}
          onClick={() => setSelectedEstado('RECEPCIONADO')}
        >
          Recepcionadas ({contarPorEstado('RECEPCIONADO')})
        </FilterTab>
        <FilterTab
          $active={selectedEstado === 'ENTREGADO'}
          $color={ESTADO_CONFIG.ENTREGADO.color}
          onClick={() => setSelectedEstado('ENTREGADO')}
        >
          Entregadas ({contarPorEstado('ENTREGADO')})
        </FilterTab>
      </FilterTabs>

      {solicitudesFiltradas.length === 0 ? (
        <EmptyState>
          <FaClipboardList style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <p>No hay solicitudes {selectedEstado !== 'TODAS' ? 'en este estado' : ''}</p>
        </EmptyState>
      ) : (
        <SolicitudesGrid>
          {solicitudesFiltradas.map((solicitud) => {
            const estadoConfig = ESTADO_CONFIG[solicitud.estado];
            const Icon = estadoConfig.icon;

            return (
              <SolicitudCard key={solicitud.id}>
                <CardHeader $color={estadoConfig.color}>
                  <CodigoSolicitud>{solicitud.codigoSolicitud}</CodigoSolicitud>
                  <EstadoBadge $color={estadoConfig.color}>
                    <Icon style={{ marginRight: '6px' }} />
                    {estadoConfig.label}
                  </EstadoBadge>
                </CardHeader>

                <CardBody>
                  <InfoRow>
                    <Label>Beneficiario:</Label>
                    <Value>{solicitud.beneficiario.pacienteRegistro.nombreCompletoNino}</Value>
                  </InfoRow>

                  <InfoRow>
                    <Label>Código:</Label>
                    <Value>{solicitud.beneficiario.codigoBeneficiario}</Value>
                  </InfoRow>

                  <InfoRow>
                    <Label>Tipo de Ayuda:</Label>
                    <TipoBadge>{TIPO_AYUDA_LABELS[solicitud.tipoAyuda]}</TipoBadge>
                  </InfoRow>

                  <InfoRow>
                    <Label>Fecha de Solicitud:</Label>
                    <Value>{new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}</Value>
                  </InfoRow>

                  <InfoRow>
                    <Label>Prioridad:</Label>
                    <PrioridadBadge $prioridad={solicitud.prioridad}>
                      {solicitud.prioridad}
                    </PrioridadBadge>
                  </InfoRow>

                  <DescriptionBox>
                    <Label>Descripción:</Label>
                    <Description>{solicitud.detalleSolicitud}</Description>
                  </DescriptionBox>

                  {/* Estado específico: RECEPCIONADO */}
                  {solicitud.estado === 'RECEPCIONADO' && (
                    <StatusAlert $color="#29B6F6">
                      <FaCheckCircle />
                      <div>
                        <strong>Solicitud Recepcionada</strong>
                        <p>El asistente coordinador ha recibido tu solicitud y está gestionando la ayuda</p>
                        {solicitud.instruccionesEntrega && (
                          <InstructionsText>
                            <strong>Instrucciones:</strong> {solicitud.instruccionesEntrega}
                          </InstructionsText>
                        )}
                      </div>
                    </StatusAlert>
                  )}

                  {/* Estado específico: ENTREGADO */}
                  {solicitud.estado === 'ENTREGADO' && (
                    <StatusAlert $color="#66BB6A">
                      <FaTruck />
                      <div>
                        <strong>¡Ayuda Entregada!</strong>
                        <p>El beneficiario puede pasar a recoger la ayuda</p>
                        {solicitud.instruccionesEntrega && (
                          <InstructionsText>
                            <strong>Instrucciones de recojo:</strong> {solicitud.instruccionesEntrega}
                          </InstructionsText>
                        )}
                        {solicitud.costoReal && (
                          <InfoRow style={{ marginTop: '8px' }}>
                            <Label>Monto Entregado:</Label>
                            <Value style={{ fontWeight: 'bold', color: '#66BB6A' }}>
                              Bs. {Number(solicitud.costoReal).toFixed(2)}
                            </Value>
                          </InfoRow>
                        )}
                        {solicitud.fechaEntrega && (
                          <InfoRow>
                            <Label>Fecha de Entrega:</Label>
                            <Value>{new Date(solicitud.fechaEntrega).toLocaleDateString('es-ES')}</Value>
                          </InfoRow>
                        )}
                      </div>
                    </StatusAlert>
                  )}

                  {/* Estado específico: RECHAZADO */}
                  {solicitud.estado === 'RECHAZADO' && solicitud.motivoRechazo && (
                    <StatusAlert $color="#EF5350">
                      <FaTimesCircle />
                      <div>
                        <strong>Solicitud Rechazada</strong>
                        <p><strong>Motivo:</strong> {solicitud.motivoRechazo}</p>
                      </div>
                    </StatusAlert>
                  )}

                  {/* Documento PDF */}
                  {solicitud.recetaPdf && (
                    <DocumentoLink
                      href={`${API_URL}/uploads/${solicitud.recetaPdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFileAlt /> Ver Documento Adjunto
                    </DocumentoLink>
                  )}
                </CardBody>
              </SolicitudCard>
            );
          })}
        </SolicitudesGrid>
      )}
    </Container>
  );
};

export default MySolicitudesList;

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const HeaderText = styled.div``;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 10px 20px;
  border: 2px solid ${props => props.$active ? (props.$color || '#ff9800') : '#ddd'};
  background: ${props => props.$active ? (props.$color || '#ff9800') : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$color || '#ff9800'};
    background: ${props => props.$active ? (props.$color || '#ff9800') : `${props.$color || '#ff9800'}15`};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;

  p {
    font-size: 16px;
    margin: 0;
  }
`;

const SolicitudesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const SolicitudCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  background: ${props => props.$color || '#ff9800'};
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CodigoSolicitud = styled.div`
  color: white;
  font-weight: 700;
  font-size: 18px;
`;

const EstadoBadge = styled.div`
  background: rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const CardBody = styled.div`
  padding: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const Value = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 600;
`;

const TipoBadge = styled.span`
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const PrioridadBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch(props.$prioridad) {
      case 'URGENTE': return '#FFEBEE';
      case 'ALTA': return '#FFF3E0';
      case 'MEDIA': return '#E8F5E9';
      case 'BAJA': return '#F3E5F5';
      default: return '#E0E0E0';
    }
  }};
  color: ${props => {
    switch(props.$prioridad) {
      case 'URGENTE': return '#C62828';
      case 'ALTA': return '#E65100';
      case 'MEDIA': return '#2E7D32';
      case 'BAJA': return '#6A1B9A';
      default: return '#616161';
    }
  }};
`;

const DescriptionBox = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Description = styled.p`
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
`;

const StatusAlert = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${props => `${props.$color}15`};
  border-left: 4px solid ${props => props.$color};
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: flex-start;

  svg {
    font-size: 24px;
    color: ${props => props.$color};
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: ${props => props.$color};
    margin-bottom: 4px;
    font-size: 14px;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #555;
    line-height: 1.4;
  }
`;

const InstructionsText = styled.p`
  margin-top: 8px !important;
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  font-style: italic;
`;

const DocumentoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #ff9800;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #f57c00;
    transform: translateY(-2px);
  }

  svg {
    font-size: 16px;
  }
`;
