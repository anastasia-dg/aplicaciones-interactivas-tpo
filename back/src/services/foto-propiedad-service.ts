import { fotoPropiedadRepository } from "../repositories/foto-propiedad.repository";
import { FotoPropiedad } from "../entities/foto-propiedad.entity";
import { propiedadRepository } from "../repositories/propiedad.repository";
import {
  CrearFotoPropiedadDto,
  ActualizarFotoPropiedadDto,
} from "../dtos/foto-propiedad-dto";

class FotoPropiedadService {

  // Devuelve todas las fotos guardadas.
  listar(): Promise<FotoPropiedad[]> {
    return fotoPropiedadRepository.listar();
  }

    //BUSCAR POR ID
  async buscarPorId(id: number): Promise<FotoPropiedad> {

    // Le pedimos al Repository que busque la foto en la BD.
    const foto = await fotoPropiedadRepository.buscarPorId(id);

    // Si devuelve null, significa que no existe una foto
    // con ese ID.
    if (!foto) {
      throw new Error("Foto no encontrada");
    }

    // Si existe, la devolvemos.
    return foto;
  }


  //BUSCAR FOTOS DE UNA PROPIEDAD ESPECIFICA
  buscarPorPropiedad(
    propiedadId: number
  ): Promise<FotoPropiedad[]> {

    // Le pasamos el ID de la propiedad al Repository.
    // devuelve las fotos que pertenecen a la propiedad
    return fotoPropiedadRepository.buscarPorPropiedad(propiedadId);
  }


  // CREAR FOTO
    async crear(propiedadId: number, datos: CrearFotoPropiedadDto): Promise<FotoPropiedad> {

    // Buscamos la propiedad a la que queremos agregarle la foto.
    const propiedad =
        await propiedadRepository.buscarPorId(propiedadId);

    // Si la propiedad no existe, no podemos agregarle una foto.
    if (!propiedad) {
        throw new Error("Propiedad no encontrada");
    }

    // Creamos la foto con los datos validados por el DTO y la relacionamos con la propiedad.
    return fotoPropiedadRepository.crear({
        url: datos.url,
        orden: datos.orden,
        // Si no mandaron esPortada, queda false.
        esPortada: datos.esPortada ?? false,
        propiedad: propiedad,
    });
 }


  //ACTUALIZAR FOTO
  async actualizar( id: number, datos: ActualizarFotoPropiedadDto): Promise<FotoPropiedad> {

    // Primero comprobamos que la foto realmente exista.
    // Usamos this.buscarPorId() porque ese método ya tiene
    // la lógica de lanzar un error si no la encuentra.
    const foto = await this.buscarPorId(id);

    // Copiamos sobre la foto existente solamente
    // los datos que queremos modificar.
    Object.assign(foto, datos);

    // Le pedimos al Repository que guarde
    // la foto modificada.
    return fotoPropiedadRepository.actualizar(foto);
  }


  // ELIMINAR FOTO
  async eliminar(id: number): Promise<void> {

    // Primero verificamos que exista
    await this.buscarPorId(id);

    // Si llegamos hasta acá significa que sí existe
    // entonces podemos eliminarla.
    await fotoPropiedadRepository.eliminar(id);
  }
}

// Creamos una instancia
export const fotoPropiedadService =
  new FotoPropiedadService();