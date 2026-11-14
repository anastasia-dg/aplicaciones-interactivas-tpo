import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../servicios/api";
import "../estilos/Registro.css";

export default function Registro() {
  const navigate = useNavigate();

  // Guardamos los datos del vendedor.
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");

  // Guardamos los datos de la inmobiliaria.
  const [nombreInmobiliaria, setNombreInmobiliaria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [direccionOficina, setDireccionOficina] = useState("");
  const [urlLogo, setUrlLogo] = useState("");

  // Controlamos el envío y los errores.
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Se ejecuta cuando enviamos el formulario.
  async function registrar(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // Enviamos vendedor e inmobiliaria juntos al backend.
      const res = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendedor: {
            nombreCompleto,
            email,
            contrasena,
            telefono: telefono || null,
          },
          inmobiliaria: {
            nombre: nombreInmobiliaria,
            descripcion,
            telefonoContacto,
            emailContacto,
            direccionOficina: direccionOficina || null,
            urlLogo: urlLogo || null,
          },
        }),
      });

      // Si el backend rechaza los datos, mostramos el error.
      if (!res.ok) {
        const datos = await res.json();
        throw new Error(datos.mensaje || "No se pudo registrar.");
      }

      // Después del registro, vamos al login.
      navigate("/login");

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="pagina-registro">
      <h1>Crear cuenta</h1>
      <p>Registrá tu inmobiliaria para publicar propiedades.</p>

      <form onSubmit={registrar}>
        <h2>Datos del vendedor</h2>

        <label>Nombre completo</label>
        <input value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          maxLength={120} required />

        <label>Correo electrónico</label>
        <input type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />

        <label>Contraseña</label>
        <input type="password" value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required />

        <label>Teléfono (opcional)</label>
        <input value={telefono}
          onChange={(e) => setTelefono(e.target.value)} />

        <h2>Datos de la inmobiliaria</h2>

        <label>Nombre de la inmobiliaria</label>
        <input value={nombreInmobiliaria}
          onChange={(e) => setNombreInmobiliaria(e.target.value)}
          required />

        <label>Descripción</label>
        <textarea value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required />

        <label>Teléfono de contacto</label>
        <input value={telefonoContacto}
          onChange={(e) => setTelefonoContacto(e.target.value)}
          required />

        <label>Email de contacto</label>
        <input type="email" value={emailContacto}
          onChange={(e) => setEmailContacto(e.target.value)}
          required />

        <label>Dirección de oficina (opcional)</label>
        <input value={direccionOficina}
          onChange={(e) => setDireccionOficina(e.target.value)} />

        <label>URL del logo (opcional)</label>
        <input value={urlLogo}
          onChange={(e) => setUrlLogo(e.target.value)} />

        {error && <p className="mensaje-error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <p>¿Ya tenés una cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </main>
  );
}
