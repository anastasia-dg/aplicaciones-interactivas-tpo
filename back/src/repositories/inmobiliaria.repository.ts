// Repository es el tipo que nos da TypeORM para trabajar con una entidad
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Inmobiliaria } from "../entities/inmobiliaria.entity";


class InmobiliariaRepository {

  // Obtiene el repository de TypeORM correspondiente a Inmobiliaria.
  private get repository(): Repository<Inmobiliaria> {
    return AppDataSource.getRepository(Inmobiliaria);
  }

  // Busca TODAS las inmobiliarias.
  listar(): Promise<Inmobiliaria[]> {
    return this.repository.find({
      relations: ["vendedor"],
    });
  }

  // Busca UNA inmobiliaria por su ID.
  //
  // Devuelve:
  // - Inmobiliaria si existe
  // - null si no la encuentra
  buscarPorId(id: number): Promise<Inmobiliaria | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["vendedor", "propiedades", "reseñas"],
    });
  }


  // Busca una inmobiliaria por su nombre.
  buscarPorNombre(nombre: string): Promise<Inmobiliaria | null> {
    return this.repository.findOne({
      where: { nombre },
    });
  }

  // Recibe datos para crear una nueva inmobiliaria.
  crear(datos: Partial<Inmobiliaria>): Promise<Inmobiliaria> {

    // create() crea el objeto Inmobiliaria en memoria.
    const inmobiliaria = this.repository.create(datos);

    // save() guarda ese objeto en la base de datos.
    return this.repository.save(inmobiliaria);
  }

  // Guarda los cambios de una inmobiliaria existente.
  actualizar(inmobiliaria: Inmobiliaria): Promise<Inmobiliaria> {
    return this.repository.save(inmobiliaria);
  }

  // Elimina una inmobiliaria según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }
}

// Creamos una instancia para poder usar este repository
export const inmobiliariaRepository = new InmobiliariaRepository();