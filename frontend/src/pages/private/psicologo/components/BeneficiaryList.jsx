import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaSearch, FaCalendar, FaHospital, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';

const BeneficiaryList = ({ usuarioId, onSelectBeneficiario }) => {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);

  useEffect(() => {
    fetchBeneficiarios();
  }, [usuarioId]);

  const fetchBeneficiarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/beneficiarios-usuario/${usuarioId}`);
      const data = await response.json();

      if (data.success) {
        setBeneficiarios(data.data);
      } else {
        console.error('Error al cargar beneficiarios:', data.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'No especificada';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  const filteredBeneficiarios = beneficiarios.filter(b => {
    const searchLower = searchTerm.toLowerCase();
    const registro = b.pacienteRegistro;

    return (
      b.codigoBeneficiario.toLowerCase().includes(searchLower) ||
      registro.nombreCompletoNino.toLowerCase().includes(searchLower) ||
      registro.diagnostico.toLowerCase().includes(searchLower) ||
      (registro.ciNino && registro.ciNino.toLowerCase().includes(searchLower))
    );
  });

  const handleSelectBeneficiario = (beneficiario) => {
    setSelectedBeneficiario(beneficiario);
    onSelectBeneficiario && onSelectBeneficiario(beneficiario);
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Cargando beneficiarios...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Mis Beneficiarios</Title>
        <Subtitle>
          Total: {beneficiarios.length} beneficiario{beneficiarios.length !== 1 ? 's' : ''}
        </Subtitle>
      </Header>

      <SearchBar>
        <FaSearch />
        <SearchInput
          type="text"
          placeholder="Buscar por código, nombre, diagnóstico o CI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      {filteredBeneficiarios.length === 0 ? (
        <EmptyState>
          <FaUser style={{ fontSize: '64px', color: '#ddd', marginBottom: '16px' }} />
          <p>
            {searchTerm
              ? 'No se encontraron beneficiarios con ese criterio'
              : 'No tienes beneficiarios asignados aún'}
          </p>
        </EmptyState>
      ) : (
        <BeneficiarioGrid>
          {filteredBeneficiarios.map((beneficiario) => {
            const registro = beneficiario.pacienteRegistro;
            return (
              <BeneficiarioCard
                key={beneficiario.id}
                onClick={() => handleSelectBeneficiario(beneficiario)}
                $selected={selectedBeneficiario?.id === beneficiario.id}
              >
                <CardHeader>
                  <CodigoBadge>{beneficiario.codigoBeneficiario}</CodigoBadge>
                  <EstadoBadge $estado={beneficiario.estado}>
                    {beneficiario.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                  </EstadoBadge>
                </CardHeader>

                <CardBody>
                  <NombrePaciente>{registro.nombreCompletoNino}</NombrePaciente>

                  <InfoRow>
                    <FaIdCard />
                    <span>{registro.ciNino || 'Sin CI'}</span>
                  </InfoRow>

                  <InfoRow>
                    <FaCalendar />
                    <span>{calcularEdad(registro.fechaNacimiento)}</span>
                  </InfoRow>

                  <InfoRow>
                    <FaHospital />
                    <span>{registro.diagnostico}</span>
                  </InfoRow>

                  <InfoRow>
                    <FaMapMarkerAlt />
                    <span>{registro.centroSalud}</span>
                  </InfoRow>

                  <Divider />

                  <TutorInfo>
                    <strong>Tutor:</strong> {registro.nombrePadre}
                  </TutorInfo>

                  <InfoRow>
                    <FaPhone />
                    <span>{registro.telefonoPadre}</span>
                  </InfoRow>

                  <FechaAceptacion>
                    Beneficiario desde: {new Date(beneficiario.fechaAceptacion).toLocaleDateString('es-BO')}
                  </FechaAceptacion>
                </CardBody>
              </BeneficiarioCard>
            );
          })}
        </BeneficiarioGrid>
      )}
    </Container>
  );
};

export default BeneficiaryList;

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

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 24px;

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

const BeneficiarioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const BeneficiarioCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid ${props => props.$selected ? '#667eea' : '#e0e0e0'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CodigoBadge = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const EstadoBadge = styled.div`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.$estado === 'ACTIVO' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$estado === 'ACTIVO' ? '#155724' : '#721c24'};
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NombrePaciente = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #666;

  svg {
    color: #667eea;
    font-size: 14px;
    flex-shrink: 0;
  }

  span {
    flex: 1;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0;
`;

const TutorInfo = styled.div`
  font-size: 13px;
  color: #333;

  strong {
    color: #667eea;
  }
`;

const FechaAceptacion = styled.div`
  font-size: 11px;
  color: #999;
  font-style: italic;
  margin-top: 4px;
  text-align: right;
`;
