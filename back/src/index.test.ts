import request from "supertest";
import { app } from "./index";

describe("API - Test básico", () => {

  test("GET /health debe responder 200 y status ok", async () => {

    // Supertest hace una petición HTTP a nuestra aplicación
    const response = await request(app)
      .get("/health");

    // Esperamos que el servidor responda HTTP 200
    expect(response.statusCode).toBe(200);

    // Esperamos que devuelva:
    // {
    //   "status": "ok"
    // }
    expect(response.body).toEqual({
      status: "ok"
    });

  });

});