import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { FotoPropiedad } from "../entities/foto-propiedad.entity";


class FotoPropiedadRepository {

  // Obtiene el repository de TypeORM correspondiente a FotoPropiedad.
  private get repository(): Repository<FotoPropiedad> {
    return AppDataSource.getRepository(FotoPropiedad);
  }


  // Busca TODAS las fotos.
  // También trae la propiedad a la que pertenece cada foto.
  listar(): Promise<FotoPropiedad[]> {
    return this.repository.find({
      relations: ["propiedad"],
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