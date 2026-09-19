import { inmobiliariaRepository } from "../repositories/inmobiliaria.repository";
import { Inmobiliaria } from "../entities/inmobiliaria.entity";

// Necesitamos EstadoPropiedad para saber
// qué estados impiden eliminar una inmobiliaria.
import { EstadoPropiedad } from "../entities/enums";


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


  //CREAR INMOBILIARIA
  async crear( datos: Partial<Inmobiliaria> ): Promise<Inmobiliaria> {

    // REGLA 1: El nombre de fantasía de la inmobiliaria debe ser único.
    if (datos.nombre) {

      // Buscamos si ya existe una inmobiliaria
      // con ese mismo nombre.
      const inmobiliariaConMismoNombre = await inmobiliariaRepository.buscarPorNombre(datos.nombre);

      // Si encontramos una, no permitimos crear otra.
      if (inmobiliariaConMismoNombre) {
        throw new Error(
          "Ya existe una inmobiliaria con ese nombre"
        );
      }
    }

    // REGLA 2: Un vendedor puede tener como máximo una inmobiliaria.
    if (datos.vendedor) {

      // Buscamos si ese vendedor ya tiene
      // una inmobiliaria asociada.
      const inmobiliariaDelVendedor = await inmobiliariaRepository.buscarPorVendedor(datos.vendedor.id); //hay una inmobiliaria con un vendedor con este id?

      // Si encontramos una, significa que el vendedor
      // ya tiene una inmobiliaria.
      if (inmobiliariaDelVendedor) {
        throw new Error(
          "El vendedor ya tiene una inmobiliaria"
        );
      }
    }

    // Si pasó todas las reglas anteriores,
    // recién ahora permitimos guardarla.
    return inmobiliariaRepository.crear(datos);
  }


  //ACTUALIZAR INMOBILIARIA
  async actualizar(id: number, datos: Partial<Inmobiliaria>): Promise<Inmobiliaria> {

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