import { useEffect, useState } from "react";
// Link permite navegar sin recargar la página
// useParams obtiene los parámetros de la URL, como el ID
import { Link, useParams } from "react-router-dom";
// Dirección del backend y tipo de dato Propiedad.
import { API_URL } from "../servicios/api";
import type { Propiedad} from "../tipos/Propiedad";
// Estilos de esta página.
import "../estilos/DetallePropiedad.css";
import ComentariosPropiedad from "../componentes/ComentariosPropiedad";
import SolicitudVisita from "../componentes/SolicitudVisita";

export default function DetallePropiedad() {
  // Si la URL es /propiedades/7, id vale "7".
  const { id } = useParams();

  // Guarda la propiedad que recibimos del backend
  // Al principio es null porque todavía no cargamos los datos.
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null);

  // Indica si estamos esperando la respuesta del backend.
  const [cargando, setCargando] = useState(true);

  // Guarda un mensaje si ocurre algún error.
  const [error, setError] = useState<string | null>(null);

  // Guarda el ID de la foto que selecciona el usuario
  // Al principio es null porque todavía no eligió ninguna.
  const [fotoSeleccionada, setFotoSeleccionada] = useState<number | null>(null);

  // Se ejecuta cuando se abre la página o cambia el ID.
  useEffect(() => {
    async function cargarPropiedad() {
      try {
        // Pedimos al backend la propiedad con el ID de la URL.
        const res = await fetch(`${API_URL}/propiedades/${id}`);

        // Si la respuesta no es correcta, generamos un error.
        if (!res.ok) {
          throw new Error("No se encontró la propiedad");
        }

        // Convertimos la respuesta JSON en un objeto Propiedad.
        const datos: Propiedad = await res.json();

        // Guardamos los datos y React actualiza la pantalla.
        setPropiedad(datos);
      } catch {
        // Si falla la petición, mostramos un mensaje.
        setError("No se pudo cargar la propiedad.");
      } finally {
        // Se ejecuta tanto si la petición salió bien como si falló.
        setCargando(false);
      }
    }

    cargarPropiedad();
  }, [id]); // Si cambia el ID, volvemos a buscar la propiedad.

  // Mientras esperamos, mostramos un mensaje de carga.
  if (cargando) return <p>Cargando propiedad...</p>;

  // Si ocurrió un error, lo mostramos.
  if (error) return <p>{error}</p>;

  // Si no tenemos una propiedad, mostramos este mensaje.
  if (!propiedad) return <p>Propiedad no encontrada.</p>;

  
  // Ordenamos las fotos según el campo "orden".
  // Usamos una copia para no modificar el array original
  const fotosOrdenadas = [...(propiedad.fotos ?? [])].sort(
    (a, b) => a.orden - b.orden
  );

  // Buscamos la foto que está marcada como portada.
  const portada = fotosOrdenadas.find((foto) => foto.esPortada);

  // Buscamos la foto que el usuario seleccionó.
  const seleccionada = fotosOrdenadas.find(
    (foto) => foto.id === fotoSeleccionada
  );

  // Si seleccionó una foto, mostramos esa.
  // Si no, mostramos la portada o la primera disponible.
  const fotoPrincipal = seleccionada ?? portada ?? fotosOrdenadas[0];

    return (
        <main className="detalle-propiedad">
            {/* Link nos permite volver al inicio sin recargar la página. */}
            <Link to="/">Volver a propiedades</Link>

            {/* Mostramos el título de la propiedad. */}
            <h1>{propiedad.titulo}</h1>

            {/* Mostramos si es venta/alquiler y el tipo de propiedad. */}
            <p>{propiedad.operacion} · {propiedad.tipo}</p>


            {/* Galería de fotos de la propiedad. */}
            <section className="galeria-propiedad">

                {/* Mostramos la foto principal si hay imágenes cargadas. */}
                {fotoPrincipal ? (
                    <>
                        <img
                            className="foto-detalle"
                            src={fotoPrincipal.url}
                            alt={propiedad.titulo}
                        />

                        {/* Recorremos todas las fotos para mostrar las miniaturas. */}
                        <div className="miniaturas">
                            {fotosOrdenadas.map((foto) => (
                                <button
                                    key={foto.id}
                                    type="button"
                                    className={
                                        fotoPrincipal.id === foto.id
                                            ? "miniatura activa"
                                            : "miniatura"
                                    }
                                    onClick={() => setFotoSeleccionada(foto.id)}
                                    aria-label={`Ver foto ${foto.orden + 1}`}
                                    aria-pressed={fotoPrincipal.id === foto.id}
                                >
                                    <img
                                        src={foto.url}
                                        alt={`Foto ${foto.orden + 1} de ${propiedad.titulo}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    // Si la propiedad no tiene fotos, mostramos este mensaje.
                    <p>No hay fotos disponibles.</p>
                )}

            </section>


            {/* Convertimos el precio a número y le damos formato argentino. */}
            <h2>
                {propiedad.moneda}{" "}
                {Number(propiedad.precio).toLocaleString("es-AR")}
            </h2>

            {/* Dirección y zona donde se encuentra la propiedad. */}
            <p>{propiedad.direccion}, {propiedad.zona}</p>

            <h2>Características</h2>

            {/* Superficie total en metros cuadrados. */}
            <p>Superficie total: {propiedad.superficieTotalM2} m²</p>

            {/* Mostramos estos datos solamente si fueron informados. */}
            {propiedad.ambientes != null && (
                <p>Ambientes: {propiedad.ambientes}</p>
            )}

            {propiedad.dormitorios != null && (
                <p>Dormitorios: {propiedad.dormitorios}</p>
            )}

            {/* Descripción completa de la publicación. */}
            <h2>Descripción</h2>
            <p>{propiedad.descripcion}</p>

            {/* Información de la inmobiliaria que publicó la propiedad. */}
            <section className="datos-inmobiliaria">
                <h2>Publicado por</h2>

                {/* Enlace al perfil público de la inmobiliaria */}
                <h3>
                    <Link to={`/inmobiliarias/${propiedad.inmobiliaria.id}`}>
                        {propiedad.inmobiliaria.nombre}
                    </Link>
                </h3>

                {/* Descripción de la inmobiliaria. */}
                <p>{propiedad.inmobiliaria.descripcion}</p>

                {/* Datos de contacto. */}
                <p>Teléfono: {propiedad.inmobiliaria.telefonoContacto}</p>
                <p>Email: {propiedad.inmobiliaria.emailContacto}</p>

                {/* La dirección se muestra solamente si está cargada. */}
                {propiedad.inmobiliaria.direccionOficina && (
                    <p>Dirección: {propiedad.inmobiliaria.direccionOficina}</p>
                )}
            </section>
            {/* Mostramos los comentarios de esta propiedad. */}
            <ComentariosPropiedad propiedadId={propiedad.id} />
            
            {/* Formulario para que un interesado solicite una visita. */}
            <SolicitudVisita propiedadId={propiedad.id} />
        </main>
    );
}
