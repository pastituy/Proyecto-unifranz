import React from "react";
import styled from "styled-components";
import { FaTimes, FaDownload } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PdfViewer = ({ pdfUrl, onClose, title = "Documento PDF" }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = title.replace(/\s+/g, "_") + ".pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Overlay onClick={onClose}>
      <ViewerContainer onClick={(e) => e.stopPropagation()}>
        <ViewerHeader>
          <ViewerTitle>{title}</ViewerTitle>
          <HeaderActions>
            <ActionButton onClick={handleDownload} title="Descargar PDF">
              <FaDownload /> Descargar
            </ActionButton>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </HeaderActions>
        </ViewerHeader>
        <PdfFrame
          src={pdfUrl}
          title={title}
          type="application/pdf"
        />
      </ViewerContainer>
    </Overlay>
  );
};

export default PdfViewer;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ViewerContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const ViewerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
`;

const ViewerTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
  }

  svg {
    font-size: 1rem;
  }
`;

const CloseButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #da190b;
  }

  svg {
    font-size: 1.2rem;
  }
`;

const PdfFrame = styled.iframe`
  flex: 1;
  border: none;
  width: 100%;
  background: #525659;
`;
