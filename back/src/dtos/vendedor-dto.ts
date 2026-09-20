import { z } from "zod";

// z.object significa: Espero recibir un objeto que tenga esta estructura
export const crearVendedorSchema = z.object({


//DTO PARA CREAR UN VENDEDOR

  // nombreCompleto tiene que ser un texto.
  //
  // .min(1) significa que no puede estar vacío.
  // .max(120) porque nuestra Entity permite como máximo 120 caracteres.
  nombreCompleto: z
    .string()
    .min(1, "El nombre completo es obligatorio")
    .max(120, "El nombre completo no puede superar los 120 caracteres"),


  // El email también tiene que ser texto.
  //
  // .email() comprueba que tenga formato de email.
  email: z
    .string()
    .email("El email no es válido")
    .max(255, "El email no puede superar los 255 caracteres"),

//el usuario no manda contrasenaHash, manda normal, despues se hace Hash
  contrasenaHash: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .max(255, "La contraseña no puede superar los 255 caracteres"),


  // El teléfono es opcional.
  // .optional() significa que directamente puede NO venir.
  // .nullable() significa que también aceptamos null.
  telefono: z
    .string()
    .max(40, "El teléfono no puede superar los 40 caracteres")
    .nullable()
    .optional(),
});


//DTO PARA ACTUALIZAR UN VENDEDOR

// Para actualizar lo hacemos como el de arriba, pero hacemos que todos sus campos sean opcionales.
export const actualizarVendedorSchema =
  crearVendedorSchema.partial();


  
// TIPOS DE TYPESCRIPT

//Z.infer le dice a typeScript mira CrearVendedorSchema y creame automaticamente un tipo a partir de el (deduci el tipo de dato que acepta)
export type CrearVendedorDto =
  z.infer<typeof crearVendedorSchema>;
  //esto es igual a esto: 
  //type CrearVendedorDto = {
  //nombreCompleto: string;
  //email: string;
  //contrasena: string;
  //telefono?: string | null;

export type ActualizarVendedorDto =
  z.infer<typeof actualizarVendedorSchema>;//este hace lo msimo pero con actualizar

  //ZOD: valida los  datos que llegan
  //TYPESCRIPT: dice que forma tienen esos datos