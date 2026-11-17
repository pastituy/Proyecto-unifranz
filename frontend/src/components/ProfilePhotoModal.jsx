import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import { FaCamera, FaTimes, FaTrash } from "react-icons/fa";
import { useUser } from "../context/userContext";
import UserAvatar, { API_BASE } from "./UserAvatar";

const MAX_BYTES = 2 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

const ProfilePhotoModal = ({ onClose }) => {
  const { user, authFetch, updateUser } = useUser();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Liberar la URL temporal de la vista previa
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;

    if (!TIPOS.includes(f.type)) {
      toast.error("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("La imagen no puede pesar más de 2 MB");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const request = async (method, body) => {
    const res = await authFetch(`${API_BASE}/api/perfil/foto`, { method, body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.mensaje || "No se pudo actualizar la foto");
    }
    return data;
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("foto", file);
      const data = await request("PUT", formData);
      updateUser({ fotoPerfil: data.data.fotoPerfil });
      toast.success("Foto de perfil actualizada");
      onClose();
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await request("DELETE");
      updateUser({ fotoPerfil: null });
      toast.success("Foto de perfil eliminada");
      onClose();
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  return (
    <Overlay onClick={() => !saving && onClose()}>
      <Modal onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <Header>
          <h3>Foto de perfil</h3>
          <CloseBtn onClick={onClose} disabled={saving} aria-label="Cerrar">
            <FaTimes />
          </CloseBtn>
        </Header>

        <PreviewWrap>
          <UserAvatar src={preview} fotoPerfil={user?.fotoPerfil} size={140} />
        </PreviewWrap>

        <Hint>JPG, PNG o WEBP · máximo 2 MB</Hint>

        <input
          ref={inputRef}
          type="file"
          accept={TIPOS.join(",")}
          onChange={handleFile}
          hidden
        />

        <Actions>
          <SecondaryBtn onClick={() => inputRef.current?.click()} disabled={saving}>
            <FaCamera /> {preview || user?.fotoPerfil ? "Cambiar imagen" : "Elegir imagen"}
          </SecondaryBtn>
          <PrimaryBtn onClick={handleSave} disabled={!file || saving}>
            {saving && file ? "Guardando..." : "Guardar"}
          </PrimaryBtn>
        </Actions>

        {user?.fotoPerfil && !file && (
          <RemoveBtn onClick={handleRemove} disabled={saving}>
            <FaTrash /> Quitar foto
          </RemoveBtn>
        )}
      </Modal>
    </Overlay>
  );
};

export default ProfilePhotoModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 380px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 1.15rem;
    color: #2d3748;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;

  &:hover:not(:disabled) {
    color: #ff6347;
  }
`;

const PreviewWrap = styled.div`
  padding: 4px;
  border-radius: 50%;
  border: 3px solid rgba(255, 99, 71, 0.3);
`;

const Hint = styled.p`
  font-size: 0.8rem;
  color: #888;
  margin: 12px 0 20px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const BaseBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryBtn = styled(BaseBtn)`
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #ff9800 0%, #ff6347 100%);

  &:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(255, 99, 71, 0.35);
  }
`;

const SecondaryBtn = styled(BaseBtn)`
  background: #fff;
  color: #ff6347;
  border: 1px solid rgba(255, 99, 71, 0.5);

  &:hover:not(:disabled) {
    background: rgba(255, 99, 71, 0.08);
  }
`;

const RemoveBtn = styled.button`
  margin-top: 14px;
  background: none;
  border: none;
  color: #c0392b;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
