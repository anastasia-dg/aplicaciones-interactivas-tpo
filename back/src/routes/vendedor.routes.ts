import { Router } from "express";
import { vendedorController } from "../controllers/vendedor.controller";
import { verificarToken } from "../middlewares/auth.middleware";

export const vendedorRouter = Router();

// GET /vendedores/:id
vendedorRouter.get(
  "/:id",
  verificarToken,
  vendedorController.buscarPorId
);

// PATCH /vendedores/:id
vendedorRouter.patch(
  "/:id",
  verificarToken,
  vendedorController.actualizar
);

// DELETE /vendedores/:id
vendedorRouter.delete(
  "/:id",
  verificarToken,
  vendedorController.eliminar
);

/*
// GET /vendedores
vendedorRouter.get(
  "/",
  vendedorController.listar
);

// GET /vendedores/buscar?email=correo@ejemplo.com
vendedorRouter.get(
  "/buscar",
  vendedorController.buscarPorEmail
);

// POST /vendedores
vendedorRouter.post(
  "/",
  vendedorController.crear
);

// GET /vendedores/:id
vendedorRouter.get(
  "/:id",
  vendedorController.buscarPorId
);

// PATCH /vendedores/:id
vendedorRouter.patch(
  "/:id",
  vendedorController.actualizar
);

// DELETE /vendedores/:id
vendedorRouter.delete(
  "/:id",
  vendedorController.eliminar
);*/