import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../servicios/api";
import type { Propiedad } from "../tipos/Propiedad";
import "../estilos/MisPropiedades.css";

export default function MisPropiedades() {

  // Guardamos las propiedades del vendedor.
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);

  // Controlamos la carga y los errores.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Guardamos el ID de la propiedad que se está eliminando.
  // null significa que no estamos eliminando ninguna.
  const [eliminando, setEliminando] = useState<number | null>(null);

  // Buscamos las propiedades cuando se abre la página.
  useEffect(() => {
    async function cargarPropiedades() {
      try {
        // Recuperamos el token del vendedor.
        const token = localStorage.getItem("token");

        // Pedimos al backend solamente sus propiedades.
        const res = await fetch(`${API_URL}/propiedades/mis-propiedades`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("No se pudieron cargar las propiedades.");
        }

        // El backend devuelve propiedades y datos de paginación.
        const datos: { propiedades: Propiedad[] } = await res.json();
        setPropiedades(datos.propiedades);

      } catch {
        setError("No se pudieron cargar las propiedades.");

      } finally {
        setCargando(false);
      }
    }
    cargarPropiedades();
  }, []);
  
  // ELIMINAR UNA PROPIEDAD
  async function eliminarPropiedad(id: number) {

    // Pedimos confirmación antes de eliminar definitivamente.
    const confirmar = window.confirm(
      "¿Estás segura de que querés eliminar esta propiedad? Esta acción no se puede deshacer."
    );

    // Si el vendedor cancela, detenemos la función.
    if (!confirmar) return;

    setError("");
    setEliminando(id);

    try {

      // Recuperamos el token del vendedor.
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Iniciá sesión nuevamente.");
      }

      // DELETE solicita al backend eliminar la propiedad indicada.
      const res = await fetch(`${API_URL}/propiedades/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // El backend puede rechazar la eliminación
      // si la propiedad tiene visitas confirmadas o está finalizada.
      if (!res.ok) {
        const datos = await res.json();

        throw new Error(
          datos.mensaje || "No se pudo eliminar la propiedad."
        );
      }

      // filter() crea un nuevo array sin la propiedad eliminada.
      // Así desaparece de la pantalla sin tener que recargarla.
      setPropiedades((anteriores) =>
        anteriores.filter((propiedad) => propiedad.id !== id)
      );

    } catch (err) {

      // Mostramos el error que devuelve el backend.
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {

      // Habilitamos nuevamente los botones.
      setEliminando(null);
    }
  }


  // Mostramos un mensaje mientras esperamos la respuesta.
  if (cargando) return <p>Cargando propiedades...</p>;

  return (
    <main className="pagina-mis-propiedades">

      <h1>Mis propiedades</h1>

      {/* Enlace al formulario */}
      <Link to="/panel/propiedades/nueva" className="boton-nueva">
        Publicar propiedad
      </Link>

      {/* Mostramos un error si ocurre algún problema. */}
      {error && <p>{error}</p>}

      {/* Mensaje cuando el vendedor no tiene propiedades. */}
      {!error && propiedades.length === 0 && (
        <p>Todavía no tenés propiedades cargadas.</p>
      )}

      {/* Mostramos una tarjeta por cada propiedad. */}
      <div className="lista-mis-propiedades">
        {propiedades.map((propiedad) => {

          // Buscamos la foto marcada como portada.
          const portada = propiedad.fotos?.find((foto) => foto.esPortada);

          return (
            <article className="tarjeta-mi-propiedad" key={propiedad.id}>

              {/* Mostramos la foto si existe */}
              {portada && (
                <img src={portada.url} alt={propiedad.titulo} />
              )}

              <div>
                <h2>{propiedad.titulo}</h2>

                <p>{propiedad.zona}</p>

                <p>
                  <strong>
                    {propiedad.moneda} {Number(propiedad.precio).toLocaleString("es-AR")}
                  </strong>
                </p>

                <p>Estado: {propiedad.estado}</p>

                
            {/* Acciones disponibles para cada propiedad */}
            <div className="acciones-mi-propiedad">

            {/* Accedemos al formulario de edición */}
            <Link
                to={`/panel/propiedades/${propiedad.id}/editar`}
                className="boton-editar-propiedad"
            >
                Editar propiedad
            </Link>

            {/* No permitimos eliminar propiedades finalizadas */}
            {!["VENDIDA", "ALQUILADA", "CANCELADA"].includes(propiedad.estado) && (
                <button
                type="button"
                className="boton-eliminar-propiedad"
                onClick={() => eliminarPropiedad(propiedad.id)}
                disabled={eliminando !== null}
                >
                {eliminando === propiedad.id ? "Eliminando..." : "Eliminar"}
                </button>
            )}

            </div>

              </div>

            </article>
          );
        })}
      </div>

    </main>
  );
}
