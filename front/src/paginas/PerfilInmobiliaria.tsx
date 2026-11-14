import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../servicios/api";
import type { Inmobiliaria, Propiedad } from "../tipos/Propiedad";
import "../estilos/PerfilInmobiliaria.css";

// Datos de la reseña que devuelve el backend.
type Resena = {
  id: number;
  nombreAutor: string;
  contenido: string;
  calificacion: number;
  fechaCreacion: string;
};

// El perfil incluye los datos de la inmobiliaria y sus propiedades
type Perfil = Inmobiliaria & {
  propiedades: Propiedad[];
};

export default function PerfilInmobiliaria() {

  // Obtenemos el ID de la inmobiliaria desde la URL.
  const { id } = useParams();

  // Guardamos los datos recibidos del backend.
  const [inmobiliaria, setInmobiliaria] = useState<Perfil | null>(null);
  const [resenas, setResenas] = useState<Resena[]>([]);

  // Controlamos la carga y los errores.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Guardamos los datos del formulario de reseñas.
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");
  const [calificacion, setCalificacion] = useState(5);

  // Controlamos el envío y los mensajes del formulario.
  const [enviando, setEnviando] = useState(false);
  const [errorResena, setErrorResena] = useState("");
  const [mensaje, setMensaje] = useState("");


  // Cargamos el perfil y sus reseñas cuando cambia el ID.
  useEffect(() => {

    async function cargarPerfil() {
      setCargando(true);
      setError("");

      try {
        // Pedimos los datos públicos de la inmobiliaria.
        const res = await fetch(
          `${API_URL}/inmobiliarias/${id}/perfil`
        );

        if (!res.ok) {
          throw new Error("No se encontró la inmobiliaria.");
        }

        const datos: Perfil = await res.json();

        // Guardamos la inmobiliaria y sus propiedades.
        setInmobiliaria(datos);

        // Pedimos las reseñas de esta inmobiliaria.
        const resResenas = await fetch(
          `${API_URL}/resenas/inmobiliaria/${id}`
        );

        if (!resResenas.ok) {
          throw new Error("No se pudieron cargar las reseñas.");
        }

        const datosResenas: Resena[] = await resResenas.json();
        setResenas(datosResenas);

      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error."
        );

      } finally {
        setCargando(false);
      }
    }

    cargarPerfil();

  }, [id]);


  // Buscamos la foto marcada como portada de cada propiedad.
  function obtenerPortada(propiedad: Propiedad) {
    return propiedad.fotos?.find((foto) => foto.esPortada)?.url;
  }


  // Convertimos el precio al formato argentino.
  function mostrarPrecio(propiedad: Propiedad) {
    return `${propiedad.moneda} ${Number(propiedad.precio).toLocaleString("es-AR")}`;
  }


  // Se ejecuta cuando el usuario envía una reseña.
  async function enviarResena(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorResena("");
    setMensaje("");

    // Comprobamos que los campos no estén vacíos.
    if (!nombre.trim() || !contenido.trim()) {
      setErrorResena("Completá todos los campos.");
      return;
    }

    setEnviando(true);

    try {
      // Enviamos la reseña al backend mediante POST.
      const res = await fetch(
        `${API_URL}/resenas/inmobiliaria/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombreAutor: nombre.trim(),
            contenido: contenido.trim(),
            calificacion,
          }),
        }
      );

      if (!res.ok) {
        const datos = await res.json();
        throw new Error(datos.message || "No se pudo enviar la reseña.");
      }

      // Recibimos la reseña que se guardó en la base de datos.
      const nuevaResena: Resena = await res.json();

      // Agregamos la reseña al listado sin recargar la página.
      setResenas((anteriores) => [nuevaResena, ...anteriores]);

      setMensaje("¡Reseña publicada correctamente!");

      // Limpiamos los campos del formulario.
      setNombre("");
      setContenido("");
      setCalificacion(5);

    } catch (err) {
      setErrorResena(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      setEnviando(false);
    }
  }


  // Mostramos un mensaje mientras esperamos los datos.
  if (cargando) return <p>Cargando inmobiliaria...</p>;

  if (error) return <p className="mensaje-error">{error}</p>;

  if (!inmobiliaria) return <p>Inmobiliaria no encontrada.</p>;


  return (
    <main className="pagina-perfil-inmobiliaria">

      <Link to="/">Volver al inicio</Link>

      {/* Datos públicos de la inmobiliaria */}
      <section className="informacion-inmobiliaria">

        {inmobiliaria.urlLogo && (
          <img
            src={inmobiliaria.urlLogo}
            alt={`Logo de ${inmobiliaria.nombre}`}
            className="logo-inmobiliaria"
          />
        )}

        <h1>{inmobiliaria.nombre}</h1>

        <p>{inmobiliaria.descripcion}</p>

        <h2>Datos de contacto</h2>

        <p>Teléfono: {inmobiliaria.telefonoContacto}</p>
        <p>Email: {inmobiliaria.emailContacto}</p>

        {/* La dirección se muestra solamente si existe. */}
        {inmobiliaria.direccionOficina && (
          <p>Dirección: {inmobiliaria.direccionOficina}</p>
        )}

      </section>


      {/* Propiedades publicadas de esta inmobiliaria */}
      <section className="propiedades-inmobiliaria">

        <h2>Propiedades publicadas</h2>

        {inmobiliaria.propiedades.length === 0 && (
          <p>Esta inmobiliaria todavía no tiene propiedades publicadas.</p>
        )}

        <div className="grilla-perfil-propiedades">
          {inmobiliaria.propiedades.map((propiedad) => (
            <article className="tarjeta-perfil" key={propiedad.id}>

              {/* Mostramos la portada si la propiedad tiene fotos. */}
              {obtenerPortada(propiedad) ? (
                <img
                  src={obtenerPortada(propiedad)}
                  alt={propiedad.titulo}
                />
              ) : (
                <div className="sin-foto-perfil">Sin imagen</div>
              )}

              <div className="contenido-perfil">
                <h3>{propiedad.titulo}</h3>
                <p>{propiedad.operacion} · {propiedad.tipo}</p>
                <p>{propiedad.zona}</p>

                <p className="precio-perfil">
                  {mostrarPrecio(propiedad)}
                </p>

                <Link to={`/propiedades/${propiedad.id}`}>
                  Ver propiedad
                </Link>
              </div>

            </article>
          ))}
        </div>
      </section>


      {/* Reseñas de los interesados */}
      <section className="resenas-inmobiliaria">
        <h2>Reseñas de la inmobiliaria</h2>

        {resenas.length === 0 && (
          <p>Esta inmobiliaria todavía no tiene reseñas.</p>
        )}

        {/* Mostramos el nombre, la calificación y el comentario. */}
        {resenas.map((resena) => (
          <article className="tarjeta-resena" key={resena.id}>

            <h3>{resena.nombreAutor}</h3>

            <p className="estrellas-resena">
              {"★".repeat(resena.calificacion)}
              {"☆".repeat(5 - resena.calificacion)}
            </p>

            <p>{resena.contenido}</p>

            <small>
              {new Date(resena.fechaCreacion).toLocaleDateString("es-AR")}
            </small>

          </article>
        ))}
      </section>


      {/* Formulario para que un interesado publique una reseña */}
      <section className="nueva-resena">
        <h2>Dejá tu reseña</h2>

        <form onSubmit={enviarResena}>

          <label htmlFor="nombreAutor">Tu nombre</label>
          <input
            id="nombreAutor"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label htmlFor="calificacion">Calificación</label>
          <select
            id="calificacion"
            value={calificacion}
            onChange={(e) => setCalificacion(Number(e.target.value))}
          >
            <option value={5}>5 estrellas</option>
            <option value={4}>4 estrellas</option>
            <option value={3}>3 estrellas</option>
            <option value={2}>2 estrellas</option>
            <option value={1}>1 estrella</option>
          </select>

          <label htmlFor="contenido">Tu opinión</label>
          <textarea
            id="contenido"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
          />

          {/* Mensajes del formulario */}
          {errorResena && (
            <p className="mensaje-error">{errorResena}</p>
          )}

          {mensaje && (
            <p className="mensaje-exito">{mensaje}</p>
          )}

          <button type="submit" disabled={enviando}>
            {enviando ? "Publicando..." : "Publicar reseña"}
          </button>

        </form>
      </section>

    </main>
  );
}
