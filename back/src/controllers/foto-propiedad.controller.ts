import { Request, Response } from "express";
import { fotoPropiedadService } from "../services/foto-propiedad-service";
import {
  crearFotoPropiedadSchema,
  actualizarFotoPropiedadSchema,
} from "../dtos/foto-propiedad-dto";

export const fotoPropiedadController = {

  async listar(req: Request, res: Response) {
    try {
      const fotos = await fotoPropiedadService.listar();

      res.status(200).json(fotos);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al listar fotos",
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

      const foto =
        await fotoPropiedadService.buscarPorId(id);

      res.status(200).json(foto);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Foto no encontrada",
      });
    }
  },


  async buscarPorPropiedad(req: Request, res: Response) {
    try {
      const propiedadId = Number(req.params.propiedadId);

      if (isNaN(propiedadId)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      const fotos =
        await fotoPropiedadService.buscarPorPropiedad(
          propiedadId
        );

      res.status(200).json(fotos);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar fotos",
      });
    }
  },


  async crear(req: Request, res: Response) {
    try {
      const datos = crearFotoPropiedadSchema.parse(req.body);

      const foto =
        await fotoPropiedadService.crear(datos);

      res.status(201).json(foto);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al crear foto",
      });
    }
  },


  async actualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      const datos =
        actualizarFotoPropiedadSchema.parse(req.body);

      const foto =
        await fotoPropiedadService.actualizar(id, datos);

      res.status(200).json(foto);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al actualizar foto",
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

      await fotoPropiedadService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Foto no encontrada",
      });
    }
  },
};