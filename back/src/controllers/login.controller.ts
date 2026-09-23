import { Request, Response } from "express";
import { ZodError } from "zod";
import { loginSchema } from "../dtos/login-dto";
import { loginService } from "../services/login-service";

class LoginController {

  async iniciarSesion(req: Request, res: Response): Promise<void> {

    try {
      // Validamos el email y la contraseña recibidos
      const datos = loginSchema.parse(req.body);

      // Le pasamos los datos al Service para que compruebe las credenciales
      const vendedor = await loginService.iniciarSesion(
        datos.email,
        datos.contrasena
      );

      // Si las credenciales son correctas, devolvemos los datos del vendedor
      res.status(200).json(vendedor);

    } catch (error) {

      // Si faltan datos o tienen un formato incorrecto
      if (error instanceof ZodError) {
        res.status(400).json({
          mensaje: "Los datos ingresados no son válidos",
          errores: error.issues
        });
        return;
      }

      // Si el email no existe o la contraseña es incorrecta
      if (
        error instanceof Error &&
        error.message === "Credenciales incorrectas"
      ) {
        res.status(401).json({
          mensaje: "Credenciales incorrectas"
        });
        return;
      }

      // Cualquier otro error inesperado.
      console.error("Error al iniciar sesión:", error);

      res.status(500).json({
        mensaje: "Ocurrió un error al iniciar sesión"
      });
    }
  }
}

export const loginController = new LoginController();