import { useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../../context/userContext';
import { FaHandHoldingHeart, FaUsers } from 'react-icons/fa';
import BeneficiaryList from './components/BeneficiaryList';
import RequestHelpForm from './components/RequestHelpForm';
import NotificationBell from '../../../components/NotificationBell';

const BeneficiariosPage = () => {
  const { user } = useUser();
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
            <Subtitle>Psicólogo/a - {user?.nombre}</Subtitle>
          </HeaderText>
        </HeaderLeft>
        <HeaderRight>
          <NotificationBell usuarioId={user?.id} />
        </HeaderRight>
      </Header>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

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
  font-size: 14px;
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #667eea;
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
