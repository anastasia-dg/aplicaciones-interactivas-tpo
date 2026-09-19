import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { SolicitudVisita } from "../entities/solicitud-visita.entity";


class SolicitudVisitaRepository {

  // Obtiene el repository de TypeORM correspondiente a SolicitudVisita.
  private get repository(): Repository<SolicitudVisita> {
    return AppDataSource.getRepository(SolicitudVisita);
  }


  // Busca TODAS las solicitudes de visita.
  // También trae la propiedad relacionada con cada solicitud.
  listar(): Promise<SolicitudVisita[]> {
    return this.repository.find({
      relations: ["propiedad"],
    });
  }

  // Busca UNA solicitud de visita según su ID.
  buscarPorId(id: number): Promise<SolicitudVisita | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["propiedad"],
    });
  }

  // Busca todas las solicitudes de visita
  // correspondientes a una propiedad determinada.
  buscarPorPropiedad(propiedadId: number): Promise<SolicitudVisita[]> {
    return this.repository.find({
      where: {
        propiedad: {
          id: propiedadId,
        },
      },
      relations: ["propiedad"],
    });
  }

  // Recibe los datos para crear una nueva solicitud de visita.
  crear(datos: Partial<SolicitudVisita>): Promise<SolicitudVisita> {

    // create() arma el objeto en memoria.
    const solicitud = this.repository.create(datos);

    // save() guarda la solicitud en la base de datos.
    return this.repository.save(solicitud);
  }


  // Guarda los cambios realizados sobre una solicitud existente.
  //
  //el Service puede cambiar:
  // PENDIENTE a CONFIRMADA
  // y este método se encarga de guardar ese cambio.
  actualizar(solicitud: SolicitudVisita): Promise<SolicitudVisita> {
    return this.repository.save(solicitud);
  }

  // Elimina una solicitud de visita según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }
}


// Creamos una instancia para poder utilizar este repository
export const solicitudVisitaRepository = new SolicitudVisitaRepository();