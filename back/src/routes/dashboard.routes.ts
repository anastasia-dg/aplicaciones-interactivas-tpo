import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get(
  "/:inmobiliariaId",
  dashboardController.obtenerDashboard
);

export { dashboardRouter };