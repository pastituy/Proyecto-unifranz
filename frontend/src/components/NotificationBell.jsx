import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';

const NotificationBell = ({ usuarioId }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (usuarioId) {
      fetchNotificaciones();
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [usuarioId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch(`http://localhost:3000/notificaciones/${usuarioId}`);
      const data = await response.json();

      if (data.success) {
        setNotificaciones(data.data);
        setNoLeidas(data.noLeidas);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const marcarComoLeida = async (notificacionId) => {
    try {
      const response = await fetch(`http://localhost:3000/notificaciones/${notificacionId}/leer`, {
        method: 'PUT'
      });

      if (response.ok) {
        fetchNotificaciones();
      }
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const marcarTodasLeidas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/notificaciones/usuario/${usuarioId}/leer-todas`, {
        method: 'PUT'
      });

      if (response.ok) {
        await fetchNotificaciones();
      }
    } catch (error) {
      console.error('Error al marcar todas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notificacion) => {
    if (!notificacion.leida) {
      marcarComoLeida(notificacion.id);
    }

    // Navegar según el tipo de notificación
    if (notificacion.relacionadoTipo && notificacion.relacionadoId) {
      // Aquí puedes agregar lógica de navegación según el tipo
      console.log(`Navegar a ${notificacion.relacionadoTipo} ID: ${notificacion.relacionadoId}`);
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return '#FF6B6B';
      case 'media': return '#FFA500';
      case 'baja': return '#4ECDC4';
      default: return '#95a5a6';
    }
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diffMs = ahora - notifFecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;
    return notifFecha.toLocaleDateString('es-BO');
  };

  return (
    <Container ref={dropdownRef}>
      <BellButton onClick={() => setShowDropdown(!showDropdown)}>
        <FaBell />
        {noLeidas > 0 && <Badge>{noLeidas > 99 ? '99+' : noLeidas}</Badge>}
      </BellButton>

      {showDropdown && (
        <Dropdown>
          <DropdownHeader>
            <Title>Notificaciones</Title>
            {noLeidas > 0 && (
              <MarkAllButton onClick={marcarTodasLeidas} disabled={loading}>
                <FaCheckDouble /> Marcar todas
              </MarkAllButton>
            )}
          </DropdownHeader>

          <NotificationList>
            {notificaciones.length === 0 ? (
              <EmptyState>
                <FaBell style={{ fontSize: '48px', color: '#ddd', marginBottom: '10px' }} />
                <p>No hay notificaciones</p>
              </EmptyState>
            ) : (
              notificaciones.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  $leida={notif.leida}
                  $prioridad={notif.prioridad}
                >
                  <PrioridadIndicator $color={getPrioridadColor(notif.prioridad)} />
                  <NotificationContent>
                    <NotificationTitle>{notif.titulo}</NotificationTitle>
                    <NotificationMessage>{notif.mensaje}</NotificationMessage>
                    <NotificationTime>{formatearFecha(notif.createdAt)}</NotificationTime>
                  </NotificationContent>
                  {!notif.leida && <UnreadDot />}
                </NotificationItem>
              ))
            )}
          </NotificationList>
        </Dropdown>
      )}
    </Container>
  );
};

export default NotificationBell;

// Styled Components
const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const BellButton = styled.button`
  position: relative;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: scale(1.1);
  }

  svg {
    display: block;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #FF6347;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 320px;
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
`;

const MarkAllButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationList = styled.div`
  overflow-y: auto;
  max-height: 420px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  text-align: center;

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const NotificationItem = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$leida ? 'white' : 'rgba(102, 126, 234, 0.05)'};

  &:hover {
    background: ${props => props.$leida ? '#f9f9f9' : 'rgba(102, 126, 234, 0.1)'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PrioridadIndicator = styled.div`
  width: 4px;
  height: 100%;
  background: ${props => props.$color};
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 0 2px 2px 0;
`;

const NotificationContent = styled.div`
  flex: 1;
  padding-left: 12px;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 6px;
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: #999;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  margin-left: 8px;
  flex-shrink: 0;
  margin-top: 4px;
`;
