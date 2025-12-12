import { useState, useEffect } from "react";
import styled from "styled-components";
import { useUser } from "../../../context/userContext";
import {
  FaSearch, FaUserShield, FaClipboardCheck, FaChartBar, FaUserPlus, FaUsers, FaBell
} from "react-icons/fa";
import AdminCaseDetail from "./components/AdminCaseDetail";
import NotificationBell from "../../../components/NotificationBell";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AdminBeneficiariosComplete = () => {
  const { user } = useUser();
  const [casos, setCasos] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pendientes");
  const [selectedCaso, setSelectedCaso] = useState(null);
  const [showCaseDetail, setShowCaseDetail] = useState(false);

  useEffect(() => {
    fetchCasos();
    fetchBeneficiarios();
    fetchEstadisticas();
  }, []);

  const fetchCasos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/casos-en-evaluacion`);
      const data = await response.json();
      if (data.success) {
        setCasos(data.data);
      }
    } catch (err) {
      setError("Error al cargar los casos");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiarios = async () => {
    try {
      const response = await fetch(`${API_URL}/beneficiarios`);
      const data = await response.json();
      if (data.success) {
        setBeneficiarios(data.data);
      }
    } catch (err) {
      console.error("Error al cargar beneficiarios:", err);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(`${API_URL}/estadisticas`);
      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  };

  const handleCasoAceptado = () => {
    setSuccess("Caso aceptado correctamente. Beneficiario creado.");
    fetchCasos();
    fetchBeneficiarios();
    fetchEstadisticas();
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleCasoRechazado = () => {
    setSuccess("Caso rechazado correctamente");
    fetchCasos();
    fetchEstadisticas();
    setTimeout(() => setSuccess(""), 3000);
  };

  const filteredCasos = casos.filter(c =>
    c.nombreCompletoNino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ciTutor?.includes(searchTerm)
  );

  const filteredBeneficiarios = beneficiarios.filter(b => {
    const registro = b.pacienteRegistro;
    return (
      b.codigoBeneficiario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro?.nombreCompletoNino?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <HeaderIcon>
            <FaUserShield />
          </HeaderIcon>
          <HeaderText>
            <Title>Gestión de Beneficiarios</Title>
            <Subtitle>Administrador - {user?.nombre}</Subtitle>
          </HeaderText>
        </HeaderLeft>
        <HeaderRight>
          <NotificationBell usuarioId={user?.id} />
        </HeaderRight>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {estadisticas && (
        <StatsContainer>
          <StatCard color="#ff6347">
            <StatIcon><FaClipboardCheck /></StatIcon>
            <StatInfo>
              <StatNumber>{estadisticas.pendientes || 0}</StatNumber>
              <StatLabel>Pendientes</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#4caf50">
            <StatIcon><FaUsers /></StatIcon>
            <StatInfo>
              <StatNumber>{estadisticas.activos || 0}</StatNumber>
              <StatLabel>Beneficiarios Activos</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#2196f3">
            <StatIcon><FaChartBar /></StatIcon>
            <StatInfo>
              <StatNumber>{estadisticas.recuperados || 0}</StatNumber>
              <StatLabel>Recuperados</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#9c27b0">
            <StatIcon><FaUserPlus /></StatIcon>
            <StatInfo>
              <StatNumber>{estadisticas.total || 0}</StatNumber>
              <StatLabel>Total Histórico</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsContainer>
      )}

      <TabContainer>
        <Tab active={activeTab === "pendientes"} onClick={() => setActiveTab("pendientes")}>
          <FaClipboardCheck /> Casos Pendientes ({casos.length})
        </Tab>
        <Tab active={activeTab === "beneficiarios"} onClick={() => setActiveTab("beneficiarios")}>
          <FaUsers /> Beneficiarios Activos ({beneficiarios.length})
        </Tab>
      </TabContainer>

      <ContentArea>
        <ContentHeader>
          <ContentTitle>
            {activeTab === "pendientes" ? "Casos para Evaluación" : "Beneficiarios Registrados"}
          </ContentTitle>
          <SearchContainer>
            <FaSearch />
            <SearchInput
              placeholder={activeTab === "pendientes" ? "Buscar por nombre o CI..." : "Buscar por código o nombre..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </ContentHeader>

        {activeTab === "pendientes" ? (
          loading ? (
            <LoadingSpinner>Cargando casos...</LoadingSpinner>
          ) : filteredCasos.length === 0 ? (
            <EmptyState>
              <FaClipboardCheck style={{ fontSize: "3rem", color: "#ccc", marginBottom: "16px" }} />
              <p>No hay casos pendientes de evaluación</p>
            </EmptyState>
          ) : (
            <CardsContainer>
              {filteredCasos.map((caso) => (
                <CasoCard key={caso.id} onClick={() => {
                  setSelectedCaso(caso);
                  setShowCaseDetail(true);
                }}>
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
                    {caso.evaluacionSocial && (
                      <InfoRow>
                        <InfoLabel>Evaluación Social:</InfoLabel>
                        <Badge color="#4caf50">Completada</Badge>
                      </InfoRow>
                    )}
                    {caso.evaluacionPsicologica && (
                      <InfoRow>
                        <InfoLabel>Evaluación Psicológica:</InfoLabel>
                        <Badge color="#2196f3">Completada</Badge>
                      </InfoRow>
                    )}
                  </CasoInfo>
                  <ClickHint>Click para ver detalles y decidir</ClickHint>
                </CasoCard>
              ))}
            </CardsContainer>
          )
        ) : (
          loading ? (
            <LoadingSpinner>Cargando beneficiarios...</LoadingSpinner>
          ) : filteredBeneficiarios.length === 0 ? (
            <EmptyState>
              <FaUsers style={{ fontSize: "3rem", color: "#ccc", marginBottom: "16px" }} />
              <p>No hay beneficiarios registrados aún</p>
            </EmptyState>
          ) : (
            <BeneficiariosTable>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del Niño/a</th>
                  <th>Diagnóstico</th>
                  <th>Tutor</th>
                  <th>Estado</th>
                  <th>Fecha Aceptación</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeneficiarios.map((beneficiario) => (
                  <tr key={beneficiario.id}>
                    <td><CodigoBadge>{beneficiario.codigoBeneficiario}</CodigoBadge></td>
                    <td><strong>{beneficiario.pacienteRegistro?.nombreCompletoNino}</strong></td>
                    <td>{beneficiario.pacienteRegistro?.diagnostico}</td>
                    <td>{beneficiario.pacienteRegistro?.nombreCompletoTutor}</td>
                    <td>
                      <EstadoBadge estado={beneficiario.estado}>
                        {beneficiario.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                      </EstadoBadge>
                    </td>
                    <td>{new Date(beneficiario.fechaAceptacion).toLocaleDateString('es-BO')}</td>
                  </tr>
                ))}
              </tbody>
            </BeneficiariosTable>
          )
        )}
      </ContentArea>

      {showCaseDetail && selectedCaso && (
        <AdminCaseDetail
          registro={selectedCaso}
          onClose={() => {
            setShowCaseDetail(false);
            setSelectedCaso(null);
          }}
          onAceptar={handleCasoAceptado}
          onRechazar={handleCasoRechazado}
          usuarioId={user?.id}
        />
      )}
    </Container>
  );
};

export default AdminBeneficiariosComplete;

// Styled Components
const Container = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  border-left: 4px solid ${props => props.color || '#667eea'};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: #f5f5f5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
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

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
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
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
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
  margin-bottom: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 6px;
  align-items: center;
`;

const InfoLabel = styled.span`
  color: #888;
  font-size: 0.9rem;
  min-width: 100px;
`;

const InfoValue = styled.span`
  color: #333;
  font-size: 0.9rem;
  flex: 1;
`;

const Badge = styled.span`
  background: ${props => props.color}20;
  color: ${props => props.color};
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ClickHint = styled.div`
  text-align: center;
  color: #667eea;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

const BeneficiariosTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #f5f5f5;
  }

  th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
    border-bottom: 2px solid #e0e0e0;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem;
    color: #666;
  }

  tbody tr:hover {
    background: #f9f9f9;
  }
`;

const CodigoBadge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
`;

const EstadoBadge = styled.span`
  background: ${props => props.estado === "ACTIVO" ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.estado === "ACTIVO" ? '#2e7d32' : '#c62828'};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
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
