import { Request, Response } from "express";
import { comentarioService } from "../services/comentario-service";
import {
  crearComentarioSchema,
  responderComentarioSchema,
} from "../dtos/comentario-dto";
import { propiedadService } from "../services/propiedad-service";

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

      // Buscamos solamente comentarios públicos.
      const comentario =
        await comentarioService.buscarPublicoPorId(id);

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

      // Mostramos comentarios solo de propiedades publicadas.
      const comentarios =
        await comentarioService.buscarPublicosPorPropiedad(propiedadId);

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

      // La propiedad existe, pero no está publicada.
      if (
        error instanceof Error &&
        error.message ===
        "No se pueden crear comentarios en una propiedad no publicada"
      ) {
        return res.status(409).json({
          message: error.message,
        });
      }

      // La propiedad no existe.
      if (
        error instanceof Error &&
        error.message === "Propiedad no encontrada"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }

      // Otros errores, como datos inválidos.
      return res.status(400).json({
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

      // Buscamos el comentario para saber a qué propiedad pertenece.
      const comentarioActual = await comentarioService.buscarPorId(id);

      // Comprobamos que el vendedor autenticado
      // sea dueño de la propiedad del comentario.
      await propiedadService.verificarPropietario(
        comentarioActual.propiedad.id,
        req.vendedorId!
      );

      // Validamos los datos que llegaron en el body.
      const datos =
        responderComentarioSchema.parse(req.body);

      // Le mandamos al Service los datos ya validados.
      const comentario =
        await comentarioService.responder(id, datos);

      res.status(200).json(comentario);

    } catch (error) {
      
      // El vendedor inició sesión, pero la propiedad no le pertenece.
      if (
        error instanceof Error &&
        error.message === "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }

      // El comentario no existe.
      if (
        error instanceof Error &&
        error.message === "Comentario no encontrado"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }

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

      // Buscamos el comentario y su propiedad.
      const comentarioActual = await comentarioService.buscarPorId(id);

      // Solo el dueño de la propiedad puede eliminar el comentario.
      await propiedadService.verificarPropietario(
        comentarioActual.propiedad.id,
        req.vendedorId!
      );

      await comentarioService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      
      // El vendedor inició sesión, pero la propiedad no le pertenece.
      if (
        error instanceof Error &&
        error.message === "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }

      // El comentario no existe.
      if (
        error instanceof Error &&
        error.message === "Comentario no encontrado"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }
    }
  },
};