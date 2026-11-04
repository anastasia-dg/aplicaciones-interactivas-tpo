import { Request, Response } from "express";
import { resenaService } from "../services/resena-service";
import { crearReseñaSchema } from "../dtos/resena-dto";
import { inmobiliariaService } from "../services/inmobiliaria-service";

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
      // Obtenemos el ID de la reseña desde la URL.
      const id = Number(req.params.id);

      // Verificamos que sea un número entero positivo.
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "El ID de la reseña no es válido",
        });
      }

      // Buscamos la reseña para saber
      // a qué inmobiliaria pertenece.
      const resena = await resenaService.buscarPorId(id);

      // Comprobamos que el vendedor que inició sesión
      // sea dueño de esa inmobiliaria.
      await inmobiliariaService.verificarPropietario(
        resena.inmobiliaria.id,
        req.vendedorId!
      );

      // Si tiene permiso, eliminamos la reseña.
      await resenaService.eliminar(id);

      // 204 indica que se eliminó correctamente.
      return res.status(204).send();

    } catch (error) {

      // La reseña no existe.
      if (
        error instanceof Error &&
        error.message === "Reseña no encontrada"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }

      // El vendedor no es dueño de la inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para eliminar esta reseña",
        });
      }

      // Cualquier otro error inesperado.
      return res.status(500).json({
        message: "Error al eliminar la reseña",
      });
    }
  },

};