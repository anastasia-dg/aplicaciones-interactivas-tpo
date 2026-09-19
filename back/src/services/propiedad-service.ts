import { propiedadRepository } from "../repositories/propiedad.repository";
// Necesitamos las solicitudes de visita para controlar si una propiedad tiene una visita CONFIRMADA.
import { solicitudVisitaRepository } from "../repositories/solicitud-visita.repository";
// Service del historial lo usamos cada vez que cambia el estado de una propiedad.
import { historialEstadoPropiedadService } from "./historial-estado-propiedad-service";
// Service de actividad lo usamos para generar una actividad cuando cambia el estado de una propiedad.
import { actividadService } from "./actividad-service";
import { Propiedad } from "../entities/propiedad.entity";
import {
  EstadoPropiedad,
  EstadoSolicitudVisita,
  TipoActividad,
  TipoOperacion,
  TipoPropiedad,
} from "../entities/enums";


class PropiedadService {

  //LISTAR TODAS LAS PROPIEDADES
  listar(): Promise<Propiedad[]> {
    return propiedadRepository.listar();
  }

  //BUSCAR UNA PROPIEDAD POR ID
  async buscarPorId(id: number): Promise<Propiedad> {
    const propiedad = await propiedadRepository.buscarPorId(id);
    // Si no existe, da error
    if (!propiedad) {
      throw new Error("Propiedad no encontrada");
    }
    return propiedad;
  }


  //CREAR UNA PROPIEDAD
  async crear(datos: Partial<Propiedad>): Promise<Propiedad> {

    //VALIDAR PRECIO
    // La entidad guarda el decimal como string, por eso usamos Number() para convertirlo a número.
    if (
      datos.precio === undefined || //si precio esta vacio
      Number(datos.precio) <= 0 // o si precio es menor a 0:
    ) {
      throw new Error( //da error
        "El precio de la propiedad debe ser mayor a 0"
      );
    }


    //VALIDAR SUPERFICIE TOTAL

    // Si viene una superficie total, tiene que ser mayor a 0.
    if (
      datos.superficieTotalM2 !== undefined && //si tiene un valor y ese valor es menor a 0: 
      Number(datos.superficieTotalM2) <= 0
    ) {
      throw new Error( //da error
        "La superficie total debe ser mayor a 0"
      );
    }


    //VALIDAR SUPERFICIE CUBIERTA

    // Si viene una superficie cubierta tiene que ser mayor a 0.
    if (
      datos.superficieCubiertaM2 !== undefined && //si tiene un valor 
      datos.superficieCubiertaM2 !== null && //y no es null
      Number(datos.superficieCubiertaM2) <= 0 //y es menor a 0
    ) {
      throw new Error( //da error
        "La superficie cubierta debe ser mayor a 0"
      );
    }


    //REGLAS PARA TERRENO
    // Si es un TERRENO, no corresponde guardar:
    // - superficie cubierta
    // - ambientes
    // - dormitorios
    // - baños
    // porque esos datos no aplican a un terreno.
    if (datos.tipo === TipoPropiedad.TERRENO) {

      datos.superficieCubiertaM2 = null;
      datos.ambientes = null;
      datos.dormitorios = null;
      datos.banios = null;
    }


    //ESTADO INICIAL
    // Toda propiedad nueva empieza como BORRADOR.
    datos.estado = EstadoPropiedad.BORRADOR;

    //GUARDAMOS LA PROPIEDAD
    return propiedadRepository.crear(datos);
  }


