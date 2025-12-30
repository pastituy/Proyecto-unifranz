import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { useUser } from "../context/userContext";
import toast from "react-hot-toast";
import { FaBrain, FaNewspaper } from "react-icons/fa6";
import { FaUserPlus } from "react-icons/fa6";
import { FaMoneyBill } from "react-icons/fa6";
import { FaInternetExplorer, FaClipboardList, FaUserMd, FaUsers, FaFileAlt, FaHandHoldingHeart, FaWhatsapp } from "react-icons/fa";
import { HiChat } from "react-icons/hi";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useUser();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Salió del sistema");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Configuración de navegación por roles
  const getNavigationItems = () => {
    const baseItems = {
      // Items para Administrador - acceso completo
      ADMINISTRADOR: [
        {
          path: "/dasboard/beneficiarios",
          icon: <FaFileAlt />,
          text: "Evaluación Casos",
        },
        {
          path: "/dasboard/eventos",
          icon: <EventIcon />,
          text: "Eventos",
        },
        {
          path: "/dasboard/campana",
          icon: <CampaignIcon />,
          text: "Campañas",
        },
        {
          path: "/dasboard/usuario",
          icon: <FaUserPlus />,
          text: "Usuarios",
        },
        {
          path: "/dasboard/donaciones",
          icon: <FaMoneyBill />,
          text: "Donaciones",
        },
        {
          path: "/dasboard/chat",
          icon: <HiChat />,
          text: "Chat",
        },
        {
          path: "/dasboard/redes",
          icon: <FaInternetExplorer />,
          text: "Redes Sociales",
        },
        {
          path: "/dasboard/notificaciones-ws",
          icon: <HiChat />,
          text: "Notificaciones WS",
        },
      ],

      // Items para Psicólogo
      PSICOLOGO: [
        {
          path: "/dasboard/psicologo",
          icon: <FaUserMd />,
          text: "Evaluación Psicológica",
        },
        {
          path: "/dasboard/psicologo/beneficiarios",
          icon: <FaUsers />,
          text: "Mis Beneficiarios",
        },
        {
          path: "/dasboard/chat",
          icon: <HiChat />,
          text: "Chat",
        },
      ],

      // Items para Trabajador Social
      TRABAJADOR_SOCIAL: [
        {
          path: "/dasboard/trabajadorSocial",
          icon: <FaClipboardList />,
          text: "Registrar Casos",
        },
        {
          path: "/dasboard/trabajadorSocial/beneficiarios",
          icon: <FaUsers />,
          text: "Mis Beneficiarios",
        },
        {
          path: "/dasboard/trabajadorSocial/reportes",
          icon: <FaFileAlt />,
          text: "Historial de Ayudas",
        },
      ],

      // Items para Asistente/Coordinador
      ASISTENTE: [
        {
          path: "/dasboard/asistente",
          icon: <FaUsers />,
          text: "Gestión Beneficiarios",
        },
        {
          path: "/dasboard/asistente/solicitudes",
          icon: <FaHandHoldingHeart />,
          text: "Solicitudes de Ayuda",
        },
        {
          path: "/dasboard/asistente/reportes",
          icon: <FaFileAlt />,
          text: "Reportes y Estadísticas",
        },
      ],
    };

    return baseItems[user?.rol] || baseItems.ADMINISTRADOR;
  };

  const navigationItems = getNavigationItems();

  return (
    <SidebarContainer $collapsed={collapsed}>
      <LogoContainer>
        <LogoWrapper>
          <LogoText $collapsed={collapsed}>OF</LogoText>
        </LogoWrapper>
        {!collapsed && <BrandName>OncoFeliz</BrandName>}
      </LogoContainer>

      {/* Mostrar información del usuario */}
      {!collapsed && user && (
        <UserInfoSection>
          <UserInfoText>
            <UserInfoName>{user.nombre}</UserInfoName>
            <UserInfoRole>{user.rol?.toUpperCase()}</UserInfoRole>
          </UserInfoText>
        </UserInfoSection>
      )}

      <NavMenu>
        {navigationItems.map((item, index) => (
          <NavItem
            key={index}
            $active={isActive(item.path)}
            onClick={() => handleNavigation(item.path)}
          >
            <NavIconWrapper $active={isActive(item.path)}>
              {item.icon}
            </NavIconWrapper>
            {!collapsed && <NavText>{item.text}</NavText>}
            {!collapsed && isActive(item.path) && <ActiveIndicator />}
          </NavItem>
        ))}
      </NavMenu>

      <UserSection onClick={handleLogout}>
        <UserAvatar>
          <HiOutlineLogout
            color="#FF6347"
            style={{
              fontSize: "1.5rem",
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        </UserAvatar>
        <UserInfo>
          <UserName>Cerrar Sesión</UserName>
        </UserInfo>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar;

// Componentes de iconos personalizados
const EventIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 2V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 2V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 10H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 14H8.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14H12.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 14H16.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 18H8.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18H12.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 18H16.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CampaignIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Styled Components
const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f9fafc 100%);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-x: hidden;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1rem;
  margin-bottom: 0.5rem;
`;

const LogoWrapper = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme?.colors?.primary || "#FF6347"} 0%,
    #ff8a70 100%
  );
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(255, 99, 71, 0.3);
  margin-right: 16px;
`;

const LogoText = styled.h2`
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin: 0;
  letter-spacing: 1px;
`;

const BrandName = styled.h2`
  font-size: 1.25rem;
  color: #2d3748;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
`;

const UserInfoSection = styled.div`
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const UserInfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserInfoName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #2d3748;
`;

const UserInfoRole = styled.span`
  font-size: 0.75rem;
  color: #ff6347;
  font-weight: 500;
  background-color: rgba(255, 99, 71, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0 1rem;
  margin: 0.5rem 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled.li`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.$active ? "8px 10px" : "8px 10px")};
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
  position: relative;
  background-color: ${(props) =>
    props.$active ? "rgba(255, 99, 71, 0.1)" : "transparent"};

  &:hover {
    background-color: ${(props) =>
      props.$active ? "rgba(255, 99, 71, 0.15)" : "rgba(0, 0, 0, 0.03)"};
  }
`;

const NavIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.$active ? "white" : "transparent")};
  box-shadow: ${(props) =>
    props.$active ? "0 4px 8px rgba(0, 0, 0, 0.05)" : "none"};
  margin-right: 16px;
  color: ${(props) =>
    props.$active ? props.theme?.colors?.primary || "#FF6347" : "#718096"};
  transition: all 0.2s ease;
`;

const NavText = styled.span`
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActiveIndicator = styled.div`
  position: absolute;
  right: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
`;

const UserSection = styled.button`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  background-color: rgba(249, 250, 252, 0.8);
  margin: 1rem;
  border-radius: 12px;
  cursor: pointer;
  background: transparent;
  height: 20px;
  border: none;
  &:hover {
    background: linear-gradient(
      135deg,
      ${(props) => props.theme?.colors?.primary || "#FF6347"}20 0%,
      ${(props) => props.theme?.colors?.primary || "#FF6347"}40 100%
    );
  }
`;

const UserAvatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
`;
