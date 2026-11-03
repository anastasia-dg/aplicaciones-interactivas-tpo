import { Request, Response } from "express";
import { inmobiliariaService } from "../services/inmobiliaria-service";
import {
  crearInmobiliariaSchema,
  actualizarInmobiliariaSchema,
} from "../dtos/inmobiliaria-dto";

export const inmobiliariaController = {

  async listar(req: Request, res: Response) {
    try {
      const inmobiliarias = await inmobiliariaService.listar();

      res.status(200).json(inmobiliarias);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al listar inmobiliarias",
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

      const inmobiliaria =
        await inmobiliariaService.buscarPorId(id);

      res.status(200).json(inmobiliaria);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Inmobiliaria no encontrada",
      });
    }
  },

  
  // MOSTRAR EL PERFIL PUBLICO
  async buscarPerfilPublico(req: Request, res: Response) {
    try {

      // Convertimos el ID recibido a número
      const id = Number(req.params.id);

      // Comprobamos que sea válido
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          message: "El ID debe ser un número entero positivo",
        });
        return;
      }

      // Buscamos la inmobiliaria
      const inmobiliaria =
        await inmobiliariaService.buscarPerfilPublico(id);

      // Devolvemos sus datos públicos y propiedades publicadas
      res.status(200).json(inmobiliaria);

    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Inmobiliaria no encontrada",
      });
    }
  },



  async crear(req: Request, res: Response) {
    try {
      const datos = crearInmobiliariaSchema.parse(req.body);

      const inmobiliaria =
        await inmobiliariaService.crear(datos);

      res.status(201).json(inmobiliaria);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Datos inválidos",
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
        actualizarInmobiliariaSchema.parse(req.body);

      const inmobiliaria =
        await inmobiliariaService.actualizar(id, datos);

      res.status(200).json(inmobiliaria);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al actualizar inmobiliaria",
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

      await inmobiliariaService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al eliminar inmobiliaria",
      });
    }
  },
};