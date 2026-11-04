import { Router } from "express";
import { resenaController } from "../controllers/reseña.controller";
import { verificarToken } from "../middlewares/auth.middleware";

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
 // Eliminar una reseña requiere iniciar sesión.
resenaRouter.delete(
  "/:id",
  verificarToken,
  resenaController.eliminar
);
