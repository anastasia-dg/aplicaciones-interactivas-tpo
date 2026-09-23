// Router sirve para crear y organizar
// las rutas que va a tener nuestra API.
import { Router } from "express";
import { actividadRouter } from "./actividad.routes";
import { comentarioRouter } from "./comentario.routes";
import { fotoPropiedadRouter } from "./foto-propiedad.routes";
import { historialEstadoPropiedadRouter} from "./historial-estado-propiedad.routes";
import { inmobiliariaRouter } from "./inmobiliaria.routes";
import { propiedadRouter } from "./propiedad.routes";
import { resenaRouter } from "./resena.routes";
import { solicitudVisitaRouter } from "./solicitud-visita.routes";
import { vendedorRouter } from "./vendedor.routes";
import { registroRouter } from "./registro.routes";
import { loginRouter } from "./login.routes";
import { dashboardRouter } from "./dashboard.routes";


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

// ACTIVIDADES
router.use(
  "/actividades",
  actividadRouter
);


// COMENTARIOS
router.use(
  "/comentarios",
  comentarioRouter
);


// FOTOS DE PROPIEDADES
router.use(
  "/fotos-propiedad",
  fotoPropiedadRouter
);


// HISTORIAL DE ESTADOS
router.use(
  "/historial-estados-propiedad",
  historialEstadoPropiedadRouter
);


// INMOBILIARIAS
router.use(
  "/inmobiliarias",
  inmobiliariaRouter
);


// PROPIEDADES
router.use(
  "/propiedades",
  propiedadRouter
);


// RESEÑAS
router.use(
  "/resenas",
  resenaRouter
);


// SOLICITUDES DE VISITA
router.use(
  "/solicitudes-visita",
  solicitudVisitaRouter
);


// VENDEDORES
router.use(
  "/vendedores",
  vendedorRouter
);

//REGISTRO VENDEDOR - INMOBILIARIA
router.use(
  "/registro",
   registroRouter
  );

// LOGIN
router.use(
  "/login",
  loginRouter
);

//DASHBOARD
router.use(
  "/dashboard", 
  dashboardRouter
);