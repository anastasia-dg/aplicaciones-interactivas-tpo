import { solicitudVisitaRepository } from "../repositories/solicitud-visita.repository";
import { propiedadRepository } from "../repositories/propiedad.repository";
import { actividadService } from "./actividad-service";
import { SolicitudVisita } from "../entities/solicitud-visita.entity";
import { EstadoSolicitudVisita, TipoActividad,} from "../entities/enums";
import { CrearSolicitudVisitaDto } from "../dtos/solicitud-visita-dto";


class SolicitudVisitaService {

  //Listar todas las solicitudes
  listar(): Promise<SolicitudVisita[]> {
    return solicitudVisitaRepository.listar();
  }


  //BUSCAR UNA SOLICITUD POR ID
 async buscarPorId(id: number): Promise<SolicitudVisita> {

    // Buscamos la solicitud en la base de datos.
    const solicitud = await solicitudVisitaRepository.buscarPorId(id);

    // Si no existe, da error
    if (!solicitud) {
      throw new Error("Solicitud de visita no encontrada");
    }
    return solicitud;
  }


  // BUSCAR SOLICITUDES DE UNA PROPIEDAD

  buscarPorPropiedad(propiedadId: number): Promise<SolicitudVisita[]> {
    return solicitudVisitaRepository.buscarPorPropiedad(propiedadId);
  }


  //CREAR UNA SOLICITUD DE VISITA
    async crear( propiedadId: number,  datos: CrearSolicitudVisitaDto): Promise<SolicitudVisita> {

    //Comprobamos que la propiedad exista
    const propiedad = await propiedadRepository.buscarPorId(propiedadId);

    if (!propiedad) {
      throw new Error("Propiedad no encontrada");
    }

    //Comprobar que tenga una fecha propuesta
    if (!datos.fechaHoraPropuesta) {
      throw new Error(
        "La fecha y hora de la visita son obligatorias"
      );
    }

    //Comprobar que la fech SEa futura
    // new Date() sin parámetros representa la fecha y hora actual.
    const ahora = new Date();

    // La fecha propuesta tiene que ser POSTERIOR a la fecha y hora actual.
    if (datos.fechaHoraPropuesta <= ahora) {
      throw new Error(
        "La fecha de la visita debe ser futura"
      );
    }


    //Creamos la solicitud
    const solicitud = await solicitudVisitaRepository.crear({
        // Datos que ya fueron validados por el DTO.
        nombreSolicitante: datos.nombreSolicitante,
        telefonoSolicitante: datos.telefonoSolicitante,
        fechaHoraPropuesta: datos.fechaHoraPropuesta,
        // Si no mandaron mensaje, guardamos null.
        mensaje: datos.mensaje ?? null,
        // Asociamos la propiedad que ya comprobamos que existe.
        propiedad: propiedad,
        // Toda solicitud nueva comienza siempre como PENDIENTE.
        estado: EstadoSolicitudVisita.PENDIENTE,
    });


    //generamos una actividad
    await actividadService.crear({

      tipo: TipoActividad.SOLICITUD_VISITA,
      descripcion:
        `Nueva solicitud de visita para "${propiedad.titulo}"`,
      leida: false,
      inmobiliaria: propiedad.inmobiliaria,
    });

    // Devolvemos la solicitud creada.
    return solicitud;
  }


  //CAMBIAR EL ESTADO DE UNA SOLICITUD

  async cambiarEstado(id: number, nuevoEstado: EstadoSolicitudVisita): Promise<SolicitudVisita> {

    //buscamos la solicitud.
    const solicitud = await this.buscarPorId(id);

    // REGLA: controlamos qué cambios de estado están permitidos.
    const estadoActual = solicitud.estado;


    // Una solicitud PENDIENTE puede:
    //
    // PENDIENTE a CONFIRMADA
    // PENDIENTE a CANCELADA
    // PENDIENTE a RECHAZADA
    if (estadoActual === EstadoSolicitudVisita.PENDIENTE) { //si el estado actual es pendiente:

      if (
        nuevoEstado !== EstadoSolicitudVisita.CONFIRMADA && //si el nuevo estado NO es confirmada
        nuevoEstado !== EstadoSolicitudVisita.CANCELADA && // Y NO es cancelada
        nuevoEstado !== EstadoSolicitudVisita.RECHAZADA // Y NO es rechazada: 
      ) {
        throw new Error(
          "Cambio de estado de solicitud no permitido" //entonces no es un estado valido y da error
        );
      }
    }


    // Una solicitud CONFIRMADA puede:
    //
    // CONFIRMADA a REALIZADA
    // CONFIRMADA a CANCELADA
    // CONFIRMADA a RECHAZADA
    else if (
      estadoActual === EstadoSolicitudVisita.CONFIRMADA
    ) {

      if (
        nuevoEstado !== EstadoSolicitudVisita.REALIZADA &&
        nuevoEstado !== EstadoSolicitudVisita.CANCELADA &&
        nuevoEstado !== EstadoSolicitudVisita.RECHAZADA
      ) {
        throw new Error(
          "Cambio de estado de solicitud no permitido"
        );
      }
    }


    // Si está REALIZADA, CANCELADA o RECHAZADA,
    // no permitimos continuar cambiando el estado.
    else {
      throw new Error(
        "La solicitud ya se encuentra finalizada"
      );
    }


    // Si llegamos hasta aca el cambio es valido
    solicitud.estado = nuevoEstado;

    // Guardamos el cambio.
    return solicitudVisitaRepository.actualizar(solicitud);
  }


  // ELIMINAR SOLICITUD
  async eliminar(id: number): Promise<void> {

    // Primero comprobamos que exista.
    await this.buscarPorId(id);

    // Si existe, la eliminamos.
    await solicitudVisitaRepository.eliminar(id);
  }
}


// Creamos una instancia
export const solicitudVisitaService =
  new SolicitudVisitaService();