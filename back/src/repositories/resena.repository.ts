import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Reseña } from "../entities/reseña.entity";


class ReseñaRepository {

  // Obtiene el repository de TypeORM correspondiente a Reseña.
  private get repository(): Repository<Reseña> {
    return AppDataSource.getRepository(Reseña);
  }

  // Busca TODAS las reseñas.
  // También trae la inmobiliaria a la que pertenece cada reseña.
  listar(): Promise<Reseña[]> {
    return this.repository.find({
      relations: ["inmobiliaria"],
    });
  }

  // Busca UNA reseña según su ID.
  // Devuelve la reseña si existe o null si no la encuentra.
  buscarPorId(id: number): Promise<Reseña | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["inmobiliaria"],
    });
  }

  // Busca todas las reseñas que pertenecen a una inmobiliaria.
  buscarPorInmobiliaria(inmobiliariaId: number): Promise<Reseña[]> {
    return this.repository.find({
      where: {
        inmobiliaria: {
          id: inmobiliariaId,
        },
      },
      relations: ["inmobiliaria"],
    });
  }


  // Recibe los datos necesarios para crear una nueva reseña.
  crear(datos: Partial<Reseña>): Promise<Reseña> {

    // create() crea el objeto Reseña en memoria.
    const reseña = this.repository.create(datos);

    // save() guarda la reseña en PostgreSQL.
    return this.repository.save(reseña);
  }

  // Guarda cambios realizados sobre una reseña existente.
  actualizar(reseña: Reseña): Promise<Reseña> {
    return this.repository.save(reseña);
  }

  // Elimina una reseña según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }
}

// Creamos una instancia para poder usar este repository
export const reseñaRepository = new ReseñaRepository();