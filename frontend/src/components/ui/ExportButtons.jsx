import React from 'react';
import styled from 'styled-components';
import { FaRegFilePdf } from 'react-icons/fa6';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { ExportUtils } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const ExportButtons = ({ 
  data, 
  columns, 
  fileName = 'documento',
  title = 'Reporte',
  sheetName = 'Datos',
  showLabels = true,
  onExportStart,
  onExportEnd 
}) => {
  const handleExportExcel = async () => {
    if (onExportStart) onExportStart('excel');
    
    try {
      const result = ExportUtils.exportToExcel(data, columns, fileName, sheetName);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error inesperado al exportar Excel');
    } finally {
      if (onExportEnd) onExportEnd('excel');
    }
  };

  const handleExportPDF = async () => {
    if (onExportStart) onExportStart('pdf');
    
    try {
      const result = ExportUtils.exportToPDF(data, columns, fileName, title);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error inesperado al exportar PDF');
    } finally {
      if (onExportEnd) onExportEnd('pdf');
    }
  };

  return (
    <ButtonContainer>
      <ButtonExcel onClick={handleExportExcel}>
        <PiMicrosoftExcelLogoFill
          color="#2ba84a"
          style={{ fontSize: "1.4rem" }}
        />
        {showLabels && "Excel"}
      </ButtonExcel>
      <ButtonPDF onClick={handleExportPDF}>
        <FaRegFilePdf color="#f25c54" style={{ fontSize: "1rem" }} />
        {showLabels && "PDF"}
      </ButtonPDF>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ButtonExcel = styled.button`
  background-color: #e8f5e9;
  color: #2ba84a;
  border: 1px solid #2ba84a;
  padding: 0px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;

  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonPDF = styled.button`
  background-color: #ffebee;
  color: #f25c54;
  border: 1px solid #f25c54;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

   &:hover {
    opacity: 0.8;

  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default ExportButtons;
