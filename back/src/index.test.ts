import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "./index";
import { AppDataSource } from "./config/data-source";
import { vendedorRepository } from "./repositories/vendedor.repository";
import { inmobiliariaRepository } from "./repositories/inmobiliaria.repository";
import { propiedadRepository } from "./repositories/propiedad.repository";
import { fotoPropiedadRepository } from "./repositories/foto-propiedad.repository";
import { historialEstadoPropiedadRepository } from "./repositories/historial-estado-propiedad.repository";
import { Inmobiliaria } from "./entities/inmobiliaria.entity";
import { Propiedad } from "./entities/propiedad.entity";
import {
  TipoPropiedad,
  TipoOperacion,
  EstadoPropiedad,
  EstadoSolicitudVisita,
  TipoActividad,
} from "./entities/enums";


// ============================================================
// SETUP DE LA BASE DE DATOS DE TEST
// ============================================================
//
// Se conecta a la base de datos de test (config/data-source.ts ya
// apunta a "tpo_inmobiliario_test" cuando NODE_ENV=test) y corre las
// migraciones pendientes. "index.ts" no inicializa la conexión cuando
// NODE_ENV=test (así "app" se puede importar sin levantar el server),
// por eso lo hacemos acá.
beforeAll(async () => {

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.runMigrations();
});

// Antes de cada test vaciamos TODAS las tablas.
//
// TRUNCATE ... CASCADE ignora el orden de las foreign keys
// (propiedad -> inmobiliaria, foto -> propiedad, etc), y
// RESTART IDENTITY hace que los IDs vuelvan a arrancar en 1.
//
// Así cada test arranca con la base vacía y arma únicamente los
// datos que necesita (su propio fixture), sin depender de lo que
// haya dejado otro test ni del orden en que corran.
beforeEach(async () => {

  const tablas = AppDataSource.entityMetadatas
    .map((entidad) => `"${entidad.tableName}"`)
    .join(", ");

  if (tablas.length > 0) {
    await AppDataSource.query(
      `TRUNCATE ${tablas} RESTART IDENTITY CASCADE;`
    );
  }
});

afterAll(async () => {

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});


// ============================================================
// FIXTURES
// ============================================================
//
// Como la base se limpia y reinicia el ID en cada test, alcanza
// con un contador simple para generar emails/nombres que no
// choquen entre sí dentro de un mismo test.
let contador = 0;

function siguiente(): number {
  contador += 1;
  return contador;
}

// Crea un Vendedor + una Inmobiliaria directamente por repository
// (sin pasar por HTTP), para que los tests de propiedades y filtros
// no dependan del flujo de /registro.
async function crearInmobiliariaDePrueba(
  datos: Partial<{
    emailVendedor: string;
    nombreInmobiliaria: string;
  }> = {}
): Promise<Inmobiliaria> {

  const sufijo = siguiente();

  const vendedor = await vendedorRepository.crear({
    nombreCompleto: `Vendedor de prueba ${sufijo}`,
    email: datos.emailVendedor ?? `vendedor${sufijo}@test.com`,
    contrasenaHash: await bcrypt.hash("clave-de-prueba", 10),
    telefono: null,
  });

  return inmobiliariaRepository.crear({
    nombre: datos.nombreInmobiliaria ?? `Inmobiliaria de prueba ${sufijo}`,
    descripcion: "Inmobiliaria creada para tests",
    urlLogo: null,
    telefonoContacto: "3511234567",
    emailContacto: `contacto${sufijo}@test.com`,
    direccionOficina: null,
    vendedor,
  });
}

// Crea una Propiedad asociada a la inmobiliaria recibida.
// Todos los campos tienen un valor por defecto razonable para
// que cada test solo tenga que pisar lo que le importa.
async function crearPropiedadDePrueba(
  inmobiliaria: Inmobiliaria,
  datos: Partial<{
    titulo: string;
    tags: string[];
    tipo: TipoPropiedad;
    descripcion: string;
    operacion: TipoOperacion;
    estado: EstadoPropiedad;
    precio: number;
    zona: string;
    ambientes: number | null;
    dormitorios: number | null;
    banios: number | null;
  }> = {}
): Promise<Propiedad> {

  const sufijo = siguiente();

  return propiedadRepository.crear({
    titulo: datos.titulo ?? `Propiedad de prueba ${sufijo}`,
    descripcion: datos.descripcion ?? "Descripción de prueba",
    tipo: datos.tipo ?? TipoPropiedad.CASA,
    operacion: datos.operacion ?? TipoOperacion.VENTA,
    precio: String(datos.precio ?? 100000),
    moneda: "USD",
    direccion: `Calle Falsa ${sufijo}`,
    zona: datos.zona ?? "Centro",
    superficieCubiertaM2: "80",
    superficieTotalM2: "100",
    ambientes: datos.ambientes ?? 3,
    dormitorios: datos.dormitorios ?? 2,
    banios: datos.banios ?? 1,
    antiguedadAnios: 5,
    tags: datos.tags ?? [],
    estado: datos.estado ?? EstadoPropiedad.BORRADOR,
    inmobiliaria,
  });
}

// Le agrega a la propiedad una foto marcada como portada.
// Es requisito para poder pasarla a PUBLICADA
// (ver reglas en PropiedadService.cambiarEstado).
async function agregarFotoDePortada(propiedad: Propiedad): Promise<void> {

  await fotoPropiedadRepository.crear({
    url: "https://ejemplo.com/foto.jpg",
    orden: 0,
    esPortada: true,
    propiedad,
  });
}

// Datos válidos de registro, reutilizados en los tests de registro/login.
function datosDeRegistro(sufijo: string) {
  return {
    vendedor: {
      nombreCompleto: `Vendedor ${sufijo}`,
      email: `vendedor-${sufijo}@test.com`,
      contrasena: "claveSegura123",
      telefono: null,
    },
    inmobiliaria: {
      nombre: `Inmobiliaria ${sufijo}`,
      descripcion: "Descripción de prueba",
      urlLogo: null,
      telefonoContacto: "3511234567",
      emailContacto: `contacto-${sufijo}@test.com`,
      direccionOficina: null,
    },
  };
}


// ============================================================
// HEALTH CHECK
// ============================================================

describe("API - Test básico", () => {

  test("GET /health debe responder 200 y status ok", async () => {

    const response = await request(app)
      .get("/health");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      status: "ok"
    });

  });

});


// ============================================================
// REGISTRO Y LOGIN
// ============================================================

