import { In, Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Comentario } from "../entities/comentario.entity";
import { EstadoPropiedad } from "../entities/enums";


class ComentarioRepository {

  // Obtiene el repository de TypeORM correspondiente a Comentario.
  private get repository(): Repository<Comentario> {
    return AppDataSource.getRepository(Comentario);
  }

  
  // Lista únicamente comentarios de propiedades publicadas.
  listar(): Promise<Comentario[]> {
    return this.repository.find({

      // Mostramos comentarios de propiedades publicadas
      // y también de propiedades finalizadas.
      where: {
        propiedad: {
          estado: In([ //In permite buscar registros cuyo estado coincida con los valores en la lista
            EstadoPropiedad.PUBLICADA,
            EstadoPropiedad.VENDIDA,
            EstadoPropiedad.ALQUILADA,
            EstadoPropiedad.CANCELADA,
          ]),
        },
      },

      // Incluimos la propiedad relacionada.
      relations: ["propiedad"],
    });
  }


  // Busca UN comentario según su ID.
  // Devuelve el comentario si existe o null si no lo encuentra.
  buscarPorId(id: number): Promise<Comentario | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["propiedad"],
    });
  }

  // Busca todos los comentarios que pertenecen a una propiedad.
  buscarPorPropiedad(propiedadId: number): Promise<Comentario[]> {
    return this.repository.find({
      where: {
        propiedad: {
          id: propiedadId,
        },
      },
      relations: ["propiedad"],
    });
  }
  
  // Busca un comentario público por su ID.
  buscarPublicoPorId(id: number): Promise<Comentario | null> {
    return this.repository.findOne({
      where: {
        id,

        // Solo si pertenece a una propiedad publicada.
        propiedad: {
          estado: In([
            EstadoPropiedad.PUBLICADA,
            EstadoPropiedad.VENDIDA,
            EstadoPropiedad.ALQUILADA,
            EstadoPropiedad.CANCELADA,
          ]),
        },
      },

      relations: ["propiedad"],
    });
  }

  // Busca los comentarios públicos de una propiedad.
  buscarPublicosPorPropiedad(
    propiedadId: number
  ): Promise<Comentario[]> {
    return this.repository.find({
      where: {
        propiedad: {
          id: propiedadId,
          estado: In([
            EstadoPropiedad.PUBLICADA,
            EstadoPropiedad.VENDIDA,
            EstadoPropiedad.ALQUILADA,
            EstadoPropiedad.CANCELADA,
          ]),
        },
      },

      relations: ["propiedad"],
    });
  }



  // Recibe los datos para crear un comentario.
  crear(datos: Partial<Comentario>): Promise<Comentario> {
    // create() arma el objeto Comentario en memoria.
    const comentario = this.repository.create(datos);

    // save() guarda el comentario en la base de datos.
    return this.repository.save(comentario);
  }


  // Guarda cambios sobre un comentario existente.
  actualizar(comentario: Comentario): Promise<Comentario> {
    return this.repository.save(comentario);
  }

  // Elimina un comentario según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }
}


// Creamos una instancia para poder utilizar este repository
export const comentarioRepository = new ComentarioRepository();