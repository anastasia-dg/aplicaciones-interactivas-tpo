import { Router } from "express";
import { fotoPropiedadController } from "../controllers/foto-propiedad.controller";
import { verificarToken } from "../middlewares/auth.middleware";

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

// POST /fotos-propiedad/propiedad/:propiedadId
// Crear una foto: requiere iniciar sesión.
fotoPropiedadRouter.post(
  "/propiedad/:propiedadId",
  verificarToken,
  fotoPropiedadController.crear
);

// GET /fotos-propiedad/:id
fotoPropiedadRouter.get(
  "/:id",
  fotoPropiedadController.buscarPorId
);

// PUT/PATCH /fotos-propiedad/:id
// Modificar una foto: requiere iniciar sesión.
fotoPropiedadRouter.patch(
  "/:id",
  verificarToken,
  fotoPropiedadController.actualizar
);

// DELETE /fotos-propiedad/:id
fotoPropiedadRouter.delete(
  "/:id",
  verificarToken,
  fotoPropiedadController.eliminar
);