import { Router } from "express";
import { inmobiliariaController } from "../controllers/inmobiliaria.controller";
import { verificarToken } from "../middlewares/auth.middleware";

export const inmobiliariaRouter = Router();

// GET /inmobiliarias
inmobiliariaRouter.get(
  "/",
  inmobiliariaController.listar
);

// GET /inmobiliarias/:id
inmobiliariaRouter.get(
  "/:id",
  inmobiliariaController.buscarPorId
);


// GET /inmobiliarias/:id/perfil
// Muestra los datos públicos de una inmobiliaria
inmobiliariaRouter.get(
  "/:id/perfil",
  inmobiliariaController.buscarPerfilPublico
);

//POST /inmobiliarias
// Crear inmobiliaria: requiere iniciar sesión.
inmobiliariaRouter.post(
  "/",
  verificarToken,
  inmobiliariaController.crear
);

//PATCH /inmobiliarias/:id
// Modificar inmobiliaria: requiere iniciar sesión.
inmobiliariaRouter.patch(
  "/:id",
  verificarToken,
  inmobiliariaController.actualizar
);

//DELETE /inmobiliarias/:id
// Eliminar inmobiliaria: requiere iniciar sesión.
inmobiliariaRouter.delete(
  "/:id",
  verificarToken,
  inmobiliariaController.eliminar
);
