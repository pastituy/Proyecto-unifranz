import React, { useState } from "react";
import styled from "styled-components";
import Avatar from "./UserAvatar";
import ProfilePhotoModal from "./ProfilePhotoModal";
import { ImSearch } from "react-icons/im";
import { MdOutlineNavigateNext } from "react-icons/md";
import { HiMenu } from "react-icons/hi";
import { useUser } from "../context/userContext";
import { useLocation } from "react-router-dom";

const Nav = ({ toggleSidebar }) => {
  const { user } = useUser();
  const location = useLocation();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("eventos")) return "Eventos";
    if (path.includes("campana")) return "Campañas";
    if (path.includes("usuario")) return "Usuarios";
    if (path.includes("donaciones")) return "Donaciones";
    if (path.includes("paciente")) return "Pacientes";
    if (path.includes("tratamiento")) return "Tratamiento";
    if (path.includes("donaciones-campana")) return "Recuperados";
    return "Dashboard";
  };
  return (
    <NavContainer>
      <MenuButton onClick={toggleSidebar}>
        <HiMenu />
      </MenuButton>
      <TitleDiv>
        <MdOutlineNavigateNext />
        <PageTitle>{getPageTitle()}</PageTitle>
      </TitleDiv>
      <SearchDiv>
        <FormGroup>
          <FormInput type="text" placeholder="Buscar..." required />
          <ImSearch color="#FF6347" style={{ fontSize: "1.5rem" }} />
        </FormGroup>
      </SearchDiv>
      <Logaout>
        <UserSection
          onClick={() => user && setShowPhotoModal(true)}
          title={user ? "Cambiar foto de perfil" : undefined}
          style={{ cursor: user ? "pointer" : "default" }}
        >
          <UserAvatar>
            <Avatar fotoPerfil={user?.fotoPerfil} size={42} />
          </UserAvatar>

          <UserInfo>
            <UserName>Usuario</UserName>
            <UserRole>{user ? user?.nombre : "Espectador"}</UserRole>
          </UserInfo>
        </UserSection>
      </Logaout>
      {showPhotoModal && (
        <ProfilePhotoModal onClose={() => setShowPhotoModal(false)} />
      )}
    </NavContainer>
  );
};

export default Nav;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #ff6347;
  cursor: pointer;
  padding: 0 15px;
  transition: all 0.3s ease;

  &:hover {
    color: #ff8a70;
  }

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const NavContainer = styled.nav`
  width: 100%;
  height: 60px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fafc 100%);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    height: 70px;
    padding: 0 10px;
  }
`;

const TitleDiv = styled.div`
  width: 20%;
  font-size: 1.65rem;
  color: #ff6347;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;

  @media (max-width: 1024px) {
    width: auto;
    flex: 0 0 auto;
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;

    svg {
      display: none;
    }
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const PageTitle = styled.span`
  @media (max-width: 480px) {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SearchDiv = styled.div`
  width: 40%;
  flex: 1;
  max-width: 500px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Logaout = styled.div`
  width: 40%;
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  padding-right: 50px;

  @media (max-width: 1024px) {
    width: auto;
    flex: 0 0 auto;
    padding-right: 20px;
  }

  @media (max-width: 768px) {
    padding-right: 10px;
  }
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(249, 250, 252, 0.8);
  margin: 1rem;
  border-radius: 12px;
  padding: 5px;

  @media (max-width: 768px) {
    margin: 0.5rem;
    padding: 3px;
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

  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    margin-right: 8px;

    svg {
      font-size: 1.2rem !important;
    }
  }

  @media (max-width: 480px) {
    margin-right: 0;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const UserRole = styled.span`
  font-size: 0.8rem;
  color: #718096;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;
