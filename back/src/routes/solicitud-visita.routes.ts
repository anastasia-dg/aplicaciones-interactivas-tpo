import { Router } from "express";
import { solicitudVisitaController } from "../controllers/solicitud-visita.controller";
import { verificarToken } from "../middlewares/auth.middleware";

export const solicitudVisitaRouter = Router();

// Listar solicitudes: solo vendedores autenticados.
solicitudVisitaRouter.get(
  "/",
  verificarToken,
  solicitudVisitaController.listar
);

// Ver solicitudes de una propiedad: requiere token.
solicitudVisitaRouter.get(
  "/propiedad/:propiedadId",
  verificarToken,
  solicitudVisitaController.buscarPorPropiedad
);

// Crear solicitud: público, no requiere iniciar sesión.
solicitudVisitaRouter.post(
  "/propiedad/:propiedadId",
  solicitudVisitaController.crear
);

// Ver una solicitud: requiere token.
solicitudVisitaRouter.get(
  "/:id",
  verificarToken,
  solicitudVisitaController.buscarPorId
);

// Confirmar, rechazar o cambiar estado: requiere token.
solicitudVisitaRouter.patch(
  "/:id/estado",
  verificarToken,
  solicitudVisitaController.cambiarEstado
);

// Eliminar solicitud: requiere token.
solicitudVisitaRouter.delete(
  "/:id",
  verificarToken,
  solicitudVisitaController.eliminar
);

// GET /solicitudes-visita
//Devuelve solo las solicitudes del vendedor autenticado
solicitudVisitaRouter.get(
  "/",
  verificarToken,
  solicitudVisitaController.listar
);


/*
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
);*/