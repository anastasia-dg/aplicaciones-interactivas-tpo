import { Router } from "express";
import { propiedadController } from "../controllers/propiedad.controller";

export const propiedadRouter = Router();

// GET /propiedades
propiedadRouter.get(
  "/",
  propiedadController.listar
);

// POST /propiedades
propiedadRouter.post(
  "/",
  propiedadController.crear
);

// GET /propiedades/:id
propiedadRouter.get(
  "/:id",
  propiedadController.buscarPorId
);

// PATCH /propiedades/:id
propiedadRouter.patch(
  "/:id",
  propiedadController.actualizar
);

// PATCH /propiedades/:id/estado
propiedadRouter.patch(
  "/:id/estado",
  propiedadController.cambiarEstado
);

// DELETE /propiedades/:id
propiedadRouter.delete(
  "/:id",
  propiedadController.eliminar
);