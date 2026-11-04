import { propiedadRepository } from "../repositories/propiedad.repository";
import { solicitudVisitaRepository } from "../repositories/solicitud-visita.repository";
import { historialEstadoPropiedadRepository } from "../repositories/historial-estado-propiedad.repository";
import { actividadService } from "./actividad-service";
import { inmobiliariaService } from "./inmobiliaria-service";
import { Propiedad } from "../entities/propiedad.entity";
import {
  EstadoPropiedad,
  TipoPropiedad,
  TipoOperacion,
  EstadoSolicitudVisita,
  TipoActividad,
} from "../entities/enums";
import {
  CrearPropiedadDto,
  ActualizarPropiedadDto,
  ListarPropiedadesDto,
} from "../dtos/propiedad-dto";
import { fotoPropiedadRepository } from "../repositories/foto-propiedad.repository";
import { AppDataSource } from "../config/data-source";
import { HistorialEstadoPropiedad } from "../entities/historial-estado-propiedad.entity";
import { Actividad } from "../entities/actividad.entity";



class PropiedadService {

  // Devuelve las propiedades filtradas junto con los datos de paginación
  async listar(filtros: ListarPropiedadesDto): Promise<{
    propiedades: Propiedad[];
    paginacion: {
      paginaActual: number;
      porPagina: number;
      totalRegistros: number;
      totalPaginas: number;
    };
  }> {

    const { propiedades, total } =
      await propiedadRepository.listar(filtros);

    // Si no hay resultados, igual devolvemos totalPaginas = 1
    // para que el frontend no tenga que contemplar el caso 0
    // 15 propiedades
    // limit = 5
    // 15 / 5 = 3 páginas
    const totalPaginas = Math.max( //el repository devuelve propiedades + total
      Math.ceil(total / filtros.limit), //math.ceil redondea para arriba
      1
    );

    return {
      propiedades,
      paginacion: {
        paginaActual: filtros.page,
        porPagina: filtros.limit,
        totalRegistros: total,
        totalPaginas,
      },
    };
  }


  // Busca una propiedad por su ID
  async buscarPorId(id: number): Promise<Propiedad> {
    const propiedad = await propiedadRepository.buscarPorId(id);

    if (!propiedad) {
      throw new Error("Propiedad no encontrada");
    }

    return propiedad;
  }
  
  // Lista las propiedades del vendedor con filtros y paginación.
  async listarMisPropiedades(
    filtros: ListarPropiedadesDto,
    vendedorId: number
  ) {
    // El Repository devuelve los resultados y su cantidad.
    const { propiedades, total } =
      await propiedadRepository.listarMisPropiedades(
        filtros,
        vendedorId
      );

    // Calculamos la cantidad de páginas.
    const totalPaginas = Math.max(
      Math.ceil(total / filtros.limit),
      1
    );

    return {
      propiedades,
      paginacion: {
        paginaActual: filtros.page,
        porPagina: filtros.limit,
        totalRegistros: total,
        totalPaginas,
      },
    };
  }

  
  // Busca una propiedad para mostrarla a los visitantes.
  async buscarPublicadaPorId(id: number): Promise<Propiedad> {

    // Consultamos solamente propiedades publicadas.
    const propiedad =
      await propiedadRepository.buscarPublicadaPorId(id);

    // Si no existe o no está publicada, devolvemos 404.
    if (!propiedad) {
      throw new Error("Propiedad no encontrada");
    }

    return propiedad;
  }

  // COMPROBAR QUE LA PROPIEDAD PERTENEZCA AL VENDEDOR
  async verificarPropietario(
    propiedadId: number,
    vendedorId: number
  ): Promise<void> {

    // Buscamos la propiedad que quieren modificar
    const propiedad = await this.buscarPorId(propiedadId);

    // Cada propiedad pertenece a una inmobiliaria
    // Buscamos los datos completos de esa inmobiliaria
    const inmobiliaria = await inmobiliariaService.buscarPorId(
      propiedad.inmobiliaria.id
    );

    // Comparamos el vendedor dueño con el vendedor autenticado
    if (inmobiliaria.vendedor.id !== vendedorId) {
      throw new Error(
        "No tenés permiso para modificar esta propiedad"
      );
    }
  }



