import bcrypt from "bcryptjs";
import { vendedorRepository } from "../repositories/vendedor.repository";
import jwt from "jsonwebtoken";

class LoginService {

  // Recibe el email y la contraseña que escribe el vendedor
  async iniciarSesion(email: string, contrasena: string) {

    //Buscamos al vendedor por su email
    // Usamos el metodo que tambien trae la contraseña encriptada desde PostgreSQL
    const vendedor =
      await vendedorRepository.buscarPorEmailConContrasena(email);

    //Si no encontramos al vendedor, no podemos iniciar sesion
    if (!vendedor) {
      throw new Error("Credenciales incorrectas");
    }

    //Comparamos la contraseña ingresada con la contraseña encriptada de la base de datos
    const contrasenaCorrecta = await bcrypt.compare( //verifica si la contra ingresada es igual al hash almacenado
      contrasena,//ingresada
      vendedor.contrasenaHash //almacenada
    );

    //Si las contraseñas no coinciden, rechazamos el inicio de sesión
    if (!contrasenaCorrecta) {
      throw new Error("Credenciales incorrectas");
    }

    
    // Buscamos los datos del vendedor sin su contraseña.
    const vendedorSinContrasena =
      await vendedorRepository.buscarPorId(vendedor.id);

    // Comprobamos que exista la clave secreta del JWT.
    const claveSecreta = process.env.JWT_SECRET;

    if (!claveSecreta) {
      throw new Error("Falta configurar JWT_SECRET");
    }

    // Creamos un token que identifica al vendedor.
    const token = jwt.sign(
      {
        vendedorId: vendedor.id, // ID del vendedor autenticado.
      },
      claveSecreta, // Clave utilizada para firmar el token.
      {
        expiresIn: "2h", // El token vence después de 2 horas.
      }
    );

    // Devolvemos los datos del vendedor y su token.
    return {
      vendedor: vendedorSinContrasena,
      token: token,
    };

  }
}

export const loginService = new LoginService();