// Importa reflect-metadata.
// TypeORM necesita esta librería para poder trabajar correctamente
// con decoradores como @Entity, @Column, @ManyToOne, etc.
import "reflect-metadata";

// Permite leer las variables guardadas en el archivo .env.
// Por ejemplo: PORT, datos de la base de datos, etc.
import "dotenv/config";

// Importa Express.
// Express es la librería que usamos para crear el servidor/backend.
import express from "express";

// Importa CORS.
// CORS permite que el frontend pueda hacer peticiones al backend
// aunque estén funcionando en puertos o direcciones diferentes.
import cors from "cors";

// Importa el router que está en:
// src/routes/index.ts
//
// Ese router contiene las rutas de nuestra API.
import { router } from "./routes";

import { AppDataSource } from "./config/data-source";


// Crea la aplicación de Express.
//
// "app" representa nuestro servidor.
const app = express();


// Busca la variable PORT dentro del archivo .env.
//
// Si en .env existe, por ejemplo:
// PORT=4000
// usa el puerto 4000.
//
// Si no existe PORT, usa el puerto 3000.
const port = Number(process.env.PORT ?? 3000);


// Activa CORS en nuestra aplicación.
//
// Esto permite, por ejemplo, que el frontend
// se comunique con este backend.
app.use(cors());


// Le permite a Express recibir datos en formato JSON.
//
// Por ejemplo, si en el futuro el frontend manda:
//
// {
//   "titulo": "Casa con pileta",
//   "precio": 120000
// }
//
// gracias a express.json() el backend puede leer esos datos.
app.use(express.json());


// Le dice a la aplicación que use las rutas
// que fueron creadas en src/routes/index.ts.
app.use(router);


// Si estamos ejecutando tests, NO levantamos el servidor
// Los tests necesitan importar "app" sin ocupar un puerto
if (process.env.NODE_ENV !== "test") {

  // Primero inicializamos la conexión con PostgreSQL
  AppDataSource.initialize()
    .then(() => {
      console.log("Data source initialized");

      // Una vez conectada la base de datos,
      // levantamos el servidor de Express
      app.listen(port, () => {
        console.log(`API running on http://localhost:${port}`);
      });
    })
    .catch((error: unknown) => {
      console.error("Error initializing data source", error);
      process.exit(1);
    });
}

export { app };