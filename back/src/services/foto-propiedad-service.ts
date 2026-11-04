import { fotoPropiedadRepository } from "../repositories/foto-propiedad.repository";
import { FotoPropiedad } from "../entities/foto-propiedad.entity";
import { EstadoPropiedad } from "../entities/enums";
import { propiedadRepository } from "../repositories/propiedad.repository";
import {
  CrearFotoPropiedadDto,
  ActualizarFotoPropiedadDto,
} from "../dtos/foto-propiedad-dto";
import { AppDataSource } from "../config/data-source";
import { solicitudVisitaRepository } from "../repositories/solicitud-visita.repository";
import { EstadoSolicitudVisita } from "../entities/enums";

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
  
  // Busca una foto que pueda mostrarse públicamente.
  async buscarPublicaPorId(id: number): Promise<FotoPropiedad> {
    const foto = await fotoPropiedadRepository.buscarPublicaPorId(id);

    // Si no existe o pertenece a una propiedad no publicada.
    if (!foto) {
      throw new Error("Foto no encontrada");
    }

    return foto;
  }

  // Busca las fotos públicas de una propiedad.
  buscarPublicasPorPropiedad(
    propiedadId: number
  ): Promise<FotoPropiedad[]> {
    return fotoPropiedadRepository.buscarPublicasPorPropiedad(
      propiedadId
    );
  }


  // Comprueba si una propiedad puede modificar sus fotos.
  private async verificarEdicionPermitida(
    propiedadId: number
  ): Promise<void> {

    // Buscamos la propiedad.
    const propiedad = await propiedadRepository.buscarPorId(propiedadId);

    if (!propiedad) {
      throw new Error("Propiedad no encontrada");
    }

    // No permitimos modificar fotos de propiedades finalizadas.
    if (
      propiedad.estado === EstadoPropiedad.VENDIDA ||
      propiedad.estado === EstadoPropiedad.ALQUILADA ||
      propiedad.estado === EstadoPropiedad.CANCELADA
    ) {
      throw new Error("No se pueden modificar fotos de una propiedad finalizada");
    }

    // Buscamos las solicitudes de visita.
    const solicitudes =
      await solicitudVisitaRepository.buscarPorPropiedad(propiedadId);

    // Comprobamos si alguna visita está confirmada
    // y tiene una fecha posterior a la actual.
    const tieneVisitaFutura = solicitudes.some(
      (solicitud) =>
        solicitud.estado === EstadoSolicitudVisita.CONFIRMADA &&
        new Date(solicitud.fechaHoraPropuesta) > new Date()
    );

    // Si existe, impedimos modificar las fotos.
    if (tieneVisitaFutura) {
      throw new Error(
        "No se pueden modificar fotos con visitas futuras confirmadas"
      );
    }
  }


  // CREAR FOTO
  async crear(
    propiedadId: number,
    datos: CrearFotoPropiedadDto
  ): Promise<FotoPropiedad> {

    // Comprobamos que la propiedad exista.
    const propiedad = await propiedadRepository.buscarPorId(propiedadId);
    
    await this.verificarEdicionPermitida(propiedadId);

    if (!propiedad) {
      throw new Error("Propiedad no encontrada");
    }

    
    // Si la nueva foto será portada,
    // hacemos todos los cambios en una transacción.
    if (datos.esPortada === true) {

      return AppDataSource.transaction(async (manager) => {

        // Buscamos las fotos actuales de la propiedad.
        const fotos = await manager.find(FotoPropiedad, {
          where: {
            propiedad: { id: propiedadId },
          },
        });

        // Quitamos la portada a las fotos anteriores.
        for (const foto of fotos) {
          foto.esPortada = false;
        }

        // Guardamos los cambios.
        await manager.save(FotoPropiedad, fotos);

        // Creamos la foto nueva y la marcamos como portada.
        const nuevaFoto = manager.create(FotoPropiedad, {
          url: datos.url,
          orden: datos.orden,
          esPortada: true,
          propiedad,
        });

        // Guardamos la nueva foto dentro de la transacción.
        return manager.save(FotoPropiedad, nuevaFoto);
      });
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

    await this.verificarEdicionPermitida(foto.propiedad.id);

    // Si queremos convertir esta foto en portada,
    // hacemos los cambios dentro de una transacción.
    if (datos.esPortada === true) {

      return AppDataSource.transaction(async (manager) => {

        // Buscamos todas las fotos de esta propiedad.
        const fotos = await manager.find(FotoPropiedad, {
          where: {
            propiedad: { id: foto.propiedad.id },
          },
        });

        // Recorremos las fotos y dejamos solamente
        // la elegida como portada.
        for (const otraFoto of fotos) {
          otraFoto.esPortada = otraFoto.id === foto.id;
        }

        // Guardamos todos los cambios en la transacción.
        await manager.save(FotoPropiedad, fotos);

        // Aplicamos los demás cambios recibidos,
        // por ejemplo la URL o el orden.
        Object.assign(foto, datos);

        // Guardamos la foto elegida.
        return manager.save(FotoPropiedad, foto);
      });
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

    await this.verificarEdicionPermitida(foto.propiedad.id);

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