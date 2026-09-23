import { Router } from "express";
import { registroController } from "../controllers/registro.controller";

// Creamos el router
const registroRouter = Router();

// POST /registro
registroRouter.post(
  "/",
  registroController.registrar
);

export { registroRouter };