import { Router } from "express";
import { solicitudVisitaController } from "../controllers/solicitud-visita.controller";

export const solicitudVisitaRouter = Router();

// GET /solicitudes-visita
solicitudVisitaRouter.get(
  "/",
  solicitudVisitaController.listar
);

// GET /solicitudes-visita/propiedad/:propiedadId
solicitudVisitaRouter.get(
  "/propiedad/:propiedadId",
  solicitudVisitaController.buscarPorPropiedad
);

// POST /solicitudes-visita/propiedad/:propiedadId
solicitudVisitaRouter.post(
  "/propiedad/:propiedadId",
  solicitudVisitaController.crear
);

// GET /solicitudes-visita/:id
solicitudVisitaRouter.get(
  "/:id",
  solicitudVisitaController.buscarPorId
);

// PATCH /solicitudes-visita/:id/estado
solicitudVisitaRouter.patch(
  "/:id/estado",
  solicitudVisitaController.cambiarEstado
);

// DELETE /solicitudes-visita/:id
solicitudVisitaRouter.delete(
  "/:id",
  solicitudVisitaController.eliminar
);