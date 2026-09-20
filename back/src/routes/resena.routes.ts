import { Router } from "express";
import { resenaController } from "../controllers/reseña.controller";

export const resenaRouter = Router();

// GET /resenas
resenaRouter.get(
  "/",
  resenaController.listar
);

// GET /resenas/inmobiliaria/:inmobiliariaId
resenaRouter.get(
  "/inmobiliaria/:inmobiliariaId",
  resenaController.buscarPorInmobiliaria
);

// POST /resenas/inmobiliaria/:inmobiliariaId
resenaRouter.post(
  "/inmobiliaria/:inmobiliariaId",
  resenaController.crear
);

// GET /resenas/:id
resenaRouter.get(
  "/:id",
  resenaController.buscarPorId
);

// DELETE /resenas/:id
resenaRouter.delete(
  "/:id",
  resenaController.eliminar
);