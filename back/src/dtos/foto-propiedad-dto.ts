import { z } from "zod";


// DTO PARA CREAR UNA FOTO DE UNA PROPIEDAD

export const crearFotoPropiedadSchema = z.object({

  // URL donde está guardada la imagen es obligatoria
  url: z
    .string()
    .min(1, "La URL de la foto es obligatoria")
    .max(500, "La URL no puede superar los 500 caracteres"),


  // Indica en qué posición se muestra la foto dentro de la galería
  // Tiene que ser un número entero y no puede ser negativo
  orden: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo"),


  // Indica si esta foto es la portada de la propiedad
  esPortada: z
    .boolean()
    .optional(),
});



// DTO PARA ACTUALIZAR UNA FOTO

// En una actualización podemos modificar solamente alguno de los datos
// Por eso usamos partial(), que convierte todos los campos anteriores en opcionales
export const actualizarFotoPropiedadSchema =
  crearFotoPropiedadSchema.partial();


// TIPOS DE TYPESCRIPT

export type CrearFotoPropiedadDto =
  z.infer<typeof crearFotoPropiedadSchema>;

export type ActualizarFotoPropiedadDto =
  z.infer<typeof actualizarFotoPropiedadSchema>;