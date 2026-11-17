import React, { useState } from "react";
import Sidebar from "../../components/sidebar";
import Nav from "../../components/nav";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import OncoFelizChatbot from "../../components/chatbot";

const LayoutAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Container>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <DivOutled $sidebarOpen={sidebarOpen}>
        <Nav toggleSidebar={toggleSidebar} />
        <DivOutl>
          <Outlet />
        </DivOutl>
      </DivOutled>
      {sidebarOpen && <Overlay onClick={toggleSidebar} />}
    </Container>
  );
};

export default LayoutAdmin;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  position: relative;
  overflow: hidden;
`;

const DivOutled = styled.div`
  width: calc(100vw - 250px);
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    width: 100vw;
  }
`;

const DivOutl = styled.div`
  height: calc(100vh - 60px);
  position: relative;
  overflow: auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
    height: calc(100vh - 70px);
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
    backdrop-filter: blur(2px);
  }
`;
