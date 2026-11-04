import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard-service";
import { inmobiliariaService } from "../services/inmobiliaria-service";

// Creamos una instancia del Service para poder usar sus métodos
const dashboardService = new DashboardService();

class DashboardController {
  
  async obtenerDashboard(req: Request, res: Response) {
    try {

      // Obtenemos el ID de la inmobiliaria desde la URL.
      const inmobiliariaId = Number(req.params.inmobiliariaId);

      // Comprobamos que sea un número entero positivo.
      if (!Number.isInteger(inmobiliariaId) || inmobiliariaId <= 0) {
        return res.status(400).json({
          mensaje: "El ID de la inmobiliaria no es válido",
        });
      }

      // Verificamos que la inmobiliaria pertenezca
      // al vendedor que inició sesión.
      await inmobiliariaService.verificarPropietario(
        inmobiliariaId,
        req.vendedorId!
      );

      // Si tiene permiso, obtenemos las estadísticas.
      const dashboard =
        await dashboardService.obtenerDashboard(inmobiliariaId);

      // Devolvemos los datos.
      return res.status(200).json(dashboard);

    } catch (error) {

      // El vendedor no es dueño de esta inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          mensaje: "No tenés permiso para consultar este dashboard",
        });
      }

      // La inmobiliaria no existe.
      if (
        error instanceof Error &&
        error.message === "Inmobiliaria no encontrada"
      ) {
        return res.status(404).json({
          mensaje: error.message,
        });
      }

      // Error inesperado.
      return res.status(500).json({
        mensaje: "Error al obtener el dashboard",
      });
    }
  }

}

// Exportamos una instancia del Controller
export const dashboardController = new DashboardController();