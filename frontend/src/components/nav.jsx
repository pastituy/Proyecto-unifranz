import React from "react";
import styled from "styled-components";
import { ImSearch } from "react-icons/im";
import { MdOutlineNavigateNext } from "react-icons/md";
import { useUser } from "../context/userContext";
import { FaUser } from "react-icons/fa";
import { useLocation } from "react-router-dom";
const Nav = () => {
  const { user } = useUser();
  const location = useLocation();

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
      <TitleDiv>
        <MdOutlineNavigateNext />
        {getPageTitle()}
      </TitleDiv>
      <SearchDiv>
        <FormGroup>
          <FormInput type="text" placeholder="Buscar..." required />
          <ImSearch color="#FF6347" style={{ fontSize: "1.5rem" }} />
        </FormGroup>
      </SearchDiv>
      <Logaout>
        <UserSection>
          <UserAvatar>
            <FaUser color="#FF6347" style={{ fontSize: "1.5rem" }} />
          </UserAvatar>

          <UserInfo>
            <UserName>Usuario</UserName>
            <UserRole>{user ? user?.nombre : "Espectador"}</UserRole>
          </UserInfo>
        </UserSection>
      </Logaout>
    </NavContainer>
  );
};

export default Nav;
const NavContainer = styled.nav`
  width: 100%;
  height: 60px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fafc 100%);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
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
`;
const SearchDiv = styled.div`
  width: 40%;
`;
const Logaout = styled.div`
  width: 40%;
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  padding-right: 50px;
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

const UserRole = styled.span`
  font-size: 0.8rem;
  color: #718096;
`;
