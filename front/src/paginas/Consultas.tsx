import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../servicios/api";
import type { Propiedad } from "../tipos/Propiedad";
import type { Comentario } from "../tipos/Comentario";
import "../estilos/Consultas.css";

// Cada consulta también tendrá los datos de la propiedad a la que pertenece.
type Consulta = Comentario & {
  propiedad: {
    id: number;
    titulo: string;
  };
};

export default function Consultas() {

  // Guardamos las consultas y las respuestas que escribe el vendedor.
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});

  // Controlamos la carga, el envío y los errores.
  const [cargando, setCargando] = useState(true);
  const [respondiendo, setRespondiendo] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Recuperamos el token del vendedor que inició sesión.
  const token = localStorage.getItem("token");


  // OBTENER TODAS LAS CONSULTAS DEL VENDEDOR
  async function cargarConsultas() {
    try {

      if (!token) {
        throw new Error("Iniciá sesión para ver las consultas.");
      }

      // Primero buscamos las propiedades que pertenecen al vendedor.
      const res = await fetch(
        `${API_URL}/propiedades/mis-propiedades?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("No se pudieron cargar las propiedades.");
      }

      const datos = await res.json();
      const propiedades: Propiedad[] = datos.propiedades;

      // Buscamos los comentarios de cada propiedad.
      // Promise.all espera a que terminen todas las peticiones.
      const resultados = await Promise.all(
        propiedades.map(async (propiedad) => {

          const respuesta = await fetch(
            `${API_URL}/comentarios/propiedad/${propiedad.id}`
          );

          if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las consultas.");
          }

          const comentarios: Comentario[] = await respuesta.json();

          // A cada comentario le agregamos el ID y título de su propiedad.
          return comentarios.map((comentario) => ({
            ...comentario,
            propiedad: {
              id: propiedad.id,
              titulo: propiedad.titulo,
            },
          }));
        })
      );

      // flat() une los comentarios de todas las propiedades en un solo arreglo.
      setConsultas(resultados.flat());

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      // Terminamos de cargar, haya salido bien o mal.
      setCargando(false);
    }
  }


  // useEffect ejecuta la carga cuando entramos a la página.
  useEffect(() => {
    cargarConsultas();
  }, []);


  // RESPONDER UNA CONSULTA
  async function responderConsulta(id: number) {

    // Buscamos el texto escrito para esta consulta.
    // trim() elimina los espacios al principio y al final.
    const respuesta = respuestas[id]?.trim();

    if (!respuesta) {
      setError("Escribí una respuesta.");
      return;
    }

    setError("");
    setRespondiendo(id);

    try {

      // PATCH envía la respuesta al backend para guardarla.
      const res = await fetch(`${API_URL}/comentarios/${id}/responder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ respuesta }),
      });

      if (!res.ok) {
        const datos = await res.json();
        throw new Error(datos.message || "No se pudo responder.");
      }

      // Actualizamos la consulta respondida sin volver a cargar toda la página.
      // map() recorre las consultas y modifica solamente la que tiene ese ID.
      setConsultas(anteriores =>
        anteriores.map(consulta =>
          consulta.id === id
            ? { ...consulta, respuesta }
            : consulta
        )
      );

      // Limpiamos el texto que había escrito el vendedor.
      setRespuestas(anteriores => ({
        ...anteriores,
        [id]: "",
      }));

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      // Habilitamos nuevamente el botón Responder.
      setRespondiendo(null);
    }
  }


  // Mientras esperamos la información, mostramos un mensaje.
  if (cargando) {
    return <p>Cargando consultas...</p>;
  }

  return (
    <main className="pagina-consultas">

      <Link to="/panel">Volver al panel</Link>

      <h1>Consultas</h1>
      <p>Respondé las preguntas sobre tus propiedades.</p>

      {/* Mostramos un error si ocurrió algún problema. */}
      {error && <p className="error-consultas">{error}</p>}

      {/* Si no existen consultas, mostramos un mensaje. */}
      {consultas.length === 0 && !error && (
        <p>Todavía no recibiste consultas.</p>
      )}

      {/* map() recorre las consultas y crea una tarjeta por cada una. */}
      {consultas.map(consulta => (

        <article className="tarjeta-consulta" key={consulta.id}>

          <h2>{consulta.propiedad.titulo}</h2>

          <p>
            <strong>Nombre:</strong> {consulta.nombreAutor}
          </p>

          <p>
            <strong>Pregunta:</strong> {consulta.pregunta}
          </p>

          {/* Si ya tiene respuesta, la mostramos.
              Si no, mostramos el formulario para responder. */}
          {consulta.respuesta ? (

            <div className="respuesta-consulta">
              <strong>Tu respuesta:</strong>
              <p>{consulta.respuesta}</p>
            </div>

          ) : (

            <div className="formulario-respuesta">

              <label htmlFor={`respuesta-${consulta.id}`}>
                Escribir respuesta
              </label>

              {/* Cada consulta guarda su propio texto usando su ID. */}
              <textarea
                id={`respuesta-${consulta.id}`}
                value={respuestas[consulta.id] || ""}
                onChange={e =>
                  setRespuestas(anteriores => ({
                    ...anteriores,
                    [consulta.id]: e.target.value,
                  }))
                }
                placeholder="Escribí tu respuesta..."
              />

              {/* Enviamos la respuesta correspondiente a esta consulta. */}
              <button
                type="button"
                onClick={() => responderConsulta(consulta.id)}
                disabled={respondiendo !== null}
              >
                {respondiendo === consulta.id
                  ? "Enviando..."
                  : "Responder"}
              </button>

            </div>
          )}

          {/* Link para ir al detalle público de la propiedad. */}
          <Link to={`/propiedades/${consulta.propiedad.id}`}>
            Ver propiedad
          </Link>

        </article>
      ))}

    </main>
  );
}
