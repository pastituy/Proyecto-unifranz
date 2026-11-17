import React, { createContext, useContext, useState, ReactNode } from "react";

// Define la forma del paciente
interface PacienteData {
  id: number;
  nombreCompletoNino: string;
  fechaNacimiento: string;
  edad: number;
  diagnostico: string;
  nombreCompletoTutor: string;
  telefonoTutor: string;
  direccion: string;
}

// Define la forma del beneficiario
interface BeneficiarioData {
  id: number;
  codigoBeneficiario: string;
  estadoBeneficiario: string;
  estadoMedico: string;
  paciente: PacienteData;
}

// Define la forma del usuario
interface UserData {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
}

// Define la forma del contexto
interface UserContextType {
  userData: UserData | null;
  beneficiarioData: BeneficiarioData | null;
  token: string | null;
  login: (data: { usuario: UserData; beneficiario: BeneficiarioData }, authToken: string) => void;
  logout: () => void;
}

// Valor inicial vacío
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook personalizado
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de un UserProvider");
  }
  return context;
};

// Props del proveedor
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [beneficiarioData, setBeneficiarioData] = useState<BeneficiarioData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (data: { usuario: UserData; beneficiario: BeneficiarioData }, authToken: string) => {
    setUserData(data.usuario);
    setBeneficiarioData(data.beneficiario);
    setToken(authToken);
  };

  const logout = () => {
    setUserData(null);
    setBeneficiarioData(null);
    setToken(null);
  };

  return (
    <UserContext.Provider value={{ userData, beneficiarioData, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
