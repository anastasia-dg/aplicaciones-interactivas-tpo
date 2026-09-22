import { z } from "zod";

// Importamos los enums para poder validar
// que solamente se reciban valores permitidos.
import {
  TipoPropiedad,
  TipoOperacion,
  EstadoPropiedad,
} from "../entities/enums";


// DTO PARA CREAR UNA PROPIEDAD

export const crearPropiedadSchema = z.object({

  // Título de la publicación.
  // Es obligatorio y coincide con el máximo
  // permitido por la Entity.
  titulo: z
    .string()
    .min(1, "El título es obligatorio")
    .max(160, "El título no puede superar los 160 caracteres"),


  // Descripción completa de la propiedad.
  // Es obligatoria.
  descripcion: z
    .string()
    .min(1, "La descripción es obligatoria"),


  // Tipo de propiedad.
  // Solamente puede ser uno de los valores definidos
  // en el enum TipoPropiedad.
  tipo: z
    .nativeEnum(TipoPropiedad),


  // Tipo de operación.
  // Solamente puede ser VENTA o ALQUILER.
  operacion: z
    .nativeEnum(TipoOperacion),


  // Precio de la propiedad.
  //
  // La Entity utiliza decimal, pero cuando llega
  // desde el frontend normalmente lo recibimos como número.
  //
  // Debe ser mayor a 0.
  precio: z
    .number()
    .positive("El precio debe ser mayor a 0"),


  // Moneda utilizada.
  // Solamente permitimos ARS o USD,
  // igual que en la Entity.
  moneda: z
    .enum(["ARS", "USD"]),


  // Dirección de la propiedad.
  direccion: z
    .string()
    .min(1, "La dirección es obligatoria")
    .max(255, "La dirección no puede superar los 255 caracteres"),


  // Zona, localidad o barrio.
  zona: z
    .string()
    .min(1, "La zona es obligatoria")
    .max(120, "La zona no puede superar los 120 caracteres"),


  // Superficie cubierta.
  //
  // Es opcional porque la Entity permite null
  // y además puede no corresponder, por ejemplo,
  // en un terreno.
  superficieCubiertaM2: z
    .number()
    .positive("La superficie cubierta debe ser mayor a 0")
    .nullable()
    .optional(),


  // Superficie total de la propiedad.
  // Es obligatoria y debe ser mayor a 0.
  superficieTotalM2: z
    .number()
    .positive("La superficie total debe ser mayor a 0"),


  // Cantidad de ambientes.
  // Es opcional.
  ambientes: z
    .number()
    .int("La cantidad de ambientes debe ser un número entero")
    .nonnegative("La cantidad de ambientes no puede ser negativa")
    .nullable()
    .optional(),


  // Cantidad de dormitorios.
  // Es opcional.
  dormitorios: z
    .number()
    .int("La cantidad de dormitorios debe ser un número entero")
    .nonnegative("La cantidad de dormitorios no puede ser negativa")
    .nullable()
    .optional(),


  // Cantidad de baños.
  // Es opcional.
  banios: z
    .number()
    .int("La cantidad de baños debe ser un número entero")
    .nonnegative("La cantidad de baños no puede ser negativa")
    .nullable()
    .optional(),


  // Antigüedad de la propiedad en años.
  // Es opcional.
  antiguedadAnios: z
    .number()
    .int("La antigüedad debe ser un número entero")
    .nonnegative("La antigüedad no puede ser negativa")
    .nullable()
    .optional(),


  // Lista de amenities o características.
  //
  // Ejemplo:
  // ["pileta", "cochera", "balcon"]
  //
  // Cada elemento tiene que ser un texto.
  tags: z
    .array(z.string())
    .optional(),


  // NO recibimos el objeto completo de inmobiliaria.
  // Recibimos solamente su ID.
  //
  // La relación se resuelve después en el service.
  inmobiliariaId: z
    .number()
    .int("El ID de la inmobiliaria debe ser un número entero")
    .positive("El ID de la inmobiliaria debe ser mayor a 0"),
});


// DTO PARA ACTUALIZAR UNA PROPIEDAD
// hacemos todos los campos opcionales EXCEPTO InmobiliariaId (para eso usamos .omit())
// asi no se puede actualizar la inmobiliaria a la que pertenece la propiedad
export const actualizarPropiedadSchema = 
  crearPropiedadSchema
    .omit({ inmobiliariaId: true })
    .partial();


// DTO PARA CAMBIAR EL ESTADO DE UNA PROPIEDAD

export const cambiarEstadoPropiedadSchema = z.object({

  // El estado solamente puede ser uno de los estados definidos en EstadoPropiedad.
  estado: z.nativeEnum(EstadoPropiedad),
});



// TypeScript obtiene automáticamente
// el tipo a partir del schema de Zod.
export type CrearPropiedadDto =
  z.infer<typeof crearPropiedadSchema>;

export type ActualizarPropiedadDto =
  z.infer<typeof actualizarPropiedadSchema>;

// Tipo de TypeScript generado a partir del schema
export type CambiarEstadoPropiedadDto =
  z.infer<typeof cambiarEstadoPropiedadSchema>;