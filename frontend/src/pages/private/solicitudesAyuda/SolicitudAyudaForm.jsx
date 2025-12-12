import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaPaperPlane, FaFileMedical, FaPills, FaFlask, FaSyringe, FaBus, FaUtensils, FaExclamationTriangle } from 'react-icons/fa';

const SolicitudAyudaForm = ({ beneficiario, onClose }) => {
  const [formData, setFormData] = useState({
    tipoAyuda: 'MEDICAMENTOS',
    prioridad: 'NORMAL',
    numeroReceta: '',
    fechaReceta: '',
    medicoPrescriptor: '',
    detalleSolicitud: '',
    costoEstimado: '',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const tiposAyuda = [
    { value: 'MEDICAMENTOS', label: 'Medicamentos', icon: <FaPills /> },
    { value: 'ANALISIS_EXAMENES', label: 'Análisis/Exámenes', icon: <FaFlask /> },
    { value: 'QUIMIOTERAPIA', label: 'Quimioterapia', icon: <FaSyringe /> },
    { value: 'TRANSPORTE', label: 'Transporte', icon: <FaBus /> },
    { value: 'ALIMENTACION', label: 'Alimentación', icon: <FaUtensils /> },
    { value: 'OTRO', label: 'Otro', icon: <FaFileMedical /> },
  ];

  const prioridades = [
    { value: 'NORMAL', label: 'Normal', color: '#4caf50' },
    { value: 'ALTA', label: 'Alta', color: '#ff9800' },
    { value: 'URGENTE', label: 'Urgente', color: '#f44336' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.detalleSolicitud.trim()) {
      setError('Por favor especifica qué necesitas en el detalle de la solicitud');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3000/solicitudes-ayuda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          beneficiarioId: beneficiario.id,
          solicitadoPorId: user.id,
          ...formData,
          costoEstimado: formData.costoEstimado ? parseFloat(formData.costoEstimado) : null,
          fechaReceta: formData.fechaReceta || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.mensaje || 'Error al crear la solicitud');
      }

      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal>
        <ModalContent>
          <SuccessContainer>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>¡Solicitud Enviada!</SuccessTitle>
            <SuccessMessage>
              Tu solicitud ha sido enviada a la fundación para su revisión.
              Recibirás una notificación cuando sea aprobada.
            </SuccessMessage>
          </SuccessContainer>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal>
      <ModalContent>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>

        <Header>
          <Title>
            <FaFileMedical />
            Solicitar Ayuda para Beneficiario
          </Title>
          <BeneficiarioInfo>
            <strong>{beneficiario.pacienteRegistro?.nombreCompletoNino}</strong>
            <span>{beneficiario.codigoBeneficiario}</span>
          </BeneficiarioInfo>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Tipo de Ayuda */}
          <Section>
            <SectionTitle>Tipo de Ayuda *</SectionTitle>
            <TiposGrid>
              {tiposAyuda.map((tipo) => (
                <TipoCard
                  key={tipo.value}
                  selected={formData.tipoAyuda === tipo.value}
                  onClick={() => setFormData(prev => ({ ...prev, tipoAyuda: tipo.value }))}
                >
                  {tipo.icon}
                  <span>{tipo.label}</span>
                </TipoCard>
              ))}
            </TiposGrid>
          </Section>

          {/* Prioridad */}
          <Section>
            <SectionTitle>Prioridad *</SectionTitle>
            <PrioridadesGrid>
              {prioridades.map((prioridad) => (
                <PrioridadCard
                  key={prioridad.value}
                  selected={formData.prioridad === prioridad.value}
                  color={prioridad.color}
                  onClick={() => setFormData(prev => ({ ...prev, prioridad: prioridad.value }))}
                >
                  {prioridad.value === 'URGENTE' && <FaExclamationTriangle />}
                  <span>{prioridad.label}</span>
                </PrioridadCard>
              ))}
            </PrioridadesGrid>
          </Section>

          {/* Receta Médica */}
          {(formData.tipoAyuda === 'MEDICAMENTOS' ||
            formData.tipoAyuda === 'ANALISIS_EXAMENES' ||
            formData.tipoAyuda === 'QUIMIOTERAPIA') && (
            <Section>
              <SectionTitle>Receta/Orden Médica</SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label>N° Receta</Label>
                  <Input
                    type="text"
                    name="numeroReceta"
                    value={formData.numeroReceta}
                    onChange={handleChange}
                    placeholder="RX-2024-1234"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Fecha de Receta</Label>
                  <Input
                    type="date"
                    name="fechaReceta"
                    value={formData.fechaReceta}
                    onChange={handleChange}
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <Label>Médico Prescriptor</Label>
                  <Input
                    type="text"
                    name="medicoPrescriptor"
                    value={formData.medicoPrescriptor}
                    onChange={handleChange}
                    placeholder="Dr. Juan Pérez"
                  />
                </FormGroup>
              </FormGrid>
            </Section>
          )}

          {/* Detalle */}
          <Section>
            <SectionTitle>Detalle de lo Solicitado *</SectionTitle>
            <FormGroup>
              <Label>Describe qué necesitas</Label>
              <Textarea
                name="detalleSolicitud"
                value={formData.detalleSolicitud}
                onChange={handleChange}
                rows={4}
                placeholder="Ejemplo: Mercaptopurina 50mg, 2 cajas"
                required
              />
              <HelpText>
                Especifica el medicamento, examen o ayuda que necesitas con la mayor cantidad de detalles posible
              </HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Costo Estimado (Bs) - Opcional</Label>
              <Input
                type="number"
                name="costoEstimado"
                value={formData.costoEstimado}
                onChange={handleChange}
                placeholder="350"
                min="0"
                step="0.01"
              />
            </FormGroup>
          </Section>

          {/* Observaciones */}
          <Section>
            <SectionTitle>Observaciones Adicionales</SectionTitle>
            <FormGroup>
              <Textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
                placeholder="Información adicional relevante, urgencia, contexto, etc."
              />
            </FormGroup>
          </Section>

          {error && (
            <ErrorMessage>
              <FaExclamationTriangle />
              {error}
            </ErrorMessage>
          )}

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Enviando...' : (
                <>
                  <FaPaperPlane />
                  Enviar Solicitud
                </>
              )}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
};

