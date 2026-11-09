import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../servicios/api";
import "../estilos/Reportes.css";

// Definimos la estructura de los datos que devuelve el backend.
type Reporte = {
  propiedadesPorEstado: {
    estado: string;
    cantidad: number;
  }[];

  publicacionesPorMes: {
    mes: string;
    cantidad: number;
  }[];

  operacionesPorMes: {
    mes: string;
    estado: string;
    cantidad: number;
  }[];

  tiempoPromedioEnMercado: number | null;
};

export default function Reportes() {

  // Guardamos las estadísticas y controlamos la carga y los errores
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Recuperamos los datos guardados al iniciar sesión
  const token = localStorage.getItem("token");
  const inmobiliariaId = localStorage.getItem("inmobiliariaId");


  // OBTENER LOS REPORTES
  useEffect(() => {

    async function cargarReportes() {
      try {

        // Necesitamos el token y el ID de la inmobiliaria.
        if (!token || !inmobiliariaId) {
          throw new Error("Iniciá sesión para ver los reportes.");
        }

        // GET solicita las estadísticas de nuestra inmobiliaria.
        const res = await fetch(
          `${API_URL}/dashboard/${inmobiliariaId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("No se pudieron cargar los reportes.");
        }

        // Convertimos la respuesta JSON y guardamos los datos.
        const datos: Reporte = await res.json();
        setReporte(datos);

      } catch (err) {

        setError(
          err instanceof Error ? err.message : "Ocurrió un error."
        );

      } finally {

        // Dejamos de mostrar el mensaje de carga.
        setCargando(false);
      }
    }

    cargarReportes();

  }, []);


  // Sumamos las propiedades de todos los estados.
  // reduce() recorre el arreglo y va acumulando las cantidades.
  const totalPropiedades = reporte?.propiedadesPorEstado.reduce(
    (total, propiedad) => total + propiedad.cantidad,
    0
  ) ?? 0;


  if (cargando) {
    return <p>Cargando reportes...</p>;
  }

  if (error) {
    return <p className="error-reportes">{error}</p>;
  }

  if (!reporte) {
    return <p>No hay reportes disponibles.</p>;
  }

  return (
    <main className="pagina-reportes">

      <Link to="/panel">Volver al panel</Link>

      <h1>Reportes</h1>
      <p>Estadísticas de tu inmobiliaria.</p>

      {/* Mostramos los datos principales en dos tarjetas. */}
      <div className="resumen-reportes">

        <div className="tarjeta-reporte">
          <h2>Total de propiedades</h2>
          <p>{totalPropiedades}</p>
        </div>

        <div className="tarjeta-reporte">
          <h2>Tiempo promedio en el mercado</h2>
          <p>
            {reporte.tiempoPromedioEnMercado !== null
              ? `${reporte.tiempoPromedioEnMercado} días`
              : "Sin datos"}
          </p>
        </div>

      </div>


      {/* PROPIEDADES POR ESTADO */}
      <section className="seccion-reporte">

        <h2>Propiedades por estado</h2>

        {reporte.propiedadesPorEstado.length === 0 ? (
          <p>Todavía no hay propiedades registradas.</p>
        ) : (

          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
              </tr>
            </thead>

            <tbody>
              {/* map() crea una fila por cada estado. */}
              {reporte.propiedadesPorEstado.map(propiedad => (
                <tr key={propiedad.estado}>
                  <td>{propiedad.estado}</td>
                  <td>{propiedad.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

        )}

      </section>


      {/* PUBLICACIONES POR MES */}
      <section className="seccion-reporte">

        <h2>Publicaciones por mes</h2>

        {reporte.publicacionesPorMes.length === 0 ? (
          <p>Todavía no hay publicaciones.</p>
        ) : (

          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Publicaciones</th>
              </tr>
            </thead>

            <tbody>
              {/* Recorremos los meses que devuelve el backend. */}
              {reporte.publicacionesPorMes.map(publicacion => (
                <tr key={publicacion.mes}>
                  <td>{publicacion.mes}</td>
                  <td>{publicacion.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

        )}

      </section>


      {/* VENTAS Y ALQUILERES POR MES */}
      <section className="seccion-reporte">

        <h2>Ventas y alquileres por mes</h2>

        {reporte.operacionesPorMes.length === 0 ? (
          <p>Todavía no hay operaciones concretadas.</p>
        ) : (

          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Operación</th>
                <th>Cantidad</th>
              </tr>
            </thead>

            <tbody>
              {/* Cada fila representa ventas o alquileres de un mes. */}
              {reporte.operacionesPorMes.map((operacion, indice) => (
                <tr key={indice}>
                  <td>{operacion.mes}</td>
                  <td>
                    {operacion.estado === "VENDIDA"
                      ? "Ventas"
                      : "Alquileres"}
                  </td>
                  <td>{operacion.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

        )}

      </section>

    </main>
  );
}