describe("POST /registro y POST /login", () => {

  describe("Registro", () => {

    test("registra un vendedor con su inmobiliaria y responde 201", async () => {

      const respuesta = await request(app)
        .post("/registro")
        .send(datosDeRegistro("nuevo"));

      expect(respuesta.status).toBe(201);
      expect(respuesta.body.email).toBe("vendedor-nuevo@test.com");

      expect(respuesta.body.contrasena).toBeUndefined();
      expect(respuesta.body.contrasenaHash).toBeUndefined();
    });


    test("la contraseña se guarda hasheada, no en texto plano", async () => {

      const datos = datosDeRegistro("hash");

      await request(app)
        .post("/registro")
        .send(datos);

      const vendedorGuardado =
        await vendedorRepository.buscarPorEmailConContrasena(
          datos.vendedor.email
        );

      expect(vendedorGuardado).not.toBeNull();

      expect(vendedorGuardado!.contrasenaHash).not.toBe(
        datos.vendedor.contrasena
      );

      const coincide = await bcrypt.compare(
        datos.vendedor.contrasena,
        vendedorGuardado!.contrasenaHash
      );
      expect(coincide).toBe(true);
    });


    test("rechaza el registro si el email del vendedor ya existe (409)", async () => {

      const datos = datosDeRegistro("repetido");

      await request(app).post("/registro").send(datos);

      const segundosDatos = datosDeRegistro("repetido-2");
      segundosDatos.vendedor.email = datos.vendedor.email;

      const respuesta = await request(app)
        .post("/registro")
        .send(segundosDatos);

      expect(respuesta.status).toBe(409);
      expect(respuesta.body.mensaje).toBe(
        "Ya existe un vendedor con ese correo"
      );
    });


    test("rechaza el registro si el nombre de fantasía ya existe (409)", async () => {

      const datos = datosDeRegistro("marca");

      await request(app).post("/registro").send(datos);

      const segundosDatos = datosDeRegistro("marca-2");
      segundosDatos.inmobiliaria.nombre = datos.inmobiliaria.nombre;

      const respuesta = await request(app)
        .post("/registro")
        .send(segundosDatos);

      expect(respuesta.status).toBe(409);
      expect(respuesta.body.mensaje).toBe(
        "Ya existe una inmobiliaria con ese nombre"
      );
    });


    test("rechaza el registro con datos inválidos (400)", async () => {

      const datos = datosDeRegistro("invalido");
      datos.vendedor.email = "esto-no-es-un-email";

      const respuesta = await request(app)
        .post("/registro")
        .send(datos);

      expect(respuesta.status).toBe(400);
    });

  });


  describe("Login", () => {

    async function registrarVendedorDePrueba() {
      const datos = datosDeRegistro("login");
      await request(app).post("/registro").send(datos);
      return datos.vendedor;
    }

    test("inicia sesión con credenciales correctas (200)", async () => {

      const credenciales = await registrarVendedorDePrueba();

      const respuesta = await request(app)
        .post("/login")
        .send({
          email: credenciales.email,
          contrasena: credenciales.contrasena,
        });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.email).toBe(credenciales.email);
      expect(respuesta.body.contrasenaHash).toBeUndefined();
    });


    test("rechaza la contraseña incorrecta (401)", async () => {

      const credenciales = await registrarVendedorDePrueba();

      const respuesta = await request(app)
        .post("/login")
        .send({
          email: credenciales.email,
          contrasena: "otra-contraseña",
        });

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.mensaje).toBe("Credenciales incorrectas");
    });


    test("rechaza un email que no está registrado (401)", async () => {

      const respuesta = await request(app)
        .post("/login")
        .send({
          email: "no-existe@test.com",
          contrasena: "cualquiera",
        });

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.mensaje).toBe("Credenciales incorrectas");
    });

  });

});


// ============================================================
// MÁQUINA DE ESTADOS DE PROPIEDAD
// ============================================================

describe("PATCH /propiedades/:id/estado — máquina de estados", () => {

  test("no permite publicar una propiedad sin fotos (409)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.PUBLICADA });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "La propiedad debe tener al menos una foto para ser publicada"
    );
  });


  test("no permite publicar una propiedad sin foto de portada (409)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });

    await fotoPropiedadRepository.crear({
      url: "https://ejemplo.com/sin-portada.jpg",
      orden: 0,
      esPortada: false,
      propiedad,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.PUBLICADA });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "La propiedad debe tener exactamente una foto de portada"
    );
  });


  test("BORRADOR -> PUBLICADA es válida cuando tiene una foto de portada (200)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });

    await agregarFotoDePortada(propiedad);

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.PUBLICADA });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe(EstadoPropiedad.PUBLICADA);

    const historial =
      await historialEstadoPropiedadRepository.buscarPorPropiedad(
        propiedad.id
      );

    expect(historial).toHaveLength(1);
    expect(historial[0].estadoAnterior).toBe(EstadoPropiedad.BORRADOR);
    expect(historial[0].estadoNuevo).toBe(EstadoPropiedad.PUBLICADA);
  });


  test("BORRADOR -> RESERVADA es inválida (409)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.RESERVADA });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "No se puede cambiar de BORRADOR a RESERVADA"
    );
  });


  test("PUBLICADA -> RESERVADA es válida (200)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.PUBLICADA,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.RESERVADA });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe(EstadoPropiedad.RESERVADA);
  });


  test("PUBLICADA -> VENDIDA es inválida: hay que pasar por RESERVADA (409)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.PUBLICADA,
      operacion: TipoOperacion.VENTA,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.VENDIDA });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "No se puede cambiar de PUBLICADA a VENDIDA"
    );
  });


  test("RESERVADA -> VENDIDA es válida si la operación es VENTA (200)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.RESERVADA,
      operacion: TipoOperacion.VENTA,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.VENDIDA });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe(EstadoPropiedad.VENDIDA);
  });


  test("RESERVADA -> ALQUILADA es inválida si la operación es VENTA (409)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.RESERVADA,
      operacion: TipoOperacion.VENTA,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.ALQUILADA });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "No se puede cambiar de RESERVADA a ALQUILADA"
    );
  });


  test("RESERVADA -> ALQUILADA es válida si la operación es ALQUILER (200)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.RESERVADA,
      operacion: TipoOperacion.ALQUILER,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.ALQUILADA });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe(EstadoPropiedad.ALQUILADA);
  });


  test("un estado finalizado (VENDIDA) no puede volver a cambiar (409)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.VENDIDA,
      operacion: TipoOperacion.VENTA,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.PUBLICADA });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "No se puede cambiar de VENDIDA a PUBLICADA"
    );
  });


  test("pasar al mismo estado en el que ya está es inválido (409)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.PUBLICADA,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.PUBLICADA });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "La propiedad ya se encuentra en ese estado"
    );
  });


  test("un estado que no existe en el enum es rechazado por el DTO (400)", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: "NO_EXISTE" });

    expect(respuesta.status).toBe(400);
  });


  test("cambiar el estado de una propiedad inexistente devuelve 404", async () => {

    const respuesta = await request(app)
      .patch("/propiedades/999999/estado")
      .send({ estado: EstadoPropiedad.PUBLICADA });

    expect(respuesta.status).toBe(404);
  });

});


