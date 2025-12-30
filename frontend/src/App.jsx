import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/public/login";
import Verify2FA from "./pages/public/verify2fa";
import Register from "./pages/public/register";
import { ThemeProvider } from "styled-components";
import Layout from "./pages/public/layout";
import { UserProvider, ROLES } from "./context/userContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LayoutAdmin from "./pages/private/layout";
import Events from "./pages/private/eventos";
import Camp from "./pages/private/campana";
import Usuario from "./pages/private/usuario";
import Donaciones from "./pages/private/donaciones";
import CancerNewsChat from "./pages/private/chat";
import Redes from "./pages/private/redes";
import NotificacionesWS from "./pages/private/notificacionesWS";
import Psicologo from "./pages/private/psicologo";
import TrabajoSocial from "./pages/private/trabajadorSocial";
import Asistente from "./pages/private/asistente";
import AdminBeneficiarios from "./pages/private/adminBeneficiarios";
import TrabajadorSocialBeneficiarios from "./pages/private/trabajadorSocial/beneficiarios";
import PsicologoBeneficiarios from "./pages/private/psicologo/beneficiarios";
import AsistenteSolicitudes from "./pages/private/asistente/solicitudes";
import AsistenteReportes from "./pages/private/asistente/reportes";
import TrabajadorSocialReportes from "./pages/private/trabajadorSocial/reportes";
import ChatWidget from "./components/chatbotrasa";
import BankSimulator from "./pages/private/donaciones/BankSimulator";
import { useUser } from "./context/userContext";

const theme = {
  colors: {
    primary: "#FF6347", // Coral color similar a la imagen
    secondary: "#F8A136", // Color naranja/amarillo del círculo
    accent: "#3A7BBF", // Azul del contorno
    dark: "#1F2937", // Color oscuro para el fondo
    light: "#FFFFFF", // Color claro para textos
    text: "#333333", // Color para textos principales
  },
  fonts: {
    main: "'Poppins', sans-serif",
    heading: "'Montserrat', sans-serif",
  },
  breakpoints: {
    mobile: "576px",
    tablet: "768px",
    desktop: "1024px",
  },
};

// Componente wrapper para el chat que se muestra en TODAS las vistas
const ConditionalChatWidget = () => {
  // Siempre mostrar el chat en todas las vistas
  return <ChatWidget />;
};

// Componente interno con acceso al contexto
const AppContent = () => {
  return (
    <>
      <ConditionalChatWidget/>
      <ThemeProvider theme={theme}>
        {/*<Navbar />
      <HeroSection />
      <Eventos />
      <CasosRecuperados />
      <Campanas />
      <Contact />
      <Footer />*/}
        <Toaster position="bottom-right" reverseOrder={true} />

        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Layout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />

            {/* Simulador de Banco (accesible sin autenticación para testing) */}
            <Route path="/banco-simulador" element={<BankSimulator />} />

            {/* Rutas protegidas del dashboard */}
            <Route
              path="/dasboard"
              element={
                <ProtectedRoute>
                  <LayoutAdmin />
                </ProtectedRoute>
              }
            >
              {/* Rutas accesibles por ADMINISTRADOR y PSICOLOGO */}
              <Route
                path="/dasboard/chat"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR, ROLES.PSICOLOGO]}>
                    <CancerNewsChat />
                  </ProtectedRoute>
                }
              />

              {/* Rutas solo para Administrador */}
              <Route
                path="/dasboard/eventos"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dasboard/campana"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <Camp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dasboard/usuario"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <Usuario />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dasboard/redes"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <Redes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dasboard/notificaciones-ws"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <NotificacionesWS />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para Administrador */}
              <Route
                path="/dasboard/donaciones"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <Donaciones />
                  </ProtectedRoute>
                }
              />
              {/* Rutas para Trabajador Social */}
              <Route
                path="/dasboard/trabajadorSocial"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TRABAJADOR_SOCIAL]}>
                    <TrabajoSocial />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dasboard/trabajadorSocial/beneficiarios"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TRABAJADOR_SOCIAL]}>
                    <TrabajadorSocialBeneficiarios />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para Psicólogo */}
              <Route
                path="/dasboard/psicologo"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.PSICOLOGO]}>
                    <Psicologo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dasboard/psicologo/beneficiarios"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.PSICOLOGO]}>
                    <PsicologoBeneficiarios />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para Asistente/Coordinador */}
              <Route
                path="/dasboard/asistente"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ASISTENTE]}>
                    <Asistente />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dasboard/asistente/solicitudes"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ASISTENTE]}>
                    <AsistenteSolicitudes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dasboard/asistente/reportes"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ASISTENTE]}>
                    <AsistenteReportes />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para Trabajador Social */}
              <Route
                path="/dasboard/trabajadorSocial/reportes"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TRABAJADOR_SOCIAL]}>
                    <TrabajadorSocialReportes />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para Administrador - Evaluación de Beneficiarios */}
              <Route
                path="/dasboard/beneficiarios"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <AdminBeneficiarios />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
