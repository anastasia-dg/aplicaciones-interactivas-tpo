import { Link } from "react-router";
import "../estilos/PanelVendedor.css";

export default function PanelVendedor() {
  return (
    <main className="panel-vendedor">

      <h1>Panel del vendedor</h1>
      <p>Administrá tu inmobiliaria desde acá.</p>

      {/* Enlaces a las distintas secciones del panel. */}
      <div className="opciones-panel">

        <Link to="/panel/propiedades" className="opcion-panel">
          <h2>Mis propiedades</h2>
          <p>Publicá, editá y administrá tus propiedades.</p>
        </Link>

        <Link to="/panel/visitas" className="opcion-panel">
          <h2>Solicitudes de visita</h2>
          <p>Confirmá o rechazá las visitas solicitadas.</p>
        </Link>

        <Link to="/panel/consultas" className="opcion-panel">
          <h2>Consultas</h2>
          <p>Respondé las preguntas de los interesados.</p>
        </Link>

        <Link to="/panel/actividad" className="opcion-panel">
          <h2>Actividad</h2>
          <p>Revisá las novedades de tu inmobiliaria.</p>
        </Link>

        <Link to="/panel/reportes" className="opcion-panel">
          <h2>Reportes</h2>
          <p>Consultá las estadísticas de tus propiedades.</p>
        </Link>

        <Link to="/panel/inmobiliaria" className="opcion-panel">
          <h2>Mi inmobiliaria</h2>
          <p>Administrá la información de tu inmobiliaria.</p>
        </Link>

      </div>
    </main>
  );
}