// Styled Components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #95a5a6;
  cursor: pointer;
  z-index: 10;

  &:hover {
    color: #2c3e50;
  }
`;

const Header = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 2px solid #ecf0f1;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  svg {
    color: #3498db;
  }
`;

const BeneficiarioInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 12px;

  strong {
    color: #2c3e50;
    font-size: 16px;
  }

  span {
    color: #7f8c8d;
    font-size: 14px;
  }
`;

const Form = styled.form`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 600;
`;

const TiposGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const TipoCard = styled.div`
  padding: 16px 12px;
  border: 2px solid ${props => props.selected ? '#3498db' : '#ecf0f1'};
  border-radius: 8px;
  background: ${props => props.selected ? '#ebf5fb' : 'white'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  svg {
    font-size: 24px;
    color: ${props => props.selected ? '#3498db' : '#95a5a6'};
  }

  span {
    font-size: 13px;
    font-weight: 600;
    color: ${props => props.selected ? '#3498db' : '#2c3e50'};
    text-align: center;
  }

  &:hover {
    border-color: #3498db;
    transform: translateY(-2px);
  }
`;

const PrioridadesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const PrioridadCard = styled.div`
  padding: 12px;
  border: 2px solid ${props => props.selected ? props.color : '#ecf0f1'};
  border-radius: 8px;
  background: ${props => props.selected ? `${props.color}15` : 'white'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;

  svg {
    color: ${props => props.color};
  }

  span {
    font-weight: 600;
    color: ${props => props.selected ? props.color : '#2c3e50'};
  }

  &:hover {
    border-color: ${props => props.color};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const FormGroup = styled.div`
  grid-column: ${props => props.fullWidth ? 'span 2' : 'span 1'};
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const HelpText = styled.small`
  display: block;
  margin-top: 6px;
  color: #95a5a6;
  font-size: 12px;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #ffebee;
  border-left: 4px solid #f44336;
  border-radius: 4px;
  color: #c62828;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ecf0f1;
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #f8f9fa;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessContainer = styled.div`
  padding: 60px 40px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4caf50;
  color: white;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const SuccessTitle = styled.h2`
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 12px;
`;

const SuccessMessage = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
`;

export default SolicitudAyudaForm;
