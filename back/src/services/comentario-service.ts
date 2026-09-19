import { comentarioRepository } from "../repositories/comentario.repository";
import { propiedadRepository } from "../repositories/propiedad.repository";
import { actividadService } from "./actividad-service";
import { Comentario } from "../entities/comentario.entity";
import { TipoActividad } from "../entities/enums";


class ComentarioService {

  //LISTAR COMENTARIOS
  listar(): Promise<Comentario[]> {
    return comentarioRepository.listar();
  }


  //BUSCAR UN COMENTARIO POR ID
  async buscarPorId(id: number): Promise<Comentario> {

    // Buscamos el comentario en la base de datos.
    const comentario = await comentarioRepository.buscarPorId(id);

    // Si no existe, damos error
    if (!comentario) {
      throw new Error("Comentario no encontrado");
    }

    return comentario;
  }


  //BUSCAR COMENTARIOS DE UNA PROPIEDAD ESPECIFICA
  buscarPorPropiedad(propiedadId: number): Promise<Comentario[]> {
    return comentarioRepository.buscarPorPropiedad(propiedadId);
  }


  //CREAR UN COMENTARIO
  async crear(propiedadId: number, datos: Partial<Comentario>): Promise<Comentario> {

    //Comprobamos que la propiedad exista
    const propiedad = await propiedadRepository.buscarPorId(propiedadId);

    // Si no encontramos la propiedad, da error
    if (!propiedad) {
      throw new Error("Propiedad no encontrada");
    }

    //Creamos el comentario

    // Le agregamos a los datos la propiedad encontrada
    //asi el comentario queda relacionado con esa propiedad
    const comentario = await comentarioRepository.crear({...datos, propiedad: propiedad, respuesta: null,
      });


    //Creamos la actividad que llega al vendedor
    await actividadService.crear({
        // Indicamos qué ocurrió.
      tipo: TipoActividad.COMENTARIO,

      // Texto que después podemos mostrar en el feed
      descripcion:
        `Nuevo comentario en la propiedad "${propiedad.titulo}"`,

      // Una actividad nueva empieza como no leída.
      leida: false,

      // La notificación pertenece a la inmobiliaria dueña de la propiedad.
      inmobiliaria: propiedad.inmobiliaria,
    });


    //devolvemos el comentario creado.
    return comentario;
  }


  //RESPONDER UN COMENTARIO
  async responder(id: number, respuesta: string): Promise<Comentario> {
    //buscamos el comentario.
    const comentario = await this.buscarPorId(id);

    // REGLA: un comentario puede tener UNA SOLA respuesta.

    // Si respuesta ya tiene contenido significa que el vendedor ya respondio
    if (comentario.respuesta) {
      throw new Error(
        "El comentario ya fue respondido"
      );
    }

    // Guardamos la respuesta en el comentario.
    comentario.respuesta = respuesta;

    // Le pedimos al Repository que guarde el comentario actualizado.
    return comentarioRepository.actualizar(comentario);
  }


  //ELIMINAR COMENTARIO
  async eliminar(id: number): Promise<void> {

    //verificamos que exista
    await this.buscarPorId(id);

    //si existe, lo eliminamos.
    await comentarioRepository.eliminar(id);
  }
}

// Creamos una instancia para utilizar desde Controllers
export const comentarioService =
  new ComentarioService();