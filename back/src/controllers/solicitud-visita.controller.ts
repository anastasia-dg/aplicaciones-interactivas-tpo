import { Request, Response } from "express";
import { solicitudVisitaService } from "../services/solicitud-visita-service";
import {
  crearSolicitudVisitaSchema,
  cambiarEstadoSolicitudVisitaSchema,
} from "../dtos/solicitud-visita-dto";

export const solicitudVisitaController = {

  async listar(req: Request, res: Response) {
    try {
      const solicitudes =
        await solicitudVisitaService.listar();

      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al listar solicitudes",
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

      const solicitud =
        await solicitudVisitaService.buscarPorId(id);

      res.status(200).json(solicitud);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Solicitud no encontrada",
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

      const solicitudes =
        await solicitudVisitaService.buscarPorPropiedad(
          propiedadId
        );

      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar solicitudes",
      });
    }
  },


  async crear(req: Request, res: Response) {
    try {
      const propiedadId =
        Number(req.params.propiedadId);

      if (isNaN(propiedadId)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      const datos =
        crearSolicitudVisitaSchema.parse(req.body);

      const solicitud =
        await solicitudVisitaService.crear(
          propiedadId,
          datos
        );

      res.status(201).json(solicitud);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al crear solicitud",
      });
    }
  },


  async cambiarEstado(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: "El ID debe ser un número",
        });
      }

      // Validamos el body con el DTO
      const datos =
          cambiarEstadoSolicitudVisitaSchema.parse(req.body);

      const solicitud =
        await solicitudVisitaService.cambiarEstado(
          id,
          datos.estado
        );

      res.status(200).json(solicitud);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al cambiar estado",
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

      await solicitudVisitaService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Solicitud no encontrada",
      });
    }
  },
};