  // CREAR UNA PROPIEDAD
  async crear(datos: CrearPropiedadDto): Promise<Propiedad> {

    // Buscamos la inmobiliaria usando el ID que llegó en el DTO
    const inmobiliaria = await inmobiliariaService.buscarPorId(datos.inmobiliariaId);

    // El precio debe ser mayor a 0
    if (datos.precio <= 0) {
      throw new Error("El precio debe ser mayor a 0");
    }

    // La superficie total debe ser mayor a 0
    if (datos.superficieTotalM2 <= 0) {
      throw new Error("La superficie total debe ser mayor a 0");
    }

    // Si mandaron superficie cubierta, debe ser mayor a 0
    if (
      datos.superficieCubiertaM2 != null &&
      datos.superficieCubiertaM2 <= 0
    ) {
      throw new Error("La superficie cubierta debe ser mayor a 0");
    }

    // Preparamos estos valores porque si es un terreno despues los tenemos que cambiar a null
    //let por si necesitamos cambiarlo
    let superficieCubiertaM2 = 
      datos.superficieCubiertaM2 != null // mandaron algo
        ? String(datos.superficieCubiertaM2) //si: hacer string
        : null; //no: hacer null

    let ambientes = datos.ambientes ?? null; //si datos.ambientes tiene un valor, usalo, sino null
    let dormitorios = datos.dormitorios ?? null;
    let banios = datos.banios ?? null;

    // Un terreno no tiene estos datos
    if (datos.tipo === TipoPropiedad.TERRENO) {
      superficieCubiertaM2 = null;
      ambientes = null;
      dormitorios = null;
      banios = null;
    }

    return propiedadRepository.crear({
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      tipo: datos.tipo,
      operacion: datos.operacion,
      // En el DTO es number, pero en la Entity es string
      precio: String(datos.precio),
      moneda: datos.moneda,
      direccion: datos.direccion,
      zona: datos.zona,
      superficieCubiertaM2,
      // En el DTO es number, pero en la Entity es string
      superficieTotalM2: String(datos.superficieTotalM2),
      ambientes,
      dormitorios,
      banios,
      antiguedadAnios: datos.antiguedadAnios ?? null,
      tags: datos.tags ?? [],
      // Toda propiedad nueva empieza como borrador.
      estado: EstadoPropiedad.BORRADOR,
      inmobiliaria,
    });
  }


  // ACTUALIZAR DATOS DE UNA PROPIEDAD
  async actualizar(id: number, datos: ActualizarPropiedadDto): Promise<Propiedad> {

    const propiedad = await this.buscarPorId(id);

    // Una propiedad finalizada no se puede modificar
    if (
      propiedad.estado === EstadoPropiedad.VENDIDA ||
      propiedad.estado === EstadoPropiedad.ALQUILADA ||
      propiedad.estado === EstadoPropiedad.CANCELADA
    ) {
      throw new Error("No se puede modificar una propiedad finalizada");
    }

    // Buscamos las solicitudes de visita de la propiedad
    const solicitudes = await solicitudVisitaRepository.buscarPorPropiedad(id);

    // Revisamos si tiene alguna visita confirmada FUTURA (si ya paso no bloquea)
    
    const ahora = new Date(); //pone la fecha actual

    // Comprobamos si existe una visita confirmada con fecha que todavía no paso
    const tieneVisitaConfirmada = solicitudes.some( //.some busca al menos una
      (solicitud) =>
        solicitud.estado === EstadoSolicitudVisita.CONFIRMADA &&
        new Date(solicitud.fechaHoraPropuesta) > ahora
    );


    if (tieneVisitaConfirmada) {
      throw new Error(
        "No se puede modificar una propiedad con visitas confirmadas"
      );
    }

    // Si mandaron un nuevo precio, debe ser mayor a 0
    if (
      datos.precio !== undefined &&
      datos.precio <= 0
    ) {
      throw new Error("El precio debe ser mayor a 0");
    }

    // Si mandaron superficie total, debe ser mayor a 0
    if (
      datos.superficieTotalM2 !== undefined &&
      datos.superficieTotalM2 <= 0
    ) {
      throw new Error("La superficie total debe ser mayor a 0");
    }

    // Si mandaron superficie cubierta y no es null,
    // debe ser mayor a 0
    if (
      datos.superficieCubiertaM2 !== undefined &&
      datos.superficieCubiertaM2 !== null &&
      datos.superficieCubiertaM2 <= 0
    ) {
      throw new Error("La superficie cubierta debe ser mayor a 0");
    }

    // Si no mandaron un nuevo tipo, usamos el que ya tenía
    const tipoFinal = datos.tipo ?? propiedad.tipo;

    // Separamos estos campos porque en el DTO son number
    // y en la Entity son string
    const { //sacamos de "datos" los 3 campos que tenemos que cambiar
      precio,
      superficieTotalM2,
      superficieCubiertaM2,
      ...otrosDatos //los demas campos de "datos" se guardan juntos dentro de la variable "otrosDatos"
    } = datos;

    //copiamos todos los datos que quedaron en otrosDatos
    const datosActualizados: Partial<Propiedad> = {
      ...otrosDatos,
    };

    // Convertimos el precio a string si fue enviado
    if (precio !== undefined) {
      datosActualizados.precio = String(precio);
    }

    // Convertimos la superficie total a string si fue enviada
    if (superficieTotalM2 !== undefined) {
      datosActualizados.superficieTotalM2 =
        String(superficieTotalM2);
    }

    // Si es null queda null
    // Si es un número, lo convertimos a string
    if (superficieCubiertaM2 !== undefined) {
      datosActualizados.superficieCubiertaM2 =
        superficieCubiertaM2 === null
          ? null
          : String(superficieCubiertaM2);
    }

    // Si la propiedad queda siendo un terreno
    // estos campos no corresponden
    if (tipoFinal === TipoPropiedad.TERRENO) {
      datosActualizados.superficieCubiertaM2 = null;
      datosActualizados.ambientes = null;
      datosActualizados.dormitorios = null;
      datosActualizados.banios = null;
    }

    // Aplicamos los cambios sobre la propiedad existente
    //agarra propiedad y reemplazale los cambios que aparecen em datosActualizados
    Object.assign(propiedad, datosActualizados); 
    return propiedadRepository.actualizar(propiedad);
  }


