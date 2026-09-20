// Importamos Zod para validar los datos que llegan desde el frontend.
import { z } from "zod";


// DTO PARA CREAR UNA INMOBILIARIA

export const crearInmobiliariaSchema = z.object({

  // Nombre de fantasía de la inmobiliaria
  // Es obligatorio y no puede superar los 120 caracteres
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede superar los 120 caracteres"),


  // Descripción de la inmobiliaria, tambien es obligatoria.
  descripcion: z
    .string()
    .min(1, "La descripción es obligatoria"),


  // URL del logo.
  // Es opcional porque una inmobiliaria puede no tener logo, también permitimos null
  urlLogo: z
    .string()
    .max(500, "La URL no puede superar los 500 caracteres")
    .nullable()
    .optional(),


  // Teléfono de la inmobiliaria
  telefonoContacto: z
    .string()
    .min(1, "El teléfono de contacto es obligatorio")
    .max(40, "El teléfono no puede superar los 40 caracteres"),


  // Email de contacto
  emailContacto: z
    .string()
    .email("El email de contacto no es válido")
    .max(255, "El email no puede superar los 255 caracteres"),


  // La dirección de la oficina es opcional
  direccionOficina: z
    .string()
    .max(255, "La dirección no puede superar los 255 caracteres")
    .nullable()
    .optional(),


  // No recibimos TODO el objeto vendedor, recibimos solamente su ID.
  // .int()      = tiene que ser un número entero
  // .positive() = tiene que ser mayor a 0
  vendedorId: z
    .number()
    .int("El ID del vendedor debe ser un número entero")
    .positive("El ID del vendedor debe ser mayor a 0"),
});



// DTO PARA ACTUALIZAR UNA INMOBILIARIA

//NO usamos crearInmobiliariaSchema.partial() porque NO queremos permitir cambiar el vendedor
// de la inmobiliaria desde una actualización.
//
// Por eso indicamos manualmente qué campos se pueden modificar.
export const actualizarInmobiliariaSchema = z.object({

  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(120)
    .optional(),

  descripcion: z
    .string()
    .min(1, "La descripción es obligatoria")
    .optional(),

  urlLogo: z
    .string()
    .max(500)
    .nullable()
    .optional(),

  telefonoContacto: z
    .string()
    .min(1)
    .max(40)
    .optional(),

  emailContacto: z
    .string()
    .email("El email de contacto no es válido")
    .max(255)
    .optional(),

  direccionOficina: z
    .string()
    .max(255)
    .nullable()
    .optional(),
});



// TIPOS DE TYPESCRIPT

// TypeScript crea automáticamente el tipo mirando la estructura del schema de Zod.
export type CrearInmobiliariaDto =
  z.infer<typeof crearInmobiliariaSchema>;

export type ActualizarInmobiliariaDto =
  z.infer<typeof actualizarInmobiliariaSchema>;