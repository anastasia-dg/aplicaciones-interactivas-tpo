import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../servicios/api";
import type { Inmobiliaria } from "../tipos/Propiedad";
import "../estilos/MiInmobiliaria.css";

export default function MiInmobiliaria() {

  // Guardamos los datos de la inmobiliaria y el estado de la página.
  const [inmobiliaria, setInmobiliaria] = useState<Inmobiliaria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Recuperamos los datos guardados cuando el vendedor inició sesión.
  const token = localStorage.getItem("token");
  const inmobiliariaId = localStorage.getItem("inmobiliariaId");


  // OBTENER LOS DATOS DE LA INMOBILIARIA
  useEffect(() => {

    async function cargarInmobiliaria() {
      try {

        if (!token || !inmobiliariaId) {
          throw new Error("Iniciá sesión para ver tu inmobiliaria.");
        }

        // GET busca la información de nuestra inmobiliaria.
        const res = await fetch(
          `${API_URL}/inmobiliarias/${inmobiliariaId}`
        );

        if (!res.ok) {
          throw new Error("No se pudo cargar la inmobiliaria.");
        }

        // Convertimos la respuesta y guardamos los datos.
        const datos: Inmobiliaria = await res.json();
        setInmobiliaria(datos);

      } catch (err) {

        setError(
          err instanceof Error ? err.message : "Ocurrió un error."
        );

      } finally {

        setCargando(false);
      }
    }

    cargarInmobiliaria();

  }, []);


  // GUARDAR LOS CAMBIOS
  async function guardarCambios(e: React.SubmitEvent<HTMLFormElement>) {

    // Evitamos que el formulario recargue la página.
    e.preventDefault();

    setError("");
    setMensaje("");
    setGuardando(true);

    // FormData obtiene los valores de los inputs usando sus nombres
    const formulario = new FormData(e.currentTarget);

    // Armamos el objeto que vamos a enviar al backend.
    // trim elimina espacios en blanco al principio y final de un texto
    const datos = {
      nombre: String(formulario.get("nombre")).trim(),
      descripcion: String(formulario.get("descripcion")).trim(),
      telefonoContacto: String(formulario.get("telefonoContacto")).trim(),
      emailContacto: String(formulario.get("emailContacto")).trim(),

      // Si los campos opcionales están vacíos, enviamos null.
      urlLogo: String(formulario.get("urlLogo")).trim() || null,
      direccionOficina:
        String(formulario.get("direccionOficina")).trim() || null,
    };

    try {

      // PATCH modifica los datos de la inmobiliaria en la base de datos.
      const res = await fetch(
        `${API_URL}/inmobiliarias/${inmobiliariaId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datos),
        }
      );

      if (!res.ok) {
        const respuesta = await res.json();
        throw new Error(respuesta.message || "No se pudieron guardar los cambios.");
      }

      // Guardamos los datos actualizados para mostrarlos en pantalla.
      const actualizada: Inmobiliaria = await res.json();
      setInmobiliaria(actualizada);

      setMensaje("Los datos se actualizaron correctamente.");

    } catch (err) {

      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {

      setGuardando(false);
    }
  }


  if (cargando) {
    return <p>Cargando inmobiliaria...</p>;
  }

  if (!inmobiliaria) {
    return <p>{error || "No se encontró la inmobiliaria."}</p>;
  }

  return (
    <main className="pagina-mi-inmobiliaria">

      <Link to="/panel">Volver al panel</Link>

      <h1>Mi inmobiliaria</h1>
      <p>Consultá y modificá los datos de tu inmobiliaria.</p>

      {/* Mostramos el logo actual, si tiene uno. */}
      {inmobiliaria.urlLogo && (
        <img
          className="logo-mi-inmobiliaria"
          src={inmobiliaria.urlLogo}
          alt={`Logo de ${inmobiliaria.nombre}`}
        />
      )}

      {/* El formulario comienza con los datos que recibimos del backend. */}
      <form onSubmit={guardarCambios} className="formulario-inmobiliaria">

        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          defaultValue={inmobiliaria.nombre}
          required
          maxLength={120}
        />

        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={inmobiliaria.descripcion}
          required
        />

        <label htmlFor="telefonoContacto">Teléfono</label>
        <input
          id="telefonoContacto"
          name="telefonoContacto"
          defaultValue={inmobiliaria.telefonoContacto}
          required
        />

        <label htmlFor="emailContacto">Correo electrónico</label>
        <input
          id="emailContacto"
          name="emailContacto"
          type="email"
          defaultValue={inmobiliaria.emailContacto}
          required
        />

        <label htmlFor="direccionOficina">Dirección de la oficina</label>
        <input
          id="direccionOficina"
          name="direccionOficina"
          defaultValue={inmobiliaria.direccionOficina ?? ""}
        />

        {/* El logo se carga mediante una URL, igual que las fotos. */}
        <label htmlFor="urlLogo">URL del logo</label>
        <input
          id="urlLogo"
          name="urlLogo"
          type="url"
          defaultValue={inmobiliaria.urlLogo ?? ""}
          placeholder="https://..."
        />

        {/* Deshabilitamos el botón mientras se guardan los cambios. */}
        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>

      </form>

      {/* Mensajes de éxito o error después de guardar. */}
      {mensaje && <p className="mensaje-inmobiliaria">{mensaje}</p>}
      {error && <p className="error-inmobiliaria">{error}</p>}

    </main>
  );
}
