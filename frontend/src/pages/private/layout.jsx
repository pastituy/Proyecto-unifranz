import React from "react";
import Sidebar from "../../components/sidebar";
import Nav from "../../components/nav";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import OncoFelizChatbot from "../../components/chatbot";
const LayoutAdmin = () => {
  return (
    <Container>
      
      <Sidebar />
      <DivOutled>
        <Nav />
        <DivOutl>
          <Outlet />
        </DivOutl>
      </DivOutled>
    </Container>
  );
};

export default LayoutAdmin;
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
`;
const DivOutled = styled.div`
  width: calc(100vw - 250px);
`;
const DivOutl = styled.div`
  height: calc(100vh - 60px);
  position: relative;
  overflow: auto;
`;