// ============================================================
// FILTROS DE BÚSQUEDA Y PAGINACIÓN
// ============================================================

describe("GET /propiedades — filtros y paginación", () => {

  test("sin filtros devuelve todas las propiedades con la paginación por defecto", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, { titulo: "Casa 1" });
    await crearPropiedadDePrueba(inmobiliaria, { titulo: "Casa 2" });
    await crearPropiedadDePrueba(inmobiliaria, { titulo: "Casa 3" });

    const respuesta = await request(app).get("/propiedades");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.propiedades).toHaveLength(3);
    expect(respuesta.body.paginacion).toEqual({
      paginaActual: 1,
      porPagina: 10,
      totalRegistros: 3,
      totalPaginas: 1,
    });
  });


  test("filtra por tipo", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, {
      titulo: "Depto Centro",
      tipo: TipoPropiedad.DEPARTAMENTO,
    });
    await crearPropiedadDePrueba(inmobiliaria, {
      titulo: "Casa Centro",
      tipo: TipoPropiedad.CASA,
    });

    const respuesta = await request(app)
      .get("/propiedades")
      .query({ tipo: TipoPropiedad.DEPARTAMENTO });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.propiedades).toHaveLength(1);
    expect(respuesta.body.propiedades[0].titulo).toBe("Depto Centro");
  });


  test("filtra por operación", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, {
      titulo: "En venta",
      operacion: TipoOperacion.VENTA,
    });
    await crearPropiedadDePrueba(inmobiliaria, {
      titulo: "En alquiler",
      operacion: TipoOperacion.ALQUILER,
    });

    const respuesta = await request(app)
      .get("/propiedades")
      .query({ operacion: TipoOperacion.ALQUILER });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.propiedades).toHaveLength(1);
    expect(respuesta.body.propiedades[0].titulo).toBe("En alquiler");
  });


  test("filtra por rango de precio", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, { titulo: "Barata", precio: 50000 });
    await crearPropiedadDePrueba(inmobiliaria, { titulo: "Media", precio: 120000 });
    await crearPropiedadDePrueba(inmobiliaria, { titulo: "Cara", precio: 300000 });

    const respuesta = await request(app)
      .get("/propiedades")
      .query({ precioMin: 100000, precioMax: 200000 });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.propiedades).toHaveLength(1);
    expect(respuesta.body.propiedades[0].titulo).toBe("Media");
  });


  test("filtra por zona de forma parcial e insensible a mayúsculas", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, { titulo: "En Belgrano", zona: "Belgrano Sur" });
    await crearPropiedadDePrueba(inmobiliaria, { titulo: "En Palermo", zona: "Palermo Hollywood" });

    const respuesta = await request(app)
      .get("/propiedades")
      .query({ zona: "belgrano" });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.propiedades).toHaveLength(1);
    expect(respuesta.body.propiedades[0].titulo).toBe("En Belgrano");
  });


  test("combina varios filtros a la vez", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, {
      titulo: "Coincide",
      tipo: TipoPropiedad.CASA,
      operacion: TipoOperacion.VENTA,
      zona: "Nueva Córdoba",
      precio: 150000,
      dormitorios: 3,
    });

    await crearPropiedadDePrueba(inmobiliaria, {
      titulo: "No coincide - dormitorios",
      tipo: TipoPropiedad.CASA,
      operacion: TipoOperacion.VENTA,
      zona: "Nueva Córdoba",
      precio: 150000,
      dormitorios: 1,
    });

    await crearPropiedadDePrueba(inmobiliaria, {
      titulo: "No coincide - tipo",
      tipo: TipoPropiedad.DEPARTAMENTO,
      operacion: TipoOperacion.VENTA,
      zona: "Nueva Córdoba",
      precio: 150000,
      dormitorios: 3,
    });

    const respuesta = await request(app)
      .get("/propiedades")
      .query({
        tipo: TipoPropiedad.CASA,
        operacion: TipoOperacion.VENTA,
        zona: "córdoba",
        dormitoriosMin: 2,
      });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.propiedades).toHaveLength(1);
    expect(respuesta.body.propiedades[0].titulo).toBe("Coincide");
  });


  test("un filtro que no matchea ninguna propiedad devuelve una lista vacía", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    await crearPropiedadDePrueba(inmobiliaria, { tipo: TipoPropiedad.CASA });

    const respuesta = await request(app)
      .get("/propiedades")
      .query({ tipo: TipoPropiedad.TERRENO });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.propiedades).toHaveLength(0);
    expect(respuesta.body.paginacion.totalRegistros).toBe(0);

    expect(respuesta.body.paginacion.totalPaginas).toBe(1);
  });


  test("precioMin mayor a precioMax es rechazado por el DTO (400)", async () => {

    const respuesta = await request(app)
      .get("/propiedades")
      .query({ precioMin: 200000, precioMax: 100000 });

    expect(respuesta.status).toBe(400);
  });


  describe("paginación", () => {

    async function crearQuincePropiedades() {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      for (let numero = 1; numero <= 15; numero++) {
        await crearPropiedadDePrueba(inmobiliaria, {
          titulo: `Propiedad ${String(numero).padStart(2, "0")}`,
        });
      }
    }

    test("la primera página respeta el límite indicado", async () => {

      await crearQuincePropiedades();

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ page: 1, limit: 5 });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(5);
      expect(respuesta.body.paginacion).toEqual({
        paginaActual: 1,
        porPagina: 5,
        totalRegistros: 15,
        totalPaginas: 3,
      });
    });


    test("la última página trae solo lo que sobra", async () => {

      await crearQuincePropiedades();

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ page: 3, limit: 5 });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(5);
      expect(respuesta.body.paginacion.paginaActual).toBe(3);
    });


    test("una página fuera de rango devuelve una lista vacía, sin error", async () => {

      await crearQuincePropiedades();

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ page: 10, limit: 5 });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(0);
      expect(respuesta.body.paginacion.totalPaginas).toBe(3);
    });


    test("page o limit inválidos son rechazados por el DTO (400)", async () => {

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ page: 0, limit: 5 });

      expect(respuesta.status).toBe(400);
    });


    test("limit por encima del máximo permitido es rechazado (400)", async () => {

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ limit: 100 });

      expect(respuesta.status).toBe(400);
    });

    // ======================================================
    // TESTS DE BÚSQUEDA POR TEXTO
    // ======================================================

    test("busca una propiedad por texto en el título", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa con pileta",
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Departamento céntrico",
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ texto: "pileta" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe("Casa con pileta");
    });


    test("busca una propiedad por texto en la descripción", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa en venta",
        descripcion: "Hermosa propiedad con jardín amplio",
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Departamento",
        descripcion: "Departamento ubicado en el centro",
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ texto: "jardín" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe("Casa en venta");
    });


    test("la búsqueda por texto no distingue mayúsculas y minúsculas", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa Frente al MAR",
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ texto: "mar" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe("Casa Frente al MAR");
    });


    test("la búsqueda por texto es parcial", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Departamento con balcón",
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ texto: "balc" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe(
        "Departamento con balcón"
      );
    });


    test("texto sin coincidencias devuelve una lista vacía", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa en el centro",
        descripcion: "Casa de tres ambientes",
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ texto: "playa" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(0);
    });


    test("combina búsqueda por texto con otros filtros", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa con pileta",
        tipo: TipoPropiedad.CASA,
        zona: "Centro",
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Departamento con pileta",
        tipo: TipoPropiedad.DEPARTAMENTO,
        zona: "Centro",
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa con pileta en Palermo",
        tipo: TipoPropiedad.CASA,
        zona: "Palermo",
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({
          texto: "pileta",
          tipo: TipoPropiedad.CASA,
          zona: "centro",
        });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe("Casa con pileta");
    });

    test("filtra propiedades por un amenity", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa con pileta",
        tags: ["pileta", "cochera"],
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa sin pileta",
        tags: ["balcon"],
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ amenities: "pileta" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe("Casa con pileta");
    });


    test("filtra propiedades que tengan todos los amenities solicitados", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa completa",
        tags: ["pileta", "cochera", "balcon"],
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa solo pileta",
        tags: ["pileta"],
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa solo cochera",
        tags: ["cochera"],
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ amenities: "pileta,cochera" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe("Casa completa");
    });


    test("el filtro de amenities no distingue mayúsculas y minúsculas", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa equipada",
        tags: ["Pileta", "Cochera"],
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ amenities: "PILETA" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe("Casa equipada");
    });


    test("amenities se puede combinar con otros filtros", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "La correcta",
        tipo: TipoPropiedad.CASA,
        zona: "Centro",
        tags: ["pileta", "cochera"],
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Tipo incorrecto",
        tipo: TipoPropiedad.DEPARTAMENTO,
        zona: "Centro",
        tags: ["pileta", "cochera"],
      });

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Amenity incorrecto",
        tipo: TipoPropiedad.CASA,
        zona: "Centro",
        tags: ["balcon"],
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({
          amenities: "pileta,cochera",
          tipo: TipoPropiedad.CASA,
          zona: "centro",
        });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(1);
      expect(respuesta.body.propiedades[0].titulo).toBe("La correcta");
    });


    test("amenity inexistente devuelve una lista vacía", async () => {
      const inmobiliaria = await crearInmobiliariaDePrueba();

      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Casa",
        tags: ["pileta"],
      });

      const respuesta = await request(app)
        .get("/propiedades")
        .query({ amenities: "sauna" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.propiedades).toHaveLength(0);
    });

    // ======================================================
    // TESTS DE ORDENAMIENTO
    // ======================================================

    test("ordena propiedades por precio de menor a mayor", async () => {
      const response = await request(app)
        .get("/propiedades?ordenarPor=precio&orden=ASC");

      expect(response.status).toBe(200);

      const propiedades = response.body.propiedades;

      for (let i = 1; i < propiedades.length; i++) {
        expect(Number(propiedades[i].precio)).toBeGreaterThanOrEqual(
          Number(propiedades[i - 1].precio)
        );
      }
    });


    test("ordena propiedades por precio de mayor a menor", async () => {
      const response = await request(app)
        .get("/propiedades?ordenarPor=precio&orden=DESC");

      expect(response.status).toBe(200);

      const propiedades = response.body.propiedades;

      for (let i = 1; i < propiedades.length; i++) {
        expect(Number(propiedades[i].precio)).toBeLessThanOrEqual(
          Number(propiedades[i - 1].precio)
        );
      }
    });


    test("ordena propiedades por superficie de menor a mayor", async () => {
      const response = await request(app)
        .get("/propiedades?ordenarPor=superficie&orden=ASC");

      expect(response.status).toBe(200);

      const propiedades = response.body.propiedades;

      for (let i = 1; i < propiedades.length; i++) {
        expect(Number(propiedades[i].superficieTotalM2)).toBeGreaterThanOrEqual(
          Number(propiedades[i - 1].superficieTotalM2)
        );
      }
    });


    test("ordena propiedades por superficie de mayor a menor", async () => {
      const response = await request(app)
        .get("/propiedades?ordenarPor=superficie&orden=DESC");

      expect(response.status).toBe(200);

      const propiedades = response.body.propiedades;

      for (let i = 1; i < propiedades.length; i++) {
        expect(Number(propiedades[i].superficieTotalM2)).toBeLessThanOrEqual(
          Number(propiedades[i - 1].superficieTotalM2)
        );
      }
    });


    test("ordena propiedades por fecha de más antigua a más nueva", async () => {
      const response = await request(app)
        .get("/propiedades?ordenarPor=fecha&orden=ASC");

      expect(response.status).toBe(200);

      const propiedades = response.body.propiedades;

      for (let i = 1; i < propiedades.length; i++) {
        const fechaAnterior = new Date(
          propiedades[i - 1].fechaCreacion
        ).getTime();

        const fechaActual = new Date(
          propiedades[i].fechaCreacion
        ).getTime();

        expect(fechaActual).toBeGreaterThanOrEqual(fechaAnterior);
      }
    });


    test("ordena propiedades por fecha de más nueva a más antigua", async () => {
      const response = await request(app)
        .get("/propiedades?ordenarPor=fecha&orden=DESC");

      expect(response.status).toBe(200);

      const propiedades = response.body.propiedades;

      for (let i = 1; i < propiedades.length; i++) {
        const fechaAnterior = new Date(
          propiedades[i - 1].fechaCreacion
        ).getTime();

        const fechaActual = new Date(
          propiedades[i].fechaCreacion
        ).getTime();

        expect(fechaActual).toBeLessThanOrEqual(fechaAnterior);
      }
    });


    test("rechaza un campo de ordenamiento inválido", async () => {
      const response = await request(app)
        .get("/propiedades?ordenarPor=cualquierCosa&orden=ASC");

      expect(response.status).toBe(400);
    });


    test("rechaza una dirección de ordenamiento inválida", async () => {
      const response = await request(app)
        .get("/propiedades?ordenarPor=precio&orden=CUALQUIERA");

      expect(response.status).toBe(400);
    });

  });

});


