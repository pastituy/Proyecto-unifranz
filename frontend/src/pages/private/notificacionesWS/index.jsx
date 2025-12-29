import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaWhatsapp, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const NotificacionesWS = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [formData, setFormData] = useState({
    codigo: "",
    plantilla: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/api/whatsapp-templates",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
      toast.error("Error al cargar las plantillas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo || !formData.plantilla) {
      toast.error("Código y plantilla son obligatorios");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingTemplate
        ? `http://localhost:3000/api/whatsapp-templates/${editingTemplate.id}`
        : "http://localhost:3000/api/whatsapp-templates";

      const method = editingTemplate ? "put" : "post";

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        editingTemplate
          ? "Plantilla actualizada correctamente"
          : "Plantilla creada correctamente"
      );

      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ codigo: "", plantilla: "", descripcion: "" });
      fetchTemplates();
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      toast.error(
        error.response?.data?.message || "Error al guardar la plantilla"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta plantilla?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/whatsapp-templates/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Plantilla eliminada correctamente");
      fetchTemplates();
    } catch (error) {
      console.error("Error al eliminar plantilla:", error);
      toast.error("Error al eliminar la plantilla");
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      codigo: template.codigo,
      plantilla: template.plantilla,
      descripcion: template.descripcion || "",
    });
    setShowModal(true);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setPreviewModal(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setFormData({ codigo: "", plantilla: "", descripcion: "" });
    setShowModal(true);
  };

  return (
    <Container>
      <Header>
        <Title>
          <FaWhatsapp /> Plantillas de Notificaciones WhatsApp
        </Title>
        <AddButton onClick={handleNewTemplate}>
          <FaPlus /> Nueva Plantilla
        </AddButton>
      </Header>

      <InfoBox>
        <strong>Variables disponibles:</strong> Usa doble llaves para variables
        dinámicas. Ejemplo: <code>{'{{nombreBeneficiario}}'}</code>,{" "}
        <code>{'{{telefonoTutor}}'}</code>, <code>{'{{nombreTutor}}'}</code>
      </InfoBox>

      {loading ? (
        <LoadingMessage>Cargando plantillas...</LoadingMessage>
      ) : (
        <TemplateGrid>
          {templates.length === 0 ? (
            <EmptyMessage>
              No hay plantillas creadas. Crea tu primera plantilla.
            </EmptyMessage>
          ) : (
            templates.map((template) => (
              <TemplateCard key={template.id}>
                <TemplateHeader>
                  <TemplateBadge>{template.codigo}</TemplateBadge>
                  <TemplateActions>
                    <ActionButton
                      onClick={() => handlePreview(template)}
                      title="Vista previa"
                    >
                      <FaEye />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleEdit(template)}
                      title="Editar"
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      $danger
                      onClick={() => handleDelete(template.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </ActionButton>
                  </TemplateActions>
                </TemplateHeader>
                {template.descripcion && (
                  <TemplateDescription>
                    {template.descripcion}
                  </TemplateDescription>
                )}
                <TemplateContent>
                  {template.plantilla.substring(0, 150)}
                  {template.plantilla.length > 150 && "..."}
                </TemplateContent>
                <TemplateFooter>
                  Creado: {new Date(template.createdAt).toLocaleDateString()}
                </TemplateFooter>
              </TemplateCard>
            ))
          )}
        </TemplateGrid>
      )}

      {/* Modal de Formulario */}
      {showModal && (
        <Modal>
          <ModalOverlay onClick={() => setShowModal(false)} />
          <ModalContent>
            <ModalHeader>
              {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>
                  Código único <Required>*</Required>
                </Label>
                <Input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value })
                  }
                  placeholder="Ej: CASO_ACEPTADO, SOLICITUD_APROBADA"
                  required
                  disabled={editingTemplate !== null}
                />
                <Helper>
                  Identificador único para esta plantilla (sin espacios)
                </Helper>
              </FormGroup>

              <FormGroup>
                <Label>Descripción</Label>
                <Input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Breve descripción de cuándo se usa"
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  Plantilla del mensaje <Required>*</Required>
                </Label>
                <Textarea
                  value={formData.plantilla}
                  onChange={(e) =>
                    setFormData({ ...formData, plantilla: e.target.value })
                  }
                  placeholder="Hola {{nombreTutor}}, le informamos que..."
                  rows="8"
                  required
                />
                <Helper>
                  Usa {'{{variable}}'} para campos dinámicos
                </Helper>
              </FormGroup>

              <ModalActions>
                <CancelButton type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </CancelButton>
                <SubmitButton type="submit">
                  {editingTemplate ? "Actualizar" : "Crear"} Plantilla
                </SubmitButton>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Vista Previa */}
      {previewModal && previewTemplate && (
        <Modal>
          <ModalOverlay onClick={() => setPreviewModal(false)} />
          <ModalContent>
            <ModalHeader>Vista Previa - {previewTemplate.codigo}</ModalHeader>
            <PreviewBox>
              <PreviewLabel>Plantilla:</PreviewLabel>
              <PreviewText>{previewTemplate.plantilla}</PreviewText>
            </PreviewBox>
            {previewTemplate.descripcion && (
              <PreviewBox>
                <PreviewLabel>Descripción:</PreviewLabel>
                <PreviewText>{previewTemplate.descripcion}</PreviewText>
              </PreviewBox>
            )}
            <ModalActions>
              <SubmitButton onClick={() => setPreviewModal(false)}>
                Cerrar
              </SubmitButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default NotificacionesWS;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #25d366;
    font-size: 2rem;
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #FF6347 0%, #ff8a70 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 99, 71, 0.3);
  }
`;

const InfoBox = styled.div`
  background: #e6f7ff;
  border-left: 4px solid #1890ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-size: 0.9rem;

  code {
    background: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    color: #e91e63;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.1rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #a0aec0;
  font-size: 1rem;
  grid-column: 1 / -1;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const TemplateBadge = styled.span`
  background: linear-gradient(135deg, #FF6347 0%, #ff8a70 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${(props) => (props.$danger ? "#fee" : "#f7f7f7")};
  color: ${(props) => (props.$danger ? "#f56565" : "#4a5568")};
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "#fcc" : "#eee")};
    transform: scale(1.1);
  }
`;

const TemplateDescription = styled.p`
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  font-style: italic;
`;

const TemplateContent = styled.p`
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.5;
  background: #f7fafc;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  white-space: pre-wrap;
`;

const TemplateFooter = styled.div`
  font-size: 0.8rem;
  color: #a0aec0;
  text-align: right;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const Required = styled.span`
  color: #f56565;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #FF6347;
  }

  &:disabled {
    background: #f7fafc;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #FF6347;
  }
`;

const Helper = styled.small`
  display: block;
  margin-top: 0.25rem;
  color: #a0aec0;
  font-size: 0.85rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: linear-gradient(135deg, #FF6347 0%, #ff8a70 100%);
  color: white;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 99, 71, 0.3);
  }
`;

const PreviewBox = styled.div`
  margin-bottom: 1.5rem;
`;

const PreviewLabel = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const PreviewText = styled.div`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  color: #4a5568;
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: inherit;
`;
