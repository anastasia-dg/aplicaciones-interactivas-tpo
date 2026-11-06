/**
 * Tests de integración nuevos para el TPO Marketplace Inmobiliario.
 * Guardar como back/src/backend.test.ts.
 * IMPORTANTE: antes de cada test se vacía la base tpo_inmobiliario_test.
 * Nunca ejecutar con datos importantes en esa base.
 */
import request from "supertest";
import { app } from "./index";
import { AppDataSource } from "./config/data-source";
import { Inmobiliaria } from "./entities/inmobiliaria.entity";
import { EstadoPropiedad, EstadoSolicitudVisita } from "./entities/enums";

jest.setTimeout(30000);

beforeAll(async () => {
  // Evitamos ejecutar estos tests accidentalmente sobre la base normal.
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Estos tests requieren NODE_ENV=test");
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "clave-exclusiva-para-tests-de-integracion";
  }
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  if (AppDataSource.options.database !== "tpo_inmobiliario_test") {
    throw new Error("La base activa no es tpo_inmobiliario_test");
  }
  await AppDataSource.runMigrations();
});

beforeEach(async () => {
  // Cada prueba comienza con tablas vacías y sin depender de otra prueba.
  const tablas = AppDataSource.entityMetadatas
    .map((entidad) => `"${entidad.tableName}"`)
    .join(", ");
  if (tablas) {
    await AppDataSource.query(`TRUNCATE ${tablas} RESTART IDENTITY CASCADE`);
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

let secuencia = 0;

function datosRegistro() {
  const n = ++secuencia;
  return {
    vendedor: {
      nombreCompleto: `Vendedor ${n}`,
      email: `vendedor-${n}@test.com`,
      contrasena: "ClaveSegura123",
      telefono: null,
    },
    inmobiliaria: {
      nombre: `Inmobiliaria ${n}`,
      descripcion: "Inmobiliaria para pruebas",
      telefonoContacto: "2255123456",
      emailContacto: `contacto-${n}@test.com`,
      urlLogo: null,
      direccionOficina: null,
    },
  };
}

async function registrarYEntrar() {
  // Registramos por HTTP, igual que lo hará el frontend.
  const datos = datosRegistro();
  const registro = await request(app).post("/registro").send(datos);
  expect(registro.status).toBe(201);

  const login = await request(app).post("/login").send({
    email: datos.vendedor.email,
    contrasena: datos.vendedor.contrasena,
  });
  expect(login.status).toBe(200);
  expect(typeof login.body.token).toBe("string");

  // Buscamos la inmobiliaria que se creó junto con el vendedor.
  const inmobiliaria = await AppDataSource.getRepository(Inmobiliaria).findOne({
    where: { nombre: datos.inmobiliaria.nombre },
  });
  expect(inmobiliaria).not.toBeNull();
  return { token: login.body.token as string, inmobiliariaId: inmobiliaria!.id, datos };
}

function datosPropiedad(inmobiliariaId: number) {
  return {
    titulo: "Casa de prueba con patio",
    descripcion: "Casa en muy buen estado",
    tipo: "CASA",
    operacion: "VENTA",
    precio: 120000,
    moneda: "USD",
    direccion: "Avenida 3 1234",
    zona: "Centro",
    superficieCubiertaM2: 80,
    superficieTotalM2: 120,
    ambientes: 3,
    dormitorios: 2,
    banios: 1,
    tags: ["patio"],
    inmobiliariaId,
  };
}

async function crearPropiedad(token: string, inmobiliariaId: number) {
  const respuesta = await request(app)
    .post("/propiedades")
    .set("Authorization", `Bearer ${token}`)
    .send(datosPropiedad(inmobiliariaId));
  expect(respuesta.status).toBe(201);
  return respuesta.body as { id: number; estado: string };
}

async function publicar(token: string, propiedadId: number) {
  // La publicación exige al menos una foto y exactamente una portada.
  const foto = await request(app)
    .post(`/fotos-propiedad/propiedad/${propiedadId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ url: "https://ejemplo.com/casa.jpg", orden: 0, esPortada: true });
  expect(foto.status).toBe(201);
  const publicada = await request(app)
    .patch(`/propiedades/${propiedadId}/estado`)
    .set("Authorization", `Bearer ${token}`)
    .send({ estado: EstadoPropiedad.PUBLICADA });
  expect(publicada.status).toBe(200);
  return foto.body as { id: number };
}

function fechaFutura() {
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
}

function datosVisita(fechaHoraPropuesta = fechaFutura()) {
  return {
    nombreSolicitante: "Persona interesada",
    telefonoSolicitante: "2255123456",
    fechaHoraPropuesta,
    mensaje: "Quiero conocer la propiedad",
  };
}

describe("Salud, registro y autenticación", () => {
  test("GET /health responde correctamente", async () => {
    const r = await request(app).get("/health");
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: "ok" });
  });

  test("registra vendedor e inmobiliaria", async () => {
    const datos = datosRegistro();
    const r = await request(app).post("/registro").send(datos);
    expect(r.status).toBe(201);
    const inmobiliaria = await AppDataSource.getRepository(Inmobiliaria).findOne({
      where: { nombre: datos.inmobiliaria.nombre },
    });
    expect(inmobiliaria).not.toBeNull();
  });

  test("rechaza registro inválido", async () => {
    const datos = datosRegistro();
    datos.vendedor.email = "email-invalido";
    expect((await request(app).post("/registro").send(datos)).status).toBe(400);
  });

  test("no permite registrar dos vendedores con el mismo email", async () => {
    const datos = datosRegistro();
    expect((await request(app).post("/registro").send(datos)).status).toBe(201);
    const repetido = datosRegistro();
    repetido.vendedor.email = datos.vendedor.email;
    expect((await request(app).post("/registro").send(repetido)).status).toBe(409);
  });

  test("login válido entrega token JWT", async () => {
    const { token } = await registrarYEntrar();
    expect(token.split(".")).toHaveLength(3);
  });

  test("login con contraseña incorrecta devuelve 401", async () => {
    const { datos } = await registrarYEntrar();
    const r = await request(app).post("/login").send({
      email: datos.vendedor.email,
      contrasena: "incorrecta",
    });
    expect(r.status).toBe(401);
  });

  test("sin token no permite crear propiedades", async () => {
    const r = await request(app).post("/propiedades").send({});
    expect(r.status).toBe(401);
  });
});

describe("Inmobiliarias y permisos", () => {
  test("el perfil público se puede consultar sin token", async () => {
    const { inmobiliariaId } = await registrarYEntrar();
    const r = await request(app).get(`/inmobiliarias/${inmobiliariaId}/perfil`);
    expect(r.status).toBe(200);
  });

  test("un vendedor no puede modificar la inmobiliaria de otro", async () => {
    const a = await registrarYEntrar();
    const b = await registrarYEntrar();
    const r = await request(app)
      .patch(`/inmobiliarias/${a.inmobiliariaId}`)
      .set("Authorization", `Bearer ${b.token}`)
      .send({ descripcion: "Cambio indebido" });
    expect(r.status).toBe(403);
  });

  test("un vendedor no puede consultar el dashboard de otro", async () => {
    const a = await registrarYEntrar();
    const b = await registrarYEntrar();
    const r = await request(app)
      .get(`/dashboard/${a.inmobiliariaId}`)
      .set("Authorization", `Bearer ${b.token}`);
    expect(r.status).toBe(403);
  });
});

describe("Propiedades, fotos y estados", () => {
  test("crea una propiedad en BORRADOR", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    expect(p.estado).toBe(EstadoPropiedad.BORRADOR);
  });

  test("no permite publicar sin fotos", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    const r = await request(app)
      .patch(`/propiedades/${p.id}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: EstadoPropiedad.PUBLICADA });
    expect(r.status).toBe(409);
  });

  test("publica con una foto de portada y aparece en el listado público", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    await publicar(token, p.id);
    const r = await request(app).get("/propiedades");
    expect(r.status).toBe(200);
    expect(r.body.propiedades.some((x: { id: number }) => x.id === p.id)).toBe(true);
  });

  test("los borradores no aparecen en el listado público", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    const r = await request(app).get("/propiedades");
    expect(r.status).toBe(200);
    expect(r.body.propiedades.some((x: { id: number }) => x.id === p.id)).toBe(false);
  });

  test("un vendedor no puede editar la propiedad de otro", async () => {
    const a = await registrarYEntrar();
    const b = await registrarYEntrar();
    const p = await crearPropiedad(a.token, a.inmobiliariaId);
    const r = await request(app)
      .patch(`/propiedades/${p.id}`)
      .set("Authorization", `Bearer ${b.token}`)
      .send({ titulo: "Título ajeno" });
    expect(r.status).toBe(403);
  });

  test("rechaza un cambio directo de BORRADOR a VENDIDA", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    const r = await request(app)
      .patch(`/propiedades/${p.id}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: EstadoPropiedad.VENDIDA });
    expect(r.status).toBe(409);
  });

  test("el dashboard del dueño devuelve estadísticas", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    await crearPropiedad(token, inmobiliariaId);
    const r = await request(app)
      .get(`/dashboard/${inmobiliariaId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(r.status).toBe(200);
    expect(r.body).toBeDefined();
  });
});

