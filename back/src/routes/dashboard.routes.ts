import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { verificarToken } from "../middlewares/auth.middleware";

const dashboardRouter = Router();

// Solo un vendedor autenticado puede consultar el dashboard
dashboardRouter.get(
  "/:inmobiliariaId",
  verificarToken,
  dashboardController.obtenerDashboard
);

export { dashboardRouter };
