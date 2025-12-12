import React, { useState } from 'react';
import styled from 'styled-components';
import { FaHandHoldingHeart, FaPills, FaHeartbeat, FaFlask, FaTimes, FaCheck } from 'react-icons/fa';

const TIPOS_AYUDA = [
  { value: 'MEDICAMENTOS', label: 'Medicamentos', icon: FaPills, color: '#FF6B6B' },
  { value: 'QUIMIOTERAPIA', label: 'Quimioterapia', icon: FaHeartbeat, color: '#E91E63' },
  { value: 'ANALISIS_EXAMENES', label: 'Análisis/Exámenes', icon: FaFlask, color: '#4ECDC4' },
  { value: 'OTRO', label: 'Otros', icon: FaHandHoldingHeart, color: '#A084DC' }
];

const RequestHelpForm = ({ beneficiario, usuarioId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    tipoAyuda: '',
    descripcion: '',
    prioridad: 'MEDIA',
    documentoRespaldo: null
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, documentoRespaldo: 'Solo se permiten archivos PDF' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, documentoRespaldo: 'El archivo no debe superar 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, documentoRespaldo: file }));
      setErrors(prev => ({ ...prev, documentoRespaldo: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.tipoAyuda) {
      newErrors.tipoAyuda = 'Debe seleccionar un tipo de ayuda';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 20) {
      newErrors.descripcion = 'La descripción debe tener al menos 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Usar FormData para enviar archivos
      const submitData = new FormData();
      submitData.append('beneficiarioId', beneficiario.id);
      submitData.append('solicitadoPorId', usuarioId);
      submitData.append('tipoAyuda', formData.tipoAyuda);
      submitData.append('descripcion', formData.descripcion);
      submitData.append('prioridad', formData.prioridad);

      // Adjuntar archivo PDF si existe
      if (formData.documentoRespaldo) {
        submitData.append('documentoRespaldo', formData.documentoRespaldo);
      }

      console.log('Enviando solicitud con archivo...');

      const response = await fetch('http://localhost:3000/solicitudes-ayuda', {
        method: 'POST',
        body: submitData
        // NO incluir Content-Type header - el navegador lo configura automáticamente con boundary
      });

      const data = await response.json();

      if (data.success) {
        alert('Solicitud de ayuda creada correctamente');
        onSuccess && onSuccess(data.data);
      } else {
        alert(data.mensaje || 'Error al crear la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormHeader>
        <HeaderContent>
          <FaHandHoldingHeart style={{ fontSize: '24px', color: '#ff6347' }} />
          <div>
            <Title>Solicitar Ayuda</Title>
            <Subtitle>
              Para: {beneficiario.pacienteRegistro.nombreCompletoNino} ({beneficiario.codigoBeneficiario})
            </Subtitle>
          </div>
        </HeaderContent>
        {onCancel && (
          <CloseButton type="button" onClick={onCancel}>
            <FaTimes />
          </CloseButton>
        )}
      </FormHeader>

      <FormBody>
        <FormGroup>
          <Label>Tipo de Ayuda *</Label>
          <TipoAyudaGrid>
            {TIPOS_AYUDA.map(tipo => {
              const Icon = tipo.icon;
              return (
                <TipoAyudaCard
                  key={tipo.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tipoAyuda: tipo.value }));
                    setErrors(prev => ({ ...prev, tipoAyuda: '' }));
                  }}
                  $selected={formData.tipoAyuda === tipo.value}
                  $color={tipo.color}
                >
                  <Icon style={{ fontSize: '24px' }} />
                  <span>{tipo.label}</span>
                  {formData.tipoAyuda === tipo.value && <CheckIcon><FaCheck /></CheckIcon>}
                </TipoAyudaCard>
              );
            })}
          </TipoAyudaGrid>
          {errors.tipoAyuda && <ErrorText>{errors.tipoAyuda}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Descripción Detallada *</Label>
          <TextArea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describa detalladamente la necesidad de ayuda, incluyendo razones, urgencia y cualquier información relevante..."
            rows={5}
            $error={errors.descripcion}
          />
          <CharCount $limit={formData.descripcion.length >= 20}>
            {formData.descripcion.length} / 20 caracteres mínimos
          </CharCount>
          {errors.descripcion && <ErrorText>{errors.descripcion}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Prioridad *</Label>
          <Select
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
          >
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </Select>
          <HelpText>
            El monto será registrado posteriormente por el asistente coordinador
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Documento de Respaldo (PDF, opcional)</Label>
          <FileInputWrapper>
            <FileInput
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="documentoRespaldo"
            />
            <FileLabel htmlFor="documentoRespaldo">
              {formData.documentoRespaldo
                ? formData.documentoRespaldo.name
                : 'Seleccionar archivo PDF...'}
            </FileLabel>
          </FileInputWrapper>
          <HelpText>
            Puede adjuntar recetas médicas, cotizaciones u otros documentos que respalden la solicitud
          </HelpText>
          {errors.documentoRespaldo && <ErrorText>{errors.documentoRespaldo}</ErrorText>}
        </FormGroup>
      </FormBody>

      <FormFooter>
        {onCancel && (
          <CancelButton type="button" onClick={onCancel}>
            Cancelar
          </CancelButton>
        )}
        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Solicitud'}
        </SubmitButton>
      </FormFooter>
    </FormContainer>
  );
};

export default RequestHelpForm;

// Styled Components
const FormContainer = styled.form`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const FormHeader = styled.div`
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: #333;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  background: #e0e0e0;
  border: none;
  color: #666;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;

  &:hover {
    background: #d0d0d0;
    color: #333;
  }
`;

const FormBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const TipoAyudaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const TipoAyudaCard = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid ${props => props.$selected ? props.$color : '#ddd'};
  background: ${props => props.$selected ? `${props.$color}15` : 'white'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${props => props.$selected ? props.$color : '#666'};
  font-weight: ${props => props.$selected ? '600' : '400'};

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => `${props.$color}10`};
    transform: translateY(-2px);
  }

  svg {
    font-size: 24px;
  }

  span {
    font-size: 13px;
  }
`;

const CheckIcon = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.$error ? '#F44336' : '#ddd'};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff9800;
  }
`;

const CharCount = styled.div`
  font-size: 12px;
  color: ${props => props.$limit ? '#4CAF50' : '#999'};
  margin-top: 4px;
  text-align: right;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.$error ? '#F44336' : '#ddd'};
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff9800;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff9800;
  }
`;

const FileInputWrapper = styled.div`
  position: relative;
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const FileLabel = styled.label`
  display: block;
  padding: 12px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  font-size: 14px;

  &:hover {
    border-color: #ff9800;
    background: rgba(255, 152, 0, 0.05);
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: #999;
  margin: 6px 0 0 0;
  font-style: italic;
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: #F44336;
  margin: 6px 0 0 0;
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 32px;
  border: none;
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
