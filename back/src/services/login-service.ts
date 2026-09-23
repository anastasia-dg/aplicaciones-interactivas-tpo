import bcrypt from "bcryptjs";
import { vendedorRepository } from "../repositories/vendedor.repository";

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

    //Si todo es correcto, volvemos a consultar al vendedor normalmente, sin traer su contraseña.
    return vendedorRepository.buscarPorId(vendedor.id);
  }
}

export const loginService = new LoginService();