// ============================================================
// HELPERS PARA LOS TESTS DE INTERACCIONES
// ============================================================

// Devuelve una fecha ISO ubicada en un número de días
// respecto del momento actual. Sirve para las solicitudes de visita.
function fechaISO(dias: number): string {
  return new Date(
    Date.now() + dias * 24 * 60 * 60 * 1000
  ).toISOString();
}

// Crea un comentario válido y devuelve su respuesta.
async function crearComentarioDePrueba(
  propiedad: Propiedad,
  datos: {
    nombreAutor?: string;
    pregunta?: string;
  } = {}
): Promise<{
  id: number;
  nombreAutor: string;
  pregunta: string;
  respuesta: string | null;
}> {
  const respuesta = await request(app)
    .post(`/comentarios/propiedad/${propiedad.id}`)
    .send({
      nombreAutor: datos.nombreAutor ?? "Interesado de prueba",
      pregunta: datos.pregunta ?? "¿La propiedad sigue disponible?",
    });

  expect(respuesta.status).toBe(201);

  return respuesta.body as {
    id: number;
    nombreAutor: string;
    pregunta: string;
    respuesta: string | null;
  };
}

// Crea una solicitud válida y devuelve su respuesta.
async function crearSolicitudPendiente(
  propiedad: Propiedad
): Promise<{ id: number; estado: EstadoSolicitudVisita }> {
  const respuesta = await request(app)
    .post(`/solicitudes-visita/propiedad/${propiedad.id}`)
    .send({
      nombreSolicitante: "Persona interesada",
      telefonoSolicitante: "3511234567",
      fechaHoraPropuesta: fechaISO(1),
      mensaje: "Quisiera visitarla por la mañana.",
    });

  expect(respuesta.status).toBe(201);

  return respuesta.body as {
    id: number;
    estado: EstadoSolicitudVisita;
  };
}

