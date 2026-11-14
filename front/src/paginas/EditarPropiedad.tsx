import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { API_URL } from "../servicios/api";
import type { Propiedad } from "../tipos/Propiedad";
import "../estilos/EditarPropiedad.css";
import { OPCIONES_AMENITIES } from "../tipos/amenities";


type PropiedadEditable = Propiedad & {
  superficieCubiertaM2: number | string | null;
  banios: number | null;
  antiguedadAnios: number | null;
  tags: string[];
};

export default function EditarPropiedad() {

  // Obtenemos el ID desde la URL
  const { id } = useParams();

  // Guardamos los datos que recibimos del backend
  const [propiedad, setPropiedad] = useState<PropiedadEditable | null>(null);

  // Guarda la URL de la foto que agregamos
  const [url, setUrl] = useState("");

  // Mensajes para informar errores o acciones exitosas
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Controlamos cuándo se está cargando o guardando información
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Recuperamos el token que guardamos al iniciar sesión.
  // Lo usamos para acceder a las rutas privadas del backend.
  const token = localStorage.getItem("token");


  // BUSCAR LA PROPIEDAD
  async function cargarPropiedad() {
    try {

      // GET solicita los datos de una propiedad existente.
      // Usamos la ruta privada porque también necesitamos
      // acceder a propiedades que todavía están en BORRADOR.
      const res = await fetch(
        `${API_URL}/propiedades/mis-propiedades/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Si el backend rechaza la petición, mostramos el motivo.
        if (!res.ok) {

        // Obtenemos el mensaje que envió el backend.
        const datos = await res.json();

        throw new Error(
            datos.mensaje || "No se pudo cargar la propiedad."
        );
        }

      // Convertimos la respuesta JSON en un objeto de JavaScript.
      const datos: PropiedadEditable = await res.json();

      // Guardamos la propiedad para mostrarla en pantalla.
      setPropiedad(datos);

    } catch (err) {

      // Si ocurre un error, mostramos su mensaje.
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {

      // Dejamos de mostrar el mensaje de carga.
      setCargando(false);
    }
  }

  // useEffect ejecuta la función cuando se abre la página.
  // También vuelve a ejecutarse si cambia el ID de la URL.
  useEffect(() => {
    cargarPropiedad();
  }, [id]);


  // GUARDAR LOS CAMBIOS DE LA PROPIEDAD
  async function guardarCambios(e: React.SubmitEvent<HTMLFormElement>) {

    // Evitamos que el formulario recargue la página.
    e.preventDefault();

    // Limpiamos los mensajes anteriores.
    setError("");
    setMensaje("");

    // Deshabilitamos los botones mientras se guarda.
    setGuardando(true);

    // FormData obtiene los valores de todos los campos
    // que tengan el atributo name dentro del formulario.
    const datos = new FormData(e.currentTarget);

    // Los inputs devuelven textos.
    // Esta función convierte los campos opcionales a números.
    // Si están vacíos, devuelve null.
    function numeroOpcional(nombre: string) {
      const valor = datos.get(nombre);
      return valor ? Number(valor) : null;
    }

    // Creamos un objeto con los valores actualizados.
    const cambios = {
      titulo: datos.get("titulo"),
      descripcion: datos.get("descripcion"),
      tipo: datos.get("tipo"),
      operacion: datos.get("operacion"),

      // Convertimos el precio a número porque el backend lo exige.
      precio: Number(datos.get("precio")),

      moneda: datos.get("moneda"),
      direccion: datos.get("direccion"),
      zona: datos.get("zona"),

      superficieTotalM2: Number(datos.get("superficieTotalM2")),
      superficieCubiertaM2: numeroOpcional("superficieCubiertaM2"),
      ambientes: numeroOpcional("ambientes"),
      dormitorios: numeroOpcional("dormitorios"),
      banios: numeroOpcional("banios"),
      antiguedadAnios: numeroOpcional("antiguedadAnios"),

      // Obtenemos todas las características seleccionadas.
      tags: datos.getAll("tags").map((tag) => String(tag)),
    };

    try {

      // PATCH modifica una propiedad que ya existe.
      const res = await fetch(`${API_URL}/propiedades/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        // JSON.stringify convierte el objeto en texto JSON.
        body: JSON.stringify(cambios),
      });

      // Si el backend rechaza los cambios, mostramos el motivo.
      if (!res.ok) {
        const respuesta = await res.json();

        throw new Error(
          respuesta.mensaje || "No se pudieron guardar los cambios."
        );
      }

      setMensaje("Cambios guardados correctamente.");

      // Volvemos a buscar la propiedad para obtener
      // los datos actualizados desde la base de datos.
      await cargarPropiedad();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      setGuardando(false);
    }
  }


  // AGREGAR UNA FOTO
  async function agregarFoto(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMensaje("");
    setGuardando(true);

    try {

      // POST crea una foto y la relaciona con esta propiedad
      const res = await fetch(
        `${API_URL}/fotos-propiedad/propiedad/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            url,

            // La nueva foto se coloca después de las existentes.
            orden: propiedad?.fotos?.length ?? 0,

            // Si no hay fotos, la primera se marca como portada.
            esPortada: !propiedad?.fotos?.length,
          }),
        }
      );

      if (!res.ok) {
        const datos = await res.json();
        throw new Error(datos.message || "No se pudo agregar la foto.");
      }

      // Limpiamos el input después de guardar.
      setUrl("");

      setMensaje("Foto agregada correctamente.");

      // Actualizamos la galería para mostrar la foto nueva.
      await cargarPropiedad();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      setGuardando(false);
    }
  }


  // ELEGIR UNA FOTO COMO PORTADA
  async function elegirPortada(fotoId: number) {
    setError("");
    setMensaje("");
    setGuardando(true);

    try {

      // PATCH modifica una foto existente.
      // Le enviamos el ID de la foto seleccionada.
      const res = await fetch(`${API_URL}/fotos-propiedad/${fotoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        // Marcamos esta foto como portada
        // El backend quita automáticamente la portada anterior
        body: JSON.stringify({
          esPortada: true,
        }),
      });

      if (!res.ok) {
        const datos = await res.json();
        throw new Error(
          datos.message || "No se pudo cambiar la portada."
        );
      }

      setMensaje("Portada actualizada correctamente.");

      // Volvemos a cargar las fotos para mostrar la nueva portada.
      await cargarPropiedad();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      setGuardando(false);
    }
  }


  // ELIMINAR UNA FOTO
  async function eliminarFoto(fotoId: number) {

    // Mostramos una confirmación antes de eliminar
    // Si el usuario cancela, no hacemos nada.
    if (!window.confirm("¿Querés eliminar esta foto?")) return;

    setError("");
    setMensaje("");
    setGuardando(true);

    try {

      // DELETE elimina la foto identificada por su ID.
      const res = await fetch(`${API_URL}/fotos-propiedad/${fotoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const datos = await res.json();
        throw new Error(datos.message || "No se pudo eliminar la foto.");
      }

      setMensaje("Foto eliminada correctamente.");

      // Actualizamos la galería para que desaparezca la foto.
      await cargarPropiedad();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      setGuardando(false);
    }
  }

  // CAMBIAR EL ORDEN DE LAS FOTOS
  async function moverFoto(indice: number, direccion: number) {

    // Creamos una copia de las fotos ordenadas.
    const fotos = [...(propiedad?.fotos ?? [])].sort(
      (a, b) => a.orden - b.orden
    );

    // Calculamos la nueva posición.
    const nuevaPosicion = indice + direccion;

    // Si intenta salir de los límites, no hacemos nada
    if (nuevaPosicion < 0 || nuevaPosicion >= fotos.length) {
      return;
    }

    setError("");
    setMensaje("");
    setGuardando(true);

    try {

      // Intercambiamos las dos fotos de posición
      const fotoActual = fotos[indice];
      const fotoVecina = fotos[nuevaPosicion];

      // PATCH actualiza el orden de la primera foto
      const res1 = await fetch(
        `${API_URL}/fotos-propiedad/${fotoActual.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orden: nuevaPosicion,
          }),
        }
      );

      if (!res1.ok) {
        const datos = await res1.json();
        throw new Error(datos.message || "No se pudo mover la foto.");
      }

      // Actualizamos la posición de la foto vecina.
      const res2 = await fetch(
        `${API_URL}/fotos-propiedad/${fotoVecina.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orden: indice,
          }),
        }
      );

      if (!res2.ok) {
        const datos = await res2.json();
        throw new Error(datos.message || "No se pudo completar el cambio.");
      }

      // Volvemos a cargar las fotos desde el backend.
      await cargarPropiedad();

      setMensaje("Orden de las fotos actualizado.");

    } catch (err) {

      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

      // Recargamos porque podría haberse guardado
      // solamente una de las dos modificaciones.
      await cargarPropiedad();

    } finally {
      setGuardando(false);
    }
  }



  // CAMBIAR EL ESTADO DE LA PROPIEDAD
  async function cambiarEstado(nuevoEstado: string) {
    setError("");
    setMensaje("");
    setGuardando(true);

    try {

      // PATCH modifica únicamente el estado
      // El backend verifica si el cambio está permitido
      const res = await fetch(`${API_URL}/propiedades/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      });

      if (!res.ok) {
        const datos = await res.json();
        throw new Error(
          datos.mensaje || "No se pudo cambiar el estado."
        );
      }

      setMensaje("Estado actualizado correctamente.");

      // Actualizamos la propiedad para mostrar su nuevo estado
      await cargarPropiedad();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {
      setGuardando(false);
    }
  }


  // Mientras esperamos los datos, mostramos un mensaje.
  if (cargando) {
    return <p>Cargando propiedad...</p>;
  }

  // Si la propiedad no existe, evitamos mostrar el formulario.
  if (!propiedad) {
    return <p>{error || "Propiedad no encontrada."}</p>;
  }

  // Las propiedades finalizadas no se pueden modificar.
  // includes comprueba si el estado está dentro del arreglo.
  const finalizada = ["VENDIDA", "ALQUILADA", "CANCELADA"]
    .includes(propiedad.estado);
  // Ordenamos las fotos para mostrarlas en su posición correcta.
  const fotosOrdenadas = [...(propiedad.fotos ?? [])].sort(
  (a, b) => a.orden - b.orden
  );


  return (
    <main className="pagina-editar-propiedad">

      {/* Volvemos al listado sin recargar toda la aplicación. */}
      <Link to="/panel/propiedades">
        Volver a Mis propiedades
      </Link>

      <h1>Editar propiedad</h1>

      {/* Mostramos el estado actual. */}
      <p>
        Estado actual: <strong>{propiedad.estado}</strong>
      </p>


      {/* FORMULARIO DE EDICIÓN */}
      {/* defaultValue coloca los datos existentes en los inputs. */}
      {/* onSubmit ejecuta guardarCambios al enviar el formulario. */}
      <form
        key={propiedad.id}
        onSubmit={guardarCambios}
        className="formulario-editar"
      >

        <h2>Datos generales</h2>

        <label>Título</label>
        <input
          name="titulo"
          defaultValue={propiedad.titulo}
          maxLength={160}
          required
          disabled={finalizada || guardando} //para desabilitar un elemento (boton o input)
        />

        <label>Descripción</label>
        <textarea
          name="descripcion"
          defaultValue={propiedad.descripcion}
          required
          disabled={finalizada || guardando}
        />

        {/* Los select muestran la opción guardada anteriormente. */}
        <label>Tipo de propiedad</label>
        <select
          name="tipo"
          defaultValue={propiedad.tipo}
          disabled={finalizada || guardando}
        >
          <option value="CASA">Casa</option>
          <option value="DEPARTAMENTO">Departamento</option>
          <option value="TERRENO">Terreno</option>
          <option value="LOCAL">Local</option>
        </select>

        <label>Operación</label>
        <select
          name="operacion"
          defaultValue={propiedad.operacion}
          disabled={finalizada || guardando}
        >
          <option value="VENTA">Venta</option>
          <option value="ALQUILER">Alquiler</option>
        </select>


        <h2>Precio</h2>

        {/* El precio debe ser mayor que cero. */}
        <label>Precio</label>
        <input
          name="precio"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={propiedad.precio}
          required
          disabled={finalizada || guardando}
        />

        <label>Moneda</label>
        <select
          name="moneda"
          defaultValue={propiedad.moneda}
          disabled={finalizada || guardando}
        >
          <option value="USD">USD</option>
          <option value="ARS">ARS</option>
        </select>


        <h2>Ubicación</h2>

        <label>Dirección</label>
        <input
          name="direccion"
          defaultValue={propiedad.direccion}
          maxLength={255}
          required
          disabled={finalizada || guardando}
        />

        <label>Zona o barrio</label>
        <input
          name="zona"
          defaultValue={propiedad.zona}
          maxLength={120}
          required
          disabled={finalizada || guardando}
        />


        <h2>Características</h2>

        {/* Los campos numéricos opcionales pueden quedar vacíos. */}
        <label>Superficie total (m²)</label>
        <input
          name="superficieTotalM2"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={propiedad.superficieTotalM2 ?? ""}
          required
          disabled={finalizada || guardando}
        />

        <label>Superficie cubierta (m²)</label>
        <input
          name="superficieCubiertaM2"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={propiedad.superficieCubiertaM2 ?? ""}
          disabled={finalizada || guardando}
        />

        <label>Ambientes</label>
        <input
          name="ambientes"
          type="number"
          min="0"
          defaultValue={propiedad.ambientes ?? ""}
          disabled={finalizada || guardando}
        />

        <label>Dormitorios</label>
        <input
          name="dormitorios"
          type="number"
          min="0"
          defaultValue={propiedad.dormitorios ?? ""}
          disabled={finalizada || guardando}
        />

        <label>Baños</label>
        <input
          name="banios"
          type="number"
          min="0"
          defaultValue={propiedad.banios ?? ""}
          disabled={finalizada || guardando}
        />

        <label>Antigüedad (años)</label>
        <input
          name="antiguedadAnios"
          type="number"
          min="0"
          defaultValue={propiedad.antiguedadAnios ?? ""}
          disabled={finalizada || guardando}
        />

        
        {/* Mostramos marcadas las características que ya tiene la propiedad */}
        <h2>Características de la propiedad</h2>

        <div className="opciones-formulario-amenities">
        {OPCIONES_AMENITIES.map((amenity) => (
            <label key={amenity.valor}>
            <input
                type="checkbox"
                name="tags"
                value={amenity.valor}
                //defaultChecked hace que al abrir la edicion aparezcan seleccionadas las caract que la prop tiene guardadas
                defaultChecked={propiedad.tags?.includes(amenity.valor)}
            />

            {amenity.texto}
            </label>
        ))}
        </div>


        {/* Si la propiedad está finalizada, ocultamos Guardar cambios. */}
        {!finalizada && (
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
      </form>


      {/* GALERÍA DE FOTOS */}
      <h2>Fotos de la propiedad</h2>

      {/* map recorre el arreglo y crea una tarjeta por cada foto. */}
      <div className="fotos-editar">
        {fotosOrdenadas.map((foto, indice) => (
          <div className="tarjeta-foto-editar" key={foto.id}>

            <img
              src={foto.url}
              alt="Foto de la propiedad"
            />

            {/* BOTONES PARA ORDENAR LAS FOTOS */}
            {!finalizada && (
            <div className="botones-orden-fotos">

                {/* Mover la foto una posición hacia arriba */}
                <button
                type="button"
                onClick={() => moverFoto(indice, -1)}
                disabled={guardando || indice === 0}
                >
                ↑ Subir
                </button>

                {/* Mover la foto una posición hacia abajo */}
                <button
                type="button"
                onClick={() => moverFoto(indice, 1)}
                disabled={guardando || indice === fotosOrdenadas.length - 1}
                >
                ↓ Bajar
                </button>

            </div>
            )}


            {/* Indicamos cuál es la portada actual. */}
            {foto.esPortada && <p>Portada actual</p>}

            {/* Las fotos que no son portada pueden seleccionarse. */}
            {!foto.esPortada && !finalizada && (
              <button
                type="button"
                onClick={() => elegirPortada(foto.id)}
                disabled={guardando}
              >
                Elegir como portada
              </button>
            )}

            {/* Permitimos eliminar fotos. */}
            {/* Si es la portada de una propiedad publicada,
                primero hay que elegir otra portada. */}
            {!finalizada && (
              <button
                type="button"
                onClick={() => eliminarFoto(foto.id)}
                disabled={
                  guardando ||
                  (foto.esPortada && propiedad.estado === "PUBLICADA")
                }
              >
                Eliminar foto
              </button>
            )}

          </div>
        ))}
      </div>


      {/* FORMULARIO PARA AGREGAR FOTOS */}
      {!finalizada && (
        <form onSubmit={agregarFoto}>

          <label htmlFor="url">URL de la foto</label>

          {/* El input está conectado al estado url. */}
          {/* onChange actualiza ese estado mientras escribimos. */}
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            required
            disabled={guardando}
          />

          <button type="submit" disabled={guardando}>
            Agregar foto
          </button>

        </form>
      )}


      
        {/* CAMBIOS DE ESTADO */}
        <section className="seccion-estados">

        <h2>Estado de la propiedad</h2>

        {/* Mostramos el estado actual */}
        <p className="estado-actual">
            Estado actual:
            <span>{propiedad.estado}</span>
        </p>

        {/* Agrupamos las acciones principales */}
        <div className="acciones-estado">

            {/* BORRADOR -> PUBLICADA */}
            {propiedad.estado === "BORRADOR" && (
            <button
                type="button"
                onClick={() => cambiarEstado("PUBLICADA")}
                disabled={guardando || !propiedad.fotos?.length}
            >
                Publicar propiedad
            </button>
            )}

            {/* PUBLICADA -> PAUSADA o RESERVADA */}
            {propiedad.estado === "PUBLICADA" && (
            <>
                <button
                type="button"
                onClick={() => cambiarEstado("PAUSADA")}
                disabled={guardando}
                >
                Pausar publicación
                </button>

                <button
                type="button"
                onClick={() => cambiarEstado("RESERVADA")}
                disabled={guardando}
                >
                Marcar como reservada
                </button>

                <Link
                to={`/propiedades/${propiedad.id}`}
                className="boton-ver-publicacion"
                >
                Ver publicación
                </Link>
            </>
            )}

            {/* PAUSADA -> PUBLICADA */}
            {propiedad.estado === "PAUSADA" && (
            <button
                type="button"
                onClick={() => cambiarEstado("PUBLICADA")}
                disabled={guardando}
            >
                Volver a publicar
            </button>
            )}

            {/* RESERVADA -> VENDIDA o ALQUILADA */}
            {propiedad.estado === "RESERVADA" && (
            <button
                type="button"
                onClick={() =>
                cambiarEstado(
                    propiedad.operacion === "VENTA" ? "VENDIDA" : "ALQUILADA"
                )
                }
                disabled={guardando}
            >
                {propiedad.operacion === "VENTA"
                ? "Marcar como vendida"
                : "Marcar como alquilada"}
            </button>
            )}

            {/* Si ya finalizó, no hay más cambios posibles */}
            {finalizada && (
            <p>Esta propiedad ya no admite cambios de estado.</p>
            )}

        </div>

        {/* Separamos la cancelación de las demás acciones */}
        {!finalizada && (
            <div className="zona-cancelar">

            <p>Esta acción no se puede deshacer.</p>

            <button
                type="button"
                className="boton-cancelar-propiedad"
                disabled={guardando}
                onClick={() => {
                if (window.confirm(
                    "¿Estás segura de que querés cancelar esta propiedad?"
                )) {
                    cambiarEstado("CANCELADA");
                }
                }}
            >
                Cancelar propiedad
            </button>

            </div>
        )}

        </section>


      {/* MENSAJES DE RESULTADO */}
      {/* && muestra el elemento solo si existe el mensaje. */}
      {error && <p className="error-propiedad">{error}</p>}
      {mensaje && <p>{mensaje}</p>}

    </main>
  );
}
