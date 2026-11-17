import { useEffect, useState } from "react";
import styled from "styled-components";
import { FaUser } from "react-icons/fa";

export const API_BASE = "http://localhost:3000";

export const getFotoPerfilUrl = (fotoPerfil) =>
  fotoPerfil ? `${API_BASE}/uploads/perfiles/${encodeURIComponent(fotoPerfil)}` : null;

/**
 * Muestra la foto de perfil del usuario o, si no tiene (o falla al cargar),
 * el ícono de persona.
 */
const UserAvatar = ({ fotoPerfil, src, size = 42, alt = "Foto de perfil" }) => {
  const url = src || getFotoPerfilUrl(fotoPerfil);
  const [error, setError] = useState(false);

  useEffect(() => setError(false), [url]);

  return (
    <Circle $size={size}>
      {url && !error ? (
        <img src={url} alt={alt} onError={() => setError(true)} />
      ) : (
        <FaUser color="#FF6347" style={{ fontSize: size * 0.45 }} />
      )}
    </Circle>
  );
};

export default UserAvatar;

const Circle = styled.div`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  min-width: ${(p) => p.$size}px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 99, 71, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
