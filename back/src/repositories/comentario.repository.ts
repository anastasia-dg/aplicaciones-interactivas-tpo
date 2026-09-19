import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Comentario } from "../entities/comentario.entity";


class ComentarioRepository {

  // Obtiene el repository de TypeORM correspondiente a Comentario.
  private get repository(): Repository<Comentario> {
    return AppDataSource.getRepository(Comentario);
  }

  // Busca TODOS los comentarios.
  listar(): Promise<Comentario[]> {
    return this.repository.find({
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