// Crea una propiedad, la publica y luego la lleva al estado final
// indicado. Se usa para preparar los reportes del dashboard.
async function crearPropiedadOperada(
  inmobiliaria: Inmobiliaria,
  operacion: TipoOperacion,
  estadoFinal: EstadoPropiedad
): Promise<Propiedad> {
  const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
    operacion,
    estado: EstadoPropiedad.BORRADOR,
  });

  await agregarFotoDePortada(propiedad);

  const publicar = await request(app)
    .patch(`/propiedades/${propiedad.id}/estado`)
    .send({ estado: EstadoPropiedad.PUBLICADA });

  expect(publicar.status).toBe(200);

  const reservar = await request(app)
    .patch(`/propiedades/${propiedad.id}/estado`)
    .send({ estado: EstadoPropiedad.RESERVADA });

  expect(reservar.status).toBe(200);

  const finalizar = await request(app)
    .patch(`/propiedades/${propiedad.id}/estado`)
    .send({ estado: estadoFinal });

  expect(finalizar.status).toBe(200);

  return propiedad;
}

// Guarda un cambio de estado y luego ajusta su fecha para poder
// verificar reportes de meses y tiempos de manera determinista.
async function crearHistorialConFecha(
  propiedad: Propiedad,
  estadoAnterior: EstadoPropiedad,
  estadoNuevo: EstadoPropiedad,
  fecha: Date
): Promise<void> {
  const historial =
    await historialEstadoPropiedadRepository.crear({
      propiedad,
      estadoAnterior,
      estadoNuevo,
    });

  await AppDataSource.query(
    `UPDATE "historial_estado_propiedad"
     SET "fechaCreacion" = $1::timestamp
     WHERE "id" = $2`,
    [fecha, historial.id]
  );
}


// ============================================================
// INMOBILIARIAS
// ============================================================

