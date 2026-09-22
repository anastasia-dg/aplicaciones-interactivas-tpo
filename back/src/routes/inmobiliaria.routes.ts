import { Router } from "express";
import { inmobiliariaController } from "../controllers/inmobiliaria.controller";

export const inmobiliariaRouter = Router();

// GET /inmobiliarias
inmobiliariaRouter.get(
  "/",
  inmobiliariaController.listar
);

// POST /inmobiliarias
inmobiliariaRouter.post(
  "/",
  inmobiliariaController.crear
);

// GET /inmobiliarias/:id
inmobiliariaRouter.get(
  "/:id",
  inmobiliariaController.buscarPorId
);

// PUT /inmobiliarias/:id
inmobiliariaRouter.patch(
  "/:id",
  inmobiliariaController.actualizar
);

// DELETE /inmobiliarias/:id
inmobiliariaRouter.delete(
  "/:id",
  inmobiliariaController.eliminar
);