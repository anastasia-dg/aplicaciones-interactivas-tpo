// Importamos el repository de Vendedor.
// El Service NO accede directamente a PostgreSQL.
// Para eso utiliza el Repository.
import { vendedorRepository } from "../repositories/vendedor.repository";

// Importamos la entidad Vendedor porque algunos métodos
// devuelven objetos de este tipo.
import { Vendedor } from "../entities/vendedor.entity";


class VendedorService {

  // Devuelve todos los vendedores.
  // El Service le pide los datos al Repository.
  listar(): Promise<Vendedor[]> {
    return vendedorRepository.listar();
  }


  // Busca un vendedor por su ID.
  async buscarPorId(id: number): Promise<Vendedor> {

    // Le pedimos al Repository que busque el vendedor en la BD.
    const vendedor = await vendedorRepository.buscarPorId(id);

    // Si el Repository devuelve null, significa que no existe.
    if (!vendedor) {
      throw new Error("Vendedor no encontrado");
    }

    // Si existe, lo devolvemos.
    return vendedor;
  }


  // Busca un vendedor por su email.
  async buscarPorEmail(email: string): Promise<Vendedor | null> {
    return vendedorRepository.buscarPorEmail(email);
  }


  // Crea un nuevo vendedor.
  async crear(datos: Partial<Vendedor>): Promise<Vendedor> {

    // Primero verificamos si ya existe otro vendedor
    // registrado con el mismo email.
    if (datos.email) {
      const vendedorExistente =
        await vendedorRepository.buscarPorEmail(datos.email);

      // Como el email debe ser único,
      // no permitimos crear otro vendedor con el mismo.
      if (vendedorExistente) {
        throw new Error("Ya existe un vendedor con ese email");
      }
    }

    // Si pasó las reglas anteriores,
    // el Repository se encarga de guardarlo en PostgreSQL.
    return vendedorRepository.crear(datos);
  }


  // Actualiza un vendedor existente.
  async actualizar(
    id: number,
    datos: Partial<Vendedor>
  ): Promise<Vendedor> {

    // Primero buscamos el vendedor.
    // Usamos nuestro propio método buscarPorId(),
    // que ya controla que exista.
    const vendedor = await this.buscarPorId(id);

    // Object.assign copia sobre "vendedor"
    // los campos que llegaron dentro de "datos".
    Object.assign(vendedor, datos);

    // El Repository guarda los cambios en PostgreSQL.
    return vendedorRepository.actualizar(vendedor);
  }


  // Elimina un vendedor.
  async eliminar(id: number): Promise<void> {

    // Primero comprobamos que exista.
    await this.buscarPorId(id);

    // Si existe, le pedimos al Repository que lo elimine.
    await vendedorRepository.eliminar(id);
  }
}


// Creamos una instancia para poder utilizar este Service
export const vendedorService = new VendedorService();