import { useEffect, useState } from "react";
// Importamos la dirección del backend.
import { API_URL } from "../servicios/api";
// Importamos el tipo que define cómo es un comentario.
import type { Comentario } from "../tipos/Comentario";
// Importamos los estilos del componente.
import "../estilos/ComentariosPropiedad.css";

// Definimos qué dato recibe este componente.
// Recibe el ID de la propiedad para buscar sus comentarios.
type Props = {
  propiedadId: number;
};

export default function ComentariosPropiedad({ propiedadId }: Props) {

  // Guarda todos los comentarios de la propiedad.
  // Empieza como un array vacío.
  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  // Guarda el nombre que escribe el visitante.
  const [nombre, setNombre] = useState("");

  // Guarda la pregunta que escribe el visitante.
  const [pregunta, setPregunta] = useState("");

  // Indica si estamos cargando los comentarios.
  const [cargando, setCargando] = useState(true);

  // Indica si estamos enviando un comentario.
  const [enviando, setEnviando] = useState(false);

  // Guarda un mensaje si ocurre algún error.
  const [error, setError] = useState("");

  // Se ejecuta cuando se abre el componente
  // o cuando cambia el ID de la propiedad.
  useEffect(() => {

    // Función que pide los comentarios al backend.
    async function cargarComentarios() {

      // Indicamos que empezó la carga.
      setCargando(true);

      // Limpiamos cualquier error anterior.
      setError("");

      try {
        // Hacemos una petición GET al backend.
        // El ID indica de qué propiedad queremos los comentarios.
        const res = await fetch(
          `${API_URL}/comentarios/propiedad/${propiedadId}`
        );

        // Si el backend devuelve un error, lo detectamos.
        if (!res.ok) {
          throw new Error("Error al cargar comentarios");
        }

        // Convertimos la respuesta JSON en un array.
        const datos: Comentario[] = await res.json();

        // Guardamos los comentarios en el estado.
        // React vuelve a mostrar el componente con esos datos.
        setComentarios(datos);

      } catch {
        // Si falla la petición, guardamos un mensaje.
        setError("No se pudieron cargar los comentarios.");

      } finally {
        // Terminamos la carga, haya salido bien o mal.
        setCargando(false);
      }
    }

    // Ejecutamos la función.
    cargarComentarios();

  }, [propiedadId]); // Si cambia la propiedad, cargamos sus comentarios.

  // Esta función se ejecuta cuando enviamos el formulario.
  async function enviarComentario(e: React.SubmitEvent<HTMLFormElement>) {

    // Evita que el navegador recargue la página.
    e.preventDefault();

    // trim() elimina espacios al principio y al final.
    // Si el nombre o la pregunta están vacíos, no enviamos nada.
    if (!nombre.trim() || !pregunta.trim()) {
      setError("Completá tu nombre y tu consulta.");
      return;
    }

    // Indicamos que estamos enviando el comentario.
    setEnviando(true);

    // Limpiamos errores anteriores.
    setError("");

    try {
      // Hacemos una petición POST para crear el comentario.
      const res = await fetch(
        `${API_URL}/comentarios/propiedad/${propiedadId}`,
        {
          method: "POST",

          // Avisamos que enviamos datos en formato JSON.
          headers: {
            "Content-Type": "application/json",
          },

          // Convertimos los datos de JavaScript a JSON.
          // Los nombres deben coincidir con los del backend.
          body: JSON.stringify({
            nombreAutor: nombre.trim(),
            pregunta: pregunta.trim(),
          }),
        }
      );

      // Comprobamos si el backend guardó el comentario.
      if (!res.ok) {
        throw new Error("Error al enviar comentario");
      }

      // Convertimos la respuesta al tipo Comentario.
      const nuevoComentario: Comentario = await res.json();

      // Agregamos el comentario nuevo al array anterior.
      // ...anteriores conserva los comentarios que ya existían.
      setComentarios((anteriores) => [
        ...anteriores,
        nuevoComentario
      ]);

      // Limpiamos los campos del formulario.
      setNombre("");
      setPregunta("");

    } catch {
      // Mostramos un mensaje si no se pudo guardar.
      setError("No se pudo enviar el comentario.");

    } finally {
      // Habilitamos nuevamente el botón.
      setEnviando(false);
    }
  }

  return (
    <section className="comentarios-propiedad">

      <h2>Consultas sobre la propiedad</h2>

      {/* Mientras esperamos los datos, mostramos este mensaje. */}
      {cargando && <p>Cargando comentarios...</p>}

      {/* Si terminó de cargar y no hay comentarios, mostramos un aviso. */}
      {!cargando && comentarios.length === 0 && (
        <p>Todavía no hay consultas sobre esta propiedad.</p>
      )}

      {/* map() recorre el array y crea una tarjeta por comentario. */}
      {comentarios.map((comentario) => (

        // key permite que React identifique cada comentario.
        <article
          className="tarjeta-comentario"
          key={comentario.id}
        >

          {/* Nombre de la persona que hizo la pregunta. */}
          <h3>{comentario.nombreAutor}</h3>

          {/* Pregunta que escribió el visitante. */}
          <p>{comentario.pregunta}</p>

          {/* Si existe una respuesta, la mostramos.
              Si es null, no aparece esta sección. */}
          {comentario.respuesta && (
            <div className="respuesta-comentario">
              <strong>Respuesta de la inmobiliaria:</strong>
              <p>{comentario.respuesta}</p>
            </div>
          )}

        </article>
      ))}

      <h3>Dejá tu consulta</h3>

      {/* onSubmit ejecuta enviarComentario al enviar el formulario. */}
      <form
        onSubmit={enviarComentario}
        className="formulario-comentario"
      >

        <label htmlFor="nombre-comentario">Tu nombre</label>

        <input
          id="nombre-comentario"
          type="text"

          // value muestra el valor guardado en el estado.
          value={nombre}

          // onChange actualiza el estado mientras escribimos.
          onChange={(e) => setNombre(e.target.value)}

          // El navegador exige completar este campo.
          required
        />

        <label htmlFor="pregunta-comentario">Tu consulta</label>

        <textarea
          id="pregunta-comentario"
          value={pregunta}

          // Guardamos lo que escribe el visitante.
          onChange={(e) => setPregunta(e.target.value)}
          required
        />

        {/* Mostramos el error solamente si existe un mensaje. */}
        {error && (
          <p className="error-comentario">{error}</p>
        )}

        {/* El botón se deshabilita mientras se envía. */}
        <button type="submit" disabled={enviando}>

          {/* Cambiamos el texto según el estado del envío. */}
          {enviando ? "Enviando..." : "Publicar consulta"}

        </button>
      </form>

    </section>
  );
}
