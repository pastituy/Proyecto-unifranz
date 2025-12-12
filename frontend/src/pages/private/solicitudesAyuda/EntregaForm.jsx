import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheckCircle, FaMapMarkerAlt, FaDollarSign, FaStore, FaFileInvoice, FaStickyNote } from 'react-icons/fa';

const EntregaForm = ({ solicitud, onClose }) => {
  const [formData, setFormData] = useState({
    fechaEntrega: new Date().toISOString().split('T')[0],
    lugarEntrega: 'Oficina Fundación',
    costoReal: solicitud.costoEstimado || '',
    proveedor: '',
    facturaPdf: '',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const lugaresEntrega = [
    'Oficina Fundación',
    'Hospital del Niño',
    'Hospital Oncológico',
    'Otro',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lugarEntrega.trim()) {
      setError('El lugar de entrega es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3000/solicitudes-ayuda/${solicitud.id}/entregar`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            costoReal: formData.costoReal ? parseFloat(formData.costoReal) : null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.mensaje || 'Error al registrar la entrega');
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
            <SuccessTitle>¡Entrega Registrada!</SuccessTitle>
            <SuccessMessage>
              La entrega ha sido registrada correctamente. El trabajador social ha sido notificado.
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
            <FaCheckCircle />
            Registrar Entrega de Ayuda
          </Title>
          <SolicitudInfo>
            <InfoRow>
              <strong>Solicitud:</strong> {solicitud.codigoSolicitud}
            </InfoRow>
            <InfoRow>
              <strong>Beneficiario:</strong> {solicitud.beneficiario?.pacienteRegistro?.nombreCompletoNino}
            </InfoRow>
            <InfoRow>
              <strong>Tipo:</strong> {solicitud.tipoAyuda.replace(/_/g, ' ')}
            </InfoRow>
            <InfoRow>
              <strong>Detalle:</strong> {solicitud.detalleSolicitud}
            </InfoRow>
          </SolicitudInfo>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Fecha de Entrega */}
          <Section>
            <SectionTitle>Información de Entrega</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>
                  <FaCheckCircle /> Fecha de Entrega *
                </Label>
                <Input
                  type="date"
                  name="fechaEntrega"
                  value={formData.fechaEntrega}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaMapMarkerAlt /> Lugar de Entrega *
                </Label>
                <Select
                  name="lugarEntrega"
                  value={formData.lugarEntrega}
                  onChange={handleChange}
                  required
                >
                  {lugaresEntrega.map((lugar) => (
                    <option key={lugar} value={lugar}>
                      {lugar}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormGrid>
          </Section>

          {/* Información de Compra */}
          <Section>
            <SectionTitle>Información de Compra</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>
                  <FaDollarSign /> Costo Real (Bs)
                </Label>
                <Input
                  type="number"
                  name="costoReal"
                  value={formData.costoReal}
                  onChange={handleChange}
                  placeholder="350.00"
                  min="0"
                  step="0.01"
                />
                {solicitud.costoEstimado && (
                  <HelpText>
                    Costo estimado: Bs {parseFloat(solicitud.costoEstimado).toFixed(2)}
                  </HelpText>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaStore /> Proveedor/Farmacia
                </Label>
                <Input
                  type="text"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  placeholder="Farmacia San Martín"
                />
              </FormGroup>
            </FormGrid>

            <FormGroup fullWidth>
              <Label>
                <FaFileInvoice /> Factura (PDF) - Opcional
              </Label>
              <Input
                type="text"
                name="facturaPdf"
                value={formData.facturaPdf}
                onChange={handleChange}
                placeholder="Ruta o URL de la factura (funcionalidad de carga próximamente)"
              />
              <HelpText>
                Por ahora, guarda manualmente la factura y anota aquí su referencia
              </HelpText>
            </FormGroup>
          </Section>

          {/* Observaciones */}
          <Section>
            <SectionTitle>
              <FaStickyNote /> Observaciones Adicionales
            </SectionTitle>
            <FormGroup>
              <Textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
                placeholder="Observaciones sobre la entrega, estado del producto, quien recibió, etc."
              />
            </FormGroup>
          </Section>

          {error && (
            <ErrorMessage>
              <FaTimes />
              {error}
            </ErrorMessage>
          )}

          <InfoBox>
            <strong>Importante:</strong> Al registrar esta entrega, la solicitud se marcará como ENTREGADA
            y se notificará al trabajador social que solicitó la ayuda.
          </InfoBox>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Registrando...' : (
                <>
                  <FaCheckCircle />
                  Registrar Entrega
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
  max-width: 700px;
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
  margin-bottom: 16px;

  svg {
    color: #27ae60;
  }
`;

const SolicitudInfo = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  font-size: 14px;
  color: #2c3e50;

  strong {
    color: #7f8c8d;
    margin-right: 8px;
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
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #3498db;
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
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;

  svg {
    color: #3498db;
    font-size: 12px;
  }
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

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
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

const InfoBox = styled.div`
  padding: 12px 16px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  color: #1565c0;
  font-size: 14px;
  margin-bottom: 16px;

  strong {
    font-weight: 600;
  }
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
  background: #27ae60;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #229954;
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
  background: #27ae60;
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

export default EntregaForm;
