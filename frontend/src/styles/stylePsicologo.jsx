import styled from "styled-components";

export const Container = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
`;

export const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 4px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
`;

export const Tab = styled.button`
  flex: 1;
  background: ${props => props.active ? '#ff6347' : 'white'};
  color: ${props => props.active ? 'white' : '#ff6347'};
  border: none;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-right: 1px solid #e0e0e0;
  transition: all 0.2s ease;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: ${props => props.active ? '#ff6347' : '#fff5f2'};
  }
`;

export const ContentArea = styled.div`
  background: white;
  border-radius: 4px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

export const SearchInput = styled.input`
  flex: 1;
  max-width: 400px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #ff6347;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
`;

export const PrimaryButton = styled.button`
  background: #ff6347;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #e55a2b;
  }
`;

export const SecondaryButton = styled.button`
  background: transparent;
  color: #ff6347;
  border: 2px solid #ff6347;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #ff6347;
    color: white;
  }
`;

export const TableContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.th`
  background: #ff6347;
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 2px solid #ff6347;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background: #fef7f5;
  }
  
  &:hover {
    background: #fff0ed;
  }
`;

export const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  vertical-align: top;
`;

export const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch(props.status) {
      case 'completada':
        return 'background: #e8f5e8; color: #2e7d2e;';
      case 'pendiente':
        return 'background: #fff3e0; color: #f57c00;';
      case 'programada':
        return 'background: #e3f2fd; color: #1976d2;';
      case 'cancelada':
        return 'background: #ffebee; color: #c62828;';
      default:
        return 'background: #f0f0f0; color: #666;';
    }
  }}
`;

export const Modal = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 4px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
`;

export const ModalTitle = styled.h3`
  color: #ff6347;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #ff6347;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #ff6347;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    border-color: #ff6347;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #ff6347;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;