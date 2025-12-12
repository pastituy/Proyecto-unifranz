import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaBuilding, FaGlobe, FaChartLine } from 'react-icons/fa';

const EstadisticasDonaciones = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState('mes'); // 'dia', 'mes', 'año'

  useEffect(() => {
    fetchEstadisticas();
  }, [periodo]);

  const fetchEstadisticas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/donaciones/estadisticas?periodo=${periodo}`);
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
      } else {
        setError(data.mensaje);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodoText = () => {
    switch(periodo) {
      case 'dia': return 'del Día';
      case 'mes': return 'del Último Mes';
      case 'año': return 'del Año';
      default: return 'del Último Mes';
    }
  };

  const calculatePercentages = () => {
    if (!estadisticas) return { personasNaturales: 0, empresasPrivadas: 0, donacionesExtranjero: 0 };

    const total = estadisticas.totalGeneral.cantidad;
    if (total === 0) return { personasNaturales: 0, empresasPrivadas: 0, donacionesExtranjero: 0 };

    // Calcular porcentajes exactos
    const pct1 = (estadisticas.personasNaturales.cantidad / total) * 100;
    const pct2 = (estadisticas.empresasPrivadas.cantidad / total) * 100;
    const pct3 = (estadisticas.donacionesExtranjero.cantidad / total) * 100;

    // Redondear a 1 decimal
    let rounded1 = Math.round(pct1 * 10) / 10;
    let rounded2 = Math.round(pct2 * 10) / 10;
    let rounded3 = Math.round(pct3 * 10) / 10;

    // Calcular la diferencia con 100
    let sum = rounded1 + rounded2 + rounded3;
    let diff = 100 - sum;

    // Ajustar el porcentaje más grande para que la suma sea exactamente 100
    if (diff !== 0) {
      const valores = [
        { valor: pct1, rounded: rounded1, index: 0 },
        { valor: pct2, rounded: rounded2, index: 1 },
        { valor: pct3, rounded: rounded3, index: 2 }
      ];

      // Ordenar por valor original (el más grande debería absorber el ajuste)
      valores.sort((a, b) => b.valor - a.valor);

      // Ajustar el más grande
      if (valores[0].index === 0) rounded1 = Math.round((rounded1 + diff) * 10) / 10;
      else if (valores[0].index === 1) rounded2 = Math.round((rounded2 + diff) * 10) / 10;
      else rounded3 = Math.round((rounded3 + diff) * 10) / 10;
    }

    return {
      personasNaturales: rounded1,
      empresasPrivadas: rounded2,
      donacionesExtranjero: rounded3
    };
  };

  const porcentajes = calculatePercentages();

  if (loading) {
    return (
      <StatsContainer>
        <LoadingText>Cargando estadísticas...</LoadingText>
      </StatsContainer>
    );
  }

  if (error) {
    return null; // No mostrar nada si hay error
  }

  if (!estadisticas) {
    return null;
  }

  const totalDonaciones = estadisticas.totalGeneral.cantidad;

  return (
    <StatsContainer>
      <StatsHeader>
        <FaChartLine className="icon" />
        <Title>Impacto {getPeriodoText()}</Title>
        <Subtitle>Distribución de donaciones por tipo de donante</Subtitle>
      </StatsHeader>

      <PeriodoTabs>
        <PeriodoTab $active={periodo === 'dia'} onClick={() => setPeriodo('dia')}>
          Hoy
        </PeriodoTab>
        <PeriodoTab $active={periodo === 'mes'} onClick={() => setPeriodo('mes')}>
          Mes
        </PeriodoTab>
        <PeriodoTab $active={periodo === 'año'} onClick={() => setPeriodo('año')}>
          Año
        </PeriodoTab>
      </PeriodoTabs>

      <StatsGrid>
        <StatCard color="#FF6347">
          <CardIcon color="#FF6347">
            <FaUser />
          </CardIcon>
          <CardContent>
            <CardTitle>Personas Naturales</CardTitle>
            <PercentageNumber color="#FF6347">
              {porcentajes.personasNaturales}%
            </PercentageNumber>
          </CardContent>
        </StatCard>

        <StatCard color="#F8A136">
          <CardIcon color="#F8A136">
            <FaBuilding />
          </CardIcon>
          <CardContent>
            <CardTitle>Empresas Privadas</CardTitle>
            <PercentageNumber color="#F8A136">
              {porcentajes.empresasPrivadas}%
            </PercentageNumber>
          </CardContent>
        </StatCard>

        <StatCard color="#FF8C00">
          <CardIcon color="#FF8C00">
            <FaGlobe />
          </CardIcon>
          <CardContent>
            <CardTitle>Del Extranjero</CardTitle>
            <PercentageNumber color="#FF8C00">
              {porcentajes.donacionesExtranjero}%
            </PercentageNumber>
          </CardContent>
        </StatCard>
      </StatsGrid>

      {/* SECCIÓN DE TOTAL RECAUDADO OCULTA - Solo visible para administradores */}
      {/*
      <TotalSection>
        <TotalLabel>Total Recaudado en el Mes</TotalLabel>
        <TotalAmount>{formatCurrency(estadisticas.totalGeneral.total)}</TotalAmount>
        <TotalDonations>{estadisticas.totalGeneral.cantidad} donaciones recibidas</TotalDonations>
      </TotalSection>
      */}

      <MessageSection>
        <MessageText>
          Cada donación, sin importar su tamaño, hace una diferencia real en la vida de los niños
          que luchan contra el cáncer. ¡Gracias por ser parte de esta causa!
        </MessageText>
      </MessageSection>
    </StatsContainer>
  );
};

export default EstadisticasDonaciones;

// Styled Components
const StatsContainer = styled.section`
  width: 100%;
  padding: 20px;
  background: transparent;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 10px;
