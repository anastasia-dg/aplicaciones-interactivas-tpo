import { Router } from "express";
import {
  historialEstadoPropiedadController,
} from "../controllers/historial-estado-propiedad.controller";

export const historialEstadoPropiedadRouter = Router();

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