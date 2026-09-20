import { Request, Response } from "express";
import { resenaService } from "../services/resena-service";
import { crearReseñaSchema } from "../dtos/resena-dto";

export const resenaController = {

  async listar(req: Request, res: Response) {
    try {
      const resenas = await resenaService.listar();

      res.status(200).json(resenas);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al listar reseñas",
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

      const resena = await resenaService.buscarPorId(id);

      res.status(200).json(resena);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Reseña no encontrada",
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

      const resenas =
        await resenaService.buscarPorInmobiliaria(
          inmobiliariaId
        );

      res.status(200).json(resenas);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar reseñas",
      });
    }
  },


  async crear(req: Request, res: Response) {
    try {
      const inmobiliariaId =
        Number(req.params.inmobiliariaId);

      if (isNaN(inmobiliariaId)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      const datos = crearReseñaSchema.parse(req.body);

      const resena =
        await resenaService.crear(inmobiliariaId, datos);

      res.status(201).json(resena);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al crear reseña",
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

      await resenaService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Reseña no encontrada",
      });
    }
  },
};