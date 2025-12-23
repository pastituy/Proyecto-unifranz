import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useUser, ROLES } from "../../context/userContext";

const Verify2FA = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  // Si no hay email en el state, redirigir al login
  React.useEffect(() => {
    if (!email) {
      toast.error("Sesión inválida. Por favor, inicia sesión nuevamente.");
      navigate("/");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (codigo.length !== 6) {
      toast.error("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, codigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.mensaje || "Código inválido");
        setLoading(false);
        return;
      }

      // Login exitoso
      login(data.data, data.token);
      toast.success("Verificación exitosa");

      // Redirigir según el rol
      switch (data.data.rol) {
        case ROLES.ADMINISTRADOR:
          navigate("/dasboard/eventos");
          break;
        case ROLES.PSICOLOGO:
          navigate("/dasboard/psicologo");
          break;
        case ROLES.TRABAJADOR_SOCIAL:
          navigate("/dasboard/trabajadorSocial");
          break;
        default:
          navigate("/dasboard/eventos");
      }
    } catch (error) {
      console.error("Error en verificación:", error);
      toast.error("Hubo un problema al verificar el código");
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <Container>
      <VerifyCard>
        <VerifyContent>
          <IconContainer>
            🔐
          </IconContainer>

          <SectionTitle>
            Verificación de <TitleAccent>Seguridad</TitleAccent>
          </SectionTitle>

          <Subtitle>
            Hemos enviado un código de 6 dígitos a tu correo electrónico
          </Subtitle>

          <EmailDisplay>{email}</EmailDisplay>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel>Código de Verificación</FormLabel>
              <CodeInput
                type="text"
                placeholder="000000"
                value={codigo}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Solo números
                  if (value.length <= 6) {
                    setCodigo(value);
                  }
                }}
                maxLength={6}
                required
                autoFocus
              />
              <HelpText>Ingresa el código de 6 dígitos que recibiste por correo</HelpText>
            </FormGroup>

            <WarningBox>
              <WarningIcon>⚠️</WarningIcon>
              <WarningText>
                <strong>El código expira en 10 minutos</strong><br/>
                Si no lo recibiste, verifica tu carpeta de spam
              </WarningText>
            </WarningBox>

            <ButtonGroup>
              <VerifyButton type="submit" disabled={loading || codigo.length !== 6}>
                {loading ? "Verificando..." : "Verificar Código"}
              </VerifyButton>

              <BackButton type="button" onClick={handleBack}>
                Volver al inicio
              </BackButton>
            </ButtonGroup>
          </Form>
        </VerifyContent>
      </VerifyCard>
    </Container>
  );
};

export default Verify2FA;

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 2rem 5%;
`;

const VerifyCard = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

const VerifyContent = styled.div`
  padding: 2.5rem 2rem;
`;

const IconContainer = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-family: "Montserrat", sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.75rem;
  color: #333;
`;

const TitleAccent = styled.span`
  color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const EmailDisplay = styled.div`
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  text-align: center;
  color: #495057;
  font-weight: 600;
  margin-bottom: 2rem;
  word-break: break-all;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  display: block;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
`;

const CodeInput = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.3rem;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.4rem;
  transition: border-color 0.2s ease;
  font-family: 'Courier New', monospace;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  }

  &::placeholder {
    letter-spacing: 0.3rem;
    color: #d0d0d0;
  }
`;

const HelpText = styled.p`
  font-size: 0.85rem;
  color: #999;
  text-align: center;
  margin-top: 0.25rem;
`;

const WarningBox = styled.div`
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const WarningIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const WarningText = styled.div`
  font-size: 0.85rem;
  color: #856404;
  line-height: 1.5;

  strong {
    display: block;
    margin-bottom: 0.25rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const VerifyButton = styled.button`
  width: 100%;
  padding: 0.875rem 1rem;
  background-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 99, 71, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  width: 100%;
  padding: 0.875rem 1rem;
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #999;
    color: #333;
  }
`;
