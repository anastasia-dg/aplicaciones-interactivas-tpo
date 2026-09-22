import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Actividad } from "../entities/actividad.entity";


class ActividadRepository {

  // Obtiene el repository de TypeORM correspondiente a Actividad.
  private get repository(): Repository<Actividad> {
    return AppDataSource.getRepository(Actividad);
  }

  // Busca TODAS las actividades.
  // También trae la inmobiliaria relacionada con cada actividad.
  listar(): Promise<Actividad[]> {
    return this.repository.find({
      relations: ["inmobiliaria"],
    });
  }

  // Busca UNA actividad según su ID.
  buscarPorId(id: number): Promise<Actividad | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["inmobiliaria"],
    });
  }


  // Busca todas las actividades de una inmobiliaria determinada.
  //
  // sirve para mostrar el feed de actividad
  // de un vendedor/inmobiliaria.
    buscarPorInmobiliaria(inmobiliariaId: number): Promise<Actividad[]> {
    return this.repository.find({
        where: {
        inmobiliaria: {
            id: inmobiliariaId,
        },
        },
        relations: ["inmobiliaria"],

        // Mostramos primero las actividades más recientes.
        order: {
        fechaCreacion: "DESC",
        },
    });
 }

  // Recibe los datos necesarios para crear una nueva actividad.
  crear(datos: Partial<Actividad>): Promise<Actividad> {

    // create() arma el objeto Actividad en memoria.
    const actividad = this.repository.create(datos);

    // save() guarda la actividad en la base de datos.
    return this.repository.save(actividad);
  }


  // Guarda los cambios realizados sobre una actividad existente.
  //
  // ej si una notificación pasa de
  // no leída a leída.
  actualizar(actividad: Actividad): Promise<Actividad> {
    return this.repository.save(actividad);
  }

  // Elimina una actividad según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }
}

// Creamos una instancia para poder utilizar este repository
export const actividadRepository = new ActividadRepository();