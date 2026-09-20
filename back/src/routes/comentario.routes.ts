import { Router } from "express";
import { comentarioController } from "../controllers/comentario.controller";

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
comentarioRouter.patch(
  "/:id/responder",
  comentarioController.responder
);

// DELETE /comentarios/:id
comentarioRouter.delete(
  "/:id",
  comentarioController.eliminar
);