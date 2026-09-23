import { EntityManager, Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor.entity";

class VendedorRepository {

  // Obtiene el repository de TypeORM correspondiente a Vendedor.
  // Se obtiene cuando lo necesitamos y no al cargar el archivo.
  private get repository(): Repository<Vendedor> {
    return AppDataSource.getRepository(Vendedor);
  }

  // Busca TODOS los vendedores.
  listar(): Promise<Vendedor[]> {
    return this.repository.find({
      relations: ["inmobiliaria"],
    });
  }

  // Busca UN vendedor según su ID.
  buscarPorId(id: number): Promise<Vendedor | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["inmobiliaria"],
    });
  }


  // Busca un vendedor según su email. Sirve para verificar si hay un vendedor con ese email
  buscarPorEmail(email: string): Promise<Vendedor | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  // Recibe los datos necesarios para crear un vendedor.
  crear(datos: Partial<Vendedor>): Promise<Vendedor> {

    // create() crea el objeto Vendedor en memoria.
    const vendedor = this.repository.create(datos);

    // save() guarda el vendedor en la base de datos.
    return this.repository.save(vendedor);
  }

  // Guarda los cambios realizados sobre un vendedor existente.
  actualizar(vendedor: Vendedor): Promise<Vendedor> {
    return this.repository.save(vendedor);
  }

  // Elimina un vendedor de la base de datos según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }

  // Crea un vendedor utilizando la transacción que recibe desde el Service de registro
  crearEnTransaccion(
    datos: Partial<Vendedor>,
    manager: EntityManager
  ): Promise<Vendedor> {

    // Obtenemos el repositorio de Vendedor asociado a ESTA transacción
    //trabajamos con la tabla de vendedores dentro de la transaccion 
    // manager identifica que transaccion estamos usando
    const repository = manager.getRepository(Vendedor); 

    // Creamos el objeto Vendedor.
    const vendedor = repository.create(datos);

    // Lo guardamos dentro de la transacción.
    return repository.save(vendedor);
  }
}


// Creamos una instancia para poder utilizar este repository
export const vendedorRepository = new VendedorRepository();