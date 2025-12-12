import styled from "styled-components";

export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
`;

export const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? '#ff6347' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  margin-right: 4px;
  
  &:hover {
    background: ${props => props.active ? '#ff6347' : '#f8f9fa'};
  }
`;

export const ContentArea = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const SearchInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
`;

export const PrimaryButton = styled.button`
  background: #ff6347;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #ff6347;
  }
`;

export const SecondaryButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  
  &:hover {
    background: #545b62;
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.th`
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
`;

export const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

export const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
`;

export const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: bold;
  background: ${props => {
    switch(props.status) {
      case 'alto': return '#dc3545';
      case 'medio': return '#ffc107';
      case 'bajo': return '#28a745';
      case 'completada': return '#28a745';
      case 'programada': return '#ff6347';
      case 'pendiente': return '#ffc107';
      default: return '#6c757d';
    }
  }};
  color: ${props => props.status === 'medio' ? '#000' : '#fff'};
`;

export const Modal = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

export const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ModalTitle = styled.h3`
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  resize: vertical;
`;

export const ModalActions = styled.div`
  padding: 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export const VulnerabilityScale = styled.div`
  margin: 20px 0;
`;

export const ScaleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const ScaleLabel = styled.span`
  flex: 1;
`;

export const ScaleInput = styled.input`
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const TotalScore = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  margin: 10px 0;
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
`;

export const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin: 10px 0;
`;

export const SuccessMessage = styled.div`
  background: #d1edff;
  color: #0c5460;
  padding: 12px;
  border-radius: 4px;
  margin: 10px 0;
`;