describe("Comentarios y respuestas", () => {
  test("permite comentar públicamente una propiedad publicada", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    await publicar(token, p.id);
    const r = await request(app)
      .post(`/comentarios/propiedad/${p.id}`)
      .send({ nombreAutor: "Cliente", pregunta: "¿Tiene patio?" });
    expect(r.status).toBe(201);
    expect(r.body.pregunta).toBe("¿Tiene patio?");
  });

  test("rechaza comentarios en propiedades en borrador", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    const r = await request(app)
      .post(`/comentarios/propiedad/${p.id}`)
      .send({ nombreAutor: "Cliente", pregunta: "¿Está disponible?" });
    expect(r.status).toBe(409);
  });

  test("el dueño responde una sola vez", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    await publicar(token, p.id);
    const c = await request(app)
      .post(`/comentarios/propiedad/${p.id}`)
      .send({ nombreAutor: "Cliente", pregunta: "¿Tiene patio?" });
    expect(c.status).toBe(201);
    const url = `/comentarios/${c.body.id}/responder`;
    const primera = await request(app)
      .patch(url).set("Authorization", `Bearer ${token}`)
      .send({ respuesta: "Sí, tiene patio." });
    expect(primera.status).toBe(200);
    const segunda = await request(app)
      .patch(url).set("Authorization", `Bearer ${token}`)
      .send({ respuesta: "Otra respuesta" });
    expect(segunda.status).toBe(409);
  });
});

