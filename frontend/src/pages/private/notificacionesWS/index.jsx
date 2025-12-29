import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useUser } from "../../../context/userContext";
import toast from "react-hot-toast";
import Table from "../../../components/ui/table";
import { FaWhatsapp, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const NotificacionesWS = () => {
  const { user, token } = useUser();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  const [form, setForm] = useState({
    codigo: "",
    plantilla: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/whatsapp-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      } else {
        toast.error(data.message || "Error al cargar las plantillas");
      }
    } catch (error) {
      toast.error("Error de conexión al cargar las plantillas");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `${API_URL}/api/whatsapp-templates/${currentTemplate.id}`
      : `${API_URL}/api/whatsapp-templates`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Plantilla ${isEditing ? "actualizada" : "creada"} exitosamente`);
        setShowModal(false);
        fetchTemplates();
      } else {
        toast.error(data.message || "Error al guardar la plantilla");
      }
    } catch (error) {
      toast.error("Error de conexión al guardar la plantilla");
    }
  };

  const openModal = (template = null) => {
    if (template) {
      setIsEditing(true);
      setCurrentTemplate(template);
      setForm({
        codigo: template.codigo,
        plantilla: template.plantilla,
        descripcion: template.descripcion || "",
      });
    } else {
      setIsEditing(false);
      setCurrentTemplate(null);
      setForm({
        codigo: "",
        plantilla: "",
        descripcion: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta plantilla?")) {
      try {
        const response = await fetch(`${API_URL}/api/whatsapp-templates/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Plantilla eliminada exitosamente");
          fetchTemplates();
        } else {
          toast.error(data.message || "Error al eliminar la plantilla");
        }
      } catch (error) {
        toast.error("Error de conexión al eliminar la plantilla");
      }
    }
  };

  const columns = [
    { header: "Código", acceso: "codigo" },
    { header: "Descripción", acceso: "descripcion" },
    { header: "Plantilla", acceso: "plantilla" },
  ];

  return (
    <Container>
      <Header>
        <HeaderIcon>
          <FaWhatsapp />
        </HeaderIcon>
        <HeaderText>
          <Title>Gestión de Plantillas de WhatsApp</Title>
          <Subtitle>Crea y administra las plantillas para las notificaciones</Subtitle>
        </HeaderText>
      </Header>

      <Actions>
        <Button onClick={() => openModal()}>
          <FaPlus /> Nueva Plantilla
        </Button>
      </Actions>

      {loading ? (
        <p>Cargando plantillas...</p>
      ) : (
        <Table
          columns={columns}
          data={templates}
          onEdit={(row) => openModal(row)}
          onDelete={(row) => handleDelete(row.id)}
        />
      )}

      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <h2>{isEditing ? "Editar Plantilla" : "Nueva Plantilla"}</h2>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            <ModalContent>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Código</Label>
                  <Input
                    type="text"
                    name="codigo"
                    value={form.codigo}
                    onChange={handleInputChange}
                    placeholder="Ej: BIENVENIDA_BENEFICIARIO"
                    required
                    disabled={isEditing}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Descripción</Label>
                  <Input
                    type="text"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleInputChange}
                    placeholder="Ej: Mensaje de bienvenida al aceptar un caso"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Plantilla del Mensaje</Label>
                  <TextArea
                    name="plantilla"
                    value={form.plantilla}
                    onChange={handleInputChange}
                    rows="10"
                    placeholder="Escribe tu mensaje aquí. Usa {{variable}} para insertar datos dinámicos."
                    required
                  />
                  <small>
                    Usa <code>{{nombre}}</code> para el nombre del destinatario.
                  </small>
                </FormGroup>
                <ButtonGroup>
                  <Button type="button" onClick={closeModal} variant="secondary">
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Actualizar" : "Guardar"}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default NotificacionesWS;

// Styled Components
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const HeaderIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #25d366, #128c7e);
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

const Actions = styled.div`
  margin-bottom: 24px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.variant === "secondary" ? "#6c757d" : "#007bff")};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;
