import { inmobiliariaRepository } from "../repositories/inmobiliaria.repository";
import { Inmobiliaria } from "../entities/inmobiliaria.entity";

// Necesitamos EstadoPropiedad para saber
// qué estados impiden eliminar una inmobiliaria.
import { EstadoPropiedad } from "../entities/enums";
import { vendedorService } from "./vendedor-service"; //para buscar el vendedor usando vendedorId

//tipo de datos para crear y actualizar
import {
  CrearInmobiliariaDto,
  ActualizarInmobiliariaDto,
} from "../dtos/inmobiliaria-dto"; 


class InmobiliariaService {

  // Devuelve todas las inmobiliarias.
  listar(): Promise<Inmobiliaria[]> {
    return inmobiliariaRepository.listar();
  }

  //buscar por ID
  async buscarPorId(id: number): Promise<Inmobiliaria> {

    // Le pedimos al Repository que busque
    // la inmobiliaria en PostgreSQL.
    const inmobiliaria =
      await inmobiliariaRepository.buscarPorId(id);

    // Si devuelve null significa que no existe.
    if (!inmobiliaria) {
      throw new Error("Inmobiliaria no encontrada");
    }

    // Si existe, la devolvemos.
    return inmobiliaria;
  }

  
  // OBTENER EL PERFIL PUBLICO DE UNA INMOBILIARIA
  async buscarPerfilPublico(id: number): Promise<Inmobiliaria> {

    // Buscamos el perfil utilizando el Repository
    const inmobiliaria =
      await inmobiliariaRepository.buscarPerfilPublico(id);

    // Si no existe, devolvemos un error
    if (!inmobiliaria) {
      throw new Error("Inmobiliaria no encontrada");
    }

    // Devolvemos el perfil con sus propiedades publicadas
    return inmobiliaria;
  }



// CREAR INMOBILIARIA
  async crear(datos: CrearInmobiliariaDto): Promise<Inmobiliaria> {

    // REGLA 1: El nombre de fantasía de la inmobiliaria debe ser único
    const inmobiliariaConMismoNombre =
        await inmobiliariaRepository.buscarPorNombre(datos.nombre);

    if (inmobiliariaConMismoNombre) {
        throw new Error(
        "Ya existe una inmobiliaria con ese nombre"
        );
    }


    // REGLA 2: Buscamos al vendedor usando el vendedorId que llegó desde el DTO
    // vendedorService.buscarPorId() ya lanza un error si el vendedor no existe.
    const vendedor =
        await vendedorService.buscarPorId(datos.vendedorId);


    // REGLA 3: Un vendedor puede tener como máximo una inmobiliaria
    const inmobiliariaDelVendedor =
        await inmobiliariaRepository.buscarPorVendedor(vendedor.id);

    if (inmobiliariaDelVendedor) {
        throw new Error(
        "El vendedor ya tiene una inmobiliaria"
        );
    }


    // Si pasó todas las validaciones, creamos la inmobiliaria
    //
    // El DTO trae "vendedorId", pero la Entity necesita "vendedor".
    return inmobiliariaRepository.crear({

        nombre: datos.nombre,

        descripcion: datos.descripcion,

        urlLogo: datos.urlLogo ?? null,

        telefonoContacto: datos.telefonoContacto,

        emailContacto: datos.emailContacto,

        direccionOficina:
        datos.direccionOficina ?? null,

        //ponemos el objeto Vendedor que buscamos anteriormente
        vendedor: vendedor,
    });
    }


  //ACTUALIZAR INMOBILIARIA
  async actualizar(id: number, datos: ActualizarInmobiliariaDto): Promise<Inmobiliaria> {

    //comprobamos que la inmobiliaria exista
    //buscarPorId() ya lanza un error cuando no existe
    // no necesitamos repetir ese if acá.
    const inmobiliaria = await this.buscarPorId(id);


    // Si quieren modificar el nombre
    // tenemos que comprobar que el nuevo nombre
    // no pertenezca a otra inmobiliaria

    if (datos.nombre) {

      const inmobiliariaConMismoNombre = await inmobiliariaRepository.buscarPorNombre(datos.nombre);

      // Puede pasar que buscarPorNombre encuentre
      // justamente la inmobiliaria que estamos editando.
      //
      // Eso NO sería un problema
      //
      // Por eso comprobamos que el ID sea diferente
      if (
        inmobiliariaConMismoNombre &&
        inmobiliariaConMismoNombre.id !== id
      ) {
        throw new Error(
          "Ya existe otra inmobiliaria con ese nombre"
        );
      }
    }


    // Copiamos los campos recibidos sobre
    // la inmobiliaria que ya existe.
    Object.assign(inmobiliaria, datos);

    // El Repository guarda los cambios.
    return inmobiliariaRepository.actualizar(inmobiliaria);
  }


  //ELIMINAR INMOBILIARIA
  async eliminar(id: number): Promise<void> {

    // Buscamos la inmobiliaria.
    //
    // Nuestro buscarPorId del Repository trae también
    // la relación "propiedades", así que podemos revisar
    // los estados de sus propiedades.
    const inmobiliaria = await this.buscarPorId(id);


    // REGLA: No se puede eliminar una inmobiliaria si tiene
    // propiedades PUBLICADAS o RESERVADAS.

    const tienePropiedadesActivas =
      inmobiliaria.propiedades.some(
        // .some() pregunta: Hay AL MENOS UNA propiedad que cumpla esto?
        (propiedad) =>
          propiedad.estado === EstadoPropiedad.PUBLICADA ||
          propiedad.estado === EstadoPropiedad.RESERVADA
      );


    // Si encontramos al menos una propiedad
    // PUBLICADA o RESERVADA, impedimos la eliminación.
    if (tienePropiedadesActivas) {
      throw new Error(
        "No se puede eliminar la inmobiliaria porque tiene propiedades publicadas o reservadas"
      );
    }

    // Si pasó la regla anterior,
    // recién ahora la eliminamos de PostgreSQL.
    await inmobiliariaRepository.eliminar(id);
  }
}

// Creamos una única instancia del Service.
export const inmobiliariaService = new InmobiliariaService();