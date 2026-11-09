import { useState } from "react";
import { API_URL } from "../servicios/api";
import "../estilos/SolicitudVisita.css";

// El componente recibe el ID de la propiedad.
type Props = {
  propiedadId: number;
};

export default function SolicitudVisita({ propiedadId }: Props) {

  // Guardamos los datos que escribe el interesado.
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Controlamos si se está enviando la solicitud.
  const [enviando, setEnviando] = useState(false);

  // Guardamos mensajes de error o confirmación.
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

    // Se ejecuta cuando el usuario envía el formulario.
    async function enviarSolicitud(e: React.FormEvent<HTMLFormElement>) {
        // Evita que el navegador recargue la página.
        e.preventDefault();

    // Limpiamos los mensajes anteriores.
    setError("");
    setExito("");

    // Comprobamos que los campos obligatorios tengan contenido
    if (!nombre.trim() || !telefono.trim() || !fechaHora) {
      setError("Completá los campos obligatorios.");
      return;
    }

    // Convertimos la fecha elegida en un objeto Date
    const fecha = new Date(fechaHora);

    // La fecha debe ser válida y estar en el futuro.
    if (isNaN(fecha.getTime()) || fecha <= new Date()) {
      setError("Elegí una fecha y hora futuras.");
      return;
    }

    // Indicamos que comenzó el envío.
    setEnviando(true);

    try {
      // Enviamos los datos al backend con una petición POST.
      const res = await fetch(
        `${API_URL}/solicitudes-visita/propiedad/${propiedadId}`,
        {
          method: "POST",

          // Indicamos que enviamos datos en formato JSON.
          headers: {
            "Content-Type": "application/json",
          },

          // Convertimos los datos del formulario a JSON.
          // toISOString() envía la fecha con su zona horaria.
          body: JSON.stringify({
            nombreSolicitante: nombre.trim(),
            telefonoSolicitante: telefono.trim(),
            fechaHoraPropuesta: fecha.toISOString(),
            mensaje: mensaje.trim() || null,
          }),
        }
      );

      // Si el backend rechaza la solicitud, mostramos el error.
      if (!res.ok) {
        const datos = await res.json();
        throw new Error(datos.message || "No se pudo enviar la solicitud.");
      }

      // Mostramos un mensaje cuando el backend la guarda.
      setExito("¡Solicitud enviada! La inmobiliaria deberá confirmarla.");

      // Limpiamos los campos después de enviarla.
      setNombre("");
      setTelefono("");
      setFechaHora("");
      setMensaje("");

    } catch (err) {
      // Mostramos el error que ocurrió.
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la solicitud."
      );

    } finally {
      // Volvemos a habilitar el botón.
      setEnviando(false);
    }
  }

  return (
    <section className="solicitud-visita">
      <h2>Solicitar una visita</h2>

      <p>Completá tus datos para coordinar una visita a la propiedad.</p>

      {/* Formulario para enviar la solicitud. */}
      <form onSubmit={enviarSolicitud}>

        {/* Nombre del interesado. */}
        <label htmlFor="nombre-visita">Nombre completo</label>
        <input
          id="nombre-visita"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)} //guarda lo que escribe el usuario
          required //obliga a completar el campo antes de enviar el formulario
        />

        {/* Teléfono de contacto. */}
        <label htmlFor="telefono-visita">Teléfono</label>
        <input
          id="telefono-visita"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)} //guarda lo que escribe el usuario
          required //obliga a completar el campo antes de enviar el formulario
        />

        {/* Fecha y hora propuestas para la visita. */}
        <label htmlFor="fecha-visita">Fecha y hora de la visita</label>
        <input
          id="fecha-visita"
          type="datetime-local" //le indica al navegador que muestre el selector de fecha y hora
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)} //guarda lo que escribe el usuario
          required //obliga a completar el campo antes de enviar el formulario
        />

        {/* Mensaje opcional para la inmobiliaria. */}
        <label htmlFor="mensaje-visita">Mensaje (opcional)</label>
        <textarea
          id="mensaje-visita"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)} //guarda lo que escribe el usuario
          placeholder="Por ejemplo: ¿Podemos visitarla por la tarde?" //mensaje de ejemplo
        />

        {/* Mostramos los mensajes según el resultado. */}
        {error && <p className="error-visita">{error}</p>}
        {exito && <p className="exito-visita">{exito}</p>}

        {/* Deshabilitamos el botón mientras se envía. */}
        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar solicitud"}
        </button>

      </form>
    </section>
  );
}
