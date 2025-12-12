import React, { useState } from "react";
import {
  HeaderContainer,
  ContributeButton,
  Logo,
  Nav,
  NavItem,
} from "../../styles/styleNav";
import DonateModal from "../../components/donateModal";

const Navbar = ({ navLinks, scrollToSection }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("inicio");

  const openDonateModal = () => {
    setIsModalOpen(true);
  };

  const closeDonateModal = () => {
    setIsModalOpen(false);
  };

  const handleNavClick = (sectionId) => {
    scrollToSection(sectionId);
    setActiveNavItem(sectionId);
  };

  return (
    <HeaderContainer>
      <Logo>
        <span>Onco</span>
        <span>Feliz</span>
      </Logo>
      <Nav>
        <NavItem
          active={activeNavItem === "inicio"}
          onClick={() => handleNavClick("inicio")}
        >
          Inicio
        </NavItem>
        <NavItem
          active={activeNavItem === "blog"}
          onClick={() => handleNavClick("blog")}
        >
          Blog
        </NavItem>
        <NavItem
          active={activeNavItem === "casos"}
          onClick={() => handleNavClick("casos")}
        >
          Casos
        </NavItem>
        <NavItem
          active={activeNavItem === "eventos"}
          onClick={() => handleNavClick("eventos")}
        >
          Eventos
        </NavItem>
        <NavItem
          active={activeNavItem === "campanas"}
          onClick={() => handleNavClick("campanas")}
        >
          Campañas
        </NavItem>
        <NavItem
          active={activeNavItem === "contacto"}
          onClick={() => handleNavClick("contacto")}
        >
          Contacto
        </NavItem>
      </Nav>
      <ContributeButton onClick={openDonateModal}>
        <span>❤️</span> Donar
      </ContributeButton>
      <DonateModal isOpen={isModalOpen} onClose={closeDonateModal} />
    </HeaderContainer>
  );
};

export default Navbar;
