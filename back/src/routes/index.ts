// Importa Router desde Express.
//
// Router sirve para crear y organizar
// las rutas que va a tener nuestra API.
import { Router } from "express";


// Crea un router.
//
// Pensalo como un lugar donde vamos guardando
// las diferentes rutas del backend.
//
// Se exporta para que src/index.ts pueda usarlo.
export const router = Router();


// Crea una ruta GET llamada "/health".
//
// GET se usa normalmente cuando queremos
// consultar u obtener información.
//
// Esta ruta sirve solamente para comprobar
// que el backend está funcionando.
router.get("/health", (_request, response) => {

  // Devuelve una respuesta en formato JSON.
//
// Cuando alguien haga:
// GET /health
//
// el backend responde:
//
// {
//   "status": "ok"
// }
  response.json({ status: "ok" });
});