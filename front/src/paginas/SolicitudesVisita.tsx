import { useEffect, useState } from "react";
import { API_URL } from "../servicios/api";
import type { SolicitudVisita } from "../tipos/SolicitudVisita";
import "../estilos/SolicitudesVisita.css";

export default function SolicitudesVisita() {

  // Guardamos las solicitudes que vienen del backend
  const [solicitudes, setSolicitudes] = useState<SolicitudVisita[]>([]);

  // Controlamos si estamos cargando y si ocurrió un error
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Guardamos el ID de la solicitud que estamos actualizando.
  const [actualizando, setActualizando] = useState<number | null>(null);

  // Se ejecuta cuando entramos a la página.
  useEffect(() => {

    // Función para obtener las solicitudes del vendedor.
    async function cargarSolicitudes() {
      try {
        // Recuperamos el token del vendedor.
        const token = localStorage.getItem("token");

        // Hacemos una petición GET al backend.
        const res = await fetch(`${API_URL}/solicitudes-visita`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Comprobamos que la respuesta sea correcta.
        if (!res.ok) {
          throw new Error("No se pudieron cargar las solicitudes.");
        }

        // Convertimos el JSON y guardamos las solicitudes.
        const datos: SolicitudVisita[] = await res.json();
        setSolicitudes(datos);

      } catch {
        // Mostramos un error si falla la petición.
        setError("No se pudieron cargar las solicitudes.");

      } finally {
        // Indicamos que terminó la carga.
        setCargando(false);
      }
    }

    cargarSolicitudes();

  }, []);


  // Cambia el estado de una solicitud en el backend.
  async function cambiarEstado(id: number, nuevoEstado: string) {
    setActualizando(id);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Enviamos el nuevo estado mediante PATCH.
      const res = await fetch(
        `${API_URL}/solicitudes-visita/${id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        }
      );

      // Comprobamos si el backend aceptó el cambio.
      if (!res.ok) {
        const datos = await res.json();
        throw new Error(datos.message || "No se pudo actualizar.");
      }

      // Recibimos la solicitud con el estado actualizado.
      const actualizada: SolicitudVisita = await res.json();

      // Recorremos las solicitudes y modificamos solamente la elegida.
      setSolicitudes((anteriores) =>
        anteriores.map((solicitud) =>
          solicitud.id === id
            ? { ...solicitud, estado: actualizada.estado }
            : solicitud
        )
      );

    } catch (err) {
      // Mostramos el mensaje si ocurre un error.
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      // Volvemos a habilitar los botones.
      setActualizando(null);
    }
  }


  // Mostramos un mensaje mientras esperamos los datos.
  if (cargando) return <p>Cargando solicitudes...</p>;


  return (
    <main className="pagina-solicitudes">
      <h1>Solicitudes de visita</h1>

      {/* Mostramos el error si existe. */}
      {error && <p className="error-solicitudes">{error}</p>}

      {/* Mensaje cuando todavía no hay solicitudes. */}
      {solicitudes.length === 0 && !error && (
        <p>Todavía no recibiste solicitudes de visita.</p>
      )}

      {/* Recorremos las solicitudes y mostramos una tarjeta por cada una. */}
      {solicitudes.map((solicitud) => (
        <article className="tarjeta-solicitud" key={solicitud.id}>

          {/* Título de la propiedad que quieren visitar. */}
          <h2>{solicitud.propiedad.titulo}</h2>

          {/* Datos de la persona interesada. */}
          <p>
            <strong>Nombre:</strong> {solicitud.nombreSolicitante}
          </p>

          <p>
            <strong>Teléfono:</strong> {solicitud.telefonoSolicitante}
          </p>

          {/* Convertimos la fecha al formato de Argentina. */}
          <p>
            <strong>Fecha propuesta:</strong>{" "}
            {new Date(solicitud.fechaHoraPropuesta).toLocaleString("es-AR")}
          </p>

          {/* Mostramos el mensaje solamente si existe. */}
          {solicitud.mensaje && (
            <p>
              <strong>Mensaje:</strong> {solicitud.mensaje}
            </p>
          )}

          {/* Estado actual de la solicitud. */}
          <p>
            <strong>Estado:</strong>{" "}
            <span className="estado-solicitud">
              {solicitud.estado}
            </span>
          </p>

          {/* Si está pendiente, mostramos Confirmar y Rechazar. */}
          {solicitud.estado === "PENDIENTE" && (
            <div className="botones-solicitud">

              <button
                disabled={actualizando === solicitud.id}
                onClick={() =>
                  cambiarEstado(solicitud.id, "CONFIRMADA")
                }
              >
                Confirmar
              </button>

              <button
                disabled={actualizando === solicitud.id}
                onClick={() =>
                  cambiarEstado(solicitud.id, "RECHAZADA")
                }
              >
                Rechazar
              </button>

            </div>
          )}

          {/* Si está confirmada, podemos marcarla como realizada. */}
          {solicitud.estado === "CONFIRMADA" && (
            <button
              disabled={actualizando === solicitud.id}
              onClick={() =>
                cambiarEstado(solicitud.id, "REALIZADA")
              }
            >
              Marcar como realizada
            </button>
          )}

        </article>
      ))}
    </main>
  );
}
