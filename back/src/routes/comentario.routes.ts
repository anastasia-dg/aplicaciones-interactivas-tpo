import { Router } from "express";
import { comentarioController } from "../controllers/comentario.controller";
import { verificarToken } from "../middlewares/auth.middleware";

export const comentarioRouter = Router();

// GET /comentarios
comentarioRouter.get(
  "/",
  comentarioController.listar
);

// GET /comentarios/propiedad/:propiedadId
comentarioRouter.get(
  "/propiedad/:propiedadId",
  comentarioController.buscarPorPropiedad
);

// POST /comentarios/propiedad/:propiedadId
comentarioRouter.post(
  "/propiedad/:propiedadId",
  comentarioController.crear
);

// GET /comentarios/:id
comentarioRouter.get(
  "/:id",
  comentarioController.buscarPorId
);

// PATCH /comentarios/:id/responder
//Requiere iniciar sesion
comentarioRouter.patch(
  "/:id/responder",
  verificarToken,
  comentarioController.responder
);

// DELETE /comentarios/:id
//Requiere iniciar sesion
comentarioRouter.delete(
  "/:id",
  verificarToken,
  comentarioController.eliminar
);