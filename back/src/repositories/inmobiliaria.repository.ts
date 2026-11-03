// Repository es el tipo que nos da TypeORM para trabajar con una entidad
import { EntityManager, Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Inmobiliaria } from "../entities/inmobiliaria.entity";
import { EstadoPropiedad } from "../entities/enums";


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

  
  // BUSCAR EL PERFIL PUBLICO DE UNA INMOBILIARIA
  buscarPerfilPublico(id: number): Promise<Inmobiliaria | null> {

    // Buscamos la inmobiliaria por su ID.
    return this.repository.findOne({

      where: {
        id,
      },

      // Traemos las propiedades y sus fotos,
      // pero NO los datos privados del vendedor.
      relations: [
        "propiedades",
        "propiedades.fotos",
      ],

      // Solo cargamos propiedades publicadas.
      relationLoadStrategy: "query",
    }).then((inmobiliaria) => {

      // Si la inmobiliaria no existe, devolvemos null.
      if (!inmobiliaria) {
        return null;
      }

      // Dejamos únicamente las propiedades publicadas.
      inmobiliaria.propiedades = inmobiliaria.propiedades.filter(
        (propiedad) =>
          propiedad.estado === EstadoPropiedad.PUBLICADA
      );

      return inmobiliaria;
    });
  }



  // Busca una inmobiliaria por su nombre.
  buscarPorNombre(nombre: string): Promise<Inmobiliaria | null> {
    return this.repository.findOne({
      where: { nombre },
    });
  }

  // Busca una inmobiliaria según el ID del vendedor.
  buscarPorVendedor(vendedorId: number): Promise<Inmobiliaria | null> {
    return this.repository.findOne({
      where: {
        vendedor: {
          id: vendedorId,
        },
      },
      relations: ["vendedor"],
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

  // Crea una inmobiliaria utilizando la misma
  // transacción que se usó para crear al vendedor.
  crearEnTransaccion(
    datos: Partial<Inmobiliaria>,
    manager: EntityManager
  ): Promise<Inmobiliaria> {

    // Obtenemos el repositorio de Inmobiliaria
    // asociado a la transacción.
    const repository = manager.getRepository(Inmobiliaria);

    // Creamos el objeto Inmobiliaria.
    const inmobiliaria = repository.create(datos);

    // Lo guardamos dentro de la transacción.
    return repository.save(inmobiliaria);
  }
}

// Creamos una instancia para poder usar este repository
export const inmobiliariaRepository = new InmobiliariaRepository();