import { Router } from "express";
import { loginController } from "../controllers/login.controller";

const loginRouter = Router();

// POST /login
loginRouter.post(
  "/",
  loginController.iniciarSesion
);

export { loginRouter };