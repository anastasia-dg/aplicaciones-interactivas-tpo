import { Navigate, Outlet } from "react-router-dom";

// Este componente protege las páginas del vendedor.
export default function RutaProtegida() {

  // Buscamos el token guardado cuando inició sesión.
  const token = localStorage.getItem("token");

  // Si no hay token, enviamos al usuario al login.
  if (!token) {
    return <Navigate to="/login" replace />; //NAVIGATE Redirige automáticamente al login cuando no encontramos el token.
  }

  // Si hay token, mostramos la página que quiere visitar.
  return <Outlet />; // OUTLET Es un componente de React Router que muestra las páginas que están dentro de una ruta protegida.
}
