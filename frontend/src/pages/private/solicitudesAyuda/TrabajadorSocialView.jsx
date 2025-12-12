import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEye, FaHospital, FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle, FaUserMd, FaPills, FaExclamationTriangle } from 'react-icons/fa';

const TrabajadorSocialView = () => {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
  const [showSolicitudForm, setShowSolicitudForm] = useState(false);
  const [filtroEstadoMedico, setFiltroEstadoMedico] = useState('');
  const [stats, setStats] = useState({
    pendientes: 0,
    aprobadas: 0,
    listasParaRecoger: 0,
    entregadas: 0,
  });
  const [statsEstadoMedico, setStatsEstadoMedico] = useState({
    enTratamiento: 0,
    vigilancia: 0,
    paliativo: 0,
    abandono: 0,
    fallecidos: 0,
  });

  // Obtener usuario actual del contexto
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Construir URL con filtro de estado médico
      const params = new URLSearchParams();
      if (filtroEstadoMedico) params.append('estadoMedico', filtroEstadoMedico);

      // Obtener beneficiarios
      const beneficiariosRes = await fetch(`http://localhost:3000/beneficiarios?${params}`);
      const beneficiariosData = await beneficiariosRes.json();
      setBeneficiarios(beneficiariosData.data || []);

      // Obtener solicitudes creadas por este trabajador social
      const solicitudesRes = await fetch(
        `http://localhost:3000/solicitudes-ayuda?solicitadoPorId=${user.id}`
      );
      const solicitudesData = await solicitudesRes.json();
      setSolicitudes(solicitudesData.data || []);

      // Obtener estadísticas de solicitudes
      const statsRes = await fetch(
        `http://localhost:3000/solicitudes-ayuda/stats/resumen?solicitadoPorId=${user.id}`
      );
      const statsData = await statsRes.json();
      setStats(statsData.data || {});

      // Obtener estadísticas de estado médico
      const statsEstadoRes = await fetch('http://localhost:3000/estadisticas-estado-medico');
      const statsEstadoData = await statsEstadoRes.json();
      setStatsEstadoMedico(statsEstadoData.data || {});
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarAyuda = (beneficiario) => {
    setSelectedBeneficiario(beneficiario);
    setShowSolicitudForm(true);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE: { icon: <FaClock />, color: '#ffa500', text: 'En revisión' },
      APROBADA: { icon: <FaCheckCircle />, color: '#4caf50', text: 'Aprobada' },
      LISTA_PARA_RECOGER: { icon: <FaClipboardList />, color: '#2196f3', text: 'Lista para recoger' },
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

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Cargando...</LoadingMessage>
      </Container>
    );
  }

  if (showSolicitudForm) {
    // Importar dinámicamente el formulario
    const SolicitudAyudaForm = require('./SolicitudAyudaForm').default;
    return (
      <SolicitudAyudaForm
        beneficiario={selectedBeneficiario}
        onClose={() => {
          setShowSolicitudForm(false);
          setSelectedBeneficiario(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaHospital />
          Mis Beneficiarios - {user.nombre}
        </Title>
        <Subtitle>Gestiona las solicitudes de ayuda para tus beneficiarios</Subtitle>
      </Header>

      {/* Estadísticas */}
      <StatsGrid>
        <StatCard color="#ffa500">
          <StatNumber>{stats.pendientes || 0}</StatNumber>
          <StatLabel>Pendientes</StatLabel>
        </StatCard>
        <StatCard color="#4caf50">
          <StatNumber>{stats.aprobadas || 0}</StatNumber>
          <StatLabel>Aprobadas</StatLabel>
        </StatCard>
        <StatCard color="#2196f3">
          <StatNumber>{stats.listasParaRecoger || 0}</StatNumber>
          <StatLabel>Listas para Recoger</StatLabel>
        </StatCard>
        <StatCard color="#4caf50">
          <StatNumber>{stats.entregadas || 0}</StatNumber>
          <StatLabel>Entregadas</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Beneficiarios */}
      <Section>
        <SectionTitle>Mis Beneficiarios Activos</SectionTitle>
        {beneficiarios.length === 0 ? (
          <EmptyMessage>No tienes beneficiarios asignados</EmptyMessage>
        ) : (
          <BeneficiariosGrid>
            {beneficiarios.map((beneficiario) => (
              <BeneficiarioCard key={beneficiario.id}>
                <BeneficiarioHeader>
                  <BeneficiarioCode>{beneficiario.codigoBeneficiario}</BeneficiarioCode>
                  <BeneficiarioStatus active={beneficiario.estadoBeneficiario === 'ACTIVO'}>
                    {beneficiario.estadoBeneficiario}
                  </BeneficiarioStatus>
                </BeneficiarioHeader>

                <BeneficiarioName>
                  {beneficiario.pacienteRegistro?.nombreCompletoNino}
                </BeneficiarioName>

                <BeneficiarioInfo>
                  <InfoItem>
                    <strong>Edad:</strong> {beneficiario.pacienteRegistro?.edad} años
                  </InfoItem>
                  <InfoItem>
                    <strong>Diagnóstico:</strong> {beneficiario.pacienteRegistro?.diagnostico}
                  </InfoItem>
                </BeneficiarioInfo>

                <BeneficiarioActions>
                  <ActionButton primary onClick={() => handleSolicitarAyuda(beneficiario)}>
                    <FaPlus /> Solicitar Ayuda
                  </ActionButton>
                </BeneficiarioActions>
              </BeneficiarioCard>
            ))}
          </BeneficiariosGrid>
        )}
      </Section>

      {/* Mis Solicitudes */}
      <Section>
        <SectionTitle>Mis Solicitudes de Ayuda</SectionTitle>
        {solicitudes.length === 0 ? (
          <EmptyMessage>No has creado solicitudes aún</EmptyMessage>
        ) : (
          <SolicitudesTable>
            <thead>
              <tr>
                <th>Código</th>
                <th>Beneficiario</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>
                    <SolicitudCode>{solicitud.codigoSolicitud}</SolicitudCode>
                  </td>
                  <td>
                    <BeneficiarioInfo>
                      {solicitud.beneficiario?.pacienteRegistro?.nombreCompletoNino}
                      <small>{solicitud.beneficiario?.codigoBeneficiario}</small>
                    </BeneficiarioInfo>
                  </td>
                  <td>{solicitud.tipoAyuda.replace(/_/g, ' ')}</td>
                  <td>
                    <PrioridadBadge color={getPrioridadColor(solicitud.prioridad)}>
                      {solicitud.prioridad}
                    </PrioridadBadge>
                  </td>
                  <td>{getEstadoBadge(solicitud.estado)}</td>
                  <td>{new Date(solicitud.fechaSolicitud).toLocaleDateString('es-BO')}</td>
                  <td>
                    <ActionButton small>
                      <FaEye /> Ver
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </SolicitudesTable>
        )}
      </Section>
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
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color};
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

const Section = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ecf0f1;
`;

const BeneficiariosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const BeneficiarioCard = styled.div`
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const BeneficiarioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BeneficiarioCode = styled.span`
  font-weight: bold;
  color: #3498db;
  font-size: 14px;
`;

const BeneficiarioStatus = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.active ? '#155724' : '#721c24'};
`;

const BeneficiarioName = styled.h3`
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 12px;
`;

const BeneficiarioInfo = styled.div`
  margin-bottom: 16px;

  small {
    display: block;
    color: #95a5a6;
    font-size: 12px;
    margin-top: 4px;
  }
`;

const InfoItem = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;

  strong {
    color: #2c3e50;
  }
`;

const BeneficiarioActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: ${props => props.small ? '6px 12px' : '10px 16px'};
  border-radius: 6px;
  border: none;
  font-size: ${props => props.small ? '13px' : '14px'};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  background: ${props => props.primary ? '#3498db' : '#ecf0f1'};
  color: ${props => props.primary ? 'white' : '#2c3e50'};

  &:hover {
    background: ${props => props.primary ? '#2980b9' : '#bdc3c7'};
    transform: translateY(-1px);
  }
`;

const SolicitudesTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 12px;
    background: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 2px solid #dee2e6;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #ecf0f1;
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const SolicitudCode = styled.span`
  font-weight: bold;
  color: #3498db;
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

  svg {
    font-size: 12px;
  }
`;

const PrioridadBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => `${props.color}20`};
  color: ${props => props.color};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #95a5a6;
  font-size: 16px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 18px;
  color: #95a5a6;
`;

export default TrabajadorSocialView;
