import { Request, Response } from "express";
import { solicitudVisitaService } from "../services/solicitud-visita-service";
import {
  crearSolicitudVisitaSchema,
  cambiarEstadoSolicitudVisitaSchema,
} from "../dtos/solicitud-visita-dto";
import { propiedadService } from "../services/propiedad-service";

export const solicitudVisitaController = {

  
  async listar(req: Request, res: Response) {
    try {

      // El middleware verificarToken ya identificó al vendedor.
      const vendedorId = req.vendedorId!;

      // Buscamos solamente sus solicitudes.
      const solicitudes =
        await solicitudVisitaService.listar(vendedorId);

      // Devolvemos las solicitudes encontradas.
      return res.status(200).json(solicitudes);

    } catch (error) {

      // Si ocurre un error inesperado.
      return res.status(500).json({
        message: "Error al listar solicitudes",
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

      // Buscamos la solicitud para saber a qué propiedad pertenece.
      const solicitudActual =
        await solicitudVisitaService.buscarPorId(id);

      // Comprobamos que la propiedad pertenezca
      // al vendedor que inició sesión.
      await propiedadService.verificarPropietario(
        solicitudActual.propiedad.id,
        req.vendedorId!
      );

      const solicitud =
        await solicitudVisitaService.buscarPorId(id);

      res.status(200).json(solicitud);
    } catch (error) {
      
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas solicitudes",
        });
      }

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

      // Verificamos que el vendedor sea dueño de la propiedad.
      await propiedadService.verificarPropietario(
        propiedadId,
        req.vendedorId!
      );

      const solicitudes =
        await solicitudVisitaService.buscarPorPropiedad(
          propiedadId
        );

      res.status(200).json(solicitudes);
    } catch (error) {
      
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas solicitudes",
        });
      }

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
      
      // La propiedad existe, pero no está publicada.
      if (
        error instanceof Error &&
        error.message ===
        "No se pueden solicitar visitas para una propiedad no publicada"
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

      
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas solicitudes",
        });
      }

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

      // Buscamos la solicitud para saber a qué propiedad pertenece.
      const solicitudActual =
        await solicitudVisitaService.buscarPorId(id);

      // Comprobamos que la propiedad pertenezca
      // al vendedor que inició sesión.
      await propiedadService.verificarPropietario(
        solicitudActual.propiedad.id,
        req.vendedorId!
      );

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
      
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas solicitudes",
        });
      }

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
      
      // Buscamos la solicitud para saber a qué propiedad pertenece.
      const solicitudActual =
        await solicitudVisitaService.buscarPorId(id);

      // Comprobamos que la propiedad pertenezca
      // al vendedor que inició sesión.
      await propiedadService.verificarPropietario(
        solicitudActual.propiedad.id,
        req.vendedorId!
      );

      await solicitudVisitaService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas solicitudes",
        });
      }

      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Solicitud no encontrada",
      });
    }
  },
};