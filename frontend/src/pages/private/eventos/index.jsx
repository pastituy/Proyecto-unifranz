import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaRegFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoCloseOutline } from "react-icons/io5";
import Table from "../../../components/ui/table";
import toast from "react-hot-toast";
import ExportButtons from "../../../components/ui/ExportButtons";

const Events = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [item, setitem] = useState({});
  const isFetched = useRef(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    ubicacion: "",
  });
  const [dataEvento, setDataEvento] = useState([]); //Aqui vamos guardar los datos que devuelva la api
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const getData = async () => {
    try {
      const response = await fetch("http://localhost:3000/evento", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.mensaje || "Error al obtener los eventos");
        return;
      }

      setDataEvento(data.data);

      if (data.mensaje) {
        toast.success(data.mensaje);
        console.log(data.mensaje);
      }
    } catch (error) {
      toast.error("Hubo un problema al iniciar sesión");
    }
  };

  useEffect(() => {
    if (!isFetched.current) {
      getData();
      isFetched.current = true;
    }
  }, []);

  const resetForm = () => {
    setitem({
      titulo: "",
      descripcion: "",
      fecha: "",
      img: "",
      ubicacion: "",
    });
    setitem({});
  };

  const openModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const editarEvento = (data) => {
    setForm({
      titulo: data.titulo || "",
      descripcion: data.descripcion || "",
      fecha: data.fecha || "",
      img: data.img || "",
      ubicacion: data.ubicacion || "",
    });

    setitem(data);
    setIsEditing(true);
    setShowModal(true);
  };

  const eliminarEvento = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/evento/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.mensaje || "Error al eliminar eventoo");
        return;
      }
      getData();
      toast.success(data.mensaje);
    } catch (error) {
      toast.error("Hubo un problema al iliminar");
    }
  };

  const exportToExcel = () => {
    alert("Exportando a Excel...");
  };

  const exportToPDF = () => {
    alert("Exportando a PDF...");
  };

  const handleAgregar = async (e) => {
    e.preventDefault();

    if (isEditing) {
      try {
        const response = await fetch(
          `http://localhost:3000/evento/${item.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          }
        );

        const result = await response.json();
        if (!response.ok) {
          toast.error(result.mensaje || "Error al editar evento");
          return;
        }
        getData();
        closeModal();
        toast.success(result.mensaje);
      } catch (error) {
        toast.error("Hubo un problema al editar el evento");
      }
    } else {
      try {
        const response = await fetch("http://localhost:3000/evento", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const result = await response.json();
        if (!response.ok) {
          toast.error(result.mensaje || "Error al crear un evento");
          return;
        }
        getData();
        closeModal();
        toast.success(result.mensaje);
      } catch (error) {
        toast.error("Hubo un problema al crear el evento");
      }
    }
  };
  const columns = [
    {
      header: "Titulo",
      acceso: "titulo",
    },
    {
      header: "Descripcion",
      acceso: "descripcion",
    },
    {
      header: "Fecha",
      acceso: "fecha",
    },
    {
      header: "Ubicación",
      acceso: "ubicacion",
    },
  ];
  const handleExportStart = (type) => {
    console.log(`Iniciando exportación: ${type}`);
  };

  const handleExportEnd = (type) => {
    console.log(`Exportación completada: ${type}`);
  };
  return (
    <Container>
      <TopSection>
        <DateFile>
          <LoginButton onClick={openModal}>Agregar</LoginButton>
          <ExportButtons
            data={dataEvento}
            columns={columns}
            fileName="eventos"
            title="Reporte de Eventos"
            sheetName="Eventos"
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
          />
        </DateFile>
      </TopSection>

      <Table
        columns={columns}
        data={dataEvento}
        onDelete={eliminarEvento}
        onEdit={editarEvento}
      />

      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <h2>{isEditing ? "Editar Evento" : "Agregar Evento"}</h2>
              <CloseButton onClick={closeModal}>
                <IoCloseOutline size={24} />
              </CloseButton>
            </ModalHeader>
            <ModalContent>
              <Form onSubmit={handleAgregar}>
                <FormGroup>
                  <Label>Título</Label>
                  <Input
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Descripción</Label>
                  <TextArea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup style={{ flex: 1 }}>
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup style={{ flex: 1 }}>
                    <Label>Ubicación</Label>
                    <Input
                      type="text"
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </FormRow>

                <ButtonGroup>
                  <CancelButton type="button" onClick={closeModal}>
                    Cancelar
                  </CancelButton>
                  <SubmitButton type="submit">
                    {isEditing ? "Actualizar" : "Guardar"}
                  </SubmitButton>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Events;

const Container = styled.div`
  padding: 20px;
`;

const DateFile = styled.div`
  gap: 20px;
  display: flex;
  flex-direction: row;
`;

const LoginButton = styled.button`
  width: 100px;
  height: 35px;
  background-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.5;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 0.9;
  }
`;

const ButtonExcel = styled.button`
  width: 70px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  color: #595959;
  transition: 0.5s;
  &:hover {
    color: rgba(43, 168, 74, 0.63);
  }
`;

const ButtonPDF = styled.button`
  width: 70px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #595959;
  transition: 0.5s;
  &:hover {
    color: rgba(242, 92, 84, 0.63);
  }
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  width: 300px;
  height: 35px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0 10px;

  input {
    border: none;
    outline: none;
    width: 100%;
    margin-left: 10px;
    font-size: 14px;
  }
`;

const EventosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const EventoCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const EventoImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const EventoContent = styled.div`
  padding: 15px;
`;

const EventoTitle = styled.h3`
  margin: 0 0 10px;
  color: #333;
`;

const EventoInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;

  span {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }
`;

const EventoDescription = styled.p`
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const EventoActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #777;

  &:hover {
    color: #333;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 14px;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const CancelButton = styled.button`
  padding: 8px 15px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const SubmitButton = styled.button`
  padding: 8px 15px;
  border: none;
  background-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;
