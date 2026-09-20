import { z } from "zod";

// DTO PARA CREAR UNA RESEÑA

export const crearReseñaSchema = z.object({

  // Nombre de la persona que deja la reseña
  // Tiene que ser texto y no puede estar vacío.
  nombreAutor: z
    .string()
    .min(1, "El nombre del autor es obligatorio"),


  // Texto sobre la inmobiliaria
  // No puede estar vacío
  contenido: z
    .string()
    .min(1, "El contenido de la reseña es obligatorio"),


  // La calificación tiene que ser un número.
  //
  // .int() = tiene que ser entero
  // .min(1) = mínimo 1
  // .max(5) = máximo 5
  calificacion: z
    .number()
    .int("La calificación debe ser un número entero")
    .min(1, "La calificación mínima es 1")
    .max(5, "La calificación máxima es 5"),
});


// TIPO DE TYPESCRIPT

// TypeScript obtiene automáticamente el tipo a partir del schema
export type CrearReseñaDto =
  z.infer<typeof crearReseñaSchema>;