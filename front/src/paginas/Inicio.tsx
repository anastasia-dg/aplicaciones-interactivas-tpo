import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../servicios/api";
import type { Propiedad, RespuestaPropiedades } from "../tipos/Propiedad";
import "../estilos/Inicio.css";

export default function Inicio() {
  // Guardamos las propiedades y el estado de la petición.
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Traemos las propiedades del backend al cargar la página.
  useEffect(() => {
    async function cargarPropiedades() {
      try {
        const res = await fetch(`${API_URL}/propiedades`);

        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }

        const datos: RespuestaPropiedades = await res.json();
        setPropiedades(datos.propiedades);
      } catch {
        setError("No se pudieron cargar las propiedades.");
      } finally {
        setCargando(false);
      }
    }

    cargarPropiedades();
  }, []);

  // Buscamos la foto principal de cada propiedad.
  function obtenerPortada(propiedad: Propiedad) {
    return propiedad.fotos?.find((foto) => foto.esPortada)?.url;
  }

  // Mostramos el precio con formato argentino.
  function mostrarPrecio(propiedad: Propiedad) {
    return `${propiedad.moneda} ${Number(propiedad.precio).toLocaleString("es-AR")}`;
  }

  if (cargando) return <p>Cargando propiedades...</p>;

  if (error) return <p className="mensaje-error">{error}</p>;

  return (
    <main className="inicio">
      <h1>Encontrá tu próxima propiedad</h1>
      <p>Explorá propiedades en venta y alquiler.</p>

      {propiedades.length === 0 && (
        <p>No hay propiedades publicadas por el momento.</p>
      )}

      <section className="grilla-propiedades">
        {propiedades.map((propiedad) => (
          <article className="tarjeta-propiedad" key={propiedad.id}>
            {obtenerPortada(propiedad) ? (
              <img
                src={obtenerPortada(propiedad)}
                alt={propiedad.titulo}
              />
            ) : (
              <div className="sin-foto">Sin imagen</div>
            )}

            <div className="contenido-tarjeta">
              <p className="operacion">{propiedad.operacion}</p>
              <h2>{propiedad.titulo}</h2>
              <p className="precio">{mostrarPrecio(propiedad)}</p>
              <p>{propiedad.zona}</p>
              <p>
                {propiedad.tipo}
                {propiedad.ambientes != null &&
                  ` · ${propiedad.ambientes} ambientes`}
              </p>

              <Link to={`/propiedades/${propiedad.id}`}>
                Ver propiedad
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
