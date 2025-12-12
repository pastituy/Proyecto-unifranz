import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaRegFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoCloseOutline } from "react-icons/io5";
import Table from "../../../components/ui/table";
import toast from "react-hot-toast";
import ExportButtons from "../../../components/ui/ExportButtons";

const Campanas = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [item, setItem] = useState({});
  const isFetched = useRef(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    multimedia: "",
    recaudado: "",
    previstro: "",
  });
  const [dataCampana, setDataCampana] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const getData = async () => {
    try {
      const response = await fetch("http://localhost:3000/campana");
      const data = await response.json();
      setDataCampana(data.data);
      if (!response.ok) {
        toast.error(data.mensaje || "Error al obtener campañas");
        return;
      }
      toast.success(data.mensaje);
    } catch (error) {
      toast.error("Hubo un problema al obtener campañas");
    }
  };

  useEffect(() => {
    if (!isFetched.current) {
      getData();
      isFetched.current = true;
    }
  }, []);

  const resetForm = () => {
    setForm({
      titulo: "",
      descripcion: "",
      fecha: "",
      multimedia: "",
    });
    setItem({});
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

  const editarCampana = (data) => {
    setForm({
      titulo: data.titulo || "",
      descripcion: data.descripcion || "",
      fecha: data.fecha || "",
      multimedia: data.multimedia || "",
      recaudado: data.recaudado || "",
      previstro: data.previstro || "",
    });
    setItem(data);
    setIsEditing(true);
    setShowModal(true);
  };

  const eliminarCampana = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/campana/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.mensaje || "Error al eliminar campaña");
        return;
      }
      getData();
      toast.success(data.mensaje);
    } catch (error) {
      toast.error("Hubo un problema al eliminar la campaña");
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:3000/campana/${item.id}`
      : "http://localhost:3000/campana";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.mensaje || "Error al guardar campaña");
        return;
      }
      getData();
      closeModal();
      toast.success(result.mensaje);
    } catch (error) {
      toast.error("Hubo un problema al guardar campaña");
    }
  };

  const exportToExcel = () => {
    alert("Exportando a Excel...");
  };

  const exportToPDF = () => {
    alert("Exportando a PDF...");
  };

  const columns = [
    { header: "Título", acceso: "titulo" },
    { header: "Descripción", acceso: "descripcion" },
    { header: "Fecha", acceso: "fecha" },
    { header: "Multimedia", acceso: "multimedia" },
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
            data={dataCampana}
            columns={columns}
            fileName="campañas"
            title="Reporte de campañas"
            sheetName="Campañas"
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
          />
        </DateFile>
      </TopSection>

      <Table
        columns={columns}
        data={dataCampana}
        onDelete={eliminarCampana}
        onEdit={editarCampana}
      />

      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <h2>{isEditing ? "Editar Campaña" : "Agregar Campaña"}</h2>
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

                <FormGroup>
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Multimedia (URL)</Label>
                  <Input
                    type="text"
                    name="multimedia"
                    value={form.multimedia}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Recaudado</Label>
                  <Input
                    type="text"
                    name="recaudado"
                    value={form.recaudado}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Previsto</Label>
                  <Input
                    type="text"
                    name="previstro"
                    value={form.previstro}
                    onChange={handleInputChange}
                  />
                </FormGroup>

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

export default Campanas;

const Container = styled.div`
  padding: 20px;
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
const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  background-color: #fff;
  color: #333;
  transition: border 0.3s ease;

  &:focus {
    border-color: #007bff;
  }
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
