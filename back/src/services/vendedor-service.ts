import bcrypt from "bcryptjs"; //convierte la contra en hash

import {
  CrearVendedorDto,
  ActualizarVendedorDto,
} from "../dtos/vendedor-dto";

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


 // CREA UN NUEVO VENDEDOR
  async crear(datos: CrearVendedorDto): Promise<Vendedor> {

    // Primero buscamos si ya existe un vendedor que tenga el mismo email.
    const vendedorExistente =
        await vendedorRepository.buscarPorEmail(datos.email);

    // Si existe, da error
    if (vendedorExistente) {
        throw new Error(
        "Ya existe un vendedor con ese email"
        );
    }

    // La contraseña llega normal desde el frontend
    // bcrypt.hash() la transforma en un hash
    // para NO guardar la contraseña original
    //
    // El 10 indica el costo utilizado para generar el hash.
    const contrasenaHash =
        await bcrypt.hash(datos.contrasena, 10);

    // Ahora mandamos al Repository los datos
    // que realmente necesita nuestra Entity Vendedor
    return vendedorRepository.crear({

        nombreCompleto: datos.nombreCompleto,

        email: datos.email,

        // Guardamos el HASH, no la contraseña original
        contrasenaHash: contrasenaHash,

        // Si no mandaron teléfono, guardamos null
        telefono: datos.telefono ?? null,
    });
    }

  // ACTUALIZAR VENDEDOR
  async actualizar(id: number, datos: ActualizarVendedorDto): Promise<Vendedor> {

    // Primero buscamos al vendedor que queremos modificar
    // buscarPorId ya da un error si no existe
    const vendedor = await this.buscarPorId(id);


    // SI QUIERE CAMBIAR EL EMAIL
    if (datos.email !== undefined) {

        // Primero comprobamos que el nuevo email
        // no pertenezca a otro vendedor.
        const vendedorConMismoEmail =
            await vendedorRepository.buscarPorEmail(datos.email);

        if (
            vendedorConMismoEmail &&
            vendedorConMismoEmail.id !== id
        ) {
            throw new Error(
            "Ya existe otro vendedor con ese email"
            );
        }

        // Si llegamos hasta acá, significa que
        // podemos usar ese email.
        vendedor.email = datos.email;
    }

    // SI QUIERE CAMBIAR LA CONTRASEÑA
    if (datos.contrasena !== undefined) {

        // Convertimos la nueva contraseña en hash
        const contrasenaHash =
        await bcrypt.hash(datos.contrasena, 10);

        // Guardamos el hash en la Entity.
        vendedor.contrasenaHash = contrasenaHash;
    }


    // Actualizamos el nombre solamente si vino en la petición.
    if (datos.nombreCompleto !== undefined) {
        vendedor.nombreCompleto = datos.nombreCompleto;
    }


    // Actualizamos el email solamente si vino.
    if (datos.email !== undefined) {
        vendedor.email = datos.email;
    }


    // Con telefono usamos !== undefined porque:
    //
    // undefined = no mandaron el campo ->  no lo modificamos
    // null      = lo mandaron en null -> quieren borrar el teléfono
    // string    = quieren cambiarlo
    if (datos.telefono !== undefined) {
        vendedor.telefono = datos.telefono;
    }


    // Finalmente le pedimos al Repository que guarde los cambios
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