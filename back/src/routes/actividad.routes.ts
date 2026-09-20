import { Router } from "express";
import { actividadController } from "../controllers/actividad.controller";

export const actividadRouter = Router();

// GET /actividades
actividadRouter.get("/", actividadController.listar);

// GET /actividades/inmobiliaria/:inmobiliariaId
actividadRouter.get(
  "/inmobiliaria/:inmobiliariaId",
  actividadController.buscarPorInmobiliaria
);

// GET /actividades/:id
actividadRouter.get(
  "/:id",
  actividadController.buscarPorId
);

// PATCH /actividades/:id/leida
actividadRouter.patch(
  "/:id/leida",
  actividadController.marcarComoLeida
);

// DELETE /actividades/:id
actividadRouter.delete(
  "/:id",
  actividadController.eliminar
);