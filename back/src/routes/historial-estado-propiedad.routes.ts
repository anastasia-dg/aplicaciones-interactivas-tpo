import { Router } from "express";
import {
  historialEstadoPropiedadController,
} from "../controllers/historial-estado-propiedad.controller";
import { verificarToken } from "../middlewares/auth.middleware";

export const historialEstadoPropiedadRouter = Router();

// Todas las rutas del historial requieren iniciar sesión.
historialEstadoPropiedadRouter.use(verificarToken); //esto protege automaticamente las rutas

// GET /historial-estados-propiedad
historialEstadoPropiedadRouter.get(
  "/",
  historialEstadoPropiedadController.listar
);

// GET /historial-estados-propiedad/propiedad/:propiedadId
historialEstadoPropiedadRouter.get(
  "/propiedad/:propiedadId",
  historialEstadoPropiedadController.buscarPorPropiedad
);

// GET /historial-estados-propiedad/:id
historialEstadoPropiedadRouter.get(
  "/:id",
  historialEstadoPropiedadController.buscarPorId
);