import { fotoPropiedadRepository } from "../repositories/foto-propiedad.repository";
import { FotoPropiedad } from "../entities/foto-propiedad.entity";
import { EstadoPropiedad } from "../entities/enums";
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

  
  // Deja todas las fotos de una propiedad sin portada,
  // excepto la foto que queremos conservar (si la hay)
  private async quitarPortadas(
    propiedadId: number,
    fotoExceptuadaId?: number
  ): Promise<void> {

    // Buscamos todas las fotos de la propiedad.
    const fotos = await fotoPropiedadRepository.buscarPorPropiedad(
      propiedadId
    );

    // Recorremos las fotos.
    for (const foto of fotos) {

      // Si esta foto ya es portada y no es la exceptuada,
      // le quitamos la marca de portada.
      if (foto.esPortada && foto.id !== fotoExceptuadaId) {
        foto.esPortada = false;

        // Guardamos el cambio en PostgreSQL.
        await fotoPropiedadRepository.actualizar(foto);
      }
    }
  }


  // CREAR FOTO
  async crear(
    propiedadId: number,
    datos: CrearFotoPropiedadDto
  ): Promise<FotoPropiedad> {

    // Comprobamos que la propiedad exista.
    const propiedad = await propiedadRepository.buscarPorId(propiedadId);

    if (!propiedad) {
      throw new Error("Propiedad no encontrada");
    }

    // Si la nueva foto será portada, quitamos las portadas anteriores.
    if (datos.esPortada === true) {
      await this.quitarPortadas(propiedadId);
    }

    // Guardamos la nueva foto.
    return fotoPropiedadRepository.crear({
      url: datos.url,
      orden: datos.orden,
      esPortada: datos.esPortada ?? false,
      propiedad,
    });
  }



  //ACTUALIZAR FOTO
  async actualizar(
    id: number,
    datos: ActualizarFotoPropiedadDto
  ): Promise<FotoPropiedad> {

    // Buscamos la foto que queremos modificar.
    const foto = await this.buscarPorId(id);

    // Si queremos convertirla en portada,
    // quitamos la marca de las demás fotos.
    if (datos.esPortada === true) {
      await this.quitarPortadas(foto.propiedad.id, foto.id);
    }

    // Si queremos quitarle la portada a una foto publicada,
    // primero comprobamos que no deje la propiedad sin portada.
    if (
      datos.esPortada === false &&
      foto.esPortada &&
      foto.propiedad.estado === EstadoPropiedad.PUBLICADA
    ) {
      throw new Error(
        "Una propiedad publicada debe conservar una foto de portada"
      );
    }

    // Aplicamos los cambios recibidos.
    Object.assign(foto, datos);

    // Guardamos la foto actualizada.
    return fotoPropiedadRepository.actualizar(foto);
  }


  // ELIMINAR FOTO
  async eliminar(id: number): Promise<void> {

    // Comprobamos que la foto exista.
    const foto = await this.buscarPorId(id);

    // No dejamos eliminar la portada de una propiedad publicada.
    if (
      foto.esPortada &&
      foto.propiedad.estado === EstadoPropiedad.PUBLICADA
    ) {
      throw new Error(
        "No se puede eliminar la portada de una propiedad publicada"
      );
    }

    // Si pasó la validación, eliminamos la foto.
    await fotoPropiedadRepository.eliminar(id);
  }

}
// Creamos una instancia
export const fotoPropiedadService =
  new FotoPropiedadService();