describe("Inmobiliaria — administración", () => {

  test("actualiza correctamente los datos de la inmobiliaria", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    const datosActualizados = {
      nombre: `Inmobiliaria actualizada ${siguiente()}`,
      descripcion: "Descripción actualizada",
      urlLogo: "https://ejemplo.com/logo.png",
      telefonoContacto: "3519999999",
      emailContacto: "actualizada@test.com",
      direccionOficina: "Av. Siempre Viva 742",
    };

    const respuesta = await request(app)
      .patch(`/inmobiliarias/${inmobiliaria.id}`)
      .send(datosActualizados);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject(datosActualizados);

  });


  test("impide que dos inmobiliarias tengan el mismo nombre de fantasía", async () => {

    const primera = await crearInmobiliariaDePrueba({
      nombreInmobiliaria: "Inmobiliaria con nombre único",
    });

    const segunda = await crearInmobiliariaDePrueba();

    const respuesta = await request(app)
      .patch(`/inmobiliarias/${primera.id}`)
      .send({ nombre: segunda.nombre });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe(
      "Ya existe otra inmobiliaria con ese nombre"
    );

  });


  test("elimina una inmobiliaria que no tiene propiedades publicadas ni reservadas", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });

    const respuesta = await request(app)
      .delete(`/inmobiliarias/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(204);
    expect(
      await inmobiliariaRepository.buscarPorId(inmobiliaria.id)
    ).toBeNull();

  });


  test("impide eliminar una inmobiliaria con una propiedad PUBLICADA", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.PUBLICADA,
    });

    const respuesta = await request(app)
      .delete(`/inmobiliarias/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe(
      "No se puede eliminar la inmobiliaria porque tiene propiedades publicadas o reservadas"
    );

  });


  test("impide eliminar una inmobiliaria con una propiedad RESERVADA", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.RESERVADA,
    });

    const respuesta = await request(app)
      .delete(`/inmobiliarias/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe(
      "No se puede eliminar la inmobiliaria porque tiene propiedades publicadas o reservadas"
    );

  });


  test("impide que un vendedor tenga más de una inmobiliaria", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const vendedorId = (
      await inmobiliariaRepository.buscarPorId(inmobiliaria.id)
    )!.vendedor.id;

    const respuesta = await request(app)
      .post("/inmobiliarias")
      .send({
        nombre: `Segunda inmobiliaria ${siguiente()}`,
        descripcion: "No debería poder crearse",
        urlLogo: null,
        telefonoContacto: "3511234567",
        emailContacto: "segunda@test.com",
        direccionOficina: null,
        vendedorId,
      });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe(
      "El vendedor ya tiene una inmobiliaria"
    );

  });

});


// ============================================================
// COMENTARIOS
// ============================================================

describe("Comentarios — consultas y respuestas", () => {

  test("crea correctamente un comentario", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    const respuesta = await request(app)
      .post(`/comentarios/propiedad/${propiedad.id}`)
      .send({
        nombreAutor: "Ana interesada",
        pregunta: "¿La propiedad tiene garaje?",
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombreAutor).toBe("Ana interesada");
    expect(respuesta.body.pregunta).toBe(
      "¿La propiedad tiene garaje?"
    );
    expect(respuesta.body.respuesta).toBeNull();
    expect(respuesta.body.propiedad.id).toBe(propiedad.id);

  });


  test("rechaza un nombre de autor vacío", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    const respuesta = await request(app)
      .post(`/comentarios/propiedad/${propiedad.id}`)
      .send({
        nombreAutor: "",
        pregunta: "Pregunta válida",
      });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain(
      "El nombre del autor es obligatorio"
    );

  });


  test("rechaza una pregunta vacía", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    const respuesta = await request(app)
      .post(`/comentarios/propiedad/${propiedad.id}`)
      .send({
        nombreAutor: "Interesado",
        pregunta: "",
      });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain(
      "La pregunta es obligatoria"
    );

  });


  test("responde correctamente un comentario", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const comentario = await crearComentarioDePrueba(propiedad);

    const respuesta = await request(app)
      .patch(`/comentarios/${comentario.id}/responder`)
      .send({ respuesta: "Sí, tiene garaje." });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.respuesta).toBe("Sí, tiene garaje.");

  });


  test("impide responder un comentario por segunda vez", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const comentario = await crearComentarioDePrueba(propiedad);

    const primeraRespuesta = await request(app)
      .patch(`/comentarios/${comentario.id}/responder`)
      .send({ respuesta: "Primera respuesta" });

    expect(primeraRespuesta.status).toBe(200);

    const segundaRespuesta = await request(app)
      .patch(`/comentarios/${comentario.id}/responder`)
      .send({ respuesta: "Segunda respuesta" });

    expect(segundaRespuesta.status).toBe(400);
    expect(segundaRespuesta.body.message).toBe(
      "El comentario ya fue respondido"
    );

  });


  test("obtiene los comentarios de una propiedad", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedadConComentarios =
      await crearPropiedadDePrueba(inmobiliaria, {
        titulo: "Propiedad consultada",
      });
    const otraPropiedad = await crearPropiedadDePrueba(inmobiliaria, {
      titulo: "Otra propiedad",
    });

    const primerComentario = await crearComentarioDePrueba(
      propiedadConComentarios,
      { pregunta: "Primera consulta" }
    );
    const segundoComentario = await crearComentarioDePrueba(
      propiedadConComentarios,
      { pregunta: "Segunda consulta" }
    );
    await crearComentarioDePrueba(otraPropiedad);

    const respuesta = await request(app)
      .get(`/comentarios/propiedad/${propiedadConComentarios.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(2);
    expect(respuesta.body.map((comentario: { id: number }) => comentario.id))
      .toEqual(
        expect.arrayContaining([
          primerComentario.id,
          segundoComentario.id,
        ])
      );

  });


  test("crear un comentario genera una actividad COMENTARIO", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    await crearComentarioDePrueba(propiedad);

    const respuesta = await request(app)
      .get(`/actividades/inmobiliaria/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].tipo).toBe(TipoActividad.COMENTARIO);

  });

});


// ============================================================
// SOLICITUDES DE VISITA
// ============================================================

describe("Solicitudes de visita — creación y estados", () => {

  test("crea correctamente una solicitud y comienza PENDIENTE", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    const respuesta = await request(app)
      .post(`/solicitudes-visita/propiedad/${propiedad.id}`)
      .send({
        nombreSolicitante: "Persona interesada",
        telefonoSolicitante: "3511234567",
        fechaHoraPropuesta: fechaISO(2),
        mensaje: "Me gustaría visitarla.",
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.estado).toBe(EstadoSolicitudVisita.PENDIENTE);
    expect(respuesta.body.propiedad.id).toBe(propiedad.id);

  });


  test("rechaza una fecha de visita pasada", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    const respuesta = await request(app)
      .post(`/solicitudes-visita/propiedad/${propiedad.id}`)
      .send({
        nombreSolicitante: "Persona interesada",
        telefonoSolicitante: "3511234567",
        fechaHoraPropuesta: fechaISO(-1),
        mensaje: null,
      });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe(
      "La fecha de la visita debe ser futura"
    );

  });


  test("permite cambiar una solicitud de PENDIENTE a CONFIRMADA", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const solicitud = await crearSolicitudPendiente(propiedad);

    const respuesta = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.CONFIRMADA });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe(
      EstadoSolicitudVisita.CONFIRMADA
    );

  });


  test("permite cambiar una solicitud de PENDIENTE a RECHAZADA", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const solicitud = await crearSolicitudPendiente(propiedad);

    const respuesta = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.RECHAZADA });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe(
      EstadoSolicitudVisita.RECHAZADA
    );

  });


  test("permite cambiar una solicitud de PENDIENTE a CANCELADA", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const solicitud = await crearSolicitudPendiente(propiedad);

    const respuesta = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.CANCELADA });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe(
      EstadoSolicitudVisita.CANCELADA
    );

  });


  test("permite cambiar una solicitud de CONFIRMADA a REALIZADA", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const solicitud = await crearSolicitudPendiente(propiedad);

    const confirmar = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.CONFIRMADA });

    expect(confirmar.status).toBe(200);

    const realizar = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.REALIZADA });

    expect(realizar.status).toBe(200);
    expect(realizar.body.estado).toBe(
      EstadoSolicitudVisita.REALIZADA
    );

  });


  test("impide una transición inválida de una solicitud", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const solicitud = await crearSolicitudPendiente(propiedad);

    const respuesta = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.REALIZADA });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe(
      "Cambio de estado de solicitud no permitido"
    );

  });


  test("impide volver de CONFIRMADA a PENDIENTE", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const solicitud = await crearSolicitudPendiente(propiedad);

    const confirmar = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.CONFIRMADA });

    expect(confirmar.status).toBe(200);

    const respuesta = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.PENDIENTE });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe(
      "Cambio de estado de solicitud no permitido"
    );

  });


  test("impide modificar una propiedad con una visita confirmada pendiente de realizar", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const solicitud = await crearSolicitudPendiente(propiedad);

    const confirmar = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.CONFIRMADA });

    expect(confirmar.status).toBe(200);

    const respuesta = await request(app)
      .patch(`/propiedades/${propiedad.id}`)
      .send({ descripcion: "Descripción que no debe guardarse" });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "No se puede modificar una propiedad con visitas confirmadas"
    );

  });


  test("impide eliminar una propiedad con una visita confirmada pendiente de realizar", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    const solicitud = await crearSolicitudPendiente(propiedad);

    const confirmar = await request(app)
      .patch(`/solicitudes-visita/${solicitud.id}/estado`)
      .send({ estado: EstadoSolicitudVisita.CONFIRMADA });

    expect(confirmar.status).toBe(200);

    const respuesta = await request(app)
      .delete(`/propiedades/${propiedad.id}`);

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe(
      "No se puede eliminar una propiedad con visitas confirmadas"
    );

  });


  test("crear una visita genera una actividad SOLICITUD_VISITA", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    await crearSolicitudPendiente(propiedad);

    const respuesta = await request(app)
      .get(`/actividades/inmobiliaria/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].tipo).toBe(
      TipoActividad.SOLICITUD_VISITA
    );

  });

});


