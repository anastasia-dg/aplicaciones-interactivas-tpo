import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../servicios/api";
import type { Propiedad, RespuestaPropiedades } from "../tipos/Propiedad";
import "../estilos/Inicio.css";
import { OPCIONES_AMENITIES } from "../tipos/amenities";

export default function Inicio() {

  // Guardamos las propiedades recibidas del backend.
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);

  // Controlamos la carga y los errores.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Guardamos los valores que el usuario selecciona en los filtros.
  const [texto, setTexto] = useState("");
  const [zona, setZona] = useState("");
  const [operacion, setOperacion] = useState("");
  const [tipo, setTipo] = useState("");
  const [moneda, setMoneda] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("fecha");

  //cantidad mínima de ambientes.
  const [ambientesMin, setAmbientesMin] = useState("");

  //lista de amenities seleccionados.
  // Es un array porque podemos elegir varios al mismo tiempo.
  const [amenities, setAmenities] = useState<string[]>([]);

  // Guardamos los filtros que se envían al backend.
  const [filtros, setFiltros] = useState("");

  // Controlamos la paginación.
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cantidadPorPagina, setCantidadPorPagina] = useState(10);
  
  // Guarda los errores relacionados con los filtros.
  const [errorFiltros, setErrorFiltros] = useState("");

  // Buscamos las propiedades al abrir la página o cambiar los filtros.
  useEffect(() => {

    async function cargarPropiedades() {
      setCargando(true);
      setError("");

      try {
        // Preparamos los parámetros que vamos a enviar en la URL.
        const parametros = new URLSearchParams(filtros);

        parametros.set("page", String(pagina));
        parametros.set("limit", String(cantidadPorPagina));

        // Hacemos una petición GET al backend.
        const res = await fetch(
          `${API_URL}/propiedades?${parametros.toString()}`
        );

        if (!res.ok) {
          throw new Error("No se pudieron cargar las propiedades.");
        }

        // Convertimos la respuesta JSON a un objeto.
        const datos: RespuestaPropiedades & {
          paginacion: { totalPaginas: number };
        } = await res.json();

        // Guardamos las propiedades y el total de páginas.
        setPropiedades(datos.propiedades);
        setTotalPaginas(datos.paginacion.totalPaginas);

      } catch {
        setError("No se pudieron cargar las propiedades.");

      } finally {
        setCargando(false);
      }
    }

    cargarPropiedades();

  }, [filtros, pagina, cantidadPorPagina]);


  //agregamos o quitamos un amenity del array.
  function cambiarAmenity(amenity: string) {

    // includes() comprueba si el amenity ya está seleccionado.
    if (amenities.includes(amenity)) {

      // filter() crea un nuevo array sin el amenity elegido.
      setAmenities(amenities.filter((a) => a !== amenity));

    } else {

      // Si no estaba seleccionado, lo agregamos al array.
      setAmenities([...amenities, amenity]);
    }
  }


  
    function buscarPropiedades(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    // Limpiamos el error de la búsqueda anterior.
    setErrorFiltros("");

    // Si ingresaron ambos precios, comprobamos que el
    // mínimo no sea mayor que el máximo.
    if (
        precioMin !== "" &&
        precioMax !== "" &&
        Number(precioMin) > Number(precioMax)
    ) {
        setErrorFiltros(
        "El precio mínimo no puede ser mayor que el precio máximo."
        );
        return;
    }

    // Si los precios son válidos, continuamos con la búsqueda.
    const parametros = new URLSearchParams();


    // Agregamos solamente los filtros completados.
    if (texto.trim()) parametros.set("texto", texto.trim());
    if (zona.trim()) parametros.set("zona", zona.trim());
    if (operacion) parametros.set("operacion", operacion);
    if (tipo) parametros.set("tipo", tipo);
    if (moneda) parametros.set("moneda", moneda);
    if (precioMin) parametros.set("precioMin", precioMin);
    if (precioMax) parametros.set("precioMax", precioMax);

    // enviamos los ambientes mínimos si fueron seleccionados.
    if (ambientesMin) {
      parametros.set("ambientesMin", ambientesMin);
    }

    //join() une los amenities en un solo texto separado por comas.
    // Ejemplo: ["pileta", "cochera"] se convierte en "pileta,cochera".
    if (amenities.length > 0) {
      parametros.set("amenities", amenities.join(","));
    }

    // Ordenamos los resultados según la opción elegida.
    parametros.set("ordenarPor", ordenarPor);
    parametros.set("orden", ordenarPor === "fecha" ? "DESC" : "ASC");

    // Cada búsqueda nueva comienza desde la primera página.
    setPagina(1);
    setFiltros(parametros.toString());
  }


  // Limpiamos los filtros y volvemos al listado completo.
  function limpiarFiltros() {
    setTexto("");
    setZona("");
    setOperacion("");
    setTipo("");
    setMoneda("");
    setPrecioMin("");
    setPrecioMax("");
    setOrdenarPor("fecha");

    // Limpiamos también los filtros nuevos.
    setAmbientesMin("");
    setAmenities([]);

    setPagina(1);
    setFiltros("");
    // Borramos también el mensaje de error.
    setErrorFiltros("");
  }


  // Buscamos la foto marcada como portada.
  function obtenerPortada(propiedad: Propiedad) {
    return propiedad.fotos?.find((foto) => foto.esPortada)?.url;
  }


  // Mostramos el precio con formato argentino.
  function mostrarPrecio(propiedad: Propiedad) {
    return `${propiedad.moneda} ${Number(propiedad.precio).toLocaleString("es-AR")}`;
  }


  return (
    <main className="inicio">

      <h1>Encontrá tu próxima propiedad</h1>
      <p>Explorá propiedades en venta y alquiler.</p>

      {/* Formulario de búsqueda */}
      <form className="filtros-propiedades" onSubmit={buscarPropiedades}>
        <h2>Buscar propiedades</h2>

        <div className="campos-filtros">

          <div>
            <label htmlFor="texto">Buscar</label>
            <input
              id="texto"
              type="text"
              placeholder="Casa con pileta..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="zona">Zona</label>
            <input
              id="zona"
              type="text"
              placeholder="Ej: Palermo"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="operacion">Operación</label>
            <select
              id="operacion"
              value={operacion}
              onChange={(e) => setOperacion(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="VENTA">Venta</option>
              <option value="ALQUILER">Alquiler</option>
            </select>
          </div>

          <div>
            <label htmlFor="tipo">Tipo de propiedad</label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="CASA">Casa</option>
              <option value="DEPARTAMENTO">Departamento</option>
              <option value="TERRENO">Terreno</option>
              <option value="LOCAL">Local</option>
            </select>
          </div>

          <div>
            <label htmlFor="moneda">Moneda</label>
            <select
              id="moneda"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="USD">Dólares</option>
              <option value="ARS">Pesos</option>
            </select>
          </div>

          <div>
            <label htmlFor="precioMin">Precio mínimo</label>
            <input
              id="precioMin"
              type="number"
              min="0"
              placeholder="Desde"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="precioMax">Precio máximo</label>
            <input
              id="precioMax"
              type="number"
              min="0"
              placeholder="Hasta"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
            />
          </div>

          {/* elegimos la cantidad mínima de ambientes */}
          <div>
            <label htmlFor="ambientesMin">Ambientes mínimos</label>
            <select
              id="ambientesMin"
              value={ambientesMin}
              onChange={(e) => setAmbientesMin(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="1">1 o más</option>
              <option value="2">2 o más</option>
              <option value="3">3 o más</option>
              <option value="4">4 o más</option>
              <option value="5">5 o más</option>
            </select>
          </div>

          <div>
            <label htmlFor="ordenarPor">Ordenar por</label>
            <select
              id="ordenarPor"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
            >
              <option value="fecha">Más recientes</option>
              <option value="precio">Menor precio</option>
              <option value="superficie">Menor superficie</option>
            </select>
          </div>

        </div>


        
              {/* El usuario puede filtrar por varias características */}
              <div className="filtros-amenities">
                  <h3>Características</h3>

                  <div className="opciones-amenities">
                      {OPCIONES_AMENITIES.map((amenity) => (
                          <label key={amenity.valor}>
                              <input
                                  type="checkbox"
                                  checked={amenities.includes(amenity.valor)}
                                  onChange={() => cambiarAmenity(amenity.valor)}
                              />

                              {amenity.texto}
                          </label>
                      ))}
                  </div>
              </div>

        {/* Mostramos un mensaje si los precios son incorrectos */}
        {errorFiltros && (
        <p className="error-filtros">{errorFiltros}</p>
        )}

        {/* Botones del formulario */}
        <div className="botones-filtros">

          <button type="submit">
            Buscar propiedades
          </button>

          <button type="button" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>

        </div>
      </form>


      {/* Mensajes de carga y error */}
      {cargando && <p>Cargando propiedades...</p>}
      {error && <p className="mensaje-error">{error}</p>}


      {/* El usuario puede elegir cuántas propiedades mostrar */}
      <div className="cantidad-propiedades">
        <label htmlFor="cantidadPorPagina">
          Propiedades por página:
        </label>

        <select
          id="cantidadPorPagina"
          value={cantidadPorPagina}
          onChange={(e) => {
            setCantidadPorPagina(Number(e.target.value));
            setPagina(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>


      {/* Mostramos los resultados cuando terminó la carga */}
      {!cargando && !error && (
        <>

          {propiedades.length === 0 && (
            <p>No se encontraron propiedades con esos filtros.</p>
          )}

          {/* Creamos una tarjeta por cada propiedad */}
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


          {/* Paginación: permite avanzar o retroceder entre páginas */}
          {totalPaginas > 1 && (
            <div className="paginacion">

              <button
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
              >
                Anterior
              </button>

              <span>Página {pagina} de {totalPaginas}</span>

              <button
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
              >
                Siguiente
              </button>

            </div>
          )}

        </>
      )}

    </main>
  );
}
