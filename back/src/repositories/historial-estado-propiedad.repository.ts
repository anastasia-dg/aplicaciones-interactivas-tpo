import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { HistorialEstadoPropiedad } from "../entities/historial-estado-propiedad.entity";


class HistorialEstadoPropiedadRepository {

  // Obtiene el repository de TypeORM correspondiente
  // a HistorialEstadoPropiedad.
  private get repository(): Repository<HistorialEstadoPropiedad> {
    return AppDataSource.getRepository(HistorialEstadoPropiedad);
  }


  // Busca TODOS los registros del historial.
  // También trae la propiedad relacionada.
  listar(): Promise<HistorialEstadoPropiedad[]> {
    return this.repository.find({
      relations: ["propiedad"],
    });
  }

  // Busca UN registro del historial según su ID.
  // Devuelve el registro o null si no existe.
  buscarPorId(id: number): Promise<HistorialEstadoPropiedad | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["propiedad"],
    });
  }

  // Busca todo el historial de una propiedad determinada.
  buscarPorPropiedad(
    propiedadId: number
  ): Promise<HistorialEstadoPropiedad[]> {

    return this.repository.find({
      where: {
        propiedad: {
          id: propiedadId,
        },
      },

      relations: ["propiedad"],

      // Ordenamos por fecha desde el cambio más antiguo
      // hasta el cambio más reciente.
      order: {
        fechaCreacion: "ASC",
      },
    });
  }

  // Crea un nuevo registro en el historial.
  //
  //ej si una propiedad pasa:
  // PUBLICADA a RESERVADA
  crear(
    datos: Partial<HistorialEstadoPropiedad>
  ): Promise<HistorialEstadoPropiedad> {

    // create() arma el objeto en memoria.
    const historial = this.repository.create(datos);

    // save() lo guarda en PostgreSQL.
    return this.repository.save(historial);
  }
}


// Creamos una instancia para poder usar este repository
export const historialEstadoPropiedadRepository = new HistorialEstadoPropiedadRepository();