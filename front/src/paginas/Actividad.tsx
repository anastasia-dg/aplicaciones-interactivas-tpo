import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../servicios/api";
import "../estilos/Actividad.css";

// Definimos cómo es una actividad que recibimos del backend.
type Actividad = {
  id: number;
  tipo: string;
  descripcion: string;
  leida: boolean;
  fechaCreacion: string;
};

export default function Actividad() {

  // Guardamos las actividades que vamos a mostrar en pantalla.
  const [actividades, setActividades] = useState<Actividad[]>([]);

  // Estos estados nos permiten controlar la carga, los errores y los botones
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState<number | null>(null);

  // Recuperamos el token que guardamos cuando el vendedor inició sesión.
  const token = localStorage.getItem("token");

  // filter() crea un arreglo con las actividades que NO están leídas
  // length cuenta cuántas hay en ese arreglo.
  const noLeidas = actividades.filter(actividad => !actividad.leida).length;


  // OBTENER LAS ACTIVIDADES
  useEffect(() => {

    async function cargarActividades() {
      try {

        // Si no hay token, el vendedor no inició sesión.
        if (!token) {
          throw new Error("Iniciá sesión para ver las actividades.");
        }

        // GET le pide al backend las actividades del vendedor
        // Enviamos el token para que el backend sepa quién inició sesión.
        const res = await fetch(`${API_URL}/actividades`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Si la petición falla, mostramos un error.
        if (!res.ok) {
          throw new Error("No se pudieron cargar las actividades.");
        }

        // Convertimos la respuesta JSON en un arreglo de actividades.
        const datos: Actividad[] = await res.json();

        // sort() ordena las actividades según su fecha.
        // Restamos las fechas para que aparezcan primero las más recientes.
        // getTime() convierte cada fecha en un número para poder compararlas.
        datos.sort(
          (a, b) =>
            new Date(b.fechaCreacion).getTime() -
            new Date(a.fechaCreacion).getTime()
        );

        // Guardamos las actividades en el estado para mostrarlas.
        setActividades(datos);

      } catch (err) {

        // Si ocurrió un error, guardamos su mensaje.
        setError(
          err instanceof Error ? err.message : "Ocurrió un error."
        );

      } finally {

        // Terminamos de cargar, haya salido bien o mal.
        setCargando(false);
      }
    }

    // Ejecutamos la función al entrar a esta página.
    cargarActividades();

  }, []);


  // MARCAR UNA ACTIVIDAD COMO LEÍDA
  async function marcarComoLeida(id: number) {

    // Limpiamos errores anteriores y guardamos el ID que estamos modificando.
    setError("");
    setActualizando(id);

    try {

      // PATCH le indica al backend que esta actividad fue leída
      const res = await fetch(`${API_URL}/actividades/${id}/leida`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo marcar como leída.");
      }

      // map() recorre todas las actividades.
      // Si encontramos el ID seleccionado, cambiamos leida a true
      // Las demás actividades quedan exactamente como estaban
      setActividades(anteriores =>
        anteriores.map(actividad =>
          actividad.id === id
            ? { ...actividad, leida: true }
            : actividad
        )
      );

    } catch (err) {

      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {

      // null indica que ya no estamos modificando ninguna actividad.
      setActualizando(null);
    }
  }


  // ELIMINAR UNA ACTIVIDAD
  async function eliminarActividad(id: number) {

    // Mostramos una ventana para confirmar antes de eliminar
    // Si el vendedor elige Cancelar, return detiene la función
    if (!window.confirm("¿Querés eliminar esta actividad?")) {
      return;
    }

    setError("");
    setActualizando(id);

    try {

      // DELETE le pide al backend que elimine la actividad por su ID
      const res = await fetch(`${API_URL}/actividades/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar la actividad.");
      }

      // filter() crea un nuevo arreglo sin la actividad eliminada
      // Conservamos solamente las actividades cuyo ID sea diferente
      setActividades(anteriores =>
        anteriores.filter(actividad => actividad.id !== id)
      );

    } catch (err) {

      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {

      setActualizando(null);
    }
  }


  // Mientras esperamos al backend, mostramos este mensaje.
  if (cargando) {
    return <p>Cargando actividades...</p>;
  }

  return (
    <main className="pagina-actividad">

      <Link to="/panel">Volver al panel</Link>

      <h1>Actividad</h1>
      <p>Estas son las últimas novedades de tu inmobiliaria.</p>

      {/* Mostramos el número de actividades que todavía no se leyeron. */}
      <p className="contador-actividad">
        Notificaciones sin leer: <strong>{noLeidas}</strong>
      </p>

      {/* Si ocurrió un error, mostramos el mensaje. */}
      {error && <p className="error-actividad">{error}</p>}

      {/* Si el arreglo está vacío, mostramos un mensaje. */}
      {actividades.length === 0 && !error && (
        <p>Todavía no hay actividades registradas.</p>
      )}

      {/* map() recorre las actividades y crea una tarjeta por cada una. */}
      {actividades.map(actividad => (

        <article
          key={actividad.id}

          // Cambiamos el estilo dependiendo de si fue leída o no.
          className={
            actividad.leida
              ? "tarjeta-actividad"
              : "tarjeta-actividad sin-leer"
          }
        >

          <div className="informacion-actividad">

            {/* Mostramos el tipo de actividad y su descripción. */}
            <h2>{actividad.tipo.replaceAll("_", " ")}</h2>

            <p>{actividad.descripcion}</p>

            {/* Convertimos la fecha al formato de Argentina. */}
            <small>
              {new Date(actividad.fechaCreacion).toLocaleString("es-AR")}
            </small>

            <p className="estado-lectura">
              {actividad.leida ? "Leída" : "Sin leer"}
            </p>

          </div>

          <div className="botones-actividad">

            {/* El botón aparece solo si la actividad no fue leída. */}
            {!actividad.leida && (
              <button
                onClick={() => marcarComoLeida(actividad.id)}
                disabled={actualizando !== null}
              >
                Marcar como leída
              </button>
            )}

            {/* Al hacer clic, enviamos el ID de la actividad a eliminar. */}
            <button
              className="boton-eliminar-actividad"
              onClick={() => eliminarActividad(actividad.id)}
              disabled={actualizando !== null}
            >
              Eliminar
            </button>

          </div>

        </article>
      ))}

    </main>
  );
}
