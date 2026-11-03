import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Actividad } from "../entities/actividad.entity";


class ActividadRepository {

  // Obtiene el repository de TypeORM correspondiente a Actividad.
  private get repository(): Repository<Actividad> {
    return AppDataSource.getRepository(Actividad);
  }

  
  // Lista solamente las actividades del vendedor autenticado.
  listar(vendedorId: number): Promise<Actividad[]> {
    return this.repository.find({

      // Filtramos por el dueño de la inmobiliaria.
      where: {
        inmobiliaria: {
          vendedor: {
            id: vendedorId,
          },
        },
      },

      // Traemos los datos de la inmobiliaria.
      relations: ["inmobiliaria"],

      // Mostramos primero las actividades más recientes.
      order: {
        fechaCreacion: "DESC",
      },
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

 
  // CONTAR ACTIVIDADES SIN LEER DE UNA INMOBILIARIA
  contarNoLeidas(inmobiliariaId: number): Promise<number> {

    // count() cuenta los registros que cumplen las condiciones
    return this.repository.count({
      where: {
        // Solo contamos las actividades de esta inmobiliaria
        inmobiliaria: {
          id: inmobiliariaId,
        },

        // Solo contamos las que todavía no fueron leídas
        leida: false,
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