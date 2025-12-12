import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../../context/userContext';
import { FaHandHoldingHeart, FaUsers, FaBell, FaClipboardList } from 'react-icons/fa';
import BeneficiaryList from './components/BeneficiaryList';
import RequestHelpForm from './components/RequestHelpForm';
import MySolicitudesList from './components/MySolicitudesList';
import NotificationBell from '../../../components/NotificationBell';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BeneficiariosPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('beneficiarios'); // 'beneficiarios' o 'solicitudes'
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSelectBeneficiario = (beneficiario) => {
    setSelectedBeneficiario(beneficiario);
    setShowRequestForm(true);
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    setSelectedBeneficiario(null);
    setSuccessMessage('Solicitud de ayuda enviada correctamente');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleCancel = () => {
    setShowRequestForm(false);
    setSelectedBeneficiario(null);
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <HeaderIcon>
            <FaUsers />
          </HeaderIcon>
          <HeaderText>
            <Title>Mis Beneficiarios</Title>
            <Subtitle>Trabajador Social - {user?.nombre}</Subtitle>
          </HeaderText>
        </HeaderLeft>
        <HeaderRight>
          <NotificationBell usuarioId={user?.id} />
        </HeaderRight>
      </Header>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <TabsContainer>
        <Tab $active={activeTab === 'beneficiarios'} onClick={() => setActiveTab('beneficiarios')}>
          <FaUsers /> Beneficiarios
        </Tab>
        <Tab $active={activeTab === 'solicitudes'} onClick={() => setActiveTab('solicitudes')}>
          <FaClipboardList /> Estado de Solicitudes
        </Tab>
      </TabsContainer>

      {activeTab === 'beneficiarios' ? (
        <>
          <InfoBox>
            <InfoIcon><FaHandHoldingHeart /></InfoIcon>
            <InfoText>
              <InfoTitle>¿Cómo solicitar ayuda?</InfoTitle>
              <InfoDescription>
                Haz click en cualquier beneficiario para abrir el formulario de solicitud de ayuda.
                Puedes solicitar: medicamentos, alimentos, transporte, vivienda u otros tipos de ayuda.
              </InfoDescription>
            </InfoText>
          </InfoBox>

          <BeneficiaryList
            usuarioId={user?.id}
            onSelectBeneficiario={handleSelectBeneficiario}
          />
        </>
      ) : (
        <MySolicitudesList usuarioId={user?.id} />
      )}

      {showRequestForm && selectedBeneficiario && (
        <ModalOverlay onClick={handleCancel}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <RequestHelpForm
              beneficiario={selectedBeneficiario}
              usuarioId={user?.id}
              onSuccess={handleRequestSuccess}
              onCancel={handleCancel}
            />
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default BeneficiariosPage;

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
  background: #ff9800;
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
  font-size: 14px;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#ff6347' : '#666'};
  font-size: 15px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  border-bottom: 3px solid ${props => props.$active ? '#ff6347' : 'transparent'};
  transition: all 0.2s ease;
  position: relative;
  bottom: -2px;

  &:hover {
    background: ${props => props.$active ? 'white' : '#f5f5f5'};
    color: #ff6347;
  }

  svg {
    font-size: 18px;
  }
`;

const InfoBox = styled.div`
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const InfoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #ff9800;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #ff6347;
  font-size: 1.1rem;
  font-weight: 600;
`;

const InfoDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const SuccessMessage = styled.div`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
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
  padding: 20px;
`;

const ModalContent = styled.div`
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;