  //ACTUALIZAR DATOS DE UNA PROPIEDAD
  async actualizar(id: number, datos: Partial<Propiedad>): Promise<Propiedad> {

    //comprobamos que exista.
    const propiedad = await this.buscarPorId(id);

    // REGLA: VENDIDA, ALQUILADA o CANCELADA no se pueden editar.
    if (
      propiedad.estado === EstadoPropiedad.VENDIDA ||
      propiedad.estado === EstadoPropiedad.ALQUILADA ||
      propiedad.estado === EstadoPropiedad.CANCELADA
    ) {
      throw new Error(
        "No se puede editar una propiedad finalizada"
      );
    }

    // REGLA: si tiene una visita CONFIRMADA tampoco se puede editar.
    const solicitudes = await solicitudVisitaRepository.buscarPorPropiedad(id);

    // .some() pregunta: Existe AL MENOS UNA solicitud CONFIRMADA?
    const tieneVisitaConfirmada = solicitudes.some(
      (solicitud) => solicitud.estado === EstadoSolicitudVisita.CONFIRMADA
    );

    if (tieneVisitaConfirmada) {
      throw new Error(
        "No se puede editar una propiedad con una visita confirmada"
      );
    }


    //VALIDAR PRECIO SI LO ESTAN MODIFICANDO
    if (
      datos.precio !== undefined && //si hay un valor
      Number(datos.precio) <= 0 //y ese valor es menor o igual a 0
    ) {
      throw new Error( //da error
        "El precio de la propiedad debe ser mayor a 0"
      );
    }


    //VALIDAR SUPERFICIE TOTAL SI LA MODIFICAN
    if (
      datos.superficieTotalM2 !== undefined && //si hay un valor
      Number(datos.superficieTotalM2) <= 0 // y es menor o igual a 0
    ) {
      throw new Error( //da error
        "La superficie total debe ser mayor a 0"
      );
    }


    //VALIDAR SUPERFICIE CUBIERTA SI LA MODIFICAN
    if (
      datos.superficieCubiertaM2 !== undefined && //si hay un valor
      datos.superficieCubiertaM2 !== null && //y no es null
      Number(datos.superficieCubiertaM2) <= 0 //y es menor o igual a 0
    ) {
      throw new Error( //da error
        "La superficie cubierta debe ser mayor a 0"
      );
    }


    //CONTROLAR SI VA A QUEDAR COMO TERRENO
    // Puede pasar que ya fuera TERRENO,
    // o que ahora estén cambiando el tipo a TERRENO.

    const tipoFinal = datos.tipo ?? propiedad.tipo; //mandaron un tipo nuevo? SI: uso datos.tipo/ NO: uso propiedad.tipo

    if (tipoFinal === TipoPropiedad.TERRENO) {

      // Estos datos no aplican para terrenos.
      datos.superficieCubiertaM2 = null;
      datos.ambientes = null;
      datos.dormitorios = null;
      datos.banios = null;
    }


    // Copiamos los nuevos datos sobre la propiedad existente.
    Object.assign(propiedad, datos);

    // Guardamos los cambios.
    return propiedadRepository.actualizar(propiedad);
  }



