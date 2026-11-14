import { useState } from "react";
import { useNavigate } from "react-router";
import { API_URL } from "../servicios/api";
import "../estilos/NuevaPropiedad.css";
import { OPCIONES_AMENITIES } from "../tipos/amenities";

// Definimos cómo será cada foto antes de guardarla.
type FotoNueva = {
  url: string;
  esPortada: boolean;
};

export default function NuevaPropiedad() {

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Guarda las fotos que vamos agregando al formulario.
  const [fotos, setFotos] = useState<FotoNueva[]>([]);

  // Guarda la URL que estamos escribiendo.
  const [urlFoto, setUrlFoto] = useState("");

  const navigate = useNavigate();


  // AGREGAR UNA FOTO
  function agregarFoto() {

    // No agregamos una URL vacía.
    if (!urlFoto.trim()) return;

    // La primera foto se convierte automáticamente en portada.
    const nuevaFoto: FotoNueva = {
      url: urlFoto.trim(),
      esPortada: fotos.length === 0,
    };

    // Agregamos la foto al arreglo sin borrar las anteriores.
    setFotos([...fotos, nuevaFoto]);

    // Limpiamos el input para agregar otra imagen.
    setUrlFoto("");
  }


  // ELEGIR UNA FOTO COMO PORTADA
  function elegirPortada(indice: number) {

    // Recorremos todas las fotos.
    // Solo la seleccionada queda con esPortada en true.
    setFotos(
      fotos.map((foto, i) => ({
        ...foto,
        esPortada: i === indice,
      }))
    );
  }


  // ELIMINAR UNA FOTO
  function eliminarFoto(indice: number) {

    // filter devuelve todas las fotos menos la seleccionada.
    const nuevasFotos = fotos.filter((_, i) => i !== indice);

    // Si eliminamos la portada, elegimos otra automáticamente.
    if (nuevasFotos.length > 0 && !nuevasFotos.some(foto => foto.esPortada)) {
      nuevasFotos[0] = {
        ...nuevasFotos[0],
        esPortada: true,
      };
    }

    setFotos(nuevasFotos);
  }


  // CREAR LA PROPIEDAD
  async function crearPropiedad(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    // Para guardar necesitamos al menos una imagen.
    if (fotos.length === 0) {
      setError("Agregá al menos una foto de la propiedad.");
      return;
    }
    
    // FormData obtiene los datos escritos en el formulario
    const datos = new FormData(e.currentTarget);

    // Campos de texto obligatorios.
    const camposObligatorios = [
      "titulo",
      "descripcion",
      "direccion",
      "zona",
    ];

    // some() comprueba si al menos un campo está vacío.
    // trim() quita espacios al principio y al final.
    const hayCamposVacios = camposObligatorios.some(
      (campo) => !String(datos.get(campo) ?? "").trim()
    );

    // Si hay un campo vacío, mostramos el error y no guardamos.
    if (hayCamposVacios) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    // comenzamos a guardar la propiedad.
    setCargando(true);


    const token = localStorage.getItem("token");
    const inmobiliariaId = Number(localStorage.getItem("inmobiliariaId"));

    // Convierte un campo opcional a número o null.
    function numeroOpcional(nombre: string) {
      const valor = datos.get(nombre);
      return valor ? Number(valor) : null;
    }

    // Armamos el objeto con los datos de la propiedad.
    const propiedad = {
      titulo: String(datos.get("titulo")).trim(),
      descripcion: String(datos.get("descripcion")).trim(),
      tipo: datos.get("tipo"),
      operacion: datos.get("operacion"),
      precio: Number(datos.get("precio")),
      moneda: datos.get("moneda"),
      direccion: String(datos.get("direccion")).trim(),
      zona: String(datos.get("zona")).trim(),
      superficieTotalM2: Number(datos.get("superficieTotalM2")),
      superficieCubiertaM2: numeroOpcional("superficieCubiertaM2"),
      ambientes: numeroOpcional("ambientes"),
      dormitorios: numeroOpcional("dormitorios"),
      banios: numeroOpcional("banios"),
      antiguedadAnios: numeroOpcional("antiguedadAnios"),
      // getAll() obtiene todos los checkboxes marcados con name="tags".
      tags: datos.getAll("tags").map((tag) => String(tag)),
      inmobiliariaId,
    };

    try {

      if (!token || !inmobiliariaId) {
        throw new Error("Iniciá sesión nuevamente.");
      }

      // PASO 1: Guardamos la propiedad en el backend.
      const res = await fetch(`${API_URL}/propiedades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(propiedad),
      });

      if (!res.ok) {
        const respuesta = await res.json();
        throw new Error(respuesta.mensaje || "No se pudo crear la propiedad.");
      }

      // El backend devuelve la propiedad creada con su ID.
      const propiedadCreada = await res.json();

      // PASO 2: Guardamos las fotos relacionadas con ese ID.
      for (let i = 0; i < fotos.length; i++) {

        const foto = fotos[i];

        const resFoto = await fetch(
          `${API_URL}/fotos-propiedad/propiedad/${propiedadCreada.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url: foto.url,
              orden: i,
              esPortada: foto.esPortada,
            }),
          }
        );

        // Si alguna foto falla, avisamos y conservamos el borrador.
        if (!resFoto.ok) {
          throw new Error(
            "La propiedad se creó, pero no se pudieron guardar todas las fotos. Revisala desde Mis propiedades."
          );
        }
      }

      // Cuando terminamos, volvemos al listado.
      navigate("/panel/propiedades");

    } catch (err) {

      setError(
        err instanceof Error ? err.message : "Ocurrió un error."
      );

    } finally {

      // Volvemos a habilitar el botón.
      setCargando(false);
    }
  }


  return (
    <main className="pagina-nueva-propiedad">

      <h1>Publicar propiedad</h1>
      <p>Completá los datos y agregá las fotos de la propiedad.</p>

      <form onSubmit={crearPropiedad}>

        <label>Título</label>
        <input name="titulo" maxLength={160} required />

        <label>Descripción</label>
        <textarea name="descripcion" required />

        <label>Tipo de propiedad</label>
        <select name="tipo" required>
          <option value="CASA">Casa</option>
          <option value="DEPARTAMENTO">Departamento</option>
          <option value="TERRENO">Terreno</option>
          <option value="LOCAL">Local</option>
        </select>

        <label>Operación</label>
        <select name="operacion" required>
          <option value="VENTA">Venta</option>
          <option value="ALQUILER">Alquiler</option>
        </select>

        <label>Precio</label>
        <input
          name="precio"
          type="number"
          min="0.01"
          step="0.01"
          required
        />

        <label>Moneda</label>
        <select name="moneda">
          <option value="USD">USD</option>
          <option value="ARS">ARS</option>
        </select>

        <label>Dirección</label>
        <input name="direccion" maxLength={255} required />

        <label>Zona o barrio</label>
        <input name="zona" maxLength={120} required />

        <label>Superficie total (m²)</label>
        <input
          name="superficieTotalM2"
          type="number"
          min="0.01"
          step="0.01"
          required
        />

        <label>Superficie cubierta (m²)</label>
        <input
          name="superficieCubiertaM2"
          type="number"
          min="0.01"
          step="0.01"
        />

        <label>Ambientes</label>
        <input name="ambientes" type="number" min="0" />

        <label>Dormitorios</label>
        <input name="dormitorios" type="number" min="0" />

        <label>Baños</label>
        <input name="banios" type="number" min="0" />

        <label>Antigüedad (años)</label>
        <input name="antiguedadAnios" type="number" min="0" />
        
        {/* Amenities disponibles para esta propiedad */}
        <h2>Características de la propiedad</h2>

        <div className="opciones-formulario-amenities">
        {OPCIONES_AMENITIES.map((amenity) => (
            <label key={amenity.valor}>
            <input
                type="checkbox"
                name="tags"
                value={amenity.valor}
            />

            {amenity.texto}
            </label>
        ))}
        </div>



        {/* SECCIÓN DE FOTOS */}
        <h2>Fotos de la propiedad</h2>

        <p>Agregá imágenes y elegí cuál será la portada.</p>

        <label htmlFor="urlFoto">URL de la imagen</label>

        <input
          id="urlFoto"
          type="url"
          value={urlFoto}
          onChange={(e) => setUrlFoto(e.target.value)}
          placeholder="https://..."
        />

        {/* type="button" evita que se envíe el formulario. */}
        <button
          type="button"
          onClick={agregarFoto}
          disabled={cargando}
        >
          Agregar foto
        </button>

        {/* Mostramos las fotos antes de guardarlas. */}
        <div className="fotos-nueva-propiedad">

          {fotos.map((foto, indice) => (

            <div className="foto-nueva" key={indice}>

              <img src={foto.url} alt={`Foto ${indice + 1}`} />

              {/* Indicamos cuál es la portada. */}
              {foto.esPortada && <p>Portada</p>}

              {/* Permitimos elegir otra foto como portada. */}
              {!foto.esPortada && (
                <button
                  type="button"
                  onClick={() => elegirPortada(indice)}
                  disabled={cargando}
                >
                  Elegir como portada
                </button>
              )}

              {/* Eliminamos la foto del formulario. */}
              <button
                type="button"
                onClick={() => eliminarFoto(indice)}
                disabled={cargando}
              >
                Eliminar foto
              </button>

            </div>
          ))}
        </div>


        {/* Mensaje de error. */}
        {error && <p className="error-propiedad">{error}</p>}

        {/* Guardamos la propiedad y todas sus fotos. */}
        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Guardar propiedad"}
        </button>

      </form>
    </main>
  );
}
