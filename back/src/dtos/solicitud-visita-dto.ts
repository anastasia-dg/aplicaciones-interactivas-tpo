import { z } from "zod";
// Importamos también el enum de los estados
import { EstadoSolicitudVisita } from "../entities/enums";

// DTO PARA CREAR UNA SOLICITUD DE VISITA

export const crearSolicitudVisitaSchema = z.object({

  // Nombre de la persona que quiere visitar la propiedad
  nombreSolicitante: z
    .string()
    .min(1, "El nombre del solicitante es obligatorio"),


  // Teléfono de la persona
  telefonoSolicitante: z
    .string()
    .min(1, "El teléfono del solicitante es obligatorio"),


  // Fecha y hora que propone para realizar la visita.
  // Cuando el frontend manda una fecha mediante JSON llega como un string.
  // z.coerce.date() intenta convertir ese texto automáticamente a un objeto Date de JavaScript
  fechaHoraPropuesta: z.coerce.date(),


  // El mensaje es opcional
  mensaje: z
    .string()
    .nullable()
    .optional(),
});



// DTO PARA CAMBIAR EL ESTADO DE UNA SOLICITUD

export const cambiarEstadoSolicitudVisitaSchema = z.object({

  // El estado solamente puede ser uno de los valores
  // permitidos por nuestro enum:
  //
  // PENDIENTE
  // CONFIRMADA
  // REALIZADA
  // CANCELADA
  // RECHAZADA
  estado: z.nativeEnum(EstadoSolicitudVisita),
});


// TIPO DE TYPESCRIPT

export type CrearSolicitudVisitaDto =
  z.infer<typeof crearSolicitudVisitaSchema>;

export type CambiarEstadoSolicitudVisitaDto =
  z.infer<typeof cambiarEstadoSolicitudVisitaSchema>;