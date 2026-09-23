
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";
import { RegistroDto } from "../dtos/registro-dto";
import { vendedorRepository } from "../repositories/vendedor.repository";
import { inmobiliariaRepository } from "../repositories/inmobiliaria.repository";

class RegistroService {

  // Recibe los datos del formulario completo: los del vendedor y los de su inmobiliaria.
  async registrar(datos: RegistroDto) {

    // Iniciamos una transacción
    // Todas las operaciones que usen este manager  se confirmarán juntas o se desharán si hay un error
    // .transaction() es un metodo de TypeORM que inicia una transaccion
    const vendedorId = await AppDataSource.transaction(
      async (manager) => { //manager es el objeto que nos da TypeORM para trabajar dentro de la transaccion

        // Buscamos si ya existe un vendedor con ese correo, utilizando el manager de la transacción.
        // manager.getRepository(Vendedor) es para pedirle a manager el repositorio vendedor pero dentro de la transaccion
        const vendedorExistente = await manager.getRepository("Vendedor").findOne({
            where: { email: datos.vendedor.email }
          });

        if (vendedorExistente) {
          throw new Error("Ya existe un vendedor con ese correo");
        }

        // Comprobamos que no exista otra inmobiliaria con el mismo nombre.
        const inmobiliariaExistente = await manager
          .getRepository("Inmobiliaria")
          .findOne({
            where: { nombre: datos.inmobiliaria.nombre }
          });

        if (inmobiliariaExistente) {
          throw new Error("Ya existe una inmobiliaria con ese nombre");
        }

        // Encriptamos la contraseña antes de guardarla
        const contrasenaHash = await bcrypt.hash(
          datos.vendedor.contrasena,
          10
        );

        // Guardamos al vendedor usando la transacción
        const vendedor = await vendedorRepository.crearEnTransaccion(
          {
            nombreCompleto: datos.vendedor.nombreCompleto,
            email: datos.vendedor.email,
            contrasenaHash: contrasenaHash,
            telefono: datos.vendedor.telefono ?? null
          },
          manager
        );

        // Guardamos la inmobiliaria y la relacionamos
        // con el vendedor que acabamos de crear.
        await inmobiliariaRepository.crearEnTransaccion(
          {
            nombre: datos.inmobiliaria.nombre,
            descripcion: datos.inmobiliaria.descripcion,
            urlLogo: datos.inmobiliaria.urlLogo ?? null,
            telefonoContacto: datos.inmobiliaria.telefonoContacto,
            emailContacto: datos.inmobiliaria.emailContacto,
            direccionOficina: datos.inmobiliaria.direccionOficina ?? null,
            vendedor: vendedor
          },
          manager
        );

        // Devolvemos el ID del vendedor
        return vendedor.id;
      }
    );

    // Cuando llegamos acá, la transacción ya terminó correctamente.
    //  Volvemos a consultar al vendedor con su inmobiliaria, sin devolver la contraseña
    return vendedorRepository.buscarPorId(vendedorId);
  }
}

// Exportamos una instancia para usarla en el Controller
export const registroService = new RegistroService();