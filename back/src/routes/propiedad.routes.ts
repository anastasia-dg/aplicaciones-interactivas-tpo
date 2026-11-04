import { Router } from "express";
import { propiedadController } from "../controllers/propiedad.controller";
import { verificarToken } from "../middlewares/auth.middleware";

export const propiedadRouter = Router();

// GET /propiedades
propiedadRouter.get(
  "/",
  propiedadController.listar
);

// POST /propiedades
propiedadRouter.post(
  "/",
  verificarToken,
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
  verificarToken,
  propiedadController.actualizar
);

// PATCH /propiedades/:id/estado
propiedadRouter.patch(
  "/:id/estado",
  verificarToken,
  propiedadController.cambiarEstado
);

// DELETE /propiedades/:id
propiedadRouter.delete(
  "/:id",
  verificarToken,
  propiedadController.eliminar
);