// ============================================================
// RESEÑAS
// ============================================================

describe("Reseñas — creación y consulta", () => {

  test("crea correctamente una reseña", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    const respuesta = await request(app)
      .post(`/resenas/inmobiliaria/${inmobiliaria.id}`)
      .send({
        nombreAutor: "Cliente satisfecho",
        contenido: "Muy buena atención.",
        calificacion: 5,
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombreAutor).toBe("Cliente satisfecho");
    expect(respuesta.body.contenido).toBe("Muy buena atención.");
    expect(respuesta.body.calificacion).toBe(5);
    expect(respuesta.body.inmobiliaria.id).toBe(inmobiliaria.id);

  });


  test("rechaza una reseña con contenido vacío", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    const respuesta = await request(app)
      .post(`/resenas/inmobiliaria/${inmobiliaria.id}`)
      .send({
        nombreAutor: "Cliente",
        contenido: "",
        calificacion: 4,
      });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain(
      "El contenido de la reseña es obligatorio"
    );

  });


  test("rechaza una calificación de 0", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    const respuesta = await request(app)
      .post(`/resenas/inmobiliaria/${inmobiliaria.id}`)
      .send({
        nombreAutor: "Cliente",
        contenido: "Comentario válido",
        calificacion: 0,
      });

    expect(respuesta.status).toBe(400);

  });


  test("rechaza una calificación de 6", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    const respuesta = await request(app)
      .post(`/resenas/inmobiliaria/${inmobiliaria.id}`)
      .send({
        nombreAutor: "Cliente",
        contenido: "Comentario válido",
        calificacion: 6,
      });

    expect(respuesta.status).toBe(400);

  });


  test("rechaza una calificación decimal", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    const respuesta = await request(app)
      .post(`/resenas/inmobiliaria/${inmobiliaria.id}`)
      .send({
        nombreAutor: "Cliente",
        contenido: "Comentario válido",
        calificacion: 3.5,
      });

    expect(respuesta.status).toBe(400);

  });


  test("obtiene las reseñas de una inmobiliaria", async () => {

    const primeraInmobiliaria = await crearInmobiliariaDePrueba();
    const segundaInmobiliaria = await crearInmobiliariaDePrueba();

    await request(app)
      .post(`/resenas/inmobiliaria/${primeraInmobiliaria.id}`)
      .send({
        nombreAutor: "Cliente 1",
        contenido: "Primera reseña",
        calificacion: 4,
      });

    await request(app)
      .post(`/resenas/inmobiliaria/${primeraInmobiliaria.id}`)
      .send({
        nombreAutor: "Cliente 2",
        contenido: "Segunda reseña",
        calificacion: 5,
      });

    await request(app)
      .post(`/resenas/inmobiliaria/${segundaInmobiliaria.id}`)
      .send({
        nombreAutor: "Otro cliente",
        contenido: "Reseña de otra inmobiliaria",
        calificacion: 3,
      });

    const respuesta = await request(app)
      .get(`/resenas/inmobiliaria/${primeraInmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(2);
    expect(
      respuesta.body.every(
        (resena: { inmobiliaria: { id: number } }) =>
          resena.inmobiliaria.id === primeraInmobiliaria.id
      )
    ).toBe(true);

  });


  test("crear una reseña genera una actividad RESENA", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await request(app)
      .post(`/resenas/inmobiliaria/${inmobiliaria.id}`)
      .send({
        nombreAutor: "Cliente",
        contenido: "Reseña válida",
        calificacion: 4,
      });

    const respuesta = await request(app)
      .get(`/actividades/inmobiliaria/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].tipo).toBe(TipoActividad.RESENA);

  });

});


// ============================================================
// ACTIVIDADES / NOTIFICACIONES
// ============================================================

