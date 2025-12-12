import React from "react";
import { Navigate } from "react-router-dom";
import { useUser, ROLES } from "../context/userContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useUser();

  // Mostrar un loader mientras se verifica la sesión
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Bloquear acceso web a beneficiarios (solo pueden acceder desde móvil)
  if (user.rol === ROLES.BENEFICIARIO) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        padding: "20px",
        textAlign: "center"
      }}>
        <h2>Acceso no permitido</h2>
        <p>Los beneficiarios deben acceder a través de la aplicación móvil.</p>
        <button
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#FF6347",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Volver al login
        </button>
      </div>
    );
  }

  // Si se especifican roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        padding: "20px",
        textAlign: "center"
      }}>
        <h2>Acceso denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#FF6347",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;
