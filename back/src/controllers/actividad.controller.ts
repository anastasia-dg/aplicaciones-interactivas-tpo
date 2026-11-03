import { Request, Response } from "express";
import { actividadService } from "../services/actividad-service";
import { inmobiliariaService } from "../services/inmobiliaria-service";

export const actividadController = {

  
  async listar(req: Request, res: Response) {
    try {

      // Obtenemos el ID del vendedor desde el token.
      const vendedorId = req.vendedorId!;

      // Buscamos únicamente sus actividades.
      const actividades = await actividadService.listar(vendedorId);

      // Devolvemos las actividades encontradas.
      return res.status(200).json(actividades);

    } catch (error) {

      return res.status(500).json({
        message: "Error al listar actividades",
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
      
      // Buscamos la actividad para saber a qué inmobiliaria pertenece.
      const actividadActual = await actividadService.buscarPorId(id);

      // Verificamos que el vendedor sea dueño de esa inmobiliaria.
      await inmobiliariaService.verificarPropietario(
        actividadActual.inmobiliaria.id,
        req.vendedorId!
      );

      const actividad =
        await actividadService.buscarPorId(id);

      res.status(200).json(actividad);
    } catch (error) {
      
      // El vendedor está autenticado,
      // pero no es dueño de esta inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas actividades",
        });
      }

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

      // Comprobamos que la inmobiliaria pertenezca
      // al vendedor que inició sesión.
      await inmobiliariaService.verificarPropietario(
        inmobiliariaId,
        req.vendedorId!
      );

      const actividades =
        await actividadService.buscarPorInmobiliaria(
          inmobiliariaId
        );

      res.status(200).json(actividades);
    } catch (error) {
      
      // El vendedor está autenticado,
      // pero no es dueño de esta inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas actividades",
        });
      }

      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar actividades",
      });
    }
  },

  
  // DEVOLVER LA CANTIDAD DE ACTIVIDADES SIN LEER
  async contarNoLeidas(req: Request, res: Response) {
    try {

      // Obtenemos el ID de la inmobiliaria desde la URL
      const inmobiliariaId = Number(req.params.inmobiliariaId);

      // Comprobamos que sea un número entero positivo
      if (!Number.isInteger(inmobiliariaId) || inmobiliariaId <= 0) {
        res.status(400).json({
          message: "El ID debe ser un número entero positivo",
        });
        return;
      }

      // Solo el dueño puede consultar sus notificaciones sin leer.
      await inmobiliariaService.verificarPropietario(
        inmobiliariaId,
        req.vendedorId!
      );

      // Consultamos al Service
      const cantidad = await actividadService.contarNoLeidas(
        inmobiliariaId
      );

      // Respondemos con un JSON
      res.status(200).json({
        cantidad,
      });

    } catch (error) {
      
      // El vendedor está autenticado,
      // pero no es dueño de esta inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas actividades",
        });
      }

      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al contar actividades sin leer",
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
      
      // Buscamos la actividad para saber a qué inmobiliaria pertenece.
      const actividadActual = await actividadService.buscarPorId(id);

      // Verificamos que el vendedor sea dueño de esa inmobiliaria.
      await inmobiliariaService.verificarPropietario(
        actividadActual.inmobiliaria.id,
        req.vendedorId!
      );

      const actividad =
        await actividadService.marcarComoLeida(id);

      res.status(200).json(actividad);
    } catch (error) {
      
      // El vendedor está autenticado,
      // pero no es dueño de esta inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas actividades",
        });
      }

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
      
      // Buscamos la actividad para saber a qué inmobiliaria pertenece.
      const actividadActual = await actividadService.buscarPorId(id);

      // Verificamos que el vendedor sea dueño de esa inmobiliaria.
      await inmobiliariaService.verificarPropietario(
        actividadActual.inmobiliaria.id,
        req.vendedorId!
      );

      await actividadService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      
      // El vendedor está autenticado,
      // pero no es dueño de esta inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
        "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          message: "No tenés permiso para acceder a estas actividades",
        });
      }

      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Actividad no encontrada",
      });
    }
  },
};