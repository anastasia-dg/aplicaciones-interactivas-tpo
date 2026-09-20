import { Request, Response } from "express";
import { historialEstadoPropiedadService } from "../services/historial-estado-propiedad-service";

export const historialEstadoPropiedadController = {

  async listar(req: Request, res: Response) {
    try {
      const historial =
        await historialEstadoPropiedadService.listar();

      res.status(200).json(historial);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al listar historial",
      });
    }
  },


  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      const historial =
        await historialEstadoPropiedadService.buscarPorId(id);

      res.status(200).json(historial);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Registro de historial no encontrado",
      });
    }
  },


  async buscarPorPropiedad(req: Request, res: Response) {
    try {
      const propiedadId =
        Number(req.params.propiedadId);

      if (isNaN(propiedadId)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      const historial =
        await historialEstadoPropiedadService.buscarPorPropiedad(
          propiedadId
        );

      res.status(200).json(historial);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar historial",
      });
    }
  },
};