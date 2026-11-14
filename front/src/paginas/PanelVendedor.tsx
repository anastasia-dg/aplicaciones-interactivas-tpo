import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../servicios/api";
import "../estilos/PanelVendedor.css";

export default function PanelVendedor() {

  // Guardamos la cantidad de notificaciones sin leer.
  const [noLeidas, setNoLeidas] = useState(0);

  // Recuperamos los datos del vendedor que inició sesión.
  const token = localStorage.getItem("token");
  const inmobiliariaId = localStorage.getItem("inmobiliariaId");


  // Consultamos las notificaciones cuando entramos al panel.
  useEffect(() => {

    async function cargarNotificaciones() {

      // Sin sesión no podemos consultar las actividades privadas.
      if (!token || !inmobiliariaId) return;

      try {

        // El backend devuelve cuántas actividades están sin leer.
        const res = await fetch(
          `${API_URL}/actividades/inmobiliaria/${inmobiliariaId}/no-leidas`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("No se pudieron cargar las notificaciones.");
        }

        // La respuesta tiene la forma { cantidad: 3 }.
        const datos: { cantidad: number } = await res.json();

        // Guardamos el número recibido para mostrarlo en pantalla.
        setNoLeidas(datos.cantidad);

      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    }

    cargarNotificaciones();

  }, [token, inmobiliariaId]);


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

          {/* Título y contador de notificaciones */}
          <div className="titulo-actividad-panel">
            <h2>Actividad</h2>

            {/* Solo aparece cuando hay notificaciones sin leer. */}
            {noLeidas > 0 && (
              <span className="contador-notificaciones">
                {noLeidas} sin leer
              </span>
            )}
          </div>

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
