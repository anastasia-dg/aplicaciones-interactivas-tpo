import { z } from "zod";

// DTO PARA CREAR UN COMENTARIO

export const crearComentarioSchema = z.object({

  // Nombre de la persona que hace la pregunta
  // Tiene que ser un texto y no puede estar vacío.
  nombreAutor: z
    .string()
    .min(1, "El nombre del autor es obligatorio"),

  // La pregunta que la persona quiere hacer sobre la propiedad.
  // También tiene que tener contenido.
  pregunta: z
    .string()
    .min(1, "La pregunta es obligatoria"),
});



// DTO PARA RESPONDER UN COMENTARIO

export const responderComentarioSchema = z.object({

  respuesta: z
    .string()
    .min(1, "La respuesta es obligatoria"),
});


// TIPOS DE TYPESCRIPT

// Los tipos se generan automáticamente a partir de los schemas

export type CrearComentarioDto =
  z.infer<typeof crearComentarioSchema>;

export type ResponderComentarioDto =
  z.infer<typeof responderComentarioSchema>;