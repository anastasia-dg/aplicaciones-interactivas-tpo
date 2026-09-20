import { Request, Response } from "express";
import { actividadService } from "../services/actividad-service";

export const actividadController = {

  async listar(req: Request, res: Response) {
    try {
      const actividades = await actividadService.listar();

      res.status(200).json(actividades);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al listar actividades",
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

      const actividad =
        await actividadService.buscarPorId(id);

      res.status(200).json(actividad);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Actividad no encontrada",
      });
    }
  },


  async buscarPorInmobiliaria(req: Request, res: Response) {
    try {
      const inmobiliariaId =
        Number(req.params.inmobiliariaId);

      if (isNaN(inmobiliariaId)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      const actividades =
        await actividadService.buscarPorInmobiliaria(
          inmobiliariaId
        );

      res.status(200).json(actividades);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar actividades",
      });
    }
  },


  async marcarComoLeida(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      const actividad =
        await actividadService.marcarComoLeida(id);

      res.status(200).json(actividad);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Actividad no encontrada",
      });
    }
  },


  async eliminar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      await actividadService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Actividad no encontrada",
      });
    }
  },
};