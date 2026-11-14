import { useState } from "react";
import {Link, useNavigate } from "react-router"; //para cambiar de pagina desde el codigo, sin hacer click en un enlace
import { API_URL } from "../servicios/api";
import "../estilos/Login.css";


export default function Login() {

    // Guardamos los datos del formulario.
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");

    // Controlamos los errores y el envío.
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    // Permite cambiar de página desde el código.
    const navigate = useNavigate();

    // Se ejecuta cuando el vendedor envía el formulario.
    async function iniciarSesion(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setCargando(true);

        try {
            // Enviamos el email y la contraseña al backend.
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ //convierte un objeto Javascript a texto con formato JSON
                    email,
                    contrasena,
                }),
            });

            // Comprobamos si las credenciales son correctas.
            if (!res.ok) {
                const datos = await res.json();
                throw new Error(datos.mensaje || "No se pudo iniciar sesión.");
            }

            // Recibimos los datos del vendedor y su token.
            const datos = await res.json();

            // Guardamos el token para las páginas del vendedor.
            localStorage.setItem("token", datos.token);

            // Guardamos la inmobiliaria del vendedor.
            localStorage.setItem("inmobiliariaId", String(datos.vendedor.inmobiliaria.id));

            // Después del login, llevamos al vendedor al panel principal.
            navigate("/panel");

        } catch (err) {
            // Mostramos el error si falla el inicio de sesión.
            setError(
                err instanceof Error ? err.message : "Ocurrió un error."
            );

        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="pagina-login">

            <h1>Iniciar sesión</h1>
            <p>Ingresá con tu cuenta de vendedor.</p>

            {/* Formulario de inicio de sesión. */}
            <form onSubmit={iniciarSesion}>

                <label htmlFor="email">Correo electrónico</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="contrasena">Contraseña</label>
                <input
                    id="contrasena"
                    type="password" //muestra los puntitos
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                />

                {/* Mostramos el error si existe. */}
                {error && <p className="error-login">{error}</p>}

                {/* Deshabilitamos el botón mientras se envía. */}
                <button type="submit" disabled={cargando}>
                    {cargando ? "Ingresando..." : "Iniciar sesión"}
                </button>

            </form>
            {/* Enlace para registrar un vendedor con su inmobiliaria */}
            <p className="enlace-registro">
                ¿Todavía no tenés una cuenta?{" "}
                <Link to="/registro">Registrá tu inmobiliaria</Link>
            </p>
        </main>
    );
}