`;

const StatsHeader = styled.div`
  text-align: center;
  margin-bottom: 15px;

  .icon {
    font-size: 20px;
    margin-bottom: 5px;
    color: #FF6347;
  }
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 3px;
  color: #1F2937;
`;

const Subtitle = styled.p`
  font-size: 11px;
  color: #999;
  font-weight: 400;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  max-width: 700px;
  margin: 0 auto 15px;
  padding: 0 10px;
`;

const StatCard = styled.div`
  background: ${props => `${props.color}08` || 'rgba(255, 99, 71, 0.03)'};
  border-radius: 8px;
  padding: 12px;
  border: 1px solid ${props => `${props.color}30` || 'rgba(255, 99, 71, 0.2)'};
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-3px);
    background: ${props => `${props.color}15` || 'rgba(255, 99, 71, 0.08)'};
    box-shadow: 0 2px 8px ${props => `${props.color}20` || 'rgba(255, 99, 71, 0.12)'};
  }
`;

const CardIcon = styled.div`
  font-size: 18px;
  color: ${props => props.color || '#FF6347'};
  margin-bottom: 6px;
  text-align: center;
  opacity: 0.9;
`;

const CardContent = styled.div`
  text-align: center;
`;

const CardTitle = styled.h3`
  font-size: 11px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
`;

const PercentageNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.color || '#FF6347'};
  margin-bottom: 8px;
  line-height: 1;
`;

const MessageSection = styled.div`
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
`;

const MessageText = styled.p`
  font-size: 11px;
  line-height: 1.5;
  color: #888;
  font-weight: 400;
  font-style: italic;
`;

const PeriodoTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const PeriodoTab = styled.button`
  padding: 8px 20px;
  border: 2px solid ${props => props.$active ? '#FF6347' : '#ddd'};
  background: ${props => props.$active ? '#FF6347' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 20px;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #FF6347;
    background: ${props => props.$active ? '#FF6347' : 'rgba(255, 99, 71, 0.1)'};
  }
`;
