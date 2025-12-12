import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaUser, FaCalendar, FaFileAlt, FaHospital } from 'react-icons/fa';

const AdminCaseDetail = ({ registro, onClose, onAceptar, onRechazar, usuarioId }) => {
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAceptar = async () => {
    if (!window.confirm(`¿Está seguro de aceptar el caso de ${registro.nombreCompletoNino}? Esto creará un beneficiario activo.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/aceptar-caso/${registro.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aceptadoPorId: usuarioId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Caso aceptado correctamente. Código de beneficiario: ${data.data.codigoBeneficiario}`);
        onAceptar && onAceptar(data.data);
        onClose();
      } else {
        alert(data.mensaje || 'Error al aceptar el caso');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Debe proporcionar un motivo de rechazo');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/rechazar-caso/${registro.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivo: motivoRechazo
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Caso rechazado correctamente');
        onRechazar && onRechazar(data.data);
        onClose();
      } else {
        alert(data.mensaje || 'Error al rechazar el caso');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setLoading(false);
      setShowRechazarModal(false);
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

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>Detalle del Caso - Evaluación Final</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          <Section>
            <SectionTitle>
              <FaUser /> Información del Paciente
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <Label>Nombre Completo:</Label>
                <Value>{registro.nombreCompletoNino}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Fecha de Nacimiento:</Label>
                <Value>
                  {registro.fechaNacimiento
                    ? new Date(registro.fechaNacimiento).toLocaleDateString('es-BO')
                    : 'No especificada'}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Edad:</Label>
                <Value>{calcularEdad(registro.fechaNacimiento)}</Value>
              </InfoItem>
              <InfoItem>
                <Label>CI:</Label>
                <Value>{registro.ci || 'No proporcionado'}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Diagnóstico:</Label>
                <Value>{registro.diagnostico}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Centro de Salud:</Label>
                <Value>{registro.centroSalud}</Value>
              </InfoItem>
            </InfoGrid>
          </Section>

          <Section>
            <SectionTitle>
              <FaUser /> Información del Tutor
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <Label>Nombre del Padre/Tutor:</Label>
                <Value>{registro.nombrePadre}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Teléfono:</Label>
                <Value>{registro.telefonoPadre}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Dirección:</Label>
                <Value>{registro.direccion}</Value>
              </InfoItem>
            </InfoGrid>
          </Section>

          {registro.evaluacionSocial && (
            <Section>
              <SectionTitle>
                <FaFileAlt /> Evaluación Social
              </SectionTitle>
              <EvaluacionBadge $estado={registro.evaluacionSocial.estado}>
                {registro.evaluacionSocial.estado === 'APROBADO' ? 'Aprobada' :
                 registro.evaluacionSocial.estado === 'RECHAZADO' ? 'Rechazada' :
                 'Pendiente'}
              </EvaluacionBadge>
              {registro.evaluacionSocial.observaciones && (
                <Observaciones>
                  <strong>Observaciones:</strong> {registro.evaluacionSocial.observaciones}
                </Observaciones>
              )}
            </Section>
          )}

          {registro.evaluacionPsicologica && (
            <Section>
              <SectionTitle>
                <FaFileAlt /> Evaluación Psicológica
              </SectionTitle>
              <EvaluacionBadge $estado={registro.evaluacionPsicologica.estado}>
                {registro.evaluacionPsicologica.estado === 'APROBADO' ? 'Aprobada' :
                 registro.evaluacionPsicologica.estado === 'RECHAZADO' ? 'Rechazada' :
                 'Pendiente'}
              </EvaluacionBadge>
              {registro.evaluacionPsicologica.observaciones && (
                <Observaciones>
                  <strong>Observaciones:</strong> {registro.evaluacionPsicologica.observaciones}
                </Observaciones>
              )}
            </Section>
          )}

          <Section>
            <SectionTitle>
              <FaCalendar /> Información del Registro
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <Label>Fecha de Registro:</Label>
                <Value>{new Date(registro.createdAt).toLocaleDateString('es-BO')}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Estado Actual:</Label>
                <EstadoBadge $estado={registro.estado}>
                  {registro.estado.replace(/_/g, ' ')}
                </EstadoBadge>
              </InfoItem>
            </InfoGrid>
          </Section>
        </ModalBody>

        <ModalFooter>
          <ActionButton
            onClick={() => setShowRechazarModal(true)}
            $variant="danger"
            disabled={loading}
          >
            <FaTimesCircle /> Rechazar Caso
          </ActionButton>
          <ActionButton
            onClick={handleAceptar}
            $variant="success"
            disabled={loading}
          >
            <FaCheckCircle /> Aceptar y Crear Beneficiario
          </ActionButton>
        </ModalFooter>

        {showRechazarModal && (
          <RechazarModal onClick={() => setShowRechazarModal(false)}>
            <RechazarContent onClick={(e) => e.stopPropagation()}>
              <h3>Motivo de Rechazo</h3>
              <TextArea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Explique detalladamente el motivo del rechazo..."
                rows={5}
              />
              <RechazarButtons>
                <CancelButton onClick={() => setShowRechazarModal(false)}>
                  Cancelar
                </CancelButton>
                <ConfirmButton onClick={handleRechazar} disabled={loading || !motivoRechazo.trim()}>
                  Confirmar Rechazo
                </ConfirmButton>
              </RechazarButtons>
            </RechazarContent>
          </RechazarModal>
        )}
      </Modal>
    </Overlay>
  );
};

export default AdminCaseDetail;

// Styled Components
const Overlay = styled.div`
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

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: white;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 32px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #667eea;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const Value = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 400;
`;

const EvaluacionBadge = styled.div`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => {
    switch (props.$estado) {
      case 'APROBADO': return '#d4edda';
      case 'RECHAZADO': return '#f8d7da';
      default: return '#fff3cd';
    }
  }};
  color: ${props => {
    switch (props.$estado) {
      case 'APROBADO': return '#155724';
      case 'RECHAZADO': return '#721c24';
      default: return '#856404';
    }
  }};
`;

const EstadoBadge = styled.div`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: #e3f2fd;
  color: #1976d2;
`;

const Observaciones = styled.p`
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #555;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 0 0 12px 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  background: ${props => props.$variant === 'success' ? '#4CAF50' : '#F44336'};
  color: white;

  &:hover:not(:disabled) {
    background: ${props => props.$variant === 'success' ? '#45a049' : '#da190b'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RechazarModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const RechazarContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;

  h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #333;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const RechazarButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: #F44336;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #da190b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
