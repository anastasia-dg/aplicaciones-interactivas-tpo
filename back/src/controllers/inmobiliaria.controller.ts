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

      
      // Usamos el perfil público en lugar de la consulta interna.
      // Así no devolvemos al vendedor ni propiedades en borrador.
      const inmobiliaria =
        await inmobiliariaService.buscarPerfilPublico(id);


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

    
      // El vendedor que figura en los datos
      // debe ser el mismo que inició sesión.
      if (datos.vendedorId !== req.vendedorId) {
        return res.status(403).json({
          message: "No podés crear una inmobiliaria para otro vendedor",
        });
      }

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

      // Comprobamos que el vendedor sea dueño de la inmobiliaria.
      await inmobiliariaService.verificarPropietario(
        id,
        req.vendedorId!
      );

      const datos =
        actualizarInmobiliariaSchema.parse(req.body);

      const inmobiliaria =
        await inmobiliariaService.actualizar(id, datos);

      res.status(200).json(inmobiliaria);
    } catch (error) {
      // El vendedor inició sesión,
      // pero no es dueño de esta inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
          "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }

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

      // Comprobamos que la inmobiliaria pertenezca
      // al vendedor autenticado.
      await inmobiliariaService.verificarPropietario(
        id,
        req.vendedorId!
      );

      await inmobiliariaService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      // El vendedor inició sesión,
      // pero no es dueño de esta inmobiliaria.
      if (
        error instanceof Error &&
        error.message ===
          "No tenés permiso para modificar esta inmobiliaria"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }

      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al eliminar inmobiliaria",
      });
    }
  },
};