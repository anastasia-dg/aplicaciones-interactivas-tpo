import { Request, Response } from "express";
import { vendedorService } from "../services/vendedor-service";
import {
  crearVendedorSchema,
  actualizarVendedorSchema,
} from "../dtos/vendedor-dto";

export const vendedorController = {

  async listar(req: Request, res: Response) {
    try {
      const vendedores = await vendedorService.listar();

      res.status(200).json(vendedores);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al listar vendedores",
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

      const vendedor = await vendedorService.buscarPorId(id);

      res.status(200).json(vendedor);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error
          ? error.message
          : "Vendedor no encontrado",
      });
    }
  },


  async buscarPorEmail(req: Request, res: Response) {
    try {
      const { email } = req.query;

      if (typeof email !== "string") {
        return res.status(400).json({
          message: "Debe proporcionar un email",
        });
      }

      const vendedor =
        await vendedorService.buscarPorEmail(email);

      if (!vendedor) {
        return res.status(404).json({
          message: "Vendedor no encontrado",
        });
      }

      res.status(200).json(vendedor);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Error al buscar vendedor",
      });
    }
  },


  async crear(req: Request, res: Response) {
    try {
      const datos = crearVendedorSchema.parse(req.body);

      const vendedor =
        await vendedorService.crear(datos);

      res.status(201).json(vendedor);
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
        actualizarVendedorSchema.parse(req.body);

      const vendedor =
        await vendedorService.actualizar(id, datos);

      res.status(200).json(vendedor);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al actualizar vendedor",
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

      await vendedorService.eliminar(id);

      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error
          ? error.message
          : "Error al eliminar vendedor",
      });
    }
  },
};  