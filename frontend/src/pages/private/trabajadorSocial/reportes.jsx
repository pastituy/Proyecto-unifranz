import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../../context/userContext';
import { FaTable, FaChartBar, FaSearch, FaEdit, FaUsers, FaHandHoldingHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ReportesPage = () => {
  const { user } = useUser();
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('tabla');
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBeneficiarios();
  }, [user]);

  const fetchBeneficiarios = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        console.error('No hay usuario ID disponible');
        return;
      }

      const response = await fetch(`${API_URL}/reportes/beneficiarios-trabajador/${user.id}`);
      const data = await response.json();

      if (data.success) {
        setBeneficiarios(data.data);
        calcularEstadisticas(data.data);
      } else {
        toast.error(data.mensaje || 'Error al cargar los beneficiarios');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el historial de beneficiarios');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (beneficiariosData) => {
    const stats = {
      totalBeneficiarios: beneficiariosData.length,
      totalAyudasEntregadas: 0,
      montoTotalEntregado: 0,
      porEstado: {}
    };

    beneficiariosData.forEach(b => {
      stats.totalAyudasEntregadas += b.totalAyudas;
      stats.montoTotalEntregado += b.montoTotal;

      if (!stats.porEstado[b.estadoBeneficiario]) {
        stats.porEstado[b.estadoBeneficiario] = {
          cantidad: 0,
          montoTotal: 0
        };
      }
      stats.porEstado[b.estadoBeneficiario].cantidad++;
      stats.porEstado[b.estadoBeneficiario].montoTotal += b.montoTotal;
    });

    setEstadisticas(stats);
  };

  const beneficiariosFiltrados = beneficiarios.filter(b => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      b.nombreNino?.toLowerCase().includes(searchLower) ||
      b.codigoBeneficiario?.toLowerCase().includes(searchLower) ||
      b.diagnostico?.toLowerCase().includes(searchLower) ||
      b.nombreTutor?.toLowerCase().includes(searchLower)
    );
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatearMoneda = (monto) => {
    if (!monto && monto !== 0) return 'Bs. 0.00';
    return `Bs. ${parseFloat(monto).toFixed(2)}`;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'ACTIVO': 'Activo',
      'INACTIVO': 'Inactivo',
      'FALLECIDO': 'Fallecido',
      'RECUPERADO': 'Recuperado'
    };
    return labels[estado] || estado;
  };

  const handleAbrirModalEstado = (beneficiario) => {
    setBeneficiarioSeleccionado(beneficiario);
    setNuevoEstado(beneficiario.estadoBeneficiario);
    setShowEstadoModal(true);
  };

  const handleActualizarEstado = async () => {
    if (!beneficiarioSeleccionado || !nuevoEstado) return;

    try {
      const response = await fetch(`${API_URL}/reportes/beneficiario/${beneficiarioSeleccionado.id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estadoBeneficiario: nuevoEstado })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Estado actualizado a ${getEstadoLabel(nuevoEstado)}`);
        setShowEstadoModal(false);
        setBeneficiarioSeleccionado(null);
        fetchBeneficiarios();
      } else {
        toast.error(data.mensaje || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <HeaderIcon>
            <FaHandHoldingHeart />
          </HeaderIcon>
          <HeaderText>
            <Title>Historial de Ayudas - Mis Beneficiarios</Title>
            <Subtitle>Lista completa de beneficiarios con historial de ayudas entregadas</Subtitle>
          </HeaderText>
        </HeaderLeft>
        <ViewToggle>
          <ViewButton
            $active={activeView === 'tabla'}
            onClick={() => setActiveView('tabla')}
          >
            <FaTable /> Tabla
          </ViewButton>
          <ViewButton
            $active={activeView === 'estadisticas'}
            onClick={() => setActiveView('estadisticas')}
          >
            <FaChartBar /> Estadísticas
          </ViewButton>
        </ViewToggle>
      </Header>

      {activeView === 'tabla' ? (
        <TableContainer>
          <ActionsBar>
            <SearchContainer>
              <FaSearch />
              <SearchInput
                type="text"
                placeholder="Buscar por beneficiario, código, diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
            {beneficiarios.length > 0 && (
              <ResultadosInfo>
                Mostrando {beneficiariosFiltrados.length} de {beneficiarios.length} beneficiarios
              </ResultadosInfo>
            )}
          </ActionsBar>

          {loading ? (
            <LoadingMessage>Cargando historial de beneficiarios...</LoadingMessage>
          ) : (
            <Table>
              <thead>
                <tr>
                  <TableHeader>Código</TableHeader>
                  <TableHeader>Nombre del Niño</TableHeader>
                  <TableHeader>Edad</TableHeader>
                  <TableHeader>Diagnóstico</TableHeader>
                  <TableHeader>Total Ayudas</TableHeader>
                  <TableHeader>Última Ayuda</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </tr>
              </thead>
              <tbody>
                {beneficiariosFiltrados.length === 0 ? (
                  <tr>
                    <TableCell colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      {beneficiarios.length === 0
                        ? 'No hay beneficiarios registrados aún'
                        : 'No se encontraron resultados para la búsqueda'}
                    </TableCell>
                  </tr>
                ) : (
                  beneficiariosFiltrados.map((beneficiario) => (
                    <TableRow key={beneficiario.id}>
                      <TableCell>
                        <CodigoBadge>{beneficiario.codigoBeneficiario}</CodigoBadge>
                      </TableCell>
                      <TableCell>
                        <NombreText>{beneficiario.nombreNino}</NombreText>
                        <TutorText>Tutor: {beneficiario.nombreTutor}</TutorText>
                      </TableCell>
                      <TableCell>{beneficiario.edad} años</TableCell>
                      <TableCell>
                        <DiagnosticoText>{beneficiario.diagnostico}</DiagnosticoText>
                      </TableCell>
                      <TableCell>
                        <TotalAyudasBadge>{beneficiario.totalAyudas}</TotalAyudasBadge>
                      </TableCell>
                      <TableCell>{formatearFecha(beneficiario.ultimaFechaAyuda)}</TableCell>
                      <TableCell>
                        <EstadoBadge $estado={beneficiario.estadoBeneficiario}>
                          {getEstadoLabel(beneficiario.estadoBeneficiario)}
                        </EstadoBadge>
                      </TableCell>
                      <TableCell>
                        <ActionButton onClick={() => handleAbrirModalEstado(beneficiario)}>
                          <FaEdit /> Actualizar Estado
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </TableContainer>
      ) : (
        <EstadisticasContainer>
          {estadisticas && (
            <>
              <StatsGrid>
                <StatCard>
                  <StatIcon style={{ background: '#ff9800' }}>
                    <FaUsers />
                  </StatIcon>
                  <StatContent>
                    <StatLabel>Total Beneficiarios</StatLabel>
                    <StatValue>{estadisticas.totalBeneficiarios}</StatValue>
                  </StatContent>
                </StatCard>
                <StatCard>
                  <StatIcon style={{ background: '#4caf50' }}>
                    <FaHandHoldingHeart />
                  </StatIcon>
                  <StatContent>
                    <StatLabel>Ayudas Entregadas</StatLabel>
                    <StatValue>{estadisticas.totalAyudasEntregadas}</StatValue>
                  </StatContent>
                </StatCard>
              </StatsGrid>

              <ChartsGrid>
                <ChartCard>
                  <ChartTitle>Distribución por Estado</ChartTitle>
                  {Object.entries(estadisticas.porEstado).map(([estado, data]) => (
                    <ChartRow key={estado}>
                      <ChartLabel>
                        {getEstadoLabel(estado)}
                        <ChartSubLabel>{data.cantidad} beneficiarios</ChartSubLabel>
                      </ChartLabel>
                      <ChartBar>
                        <ChartFill
                          $width={(data.cantidad / estadisticas.totalBeneficiarios) * 100}
                          $color={estado === 'ACTIVO' ? '#4caf50' : '#999'}
                        />
                      </ChartBar>
                    </ChartRow>
                  ))}
                </ChartCard>
              </ChartsGrid>
            </>
          )}
        </EstadisticasContainer>
      )}

      {showEstadoModal && (
        <ModalOverlay onClick={() => setShowEstadoModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Actualizar Estado del Beneficiario</ModalTitle>
              <CloseButton onClick={() => setShowEstadoModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <InfoSection>
                <InfoLabel>Beneficiario:</InfoLabel>
                <InfoValue>{beneficiarioSeleccionado?.nombreNino}</InfoValue>
              </InfoSection>
              <InfoSection>
                <InfoLabel>Código:</InfoLabel>
                <InfoValue>{beneficiarioSeleccionado?.codigoBeneficiario}</InfoValue>
              </InfoSection>
              <InfoSection>
                <InfoLabel>Estado Actual:</InfoLabel>
                <EstadoBadge $estado={beneficiarioSeleccionado?.estadoBeneficiario}>
                  {getEstadoLabel(beneficiarioSeleccionado?.estadoBeneficiario)}
                </EstadoBadge>
              </InfoSection>
              <FormGroup>
                <FormLabel>Nuevo Estado:</FormLabel>
                <Select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="FALLECIDO">Fallecido</option>
                  <option value="RECUPERADO">Recuperado</option>
                </Select>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => setShowEstadoModal(false)}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton onClick={handleActualizarEstado}>
                Actualizar Estado
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ReportesPage;

// Styled Components
const Container = styled.div`
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 12px;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#ff6347' : '#666'};
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #ff6347;
  }

  svg {
    font-size: 16px;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ActionsBar = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 400px;
  padding: 10px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;

  svg {
    color: #999;
    font-size: 14px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;

  &::placeholder {
    color: #999;
  }
`;

const ResultadosInfo = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 16px;
  background: #f8f9fa;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
`;

const TableRow = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #333;
  vertical-align: middle;
`;

const CodigoBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  background: #ff9800;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const NombreText = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const TutorText = styled.div`
  font-size: 12px;
  color: #999;
`;

const DiagnosticoText = styled.div`
  font-size: 13px;
  color: #666;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TotalAyudasBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  background: #4caf50;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
`;

const MontoTotal = styled.div`
  font-weight: 700;
  color: #2196f3;
  font-size: 15px;
`;

const EstadoBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.$estado) {
      case 'ACTIVO': return '#e8f5e9';
      case 'INACTIVO': return '#fff9c4';
      case 'FALLECIDO': return '#ffebee';
      case 'RECUPERADO': return '#e3f2fd';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.$estado) {
      case 'ACTIVO': return '#2e7d32';
      case 'INACTIVO': return '#f57f17';
      case 'FALLECIDO': return '#c62828';
      case 'RECUPERADO': return '#1565c0';
      default: return '#666';
    }
  }};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #f57c00;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
  }

  svg {
    font-size: 12px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
`;

const EstadisticasContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #999;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
`;

const ChartsGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
`;

const ChartRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr 120px;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const ChartLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ChartSubLabel = styled.div`
  font-size: 12px;
  color: #999;
  font-weight: 400;
  margin-top: 2px;
`;

const ChartBar = styled.div`
  height: 32px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
`;

const ChartFill = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  border-radius: 6px;
  transition: width 0.3s ease;
`;

const ChartValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 600;
  text-align: right;
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #666;
  min-width: 120px;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const FormGroup = styled.div`
  margin-top: 24px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff9800;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
`;

const SecondaryButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }
`;

const PrimaryButton = styled.button`
  padding: 10px 24px;
  border: none;
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