  // CAMBIAR ESTADO DE UNA PROPIEDAD
  async cambiarEstado(
    id: number,
    nuevoEstado: EstadoPropiedad
  ): Promise<Propiedad> {

    const propiedad = await this.buscarPorId(id);

    const estadoAnterior = propiedad.estado;
    // Buscamos las solicitudes de visita de esta propiedad.
    const solicitudes = await solicitudVisitaRepository.buscarPorPropiedad(id);

    // Guardamos la fecha y hora actual.
    const ahora = new Date();

    // Comprobamos si existe alguna visita confirmada
    // cuya fecha todavía no haya llegado.
    const tieneVisitaFuturaConfirmada = solicitudes.some(
      (solicitud) =>
        solicitud.estado === EstadoSolicitudVisita.CONFIRMADA &&
        new Date(solicitud.fechaHoraPropuesta) > ahora
    );

    // Si tiene una visita futura confirmada,
    // impedimos cancelar o finalizar la propiedad.
    if (
      tieneVisitaFuturaConfirmada &&
      (
        nuevoEstado === EstadoPropiedad.CANCELADA ||
        nuevoEstado === EstadoPropiedad.VENDIDA ||
        nuevoEstado === EstadoPropiedad.ALQUILADA
      )
    ) {
      throw new Error(
        "No se puede cancelar ni finalizar una propiedad con visitas futuras confirmadas"
      );
    }

    if (estadoAnterior === nuevoEstado) {
      throw new Error("La propiedad ya se encuentra en ese estado");
    }

    // Acá guardamos los estados a los que puede pasar.
    let estadosPermitidos: EstadoPropiedad[] = [];

    if (estadoAnterior === EstadoPropiedad.BORRADOR) {
      estadosPermitidos = [
        EstadoPropiedad.PUBLICADA,
        EstadoPropiedad.CANCELADA,
      ];
    }

    else if (estadoAnterior === EstadoPropiedad.PUBLICADA) {
      estadosPermitidos = [
        EstadoPropiedad.PAUSADA,
        EstadoPropiedad.RESERVADA,
        EstadoPropiedad.CANCELADA,
      ];
    }

    else if (estadoAnterior === EstadoPropiedad.PAUSADA) {
      estadosPermitidos = [
        EstadoPropiedad.PUBLICADA,
        EstadoPropiedad.CANCELADA,
      ];
    }

    else if (estadoAnterior === EstadoPropiedad.RESERVADA) {

      // Si era para venta puede pasar a vendida.
      if (propiedad.operacion === TipoOperacion.VENTA) {
        estadosPermitidos = [
          EstadoPropiedad.VENDIDA,
          EstadoPropiedad.CANCELADA,
        ];
      }

      // Si era para alquiler puede pasar a alquilada.
      else if (propiedad.operacion === TipoOperacion.ALQUILER) {
        estadosPermitidos = [
          EstadoPropiedad.ALQUILADA,
          EstadoPropiedad.CANCELADA,
        ];
      }
    }

    // Controlamos que el cambio de estado esté permitido.
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error(
        `No se puede cambiar de ${estadoAnterior} a ${nuevoEstado}`
      );
    }

