import { Request, Response } from "express";
import { historialEstadoPropiedadService } from "../services/historial-estado-propiedad-service";
import { propiedadService } from "../services/propiedad-service";

export const historialEstadoPropiedadController = {

  async listar(req: Request, res: Response) {
    try {
      
      // El ID viene del token que ya verificó el middleware.
      const historial =
        await historialEstadoPropiedadService.listar(req.vendedorId!);


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
      
      // Buscamos el registro del historial.
      const historial =
        await historialEstadoPropiedadService.buscarPorId(id);

      // Comprobamos que la propiedad pertenezca
      // al vendedor que inició sesión.
      await propiedadService.verificarPropietario(
        historial.propiedad.id,
        req.vendedorId!
      );

      // Devolvemos el historial solamente si tiene permiso.
      res.status(200).json(historial);

    } catch (error) {
      
      // El vendedor no es dueño de la propiedad.
      if (
        error instanceof Error &&
        error.message === "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para consultar este historial",
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
      
      // Comprobamos que el vendedor sea dueño de la propiedad.
      // Si no lo es, no puede consultar su historial.
      await propiedadService.verificarPropietario(
        propiedadId,
        req.vendedorId!
      );

      const historial =
        await historialEstadoPropiedadService.buscarPorPropiedad(
          propiedadId
        );

      res.status(200).json(historial);
    } catch (error) {
      
      // El vendedor no es dueño de la propiedad.
      if (
        error instanceof Error &&
        error.message === "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para consultar este historial",
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

      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar historial",
      });
    }
  },
};