  //CAMBIAR ESTADO DE UNA PROPIEDAD
  async cambiarEstado(id: number, nuevoEstado: EstadoPropiedad): Promise<Propiedad> {

    // Buscamos la propiedad.
    const propiedad = await this.buscarPorId(id);

    // Guardamos el estado anterior porque después lo necesitamos para crear el historial.
    const estadoAnterior = propiedad.estado;


    //EVITAR CAMBIO AL MISMO ESTADO
    if (estadoAnterior === nuevoEstado) {
      throw new Error(
        "La propiedad ya se encuentra en ese estado"
      );
    }


    //VALIDAR CAMBIO DE ESTADO
    // Creamos una lista con los estados permitidos según el estado actual.
    let estadosPermitidos: EstadoPropiedad[] = [];

    // Si está en BORRADOR:
    // BORRADOR a PUBLICADA
    // BORRADOR a CANCELADA
    if (estadoAnterior === EstadoPropiedad.BORRADOR) {

      estadosPermitidos = [
        EstadoPropiedad.PUBLICADA,
        EstadoPropiedad.CANCELADA,
      ];
    }

    // Si está PUBLICADA:
    // PUBLICADA a PAUSADA
    // PUBLICADA a RESERVADA
    // PUBLICADA a CANCELADA
    else if (estadoAnterior === EstadoPropiedad.PUBLICADA) {

      estadosPermitidos = [
        EstadoPropiedad.PAUSADA,
        EstadoPropiedad.RESERVADA,
        EstadoPropiedad.CANCELADA,
      ];
    }


    // Si está PAUSADA:
    // PAUSADA a PUBLICADA
    // PAUSADA a CANCELADA
    else if (estadoAnterior === EstadoPropiedad.PAUSADA) {

      estadosPermitidos = [
        EstadoPropiedad.PUBLICADA,
        EstadoPropiedad.CANCELADA,
      ];
    }


    // Si está RESERVADA tenemos que mirar qué tipo de operación tiene la propiedad.
    else if (estadoAnterior === EstadoPropiedad.RESERVADA) {

      // Si la propiedad es para VENTA, puede terminar como VENDIDA.
      if (propiedad.operacion === TipoOperacion.VENTA) {

        estadosPermitidos = [
          EstadoPropiedad.VENDIDA,
          EstadoPropiedad.CANCELADA,
        ];
      }

      // Si la propiedad es para ALQUILER, puede terminar como ALQUILADA.
      else if (
        propiedad.operacion === TipoOperacion.ALQUILER
      ) {

        estadosPermitidos = [
          EstadoPropiedad.ALQUILADA,
          EstadoPropiedad.CANCELADA,
        ];
      }
    }


    // Si está VENDIDA, ALQUILADA o CANCELADA, no agregamos ningún estado permitido
    // Entonces estadosPermitidos queda []


    //COMPROBAMOS SI EL NUEV0 ESTADO ESTA PERMITIDO
    // includes() pregunta: nuevoEstado está dentro de estadosPermitidos?
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error( //Si no esta da error
        "Cambio de estado de propiedad no permitido"
      );
    }


    //CAMBIAMOS EL ESTADO
    propiedad.estado = nuevoEstado;

    // Guardamos el nuevo estado en la BD.
    const propiedadActualizada =
      await propiedadRepository.actualizar(propiedad);


    //GUARDAR EL CAMBIO EN EL HISTORIAL
    await historialEstadoPropiedadService.crear({

      // Estado que tenía antes.
      estadoAnterior: estadoAnterior,

      // Estado al que acaba de cambiar.
      estadoNuevo: nuevoEstado,

      // Propiedad a la que pertenece este cambio.
      propiedad: propiedadActualizada,
    });


    //CREAR ACTIVIDAD
    await actividadService.crear({

      tipo: TipoActividad.CAMBIO_ESTADO_PROPIEDAD,

      descripcion:
        `La propiedad "${propiedad.titulo}" cambió de ` +
        `${estadoAnterior} a ${nuevoEstado}`,

      leida: false,

      inmobiliaria: propiedad.inmobiliaria,
    });


    //devolvemos la propiedad con su nuevo estado.
    return propiedadActualizada;
  }


  //ELIMINAR UNA PROPIEDAD
  async eliminar(id: number): Promise<void> {

    // Comprobamos que exista.
    const propiedad = await this.buscarPorId(id);

    // REGLA: si tiene una visita CONFIRMADA no se puede eliminar.
    const solicitudes = await solicitudVisitaRepository.buscarPorPropiedad(id);

    const tieneVisitaConfirmada = solicitudes.some( 
      (solicitud) =>
        solicitud.estado === EstadoSolicitudVisita.CONFIRMADA
    );

    if (tieneVisitaConfirmada) {
      throw new Error(
        "No se puede eliminar una propiedad con una visita confirmada"
      );
    }

    // REGLA: una propiedad finalizada no se elimina
    if (
      propiedad.estado === EstadoPropiedad.VENDIDA ||
      propiedad.estado === EstadoPropiedad.ALQUILADA ||
      propiedad.estado === EstadoPropiedad.CANCELADA
    ) {
      throw new Error(
        "No se puede eliminar una propiedad finalizada"
      );
    }

    // Si pasó todos los controles, la eliminamos.
    await propiedadRepository.eliminar(id);
  }
}


// Creamos una instancia
export const propiedadService = new PropiedadService();