    // Si queremos publicar la propiedad,
    // comprobamos que la galería esté lista.
    if (nuevoEstado === EstadoPropiedad.PUBLICADA) {

    // Buscamos todas las fotos de esta propiedad.
    const fotos =
        await fotoPropiedadRepository.buscarPorPropiedad(id);

    // REGLA: una propiedad publicada tiene que tener al menos una foto.
    if (fotos.length === 0) {
        throw new Error(
        "La propiedad debe tener al menos una foto para ser publicada"
        );
    }

    // Buscamos las fotos marcadas como portada.
    const portadas = fotos.filter( //filter() recorre y se queda con esPortada === true
        (foto) => foto.esPortada
    );

    // REGLA: tiene que existir una sola portada.
    if (portadas.length !== 1) {
        throw new Error(
        "La propiedad debe tener exactamente una foto de portada"
        );
    }
    }


    // Iniciamos una transacción.
    // Si falla alguna operación, se deshacen todas.
    return AppDataSource.transaction(async (manager) => {

      // Cambiamos el estado de la propiedad.
      propiedad.estado = nuevoEstado;

      // Guardamos la propiedad usando el manager
      // que pertenece a esta transacción.
      const propiedadActualizada = await manager.save(
        Propiedad,
        propiedad
      );

      // Creamos un registro con el estado anterior
      // y el nuevo estado de la propiedad.
      const historial = manager.create(
        HistorialEstadoPropiedad,
        {
          propiedad: propiedadActualizada,
          estadoAnterior,
          estadoNuevo: nuevoEstado,
        }
      );

      // Guardamos el historial dentro de la transacción.
      await manager.save(HistorialEstadoPropiedad, historial);

      // Creamos la notificación del cambio de estado.
      const actividad = manager.create(Actividad, {
        tipo: TipoActividad.CAMBIO_ESTADO_PROPIEDAD,
        descripcion:
          `La propiedad "${propiedad.titulo}" cambió de ${estadoAnterior} a ${nuevoEstado}`,
        leida: false,
        inmobiliaria: propiedad.inmobiliaria,
      });

      // Guardamos también la actividad en la transacción.
      await manager.save(Actividad, actividad);

      // Devolvemos la propiedad actualizada.
      return propiedadActualizada;
    });

  }


  // Elimina una propiedad.
  async eliminar(id: number): Promise<void> {

    const propiedad = await this.buscarPorId(id);

    const solicitudes =
      await solicitudVisitaRepository.buscarPorPropiedad(id);

    
  const ahora = new Date();

  const tieneVisitaConfirmada = solicitudes.some(
    (solicitud) =>
      solicitud.estado === EstadoSolicitudVisita.CONFIRMADA &&
      new Date(solicitud.fechaHoraPropuesta) > ahora
  );


    // No se puede eliminar si tiene una visita confirmada.
    if (tieneVisitaConfirmada) {
      throw new Error(
        "No se puede eliminar una propiedad con visitas confirmadas"
      );
    }

    // Tampoco se eliminan propiedades que ya finalizaron.
    if (
      propiedad.estado === EstadoPropiedad.VENDIDA ||
      propiedad.estado === EstadoPropiedad.ALQUILADA ||
      propiedad.estado === EstadoPropiedad.CANCELADA
    ) {
      throw new Error("No se puede eliminar una propiedad finalizada");
    }

    await propiedadRepository.eliminar(id);
  }
}

export const propiedadService = new PropiedadService();