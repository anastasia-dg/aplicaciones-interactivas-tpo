
import { z } from "zod";

// Reutilizamos las validaciones que ya hicimos
// para crear un vendedor y una inmobiliaria.
import { crearVendedorSchema } from "./vendedor-dto";
import { crearInmobiliariaSchema } from "./inmobiliaria-dto";

// DTO PARA REGISTRAR VENDEDOR + INMOBILIARIA
export const registroSchema = z.object({

  // Datos de la persona que se registra
  // Deben cumplir las validaciones del DTO de vendedor
  vendedor: crearVendedorSchema,

  // Datos de su inmobiliaria.
  // Omitimos vendedorId porque el vendedor
  // se va a crear en esta misma operación
  inmobiliaria: crearInmobiliariaSchema.omit({
    vendedorId: true,
  }),

});

// TypeScript deduce automáticamente el tipo de los datos que acepta este registro
export type RegistroDto = z.infer<typeof registroSchema>;