import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaRegFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoCloseOutline } from "react-icons/io5";
import { MdAdd, MdDelete } from "react-icons/md";
import Table from "../../../components/ui/table";
import toast from "react-hot-toast";
import ExportButtons from "../../../components/ui/ExportButtons";

const Noticias = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [item, setItem] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    excerpt: "",
    autor: "",
    imagen: "",
    idCategoria: "",
    tags: [],
    contenidos: [{ titulo: "", texto: "", orden: 0 }],
  });
  const [dataEvento, setDataEvento] = useState([]); // Guardar datos de la API

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleContenidoChange = (index, field, value) => {
    const newContenidos = [...form.contenidos];
    newContenidos[index] = { ...newContenidos[index], [field]: value };
    setForm({ ...form, contenidos: newContenidos });
  };

  const addContenido = () => {
    setForm({
      ...form,
      contenidos: [
        ...form.contenidos,
        { titulo: "", texto: "", orden: form.contenidos.length },
      ],
    });
  };

  const removeContenido = (index) => {
    const newContenidos = [...form.contenidos];
    newContenidos.splice(index, 1);
    const reorderedContenidos = newContenidos.map((contenido, idx) => ({
      ...contenido,
      orden: idx,
    }));
    setForm({ ...form, contenidos: reorderedContenidos });
  };

  const addTag = () => {
    if (newTag && !form.tags.includes(newTag)) {
      setForm({ ...form, tags: [...form.tags, newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const getData = async () => {
    setLoadingData(true);
    try {
      const response = await fetch("http://localhost:3000/blog", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.mensaje || "Error al obtener las noticias");
        return;
      }

      const formattedData = data.data.map((blog) => ({
        ...blog,
        fecha: new Date(blog.fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      }));

      setDataEvento(formattedData);
    } catch (error) {
      toast.error("Hubo un problema al obtener las noticias");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const getCategorias = async () => {
    try {
      const response = await fetch("http://localhost:3000/categoria", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setCategorias(data.data || []);
    } catch (error) {
      toast.error("Error al cargar las categorías");
      console.error(error);
    }
  };

  const getAllTags = async () => {
    try {
      const response = await fetch("http://localhost:3000/tags", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setTags(data.data || []);
    } catch (error) {
      toast.error("Error al cargar los tags");
    }
  };

  const getBlogById = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/blog/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(
          errorData.mensaje || "Error al obtener los detalles del blog"
        );
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      toast.error("Error al cargar los detalles del blog");
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    getData();
    getCategorias();
    getAllTags();
  }, []);

  const resetForm = () => {
    setForm({
      titulo: "",
      excerpt: "",
      autor: "",
      imagen: "",
      idCategoria: "",
      tags: [],
      contenidos: [{ titulo: "", texto: "", orden: 0 }],
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

  const editarEvento = async (data) => {
    try {
      const blogCompleto = await getBlogById(data.id);

      if (!blogCompleto) {
        return;
      }

      setForm({
        titulo: blogCompleto.titulo || "",
        excerpt: blogCompleto.excerpt || "",
        autor: blogCompleto.autor || "",
        imagen: blogCompleto.imagen || "",
        idCategoria: blogCompleto.idCategoria?.toString() || "",
        tags: blogCompleto.tags?.map((tag) => tag.nombre) || [],
        contenidos: blogCompleto.contenidos?.sort(
          (a, b) => a.orden - b.orden
        ) || [{ titulo: "", texto: "", orden: 0 }],
      });

      setItem(blogCompleto);
      setIsEditing(true);
      setShowModal(true);
    } catch (error) {
      toast.error("Error al preparar el formulario de edición");
      console.error(error);
    }
  };

  const eliminarEvento = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta noticia?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/blog/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.mensaje || "Error al eliminar noticia");
        return;
      }
      getData();
      toast.success(data.mensaje || "Noticia eliminada correctamente");
    } catch (error) {
      toast.error("Hubo un problema al eliminar");
      console.error(error);
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

    if (!form.titulo || !form.excerpt || !form.autor) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    if (
      form.contenidos.some((contenido) => !contenido.titulo || !contenido.texto)
    ) {
      toast.error("Todos los contenidos deben tener título y texto");
      return;
    }

    const formData = {
      ...form,
      idCategoria: form.idCategoria ? Number(form.idCategoria) : null,
    };

    if (isEditing) {
      try {
        const response = await fetch(`http://localhost:3000/blog/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (!response.ok) {
          toast.error(result.mensaje || "Error al editar noticia");
          return;
        }
        getData();
        closeModal();
        toast.success(result.mensaje || "Noticia actualizada correctamente");
      } catch (error) {
        toast.error("Hubo un problema al editar la noticia");
        console.error(error);
      }
    } else {
      try {
        const response = await fetch("http://localhost:3000/blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (!response.ok) {
          toast.error(result.mensaje || "Error al crear una noticia");
          return;
        }
        getData();
        closeModal();
        toast.success(result.mensaje || "Noticia creada correctamente");
      } catch (error) {
        toast.error("Hubo un problema al crear la noticia");
        console.error(error);
      }
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : null;
    }, obj);
  };

  const columns = [
    {
      header: "Título",
      acceso: "titulo",
    },
    {
      header: "Extracto",
      acceso: "excerpt",
    },
    {
      header: "Autor",
      acceso: "autor",
    },
    {
      header: "Categoría",
      acceso: "categoria.nombre",
      render: (item) =>
        getNestedValue(item, "categoria.nombre") || "Sin categoría",
    },
    {
      header: "Fecha",
      acceso: "fecha",
    },
  ];

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };
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
            fileName="noticias"
            title="Reporte de noticias"
            sheetName="Noticias"
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
        loading={loadingData}
      />

      {showModal && (
        <ModalOverlay>
          <ModalLarge>
            <ModalHeader>
              <h2>{isEditing ? "Editar Noticia" : "Agregar Noticia"}</h2>
              <CloseButton onClick={closeModal}>
                <IoCloseOutline size={24} />
              </CloseButton>
            </ModalHeader>
            <ModalContent>
              <Form onSubmit={handleAgregar}>
                <FormGrid>
                  <FormGroup>
                    <Label>Título*</Label>
                    <Input
                      type="text"
                      name="titulo"
                      value={form.titulo}
                      onChange={handleInputChange}
                      required
                      placeholder="Título de la noticia"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Extracto (Resumen corto)*</Label>
                    <TextArea
                      name="excerpt"
                      value={form.excerpt}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Breve resumen de la noticia"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Autor*</Label>
                    <Input
                      type="text"
                      name="autor"
                      value={form.autor}
                      onChange={handleInputChange}
                      required
                      placeholder="Nombre del autor"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>URL de la Imagen</Label>
                    <Input
                      type="text"
                      name="imagen"
                      value={form.imagen}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Categoría</Label>
                    <Select
                      name="idCategoria"
                      value={form.idCategoria}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Tags</Label>
                    <TagInputContainer>
                      <TagInput
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Agregar tag y presiona Enter o Añadir"
                      />
                      <AddTagButton type="button" onClick={addTag}>
                        Añadir
                      </AddTagButton>
                    </TagInputContainer>

                    {tags.length > 0 && (
                      <SuggestionTags>
                        <Label>Tags existentes (click para seleccionar):</Label>
                        <TagsContainer>
                          {tags.map((tag) => (
                            <SuggestionTag
                              key={tag.id}
                              onClick={() => {
                                if (!form.tags.includes(tag.nombre)) {
                                  setForm({
                                    ...form,
                                    tags: [...form.tags, tag.nombre],
                                  });
                                }
                              }}
                            >
                              {tag.nombre}
                            </SuggestionTag>
                          ))}
                        </TagsContainer>
                      </SuggestionTags>
                    )}

                    {form.tags.length > 0 && (
                      <div>
                        <Label>Tags seleccionados:</Label>
                        <TagsContainer>
                          {form.tags.map((tag, index) => (
                            <Tag key={index}>
                              {tag}
                              <RemoveTagButton onClick={() => removeTag(tag)}>
                                ×
                              </RemoveTagButton>
                            </Tag>
                          ))}
                        </TagsContainer>
                      </div>
                    )}
                  </FormGroup>
                </FormGrid>

                <SectionTitle>Contenido</SectionTitle>
                <ContenidoSection>
                  {form.contenidos.map((contenido, index) => (
                    <ContenidoContainer key={index}>
                      <ContenidoHeader>
                        <h4>Sección {index + 1}</h4>
                        {form.contenidos.length > 1 && (
                          <RemoveContenidoButton
                            type="button"
                            onClick={() => removeContenido(index)}
                          >
                            <MdDelete size={20} />
                          </RemoveContenidoButton>
                        )}
                      </ContenidoHeader>
                      <FormGroup>
                        <Label>Título de la sección*</Label>
                        <Input
                          type="text"
                          value={contenido.titulo}
                          onChange={(e) =>
                            handleContenidoChange(
                              index,
                              "titulo",
                              e.target.value
                            )
                          }
                          required
                          placeholder="Título de esta sección"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Texto*</Label>
                        <TextArea
                          value={contenido.texto}
                          onChange={(e) =>
                            handleContenidoChange(
                              index,
                              "texto",
                              e.target.value
                            )
                          }
                          rows={5}
                          required
                          placeholder="Contenido detallado de esta sección"
                        />
                      </FormGroup>
                    </ContenidoContainer>
                  ))}
                  <AddContenidoButton type="button" onClick={addContenido}>
                    <MdAdd size={20} /> Agregar sección
                  </AddContenidoButton>
                </ContenidoSection>

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
          </ModalLarge>
        </ModalOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DateFile = styled.div`
  display: flex;
  gap: 20px;
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
const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #0a66c2;
    box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.2);
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

const ModalLarge = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const SectionTitle = styled.h3`
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
`;

const ContenidoSection = styled.div``;

const ContenidoContainer = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const ContenidoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h4 {
    margin: 0;
    color: #333;
    font-size: 16px;
  }
`;

const RemoveContenidoButton = styled.button`
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(211, 47, 47, 0.1);
  }
`;

const AddContenidoButton = styled.button`
  background-color: white;
  color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  border: 1px dashed ${(props) => props.theme?.colors?.primary || "#FF6347"};
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-weight: 500;
  margin-bottom: 16px;

  &:hover {
    background-color: rgba(255, 99, 71, 0.05);
  }
`;

const TagInputContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const TagInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
    box-shadow: none;
  }
`;

const AddTagButton = styled.button`
  background-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  color: white;
  border: none;
  padding: 0 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.div`
  background-color: rgba(255, 99, 71, 0.1);
  color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;

  &:hover {
    background-color: rgba(255, 99, 71, 0.1);
  }
`;

const SuggestionTags = styled.div`
  margin-top: 12px;
`;

const SuggestionTag = styled.div`
  background-color: #f0f0f0;
  color: #555;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
`;
export default Noticias;
