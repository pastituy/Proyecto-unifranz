import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";
import Navbar from "./navbar";
import HeroSection from "./heroSection";
import BlogSection from "./sectionBlog";
import Eventos from "./eventos";
import CasosRecuperados from "./casosRecuperados";
import Campanas from "./campanas";
import Contact from "./contact";
import EstadisticasDonaciones from "./estadisticasDonaciones";
import Footer from "./footer";
import OncoFelizChatbot from "../../components/chatbot";

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false);
  };

  const NavLinkes = [
    {
      name: "Inicio",
      link: "inicio",
    },
    {
      name: "Blog",
      link: "blog",
    },
    {
      name: "Casos",
      link: "casos",
    },
    {
      name: "Eventos",
      link: "eventos",
    },
    {
      name: "Compañas",
      link: "campanas",
    },
    {
      name: "Contacto",
      link: "contacto",
    },
  ];

  return (
    <Componentes>
{/*       <OncoFelizChatbot />
 */}
      <Navbar navLinks={NavLinkes} scrollToSection={scrollToSection} />
      <div id="inicio">
        <HeroSection />
      </div>
      <div id="blog">
        <BlogSection />
      </div>
      <div id="eventos">
        <Eventos />
      </div>
      <div id="casos">
        <CasosRecuperados />
      </div>
      <div id="campanas">
        <Campanas />
      </div>
      <div id="contacto">
        <Contact />
      </div>
      <EstadisticasDonaciones />
      <Footer scrollToSection={scrollToSection} />
    </Componentes>
  );
};

export default Layout;

const Componentes = styled.div`
  width: 100vw;
  height: 100vh;
`;
const DivOutles = styled.div`
  width: 100%;
  height: 100%;
`;
