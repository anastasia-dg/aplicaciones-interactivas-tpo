import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard-service";

// Creamos una instancia del Service para poder usar sus métodos
const dashboardService = new DashboardService();

class DashboardController {

  async obtenerDashboard(req: Request, res: Response) {

    // Obtenemos el ID de la inmobiliaria que viene en la URL
    const inmobiliariaId = Number(req.params.inmobiliariaId);

    // Comprobamos que el ID sea un número entero positivo
    if (!Number.isInteger(inmobiliariaId) || inmobiliariaId <= 0) {

      // Si el ID no es válido, da error
      return res.status(400).json({
        mensaje: "El ID de la inmobiliaria no es válido",
      });
    }

    // Le pedimos al Service todos los datos del Dashboard
    const dashboard =
      await dashboardService.obtenerDashboard(inmobiliariaId);

    // Devolvemos los datos obtenidos
    return res.status(200).json(dashboard);
  }
}

// Exportamos una instancia del Controller
export const dashboardController = new DashboardController();