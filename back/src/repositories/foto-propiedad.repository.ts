import { Repository, In} from "typeorm";
import { AppDataSource } from "../config/data-source";
import { FotoPropiedad } from "../entities/foto-propiedad.entity";
import { EstadoPropiedad } from "../entities/enums";


class FotoPropiedadRepository {

  // Obtiene el repository de TypeORM correspondiente a FotoPropiedad.
  private get repository(): Repository<FotoPropiedad> {
    return AppDataSource.getRepository(FotoPropiedad);
  }


  
  // Lista solamente las fotos de propiedades publicadas
  listar(): Promise<FotoPropiedad[]> {
    return this.repository.find({

      // Filtramos por el estado de la propiedad
      // a la que pertenece cada foto.
      where: {
        propiedad: {
          estado: EstadoPropiedad.PUBLICADA,
        },
      },

      // Traemos la propiedad relacionada.
      relations: ["propiedad"],

      // Ordenamos las fotos por su posición.
      order: {
        orden: "ASC",
      },
    });
  }


  // Busca UNA foto según su ID.
  buscarPorId(id: number): Promise<FotoPropiedad | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["propiedad"],
    });
  }


  // Busca todas las fotos de una propiedad determinada.
  buscarPorPropiedad(propiedadId: number): Promise<FotoPropiedad[]> {
    return this.repository.find({
      where: {
        propiedad: {
          id: propiedadId,
        },
      },
      relations: ["propiedad"],

      // Ordena las fotos según el atributo "orden".
      order: {
        orden: "ASC",
      },
    });
  }
  
  // Busca una foto pública por su ID.
  buscarPublicaPorId(id: number): Promise<FotoPropiedad | null> {
    return this.repository.findOne({
      where: {
        id,
        propiedad: {
          // Permitimos fotos de propiedades publicadas
          // y también de propiedades finalizadas.
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

  // Busca las fotos públicas de una propiedad.
  buscarPublicasPorPropiedad(
    propiedadId: number
  ): Promise<FotoPropiedad[]> {
    return this.repository.find({
      where: {
        propiedad: {
          id: propiedadId,
          // Mostramos fotos de propiedades públicas y finalizadas.
          estado: In([
            EstadoPropiedad.PUBLICADA,
            EstadoPropiedad.VENDIDA,
            EstadoPropiedad.ALQUILADA,
            EstadoPropiedad.CANCELADA,
          ]),
        },
      },
      relations: ["propiedad"],
      order: {
        orden: "ASC",
      },
    });
  }


  // Recibe los datos para crear una nueva foto.
  crear(datos: Partial<FotoPropiedad>): Promise<FotoPropiedad> {

    // create() arma el objeto FotoPropiedad en memoria.
    const foto = this.repository.create(datos);

    // save() guarda la foto en PostgreSQL.
    return this.repository.save(foto);
  }

  // Guarda los cambios de una foto existente.
  //
  //ej si cambia su orden o si pasa a ser portada.
  actualizar(foto: FotoPropiedad): Promise<FotoPropiedad> {
    return this.repository.save(foto);
  }

  // Elimina una foto según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }
}

// Creamos una instancia para poder usar este repository
export const fotoPropiedadRepository = new FotoPropiedadRepository();