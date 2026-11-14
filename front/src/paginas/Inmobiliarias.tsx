import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../servicios/api";
import type { Inmobiliaria } from "../tipos/Propiedad";
import "../estilos/Inmobiliarias.css";

export default function Inmobiliarias() {

  // Guardamos las inmobiliarias que recibimos del backend
  // Al principio tenemos un array vacío porque todavía no se cargaron.
  const [inmobiliarias, setInmobiliarias] = useState<Inmobiliaria[]>([]);

  // Controlamos si estamos esperando los datos y si hubo un error.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");


  // useEffect se ejecuta cuando entramos a esta página.
  useEffect(() => {

    // Función que obtiene todas las inmobiliarias del backend.
    async function cargarInmobiliarias() {
      try {

        // Hacemos una petición GET para consultar las inmobiliarias.
        const res = await fetch(`${API_URL}/inmobiliarias`);

        // Si el backend devuelve un error, lo detectamos.
        if (!res.ok) {
          throw new Error("No se pudieron cargar las inmobiliarias.");
        }

        // Convertimos la respuesta JSON en un array de inmobiliarias.
        const datos: Inmobiliaria[] = await res.json();

        // Guardamos los datos y React actualiza la pantalla.
        setInmobiliarias(datos);

      } catch {
        // Si falla la petición, mostramos un mensaje.
        setError("No se pudieron cargar las inmobiliarias.");

      } finally {
        // Indicamos que terminó la carga, haya funcionado o no.
        setCargando(false);
      }
    }

    cargarInmobiliarias();

  }, []); // El array vacío indica que se ejecuta al montar el componente


  // Mientras esperamos los datos, mostramos un mensaje.
  if (cargando) return <p>Cargando inmobiliarias...</p>;

  // Si ocurrió un error, lo mostramos.
  if (error) return <p className="mensaje-error">{error}</p>;


  return (
    <main className="pagina-inmobiliarias">

      <h1>Inmobiliarias</h1>
      <p>Conocé las inmobiliarias que forman parte de InmoMarket.</p>

      {/* Si no hay inmobiliarias registradas, mostramos un mensaje. */}
      {inmobiliarias.length === 0 && (
        <p>Todavía no hay inmobiliarias registradas.</p>
      )}

      {/* Mostramos una tarjeta por cada inmobiliaria. */}
      <section className="grilla-inmobiliarias">

        {inmobiliarias.map((inmobiliaria) => (
          <article
            className="tarjeta-inmobiliaria"
            key={inmobiliaria.id}
          >

            {/* Mostramos el logo solamente si la inmobiliaria tiene uno. */}
            {inmobiliaria.urlLogo ? (
              <img
                src={inmobiliaria.urlLogo}
                alt={`Logo de ${inmobiliaria.nombre}`}
              />
            ) : (
              <div className="sin-logo">
                Sin logo
              </div>
            )}

            <div className="contenido-inmobiliaria">

              <h2>{inmobiliaria.nombre}</h2>

              <p>{inmobiliaria.descripcion}</p>

              {/* Datos de contacto públicos */}
              <p>
                <strong>Teléfono:</strong>{" "}
                {inmobiliaria.telefonoContacto}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {inmobiliaria.emailContacto}
              </p>

              {/* Link lleva al perfil usando el ID de la inmobiliaria. */}
              <Link
                to={`/inmobiliarias/${inmobiliaria.id}`}
                className="boton-ver-inmobiliaria"
              >
                Ver inmobiliaria
              </Link>

            </div>

          </article>
        ))}

      </section>

    </main>
  );
}
