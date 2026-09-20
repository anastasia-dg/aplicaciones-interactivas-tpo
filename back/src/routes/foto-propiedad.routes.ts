import { Router } from "express";
import { fotoPropiedadController } from "../controllers/foto-propiedad.controller";

export const fotoPropiedadRouter = Router();

// GET /fotos-propiedad
fotoPropiedadRouter.get(
  "/",
  fotoPropiedadController.listar
);

// GET /fotos-propiedad/propiedad/:propiedadId
fotoPropiedadRouter.get(
  "/propiedad/:propiedadId",
  fotoPropiedadController.buscarPorPropiedad
);

// POST /fotos-propiedad
fotoPropiedadRouter.post(
  "/",
  fotoPropiedadController.crear
);

// GET /fotos-propiedad/:id
fotoPropiedadRouter.get(
  "/:id",
  fotoPropiedadController.buscarPorId
);

// PUT/PATCH /fotos-propiedad/:id
fotoPropiedadRouter.patch(
  "/:id",
  fotoPropiedadController.actualizar
);

// DELETE /fotos-propiedad/:id
fotoPropiedadRouter.delete(
  "/:id",
  fotoPropiedadController.eliminar
);