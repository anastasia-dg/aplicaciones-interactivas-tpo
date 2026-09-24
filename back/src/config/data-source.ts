import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { join } from "node:path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",

  // Si estamos ejecutando tests usamos la base de test.
  // Si no, usamos nuestra base normal
  database:
  process.env.NODE_ENV === "test"
    ? "tpo_inmobiliario_test"
    : process.env.DB_NAME ?? "tpo_inmobiliario",
  synchronize: false,
  logging: false,
  entities: [join(__dirname, "..", "entities", "**", "*.{ts,js}")],
  migrations: [join(__dirname, "..", "migrations", "**", "*.{ts,js}")],
});
