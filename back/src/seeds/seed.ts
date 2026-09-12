// Importamos AppDataSource desde el archivo de configuración
// de la base de datos.
//
// AppDataSource contiene la configuración que TypeORM necesita
// para conectarse con PostgreSQL.
import { AppDataSource } from "../config/data-source";


// Creamos una función llamada "seed".
//
// Un SEED sirve para cargar datos iniciales o datos de prueba
// dentro de nuestra base de datos.
//
// Por ejemplo, más adelante podríamos usarlo para crear
// automáticamente vendedores, inmobiliarias y propiedades de prueba.
//
// "async" significa que dentro de esta función podemos realizar
// operaciones asincrónicas, es decir, operaciones que pueden tardar,
// como conectarnos con una base de datos.
//
// ": Promise<void>" indica que la función es asincrónica
// y que, cuando termine, no devuelve ningún dato.
async function seed(): Promise<void> {

  // Inicia la conexión con la base de datos.
  //
  // AppDataSource tiene la configuración de PostgreSQL
  // y TypeORM que necesita nuestro proyecto.
  //
  // "await" significa:
  // "esperá a que termine de conectarse antes de continuar".
  await AppDataSource.initialize();


  // Muestra este mensaje en la terminal.
  //
  // IMPORTANTE:
  // Esta línea NO agrega ningún dato a la base de datos.
  //
  // El profesor dejó este mensaje para indicar que
  // todavía falta programar los datos iniciales/de prueba.
  console.log("Seed pendiente: agregar datos de desarrollo para el dominio.");


  // Cierra la conexión con la base de datos.
  //
  // Como el seed se ejecuta, carga los datos y termina,
  // no necesita quedarse conectado permanentemente.
  await AppDataSource.destroy();
}


// Acá termina la función seed.
// Hasta este momento solamente la DEFINIMOS.
// Todavía necesitamos ejecutarla.


// Ejecutamos la función seed().
seed()

  // .catch() se ejecuta solamente si ocurre algún error
  // mientras se está ejecutando seed().
  //
  // Por ejemplo:
  // - PostgreSQL está apagado
  // - la contraseña de la base está mal
  // - no existe la base de datos
  // - ocurre un error al intentar insertar un dato
  //
  // "error: unknown" significa que TypeScript no sabe
  // exactamente qué tipo de error puede llegar a ocurrir.
  .catch((error: unknown) => {

    // Muestra el error en la terminal para que podamos
    // ver qué salió mal.
    console.error(error);

    // Indica que el programa terminó con un error.
    //
    // El código 1 significa que la ejecución
    // no terminó correctamente.
    process.exitCode = 1;
  });