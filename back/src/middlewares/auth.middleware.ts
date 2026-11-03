import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extendemos Request para poder guardar el ID del vendedor
declare global {
  namespace Express {
    interface Request {
      vendedorId?: number;
    }
  }
}

// Este middleware verifica que el usuario esté autenticado
export function verificarToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  // Buscamos el token en el encabezado Authorization.
  const authorization = req.headers.authorization;

  // Debe tener el formato: Bearer TOKEN
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      mensaje: "Debés iniciar sesión para continuar",
    });
    return;
  }

  // Extraemos el token, quitando la palabra Bearer
  const token = authorization.slice(7);

  // Obtenemos la clave secreta configurada en .env
  const claveSecreta = process.env.JWT_SECRET;

  if (!claveSecreta) {
    res.status(500).json({
      mensaje: "Error de configuración del servidor",
    });
    return;
  }

  try {
    // Verificamos la firma y la fecha de vencimiento
    const datos = jwt.verify(token, claveSecreta);

    // Comprobamos que el token tenga un vendedorId válido.
    if (
      typeof datos === "string" ||
      typeof (datos as JwtPayload).vendedorId !== "number" ||
      !Number.isInteger((datos as JwtPayload).vendedorId) ||
      (datos as JwtPayload).vendedorId <= 0
    ) {
      res.status(401).json({
        mensaje: "Token inválido",
      });
      return;
    }

    // Guardamos el ID del vendedor autenticado.
    req.vendedorId = (datos as JwtPayload).vendedorId;

    // Permitimos continuar al Controller
    next();

  } catch {
    // Si el token es incorrecto o venció, rechazamos la petición
    res.status(401).json({
      mensaje: "Token inválido o vencido",
    });
  }
}
