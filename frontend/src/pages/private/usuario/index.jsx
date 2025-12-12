import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaRegFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoCloseOutline } from "react-icons/io5";
import Table from "../../../components/ui/table";
import toast from "react-hot-toast";
import ExportButtons from "../../../components/ui/ExportButtons";

const Usuarios = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [item, setItem] = useState({});
  const isFetched = useRef(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    pais: "",
    password: "",
    ci: "",
    rol: "TRABAJADOR_SOCIAL",
  });
  const [usuarios, setUsuarios] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validación para CI: solo números
    if (name === "ci") {
      const onlyNumbers = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: onlyNumbers });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const getData = async () => {
    try {
      const response = await fetch("http://localhost:3000/usuario");
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.mensaje || "Error al obtener usuarios");
        return;
      }
      // Filtrar el usuario administrador con email admi@gmail.com
      const usuariosFiltrados = data.data.filter(
        (usuario) => usuario.email !== "admi@gmail.com"
      );
      setUsuarios(usuariosFiltrados);
    } catch (error) {
      toast.error("Error al obtener usuarios");
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
      nombre: "",
      email: "",
      telefono: "",
      pais: "",
      password: "",
      ci: "",
      rol: "TRABAJADOR_SOCIAL",
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

  const editarUsuario = (data) => {
    setForm({
      nombre: data.nombre || "",
      email: data.email || "",
      telefono: data.telefono || "",
      pais: data.pais || "",
      password: "", // opcional, puedes dejar vacío para no sobrescribir
      ci: data.ci || "",
      rol: data.rol || "TRABAJADOR_SOCIAL",
    });
    setItem(data);
    setIsEditing(true);
    setShowModal(true);
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este usuario?")) return;

    try {
      const response = await fetch(`http://localhost:3000/usuario/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok)
        return toast.error(data.mensaje || "Error al eliminar usuario");
      getData();
      toast.success(data.mensaje || "Usuario eliminado con éxito");
    } catch (error) {
      toast.error("Error al eliminar usuario");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Por favor ingrese un correo electrónico válido");
      return;
    }

    // Validación de CI: solo números y no vacío si se proporciona
    if (form.ci && !/^\d+$/.test(form.ci)) {
      toast.error("El CI debe contener solo números");
      return;
    }

    // Validar que solo se permitan los 4 roles específicos
    const rolesPermitidos = ["ADMINISTRADOR", "PSICOLOGO", "TRABAJADOR_SOCIAL", "ASISTENTE"];
    if (!rolesPermitidos.includes(form.rol)) {
      toast.error("Rol no permitido");
      return;
    }

    const url = isEditing
      ? `http://localhost:3000/usuario/${item.id}`
      : `http://localhost:3000/usuario`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) return toast.error(data.mensaje || "Error al guardar");
      getData();
      closeModal();
      toast.success(data.mensaje || "Usuario guardado con éxito");
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  // Mapeo de roles para mostrar nombres amigables
  const getRolLabel = (rol) => {
    const rolesMap = {
      ADMINISTRADOR: "Administrador",
      PSICOLOGO: "Psicólogo",
      TRABAJADOR_SOCIAL: "Trabajador Social",
      ASISTENTE: "Asistente",
      BENEFICIARIO: "Beneficiario"
    };
    return rolesMap[rol] || rol;
  };

  const columns = [
    { header: "Nombre", acceso: "nombre" },
    { header: "Email", acceso: "email" },
    { header: "Teléfono", acceso: "telefono" },
    { header: "País", acceso: "pais" },
    { header: "CI", acceso: "ci" },
    { 
      header: "Rol", 
      acceso: "rol",
      render: (row) => getRolLabel(row.rol)
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
          <LoginButton onClick={openModal}>Agregar Usuario</LoginButton>
          <ExportButtons
            data={usuarios}
            columns={columns}
            fileName="usuarios"
            title="Reporte de Usuarios"
            sheetName="Usuarios"
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
          />
        </DateFile>
      </TopSection>

      <Table
        columns={columns}
        data={usuarios}
        onDelete={eliminarUsuario}
        onEdit={editarUsuario}
      />

      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <h2>{isEditing ? "Editar Usuario" : "Agregar Usuario"}</h2>
              <CloseButton onClick={closeModal}>
                <IoCloseOutline size={24} />
              </CloseButton>
            </ModalHeader>
            <ModalContent>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Nombre Completo</Label>
                  <Input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Teléfono</Label>
                  <Input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej: 70123456"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>País</Label>
                  <Input
                    type="text"
                    name="pais"
                    value={form.pais}
                    onChange={handleInputChange}
                    placeholder="Ej: Bolivia"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>CI (Cédula de Identidad)</Label>
                  <Input
                    type="text"
                    name="ci"
                    value={form.ci}
                    onChange={handleInputChange}
                    placeholder="Ej: 1234567"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Contraseña {isEditing && "(dejar vacío para no cambiar)"}</Label>
                  <Input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Mínimo 6 caracteres"
                    required={!isEditing}
                    minLength="6"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Rol del Usuario</Label>
                  <Select
                    name="rol"
                    value={form.rol}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="TRABAJADOR_SOCIAL">Trabajador Social</option>
                    <option value="PSICOLOGO">Psicólogo</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="ASISTENTE">Asistente</option>
                  </Select>
                  <HelpText>
                    Solo se permiten estos 4 roles en el sistema
                  </HelpText>
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

export default Usuarios;

const Container = styled.div`
  padding: 20px;
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
  padding: 10px 20px;
  background-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 0.9;
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

const HelpText = styled.small`
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
  font-style: italic;
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