import { Request, Response } from "express";
import { comentarioService } from "../services/comentario-service";
import {
  crearComentarioSchema,
  responderComentarioSchema,
} from "../dtos/comentario-dto";

export const comentarioController = {

  async listar(req: Request, res: Response) {
    try {
      const comentarios = await comentarioService.listar();

      res.status(200).json(comentarios);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al listar comentarios",
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

      const comentario =
        await comentarioService.buscarPorId(id);

      res.status(200).json(comentario);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Comentario no encontrado",
      });
    }
  },


  async buscarPorPropiedad(req: Request, res: Response) {
    try {
      const propiedadId = Number(req.params.propiedadId);

      if (isNaN(propiedadId)) {
        return res.status(400).json({
          message: "El ID de propiedad debe ser un número",
        });
      }

      const comentarios =
        await comentarioService.buscarPorPropiedad(propiedadId);

      res.status(200).json(comentarios);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar comentarios",
      });
    }
  },


  async crear(req: Request, res: Response) {
    try {
      const propiedadId = Number(req.params.propiedadId);

      if (isNaN(propiedadId)) {
        return res.status(400).json({
          message: "El ID de propiedad debe ser un número",
        });
      }

      const datos = crearComentarioSchema.parse(req.body);

      const comentario =
        await comentarioService.crear(propiedadId, datos);

      res.status(201).json(comentario);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al crear comentario",
      });
    }
  },


  async responder(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      // Validamos los datos que llegaron en el body.
      const datos =
        responderComentarioSchema.parse(req.body);

      // Le mandamos al Service los datos ya validados.
      const comentario =
        await comentarioService.responder(id, datos);

      res.status(200).json(comentario);

    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al responder comentario",
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

      await comentarioService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Comentario no encontrado",
      });
    }
  },
};