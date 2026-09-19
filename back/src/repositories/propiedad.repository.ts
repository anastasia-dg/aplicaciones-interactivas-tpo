// Repository es el tipo que nos da TypeORM para trabajar con una entidad
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Propiedad } from "../entities/propiedad.entity";


class PropiedadRepository {

  // Este getter obtiene el Repository de TypeORM para la entidad Propiedad.
  // Con él podemos hacer operaciones en la BD: buscar, guardar, eliminar, etc.
  //
  // Se obtiene cuando lo necesitamos y NO al cargar el archivo.
  private get repository(): Repository<Propiedad> {
    return AppDataSource.getRepository(Propiedad);
  }

  // Devuelve todas las propiedades guardadas en la base de datos.
  // También trae las fotos y la inmobiliaria relacionadas con cada propiedad.
  listar(): Promise<Propiedad[]> {
    return this.repository.find({
      relations: ["fotos", "inmobiliaria"],
    });
  }

  // Busca UNA propiedad según su ID.
  //
  // Puede devolver:
  // - una Propiedad si la encuentra
  // - null si no existe
  buscarPorId(id: number): Promise<Propiedad | null> {
    return this.repository.findOne({ //this.repository es el acceso a la tabla Propiedad en la base de datos
      where: { id },

      // Además de la propiedad, trae estos datos relacionados.
      relations: [
        "fotos",
        "comentarios",
        "inmobiliaria",
        "solicitudesVisita",
      ],
    });
  }


  // Recibe los datos de una nueva propiedad.
  //
  // Partial<Propiedad> significa que "datos" puede contener
  // solamente algunos atributos de Propiedad.
  crear(datos: Partial<Propiedad>): Promise<Propiedad> {

    // create() arma un objeto Propiedad con los datos recibidos.
    const propiedad = this.repository.create(datos);

    // save() guarda la propiedad en la base de datos.
    return this.repository.save(propiedad);
  }


  // Guarda los cambios realizados sobre una propiedad existente.
  actualizar(propiedad: Propiedad): Promise<Propiedad> {
    return this.repository.save(propiedad);
  }


  // Elimina una propiedad de la base de datos según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }
}


// Creamos una instancia para poder usar este repository
export const propiedadRepository = new PropiedadRepository();