describe("Solicitudes de visita", () => {
  test("una persona puede pedir una visita futura sin registrarse", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    await publicar(token, p.id);
    const r = await request(app)
      .post(`/solicitudes-visita/propiedad/${p.id}`)
      .send(datosVisita());
    expect(r.status).toBe(201);
    expect(r.body.estado).toBe(EstadoSolicitudVisita.PENDIENTE);
  });

  test("rechaza visitas con fecha pasada", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    await publicar(token, p.id);
    const r = await request(app)
      .post(`/solicitudes-visita/propiedad/${p.id}`)
      .send(datosVisita(new Date(Date.now() - 86400000).toISOString()));
    expect(r.status).toBe(400);
  });

  test("rechaza visitas para propiedades no publicadas", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    const r = await request(app)
      .post(`/solicitudes-visita/propiedad/${p.id}`)
      .send(datosVisita());
    expect(r.status).toBe(409);
  });

  test("el dueño confirma una solicitud pendiente", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    await publicar(token, p.id);
    const visita = await request(app)
      .post(`/solicitudes-visita/propiedad/${p.id}`)
      .send(datosVisita());
    expect(visita.status).toBe(201);
    const r = await request(app)
      .patch(`/solicitudes-visita/${visita.body.id}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: EstadoSolicitudVisita.CONFIRMADA });
    expect(r.status).toBe(200);
    expect(r.body.estado).toBe(EstadoSolicitudVisita.CONFIRMADA);
  });

  test("una visita futura confirmada impide cancelar la propiedad", async () => {
    const { token, inmobiliariaId } = await registrarYEntrar();
    const p = await crearPropiedad(token, inmobiliariaId);
    await publicar(token, p.id);
    const visita = await request(app)
      .post(`/solicitudes-visita/propiedad/${p.id}`)
      .send(datosVisita());
    expect(visita.status).toBe(201);
    const confirmar = await request(app)
      .patch(`/solicitudes-visita/${visita.body.id}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: EstadoSolicitudVisita.CONFIRMADA });
    expect(confirmar.status).toBe(200);
    const cancelar = await request(app)
      .patch(`/propiedades/${p.id}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: EstadoPropiedad.CANCELADA });
    expect(cancelar.status).toBe(409);
  });
});

describe("Reseñas y actividades", () => {
  test("permite crear una reseña de 1 a 5 estrellas", async () => {
    const { inmobiliariaId } = await registrarYEntrar();
    const r = await request(app)
      .post(`/resenas/inmobiliaria/${inmobiliariaId}`)
      .send({ nombreAutor: "Cliente", contenido: "Muy buena atención", calificacion: 5 });
    expect(r.status).toBe(201);
  });

  test("rechaza una reseña con calificación 6", async () => {
    const { inmobiliariaId } = await registrarYEntrar();
    const r = await request(app)
      .post(`/resenas/inmobiliaria/${inmobiliariaId}`)
      .send({ nombreAutor: "Cliente", contenido: "Buena atención", calificacion: 6 });
    expect(r.status).toBe(400);
  });

  test("las actividades requieren autenticación", async () => {
    expect((await request(app).get("/actividades")).status).toBe(401);
  });

  test("el vendedor puede consultar sus actividades", async () => {
    const { token } = await registrarYEntrar();
    const r = await request(app)
      .get("/actividades")
      .set("Authorization", `Bearer ${token}`);
    expect(r.status).toBe(200);
  });
});
