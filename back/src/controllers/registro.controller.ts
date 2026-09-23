
import { Request, Response } from "express";
import { ZodError } from "zod";
import { registroSchema } from "../dtos/registro-dto";
import { registroService } from "../services/registro-service";

class RegistroController {

  async registrar(req: Request, res: Response): Promise<void> {

    try {

      // Recibimos los datos enviados desde el formulario y comprobamos que cumplan con nuestro DTO
      const datos = registroSchema.parse(req.body);

      //Le pasamos los datos validados al Service
      // El Service se encarga de crear al vendedor y su inmobiliaria dentro de una transacción.
      const vendedor = await registroService.registrar(datos);

      // Si todo salió bien, devolvemos una respuesta HTTP 201
      res.status(201).json(vendedor);

    } catch (error) {

      // Si el error viene de Zod, significa que los datos enviados no cumplen con las validaciones del DTO.
      if (error instanceof ZodError) {
        res.status(400).json({
          mensaje: "Los datos del registro no son válidos",
          errores: error.issues
        });
        return;
      }

      // Si el correo o el nombre ya existen, devolvemos un error de conflicto
      if (
        error instanceof Error &&
        (
          error.message === "Ya existe un vendedor con ese correo" ||
          error.message === "Ya existe una inmobiliaria con ese nombre"
        )
      ) {
        res.status(409).json({
          mensaje: error.message
        });
        return;
      }

      // Si ocurre cualquier otro error inesperado lo mostramos en la consola del servidor.
      console.error("Error al registrar:", error);

      res.status(500).json({
        mensaje: "Ocurrió un error al realizar el registro"
      });
    }
  }
}

// Creamos una instancia del Controller para poder utilizarla desde las rutas
export const registroController = new RegistroController();