describe("Actividades / notificaciones", () => {

  test("una actividad nueva comienza con leida en false", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    await crearComentarioDePrueba(propiedad);

    const respuesta = await request(app)
      .get(`/actividades/inmobiliaria/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body[0].leida).toBe(false);

  });


  test("permite marcar una actividad como leída", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    await crearComentarioDePrueba(propiedad);

    const actividades = await request(app)
      .get(`/actividades/inmobiliaria/${inmobiliaria.id}`);
    const actividadId = actividades.body[0].id;

    const respuesta = await request(app)
      .patch(`/actividades/${actividadId}/leida`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.leida).toBe(true);

    const consulta = await request(app)
      .get(`/actividades/${actividadId}`);

    expect(consulta.status).toBe(200);
    expect(consulta.body.leida).toBe(true);

  });


  test("obtiene las actividades de una inmobiliaria", async () => {

    const primeraInmobiliaria = await crearInmobiliariaDePrueba();
    const segundaInmobiliaria = await crearInmobiliariaDePrueba();
    const primeraPropiedad =
      await crearPropiedadDePrueba(primeraInmobiliaria);
    const segundaPropiedad =
      await crearPropiedadDePrueba(segundaInmobiliaria);

    await crearComentarioDePrueba(primeraPropiedad);
    await crearComentarioDePrueba(segundaPropiedad);

    const respuesta = await request(app)
      .get(`/actividades/inmobiliaria/${primeraInmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].inmobiliaria.id).toBe(
      primeraInmobiliaria.id
    );

  });


  test("cambiar el estado de una propiedad genera una actividad", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });
    await agregarFotoDePortada(propiedad);

    const cambio = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.PUBLICADA });

    expect(cambio.status).toBe(200);

    const respuesta = await request(app)
      .get(`/actividades/inmobiliaria/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].tipo).toBe(
      TipoActividad.CAMBIO_ESTADO_PROPIEDAD
    );
    expect(respuesta.body[0].descripcion).toContain(propiedad.titulo);

  });


  test("permite contabilizar las actividades no leídas desde el feed de una inmobiliaria", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);

    await crearComentarioDePrueba(propiedad, {
      pregunta: "Primera consulta",
    });
    await crearComentarioDePrueba(propiedad, {
      pregunta: "Segunda consulta",
    });

    const respuesta = await request(app)
      .get(`/actividades/inmobiliaria/${inmobiliaria.id}`);

    const noLeidas = respuesta.body.filter(
      (actividad: { leida: boolean }) => !actividad.leida
    );

    expect(respuesta.status).toBe(200);
    expect(noLeidas).toHaveLength(2);

    await request(app)
      .patch(`/actividades/${respuesta.body[0].id}/leida`);

    const actividadesActualizadas = await request(app)
      .get(`/actividades/inmobiliaria/${inmobiliaria.id}`);

    const noLeidasDespues =
      actividadesActualizadas.body.filter(
        (actividad: { leida: boolean }) => !actividad.leida
      );

    expect(noLeidasDespues).toHaveLength(1);

  });

});


// ============================================================
// DASHBOARD
// ============================================================

describe("Dashboard — reportes de una inmobiliaria", () => {

  test("cuenta la cantidad de propiedades por estado", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });
    await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.BORRADOR,
    });
    await crearPropiedadDePrueba(inmobiliaria, {
      estado: EstadoPropiedad.PUBLICADA,
    });

    const respuesta = await request(app)
      .get(`/dashboard/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.propiedadesPorEstado).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          estado: EstadoPropiedad.BORRADOR,
          cantidad: 2,
        }),
        expect.objectContaining({
          estado: EstadoPropiedad.PUBLICADA,
          cantidad: 1,
        }),
      ])
    );

  });


  test("cuenta las publicaciones por mes", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    for (let numero = 0; numero < 2; numero++) {
      const propiedad = await crearPropiedadDePrueba(inmobiliaria);
      await agregarFotoDePortada(propiedad);

      const respuesta = await request(app)
        .patch(`/propiedades/${propiedad.id}/estado`)
        .send({ estado: EstadoPropiedad.PUBLICADA });

      expect(respuesta.status).toBe(200);
    }

    const respuesta = await request(app)
      .get(`/dashboard/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.publicacionesPorMes).toHaveLength(1);
    expect(respuesta.body.publicacionesPorMes[0].mes).toMatch(
      /^\d{4}-\d{2}$/
    );
    expect(respuesta.body.publicacionesPorMes[0].cantidad).toBe(2);

  });


  test("cuenta las ventas y alquileres por mes", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();

    await crearPropiedadOperada(
      inmobiliaria,
      TipoOperacion.VENTA,
      EstadoPropiedad.VENDIDA
    );
    await crearPropiedadOperada(
      inmobiliaria,
      TipoOperacion.ALQUILER,
      EstadoPropiedad.ALQUILADA
    );

    const respuesta = await request(app)
      .get(`/dashboard/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.operacionesPorMes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          estado: EstadoPropiedad.VENDIDA,
          cantidad: 1,
        }),
        expect.objectContaining({
          estado: EstadoPropiedad.ALQUILADA,
          cantidad: 1,
        }),
      ])
    );

  });


  test("calcula el promedio de días entre publicación y venta o alquiler", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedadVenta = await crearPropiedadDePrueba(inmobiliaria);
    const propiedadAlquiler = await crearPropiedadDePrueba(inmobiliaria);

    await crearHistorialConFecha(
      propiedadVenta,
      EstadoPropiedad.BORRADOR,
      EstadoPropiedad.PUBLICADA,
      new Date("2026-01-01T12:00:00.000Z")
    );
    await crearHistorialConFecha(
      propiedadVenta,
      EstadoPropiedad.RESERVADA,
      EstadoPropiedad.VENDIDA,
      new Date("2026-01-11T12:00:00.000Z")
    );

    await crearHistorialConFecha(
      propiedadAlquiler,
      EstadoPropiedad.BORRADOR,
      EstadoPropiedad.PUBLICADA,
      new Date("2026-02-01T12:00:00.000Z")
    );
    await crearHistorialConFecha(
      propiedadAlquiler,
      EstadoPropiedad.RESERVADA,
      EstadoPropiedad.ALQUILADA,
      new Date("2026-02-21T12:00:00.000Z")
    );

    const respuesta = await request(app)
      .get(`/dashboard/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.tiempoPromedioEnMercado).toBe(15);

  });


  test("devuelve null el tiempo promedio cuando no hay operaciones", async () => {

    const inmobiliaria = await crearInmobiliariaDePrueba();
    const propiedad = await crearPropiedadDePrueba(inmobiliaria);
    await agregarFotoDePortada(propiedad);

    const publicar = await request(app)
      .patch(`/propiedades/${propiedad.id}/estado`)
      .send({ estado: EstadoPropiedad.PUBLICADA });

    expect(publicar.status).toBe(200);

    const respuesta = await request(app)
      .get(`/dashboard/${inmobiliaria.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.operacionesPorMes).toEqual([]);
    expect(respuesta.body.tiempoPromedioEnMercado).toBeNull();

  });

});