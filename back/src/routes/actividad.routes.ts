import { Router } from "express";
import { actividadController } from "../controllers/actividad.controller";
import { verificarToken } from "../middlewares/auth.middleware";

export const actividadRouter = Router();

// Todas las rutas de actividades requieren iniciar sesión.
actividadRouter.use(verificarToken);


// GET /actividades
// Lista solamente las actividades del vendedor autenticado.
actividadRouter.get(
  "/",
  actividadController.listar
);


// Cantidad de actividades sin leer.
actividadRouter.get(
  "/inmobiliaria/:inmobiliariaId/no-leidas",
  actividadController.contarNoLeidas
);

// Listar actividades de una inmobiliaria.
actividadRouter.get(
  "/inmobiliaria/:inmobiliariaId",
  actividadController.buscarPorInmobiliaria
);

// Buscar una actividad por ID.
actividadRouter.get(
  "/:id",
  actividadController.buscarPorId
);

// Marcar una actividad como leída.
actividadRouter.patch(
  "/:id/leida",
  actividadController.marcarComoLeida
);

// Eliminar una actividad.
actividadRouter.delete(
  "/:id",
  actividadController.eliminar
);
