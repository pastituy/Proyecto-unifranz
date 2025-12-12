import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaCheck, FaTimes, FaTruck } from 'react-icons/fa';

const AsistenteView = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDIENTE');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [stats, setStats] = useState({
    pendientes: 0,
    aprobadas: 0,
    listasParaRecoger: 0,
    entregadas: 0,
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener solicitudes según filtro
      const url = filter === 'TODAS'
        ? 'http://localhost:3000/solicitudes-ayuda'
        : `http://localhost:3000/solicitudes-ayuda?estado=${filter}`;

      const solicitudesRes = await fetch(url);
      const solicitudesData = await solicitudesRes.json();
      setSolicitudes(solicitudesData.data || []);

      // Obtener estadísticas
      const statsRes = await fetch('http://localhost:3000/solicitudes-ayuda/stats/resumen');
      const statsData = await statsRes.json();
      setStats(statsData.data || {});
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (solicitudId) => {
    if (!window.confirm('¿Estás seguro de aprobar esta solicitud?')) return;

    try {
      const response = await fetch(`http://localhost:3000/solicitudes-ayuda/${solicitudId}/aprobar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisadoPorId: user.id }),
      });

      if (response.ok) {
        alert('Solicitud aprobada exitosamente');
        fetchData();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aprobar solicitud');
    }
  };

  const handleRechazar = async (solicitudId) => {
    const motivo = prompt('Ingresa el motivo del rechazo:');
    if (!motivo) return;

    try {
      const response = await fetch(`http://localhost:3000/solicitudes-ayuda/${solicitudId}/rechazar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisadoPorId: user.id,
          motivoRechazo: motivo,
        }),
      });

      if (response.ok) {
        alert('Solicitud rechazada');
        fetchData();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar solicitud');
    }
  };

  const handleMarcarListaParaRecoger = async (solicitudId) => {
    if (!window.confirm('¿Marcar como lista para recoger?')) return;

    try {
      const response = await fetch(`http://localhost:3000/solicitudes-ayuda/${solicitudId}/lista-para-recoger`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('Solicitud marcada como lista para recoger');
        fetchData();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar solicitud');
    }
  };

  const handleRegistrarEntrega = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowEntregaModal(true);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE: { icon: <FaClock />, color: '#ffa500', text: 'Pendiente' },
      APROBADA: { icon: <FaCheckCircle />, color: '#4caf50', text: 'Aprobada' },
      LISTA_PARA_RECOGER: { icon: <FaTruck />, color: '#2196f3', text: 'Lista para recoger' },
      ENTREGADA: { icon: <FaCheckCircle />, color: '#4caf50', text: 'Entregada' },
      RECHAZADA: { icon: <FaTimesCircle />, color: '#f44336', text: 'Rechazada' },
    };

    const badge = badges[estado] || badges.PENDIENTE;

    return (
      <EstadoBadge color={badge.color}>
        {badge.icon}
        <span>{badge.text}</span>
      </EstadoBadge>
    );
  };

  const getPrioridadColor = (prioridad) => {
    const colors = {
      URGENTE: '#f44336',
      ALTA: '#ff9800',
      NORMAL: '#4caf50',
    };
    return colors[prioridad] || colors.NORMAL;
  };

  if (showEntregaModal) {
    const EntregaForm = require('./EntregaForm').default;
    return (
      <EntregaForm
        solicitud={selectedSolicitud}
        onClose={() => {
          setShowEntregaModal(false);
          setSelectedSolicitud(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaClipboardList />
          Solicitudes de Ayuda Recibidas
        </Title>
        <Subtitle>Gestiona las solicitudes enviadas por los trabajadores sociales</Subtitle>
      </Header>

      {/* Estadísticas */}
      <StatsGrid>
        <StatCard
          color="#ffa500"
          active={filter === 'PENDIENTE'}
          onClick={() => setFilter('PENDIENTE')}
        >
          <StatNumber>{stats.pendientes || 0}</StatNumber>
          <StatLabel>Pendientes</StatLabel>
        </StatCard>
        <StatCard
          color="#4caf50"
          active={filter === 'APROBADA'}
          onClick={() => setFilter('APROBADA')}
        >
          <StatNumber>{stats.aprobadas || 0}</StatNumber>
          <StatLabel>Aprobadas</StatLabel>
        </StatCard>
        <StatCard
          color="#2196f3"
          active={filter === 'LISTA_PARA_RECOGER'}
          onClick={() => setFilter('LISTA_PARA_RECOGER')}
        >
          <StatNumber>{stats.listasParaRecoger || 0}</StatNumber>
          <StatLabel>Listas para Recoger</StatLabel>
        </StatCard>
        <StatCard
          color="#9e9e9e"
          active={filter === 'ENTREGADA'}
          onClick={() => setFilter('ENTREGADA')}
        >
          <StatNumber>{stats.entregadas || 0}</StatNumber>
          <StatLabel>Entregadas</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Filtros */}
      <FilterBar>
        <FilterButton active={filter === 'TODAS'} onClick={() => setFilter('TODAS')}>
          Todas
        </FilterButton>
        <FilterButton active={filter === 'PENDIENTE'} onClick={() => setFilter('PENDIENTE')}>
          Pendientes
        </FilterButton>
        <FilterButton active={filter === 'APROBADA'} onClick={() => setFilter('APROBADA')}>
          Aprobadas
        </FilterButton>
        <FilterButton active={filter === 'LISTA_PARA_RECOGER'} onClick={() => setFilter('LISTA_PARA_RECOGER')}>
          Listas para Recoger
        </FilterButton>
        <FilterButton active={filter === 'ENTREGADA'} onClick={() => setFilter('ENTREGADA')}>
          Entregadas
        </FilterButton>
      </FilterBar>

      {/* Lista de Solicitudes */}
      <Section>
        {loading ? (
          <LoadingMessage>Cargando...</LoadingMessage>
        ) : solicitudes.length === 0 ? (
          <EmptyMessage>No hay solicitudes en este estado</EmptyMessage>
        ) : (
          <SolicitudesGrid>
            {solicitudes.map((solicitud) => (
              <SolicitudCard key={solicitud.id} prioridad={solicitud.prioridad}>
                <CardHeader>
                  <SolicitudCode>{solicitud.codigoSolicitud}</SolicitudCode>
                  <PrioridadBadge color={getPrioridadColor(solicitud.prioridad)}>
                    {solicitud.prioridad}
                  </PrioridadBadge>
                </CardHeader>

                <BeneficiarioInfo>
                  <strong>{solicitud.beneficiario?.pacienteRegistro?.nombreCompletoNino}</strong>
                  <small>{solicitud.beneficiario?.codigoBeneficiario}</small>
                </BeneficiarioInfo>

                <SolicitudInfo>
                  <InfoRow>
                    <strong>Tipo:</strong> {solicitud.tipoAyuda.replace(/_/g, ' ')}
                  </InfoRow>
                  <InfoRow>
                    <strong>Solicitado por:</strong> {solicitud.solicitadoPor?.nombre}
                  </InfoRow>
                  <InfoRow>
                    <strong>Fecha:</strong> {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-BO')}
                  </InfoRow>
                  {solicitud.costoEstimado && (
                    <InfoRow>
                      <strong>Costo estimado:</strong> {solicitud.costoEstimado} Bs
                    </InfoRow>
                  )}
                </SolicitudInfo>

                <DetailText>{solicitud.detalleSolicitud.substring(0, 100)}...</DetailText>

                {getEstadoBadge(solicitud.estado)}

                <CardActions>
                  <ActionButton onClick={() => {
                    setSelectedSolicitud(solicitud);
                    setShowDetailModal(true);
                  }}>
                    <FaEye /> Ver Detalle
                  </ActionButton>

                  {solicitud.estado === 'PENDIENTE' && (
                    <>
                      <ActionButton success onClick={() => handleAprobar(solicitud.id)}>
                        <FaCheck /> Aprobar
                      </ActionButton>
                      <ActionButton danger onClick={() => handleRechazar(solicitud.id)}>
                        <FaTimes /> Rechazar
                      </ActionButton>
                    </>
                  )}

                  {solicitud.estado === 'APROBADA' && (
                    <ActionButton primary onClick={() => handleMarcarListaParaRecoger(solicitud.id)}>
                      <FaTruck /> Marcar Lista
                    </ActionButton>
                  )}

                  {solicitud.estado === 'LISTA_PARA_RECOGER' && (
                    <ActionButton primary onClick={() => handleRegistrarEntrega(solicitud)}>
                      <FaCheckCircle /> Registrar Entrega
                    </ActionButton>
                  )}
                </CardActions>
              </SolicitudCard>
            ))}
          </SolicitudesGrid>
        )}
      </Section>

      {/* Modal de Detalle */}
      {showDetailModal && selectedSolicitud && (
        <Modal onClick={() => setShowDetailModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Detalle de Solicitud {selectedSolicitud.codigoSolicitud}</ModalTitle>
              <CloseButton onClick={() => setShowDetailModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailSection>
                <DetailTitle>Beneficiario</DetailTitle>
                <DetailInfo>
                  <strong>{selectedSolicitud.beneficiario?.pacienteRegistro?.nombreCompletoNino}</strong>
                  <p>{selectedSolicitud.beneficiario?.codigoBeneficiario}</p>
                  <p>Diagnóstico: {selectedSolicitud.beneficiario?.pacienteRegistro?.diagnostico}</p>
                </DetailInfo>
              </DetailSection>

              <DetailSection>
                <DetailTitle>Información de la Solicitud</DetailTitle>
                <DetailGrid>
                  <DetailItem>
                    <label>Tipo de Ayuda:</label>
                    <span>{selectedSolicitud.tipoAyuda.replace(/_/g, ' ')}</span>
                  </DetailItem>
                  <DetailItem>
                    <label>Prioridad:</label>
                    <PrioridadBadge color={getPrioridadColor(selectedSolicitud.prioridad)}>
                      {selectedSolicitud.prioridad}
                    </PrioridadBadge>
                  </DetailItem>
                  <DetailItem>
                    <label>Solicitado por:</label>
                    <span>{selectedSolicitud.solicitadoPor?.nombre}</span>
                  </DetailItem>
                  <DetailItem>
                    <label>Fecha:</label>
                    <span>{new Date(selectedSolicitud.fechaSolicitud).toLocaleString('es-BO')}</span>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {selectedSolicitud.numeroReceta && (
                <DetailSection>
                  <DetailTitle>Receta Médica</DetailTitle>
                  <DetailGrid>
                    <DetailItem>
                      <label>N° Receta:</label>
                      <span>{selectedSolicitud.numeroReceta}</span>
                    </DetailItem>
                    <DetailItem>
                      <label>Médico:</label>
                      <span>{selectedSolicitud.medicoPrescriptor}</span>
                    </DetailItem>
                    {selectedSolicitud.fechaReceta && (
                      <DetailItem>
                        <label>Fecha Receta:</label>
                        <span>{new Date(selectedSolicitud.fechaReceta).toLocaleDateString('es-BO')}</span>
                      </DetailItem>
                    )}
                  </DetailGrid>
                </DetailSection>
              )}

              <DetailSection>
                <DetailTitle>Detalle</DetailTitle>
                <DetailText>{selectedSolicitud.detalleSolicitud}</DetailText>
                {selectedSolicitud.costoEstimado && (
                  <p><strong>Costo Estimado:</strong> {selectedSolicitud.costoEstimado} Bs</p>
                )}
                {selectedSolicitud.observaciones && (
                  <>
                    <DetailTitle>Observaciones</DetailTitle>
                    <DetailText>{selectedSolicitud.observaciones}</DetailText>
                  </>
                )}
              </DetailSection>

              {selectedSolicitud.estado === 'PENDIENTE' && (
                <ModalActions>
                  <ActionButton danger onClick={() => handleRechazar(selectedSolicitud.id)}>
                    <FaTimes /> Rechazar
                  </ActionButton>
                  <ActionButton success onClick={() => handleAprobar(selectedSolicitud.id)}>
                    <FaCheck /> Aprobar
                  </ActionButton>
                </ModalActions>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  svg {
    color: #3498db;
  }
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color};
  cursor: pointer;
  transition: all 0.3s;
  opacity: ${props => props.active ? 1 : 0.7};
  transform: ${props => props.active ? 'scale(1.02)' : 'scale(1)'};

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  text-transform: uppercase;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? '#3498db' : '#ecf0f1'};
  background: ${props => props.active ? '#3498db' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #3498db;
  }
`;

const Section = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SolicitudesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const SolicitudCard = styled.div`
  border: 2px solid ${props => {
    if (props.prioridad === 'URGENTE') return '#f44336';
    if (props.prioridad === 'ALTA') return '#ff9800';
    return '#ecf0f1';
  }};
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SolicitudCode = styled.span`
  font-weight: bold;
  color: #3498db;
  font-size: 16px;
`;

const PrioridadBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => `${props.color}20`};
  color: ${props => props.color};
`;

const BeneficiarioInfo = styled.div`
  margin-bottom: 12px;

  strong {
    display: block;
    color: #2c3e50;
    font-size: 16px;
    margin-bottom: 4px;
  }

  small {
    color: #95a5a6;
    font-size: 13px;
  }
`;

const SolicitudInfo = styled.div`
  margin-bottom: 12px;
`;

const InfoRow = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 4px;

  strong {
    color: #2c3e50;
  }
`;

const DetailText = styled.p`
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
  margin: 12px 0;
`;

const EstadoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => `${props.color}20`};
  color: ${props => props.color};
  margin: 12px 0;

  svg {
    font-size: 12px;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  background: ${props => {
    if (props.success) return '#4caf50';
    if (props.danger) return '#f44336';
    if (props.primary) return '#2196f3';
    return '#ecf0f1';
  }};
  color: ${props => (props.success || props.danger || props.primary) ? 'white' : '#2c3e50'};

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 18px;
  color: #95a5a6;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #95a5a6;
  font-size: 16px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 2px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 28px;
  color: #95a5a6;
  cursor: pointer;

  &:hover {
    color: #2c3e50;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const DetailSection = styled.div`
  margin-bottom: 24px;
`;

const DetailTitle = styled.h3`
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 600;
`;

const DetailInfo = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;

  strong {
    display: block;
    font-size: 16px;
    margin-bottom: 4px;
  }

  p {
    margin: 4px 0;
    font-size: 14px;
    color: #7f8c8d;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const DetailItem = styled.div`
  label {
    display: block;
    font-size: 13px;
    color: #95a5a6;
    margin-bottom: 4px;
  }

  span {
    font-size: 14px;
    color: #2c3e50;
    font-weight: 500;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ecf0f1;
`;

export default AsistenteView;
