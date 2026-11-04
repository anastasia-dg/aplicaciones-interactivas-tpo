import { Request, Response } from "express";
import { fotoPropiedadService } from "../services/foto-propiedad-service";
import {
  crearFotoPropiedadSchema,
  actualizarFotoPropiedadSchema,
} from "../dtos/foto-propiedad-dto";
import { propiedadService } from "../services/propiedad-service";

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

      // Buscamos únicamente una foto pública.
      const foto =
        await fotoPropiedadService.buscarPublicaPorId(id);

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

      // Traemos solamente las fotos si la propiedad está publicada.
      const fotos =
        await fotoPropiedadService.buscarPublicasPorPropiedad(
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

      // El ID de la propiedad viene en la URL.
      const propiedadId = Number(req.params.propiedadId);

      if (isNaN(propiedadId)) {
        return res.status(400).json({
          message: "El ID de propiedad debe ser un número",
        });
      }
      
      // Comprobamos que el vendedor autenticado
      // sea dueño de la propiedad donde agregará la foto.
      await propiedadService.verificarPropietario(
        propiedadId,
        req.vendedorId!
      );


      // Validamos los datos de la foto con el DTO.
      const datos =
        crearFotoPropiedadSchema.parse(req.body);

      // Mandamos al Service el ID de la propiedad
      // y los datos ya validados de la foto.
      const foto =
        await fotoPropiedadService.crear(
          propiedadId,
          datos
        );

      return res.status(201).json(foto);

    } catch (error) {
      
      // El vendedor inició sesión,
      // pero no es dueño de la propiedad.
      if (
        error instanceof Error &&
        error.message ===
          "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }

      return res.status(400).json({
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

      // Primero buscamos la foto para conocer su propiedad.
      const fotoActual = await fotoPropiedadService.buscarPorId(id);

      // Verificamos que la propiedad pertenezca al vendedor.
      await propiedadService.verificarPropietario(
        fotoActual.propiedad.id,
        req.vendedorId!
      );


      const datos =
        actualizarFotoPropiedadSchema.parse(req.body);

      const foto =
        await fotoPropiedadService.actualizar(id, datos);

      res.status(200).json(foto);
    } catch (error) {
      
      // El vendedor inició sesión,
      // pero no es dueño de la propiedad.
      if (
        error instanceof Error &&
        error.message ===
          "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }

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
      
      // Buscamos la foto que quieren eliminar.
      const fotoActual = await fotoPropiedadService.buscarPorId(id);

      // Comprobamos que pertenezca al vendedor autenticado.
      await propiedadService.verificarPropietario(
        fotoActual.propiedad.id,
        req.vendedorId!
      );


      await fotoPropiedadService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      
      // El vendedor inició sesión,
      // pero no es dueño de la propiedad.
      if (
        error instanceof Error &&
        error.message ===
          "No tenés permiso para modificar esta propiedad"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }

      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Foto no encontrada",
      });
    }
  },
};