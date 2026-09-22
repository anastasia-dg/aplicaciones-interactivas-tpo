import { reseñaRepository } from "../repositories/resena.repository";
import { inmobiliariaRepository } from "../repositories/inmobiliaria.repository";
import { actividadService } from "./actividad-service";
import { Reseña } from "../entities/reseña.entity";
import { TipoActividad } from "../entities/enums";
import { CrearReseñaDto } from "../dtos/resena-dto";


class ResenaService {

// Devuelve todas las reseñas guardadas en la BD.
  listar(): Promise<Reseña[]> {
    return reseñaRepository.listar();
  }


  // BUSCAR UNA RESEÑA POR ID
  async buscarPorId(id: number): Promise<Reseña> {

    // Buscamos la reseña en la base de datos.
    const reseña = await reseñaRepository.buscarPorId(id);

    // Si no existe una reseña con ese ID, da error
    if (!reseña) {
      throw new Error("Reseña no encontrada");
    }
    // Si existe, la devolvemos.
    return reseña;
  }


  // BUSCAR RESEÑAS DE UNA INMOBILIARIA ESPECIFICA
  buscarPorInmobiliaria(inmobiliariaId: number): Promise<Reseña[]> {
    return reseñaRepository.buscarPorInmobiliaria(inmobiliariaId);
  }


  // CREAR UNA RESEÑA
  async crear(inmobiliariaId: number, datos: CrearReseñaDto): Promise<Reseña> {

    // Comprobamos que la inmobiliaria exista
    const inmobiliaria = await inmobiliariaRepository.buscarPorId(inmobiliariaId);

    // Si no existe, no podemos crearle una reseña.
    if (!inmobiliaria) {
      throw new Error("Inmobiliaria no encontrada");
    }


    // validar la calificacion (tiene que ser un entero, minimo 1 y maximo 5)
    //
    // Si cualquiera de estas condiciones se cumple, significa que la calificación es inválida.
    if (
      datos.calificacion === undefined || //esta vacio?
      !Number.isInteger(datos.calificacion) || //es entero?
      datos.calificacion < 1 ||
      datos.calificacion > 5
    ) {
      throw new Error(
        "La calificación debe ser un número entero entre 1 y 5"
      );
    }

    // Crear la reseña
    const reseña = await reseñaRepository.crear({
        // Guardamos los datos que ya fueron validados por el DTO
        nombreAutor: datos.nombreAutor,
        contenido: datos.contenido,
        calificacion: datos.calificacion,
        // Relacionamos la reseña con la inmobiliaria ue buscamos y comprobamos que existe.
        inmobiliaria: inmobiliaria,
    });


    //Crear una actividad
    await actividadService.crear({

      // Indicamos que ocurrió una nueva reseña.
      tipo: TipoActividad.RESENA,

      // Texto para mostrar en la actividad
      descripcion:
        `Nueva reseña para la inmobiliaria "${inmobiliaria.nombre}"`,

      // Como la actividad acaba de crearse todavía no fue leída.
      leida: false,

      // Indicamos a qué inmobiliaria pertenece esta actividad.
      inmobiliaria: inmobiliaria,
    });

    //Devolvemos la reseña creada.
    return reseña;
  }

  // ELIMINAR UNA RESEÑA
  async eliminar(id: number): Promise<void> {

    //comprobamos que la reseña exista.
    await this.buscarPorId(id);

    // Si llegamos hasta acá significa que sí existe, entonces la eliminamos.
    await reseñaRepository.eliminar(id);
  }
}


// Creamos una instancia del Service para poder usarla
export const resenaService = new ResenaService();