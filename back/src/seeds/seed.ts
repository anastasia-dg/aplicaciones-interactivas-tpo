import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor.entity";
import { Inmobiliaria } from "../entities/inmobiliaria.entity";
import { Propiedad } from "../entities/propiedad.entity";

import {
  EstadoPropiedad,
  TipoOperacion,
  TipoPropiedad,
} from "../entities/enums";

import bcrypt from "bcryptjs";

async function seed(): Promise<void> {
  try {
    // Conectamos con PostgreSQL
    await AppDataSource.initialize();

    console.log("🌱 Cargando datos de prueba...");

    // Repositories de TypeORM
    const vendedorRepo = AppDataSource.getRepository(Vendedor);
    const inmobiliariaRepo = AppDataSource.getRepository(Inmobiliaria);
    const propiedadRepo = AppDataSource.getRepository(Propiedad);

    // =====================================================
    // EVITAMOS DUPLICADOS
    // =====================================================

    const vendedorExistente = await vendedorRepo.findOne({
      where: {
        email: "ana.seed@tpo.com",
      },
    });

    if (vendedorExistente) {
      console.log("⚠️ El seed ya fue cargado anteriormente.");
      console.log("No se agregaron datos duplicados.");
      return;
    }

    // =====================================================
    // VENDEDOR
    // =====================================================

    const contrasenaHash = await bcrypt.hash("123456", 10);

    const vendedor = vendedorRepo.create({
      nombreCompleto: "Ana Di Geronimo",
      email: "ana.seed@tpo.com",
      contrasenaHash,
      telefono: "2255123456",
    });

    await vendedorRepo.save(vendedor);

    console.log("✅ Vendedor creado");

    // =====================================================
    // INMOBILIARIA
    // =====================================================

    const inmobiliaria = inmobiliariaRepo.create({
      nombre: "Costa Propiedades Seed",
      descripcion: "Inmobiliaria de prueba del TPO",
      urlLogo: null,
      telefonoContacto: "2255123456",
      emailContacto: "contacto@costapropiedades.com",
      direccionOficina: "Avenida 3 1234, Villa Gesell",

      // Relacionamos la inmobiliaria con el vendedor
      vendedor,
    });

    await inmobiliariaRepo.save(inmobiliaria);

    console.log("✅ Inmobiliaria creada");

    // =====================================================
    // PROPIEDAD 1
    // =====================================================

    const propiedad1 = propiedadRepo.create({
      titulo: "Departamento con vista al mar",

      descripcion:
        "Departamento luminoso ubicado cerca de la playa.",

      tipo: TipoPropiedad.DEPARTAMENTO,

      operacion: TipoOperacion.VENTA,

      // IMPORTANTE:
      // En tu Entity precio es string porque PostgreSQL usa DECIMAL.
      precio: "95000.00",

      moneda: "USD",

      direccion: "Avenida 1 850",

      zona: "Centro",

      superficieCubiertaM2: "65.00",

      superficieTotalM2: "70.00",

      ambientes: 3,

      dormitorios: 2,

      banios: 1,

      antiguedadAnios: 8,

      tags: [
        "balcon",
        "cochera",
        "vista al mar",
      ],

      estado: EstadoPropiedad.BORRADOR,

      inmobiliaria,
    });

    // =====================================================
    // PROPIEDAD 2
    // =====================================================

    const propiedad2 = propiedadRepo.create({
      titulo: "Casa con pileta",

      descripcion:
        "Casa amplia con jardín, pileta y cochera.",

      tipo: TipoPropiedad.CASA,

      operacion: TipoOperacion.VENTA,

      precio: "180000.00",

      moneda: "USD",

      direccion: "Paseo 120 450",

      zona: "Sur",

      superficieCubiertaM2: "140.00",

      superficieTotalM2: "350.00",

      ambientes: 5,

      dormitorios: 3,

      banios: 2,

      antiguedadAnios: 10,

      tags: [
        "pileta",
        "jardin",
        "cochera",
      ],

      estado: EstadoPropiedad.BORRADOR,

      inmobiliaria,
    });

    // =====================================================
    // PROPIEDAD 3
    // =====================================================

    const propiedad3 = propiedadRepo.create({
      titulo: "Local comercial céntrico",

      descripcion:
        "Local comercial con excelente ubicación.",

      tipo: TipoPropiedad.LOCAL,

      operacion: TipoOperacion.ALQUILER,

      precio: "850000.00",

      moneda: "ARS",

      direccion: "Avenida 3 700",

      zona: "Centro",

      superficieCubiertaM2: "55.00",

      superficieTotalM2: "55.00",

      ambientes: 2,

      dormitorios: null,

      banios: 1,

      antiguedadAnios: 5,

      tags: [
        "vidriera",
        "centro",
      ],

      estado: EstadoPropiedad.BORRADOR,

      inmobiliaria,
    });

    // =====================================================
    // PROPIEDAD 4 - TERRENO
    // =====================================================

    const propiedad4 = propiedadRepo.create({
      titulo: "Terreno en Mar Azul",

      descripcion:
        "Terreno amplio ideal para construcción.",

      tipo: TipoPropiedad.TERRENO,

      operacion: TipoOperacion.VENTA,

      precio: "45000.00",

      moneda: "USD",

      direccion: "Calle 40 500",

      zona: "Mar Azul",

      // En un terreno puede no haber superficie cubierta
      superficieCubiertaM2: null,

      superficieTotalM2: "500.00",

      ambientes: null,

      dormitorios: null,

      banios: null,

      antiguedadAnios: null,

      tags: [],

      estado: EstadoPropiedad.BORRADOR,

      inmobiliaria,
    });

    // =====================================================
    // GUARDAMOS LAS PROPIEDADES
    // =====================================================

    await propiedadRepo.save([
      propiedad1,
      propiedad2,
      propiedad3,
      propiedad4,
    ]);

    console.log("✅ 4 propiedades creadas");

    console.log("");
    console.log("=================================");
    console.log("🎉 SEED CARGADO CORRECTAMENTE");
    console.log("=================================");
    console.log("Email: ana.seed@tpo.com");
    console.log("Contraseña: 123456");
    console.log("Propiedades: 4");
    console.log("=================================");

  } catch (error) {
    console.error("❌ ERROR AL EJECUTAR EL SEED");
    console.error(error);

    process.exitCode = 1;

  } finally {

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seed();