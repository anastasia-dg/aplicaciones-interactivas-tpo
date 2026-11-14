import { Link, useLocation, useNavigate } from "react-router-dom";
import "../estilos/Encabezado.css";

export default function Encabezado() {

  // Permite cambiar de página desde el código.
  const navigate = useNavigate();

  // Hace que el encabezado se actualice al navegar.
  useLocation();

  // Comprobamos si hay una sesión iniciada.
  const token = localStorage.getItem("token");

  // CERRAR SESIÓN
  function cerrarSesion() {

    // Eliminamos los datos guardados del vendedor.
    localStorage.removeItem("token");
    localStorage.removeItem("inmobiliariaId");

    // Redirigimos al inicio.
    navigate("/");
  }

  return (
    <header className="encabezado">

      {/* Logo de InmoPoint */}
        <Link to="/" className="logo">

        {/* Ícono de una casita */}
        <span className="logo-icono">
            <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            >
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v12h14V9" />
            <path d="M9 21v-7h6v7" />
            </svg>
        </span>

        {/* Nombre de la plataforma */}
        <span className="logo-texto">
            Inmo<span>Point</span>
        </span>

        </Link>

      <nav className="menu">

        {/* Enlaces públicos */}
        <Link to="/">Inicio</Link>
        <Link to="/inmobiliarias">Inmobiliarias</Link>

        {/* Mostramos distintas opciones según la sesión */}
        {token ? (

          <>
            {/* Si inició sesión, puede entrar al panel */}
            <Link to="/panel">
              Mi panel
            </Link>

            {/* Botón para cerrar sesión */}
            <button
              type="button"
              className="boton-cerrar-sesion"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          </>

        ) : (

          /* Si no inició sesión, mostramos el ingreso */
          <Link to="/login" className="boton-ingresar">
            Ingresar como vendedor
          </Link>

        )}

      </nav>

    </header>
  );
}
