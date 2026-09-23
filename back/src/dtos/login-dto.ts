import { z } from "zod";

// Validamos los datos que el vendedor debe enviar para iniciar sesión
export const loginSchema = z.object({

  // El email es obligatorio y debe tener un formato valido
  email: z.string().email(),

  // La contraseña es obligatoria
  contrasena: z.string().min(1),

});

// Creamos el tipo de TypeScript a partir del schema
export type LoginDto = z.infer<typeof loginSchema>;