import { useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../../context/userContext';
import { FaClipboardList } from 'react-icons/fa';
import RequestList from './components/RequestList';
import NotificationBell from '../../../components/NotificationBell';

const SolicitudesPage = () => {
  const { user } = useUser();

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <HeaderIcon>
            <FaClipboardList />
          </HeaderIcon>
          <HeaderText>
            <Title>Gestión de Solicitudes de Ayuda</Title>
            <Subtitle>Asistente - {user?.nombre}</Subtitle>
          </HeaderText>
        </HeaderLeft>
        <HeaderRight>
          <NotificationBell usuarioId={user?.id} />
        </HeaderRight>
      </Header>

      <InfoBox>
        <InfoTitle>Tu Rol</InfoTitle>
        <InfoDescription>
          Como asistente, eres responsable de revisar y aprobar/rechazar las solicitudes de ayuda
          que los trabajadores sociales y psicólogos envían para sus beneficiarios.
        </InfoDescription>
      </InfoBox>

      <RequestList usuarioId={user?.id} />
    </Container>
  );
};

export default SolicitudesPage;

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
