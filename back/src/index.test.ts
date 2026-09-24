import request from 'supertest';
import { Response } from 'supertest';

// Importamos el modulo principal sin separar 'app' de 'index'
import * as serverModule  from  './index';

// Si en tu index.ts haces `export default app` o `export const app = ...`
const app = (serverModule as any).app || serverModule;
const db = (serverModule as any).db;

describe('Tests Automatizados de Integración (TS)', () => {

  // =========================================================================
  // SUBTAREA 1: Configurar una base de datos de test aislada (no la de dev)
  // CRITERIO: Los tests no dependen del orden (cada uno limpia o usa fixture)
  // =========================================================================
  beforeAll(async () => {
    if (db && typeof db.connect === 'function') {
      await db.connect();
    }
  });

  beforeEach(async () => {
    // Limpieza de tablas antes de cada ejecución para asegurar aislamiento
    if (db && typeof db.truncateTables === 'function') {
      await db.truncateTables();
    }
  });

  afterAll(async () => {
    if (db && typeof db.disconnect === 'function') {
      await db.disconnect();
    }
    if ((serverModule as any).server && typeof (serverModule as any).server.close === 'function') {
      await (serverModule as any).server.close();
    }
  });


  // =========================================================================
  // SUBTAREA 2: Tests de registro/login (email único, password hasheado)
  // CRITERIO: Unicidad de email/nombre de fantasía
  // =========================================================================
  describe('Pruebas de Registro y Autenticación', () => {

    test('debe registrar un usuario correctamente con la contraseña hasheada', async () => {
      const newUser = {
        email: 'usuario.test@ejemplo.com',
        password: 'PasswordSegura123!',
        nombreFantasia: 'Inmobiliaria Central'
      };

      const res: Response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(newUser.email);
      
      // Verifica que el password NO esté en texto plano y coincida con hash bcrypt
      expect(res.body.password).not.toBe(newUser.password);
      expect(res.body.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    test('debe fallar si el email ya existe (unicidad de email)', async () => {
      const user = {
        email: 'duplicado@ejemplo.com',
        password: 'Password123!',
        nombreFantasia: 'Marca A'
      };

      await request(app).post('/api/auth/register').send(user);

      const res: Response = await request(app)
        .post('/api/auth/register')
        .send({ ...user, nombreFantasia: 'Marca B' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/email.*registrado|existente|único/i);
    });

    test('debe fallar si el nombre de fantasía ya existe (unicidad de nombre de fantasía)', async () => {
      const user1 = { email: 'user1@ejemplo.com', password: 'Password123!', nombreFantasia: 'Exclusivo' };
      const user2 = { email: 'user2@ejemplo.com', password: 'Password123!', nombreFantasia: 'Exclusivo' };

      await request(app).post('/api/auth/register').send(user1);

      const res: Response = await request(app).post('/api/auth/register').send(user2);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/nombre de fantasía.*existente|único/i);
    });
  });


  // =========================================================================
  // SUBTAREA 3: Tests de la máquina de estados de Property
  // CRITERIO: Transiciones de estado (válidas e inválidas)
  // =========================================================================
  describe('Pruebas de la Máquina de Estados de Propiedades', () => {

    test('debe permitir transiciones válidas de estado (BORRADOR -> PUBLICADA -> RESERVADA)', async () => {
      // 1. Crear propiedad en Borrador
      const createRes: Response = await request(app)
        .post('/api/properties')
        .send({ titulo: 'Dpto Centro', precio: 50000, superficie: 45 });

      const propId: string | number = createRes.body.id;
      expect(createRes.body.estado).toBe('BORRADOR');

      // 2. Transición válida a PUBLICADA
      const publishRes: Response = await request(app)
        .patch(`/api/properties/${propId}/estado`)
        .send({ estado: 'PUBLICADA' });

      expect(publishRes.statusCode).toBe(200);
      expect(publishRes.body.estado).toBe('PUBLICADA');

      // 3. Transición válida a RESERVADA
      const reserveRes: Response = await request(app)
        .patch(`/api/properties/${propId}/estado`)
        .send({ estado: 'RESERVADA' });

      expect(reserveRes.statusCode).toBe(200);
      expect(reserveRes.body.estado).toBe('RESERVADA');
    });

    test('debe rechazar transiciones inválidas de estado (VENDIDA -> BORRADOR)', async () => {
      const createRes: Response = await request(app)
        .post('/api/properties')
        .send({ titulo: 'Casa Norte', precio: 120000, superficie: 100, estado: 'VENDIDA' });

      const res: Response = await request(app)
        .patch(`/api/properties/${createRes.body.id}/estado`)
        .send({ estado: 'BORRADOR' });

      expect(res.statusCode).toBe(422);
      expect(res.body.error).toMatch(/transición.*inválida|no permitida/i);
    });
  });


  // =========================================================================
  // SUBTAREA 4: Tests de los filtros de búsqueda de propiedades
  // CRITERIO: Validación de precio/superficie
  // =========================================================================
  describe('Pruebas de Filtros y Validaciones de Negocio', () => {

    test('debe rechazar la creación si el precio o la superficie son negativos o cero', async () => {
      const res: Response = await request(app)
        .post('/api/properties')
        .send({
          titulo: 'Terreno Invalido',
          precio: -1000,
          superficie: 0
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ param: 'precio' }),
          expect.objectContaining({ param: 'superficie' })
        ])
      );
    });

    test('debe filtrar propiedades correctamente según rango de precio y superficie', async () => {
      // Fixtures aislados
      await request(app).post('/api/properties').send({ titulo: 'Propiedad A', precio: 10000, superficie: 30 });
      await request(app).post('/api/properties').send({ titulo: 'Propiedad B', precio: 50000, superficie: 70 });
      await request(app).post('/api/properties').send({ titulo: 'Propiedad C', precio: 150000, superficie: 150 });

      const res: Response = await request(app)
        .get('/api/properties/search')
        .query({ minPrecio: 20000, maxPrecio: 100000, minSuperficie: 50 });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].titulo).toBe('Propiedad B');
    });
  });

});