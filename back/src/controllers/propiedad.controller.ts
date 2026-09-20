import { Request, Response } from "express";

import {
  crearPropiedadSchema,
  actualizarPropiedadSchema,
} from "../dtos/propiedad-dto";

import { propiedadService } from "../services/propiedad-service";

import {
  EstadoPropiedad,
} from "../entities/enums";
import { Inmobiliaria } from "../entities/inmobiliaria.entity";

// CONTROLLER DE PROPIEDAD

class PropiedadController {

  // LISTAR TODAS LAS PROPIEDADES

  async listar(_request: Request, response: Response) {

    try {

      // Le pedimos al service todas las propiedades.
      const propiedades = await propiedadService.listar();

      // Devolvemos las propiedades encontradas.
      response.status(200).json(propiedades);

    } catch (error) {

      console.error(error);

      response.status(500).json({
        mensaje: "Error al obtener las propiedades",
      });
    }
  }

  // BUSCAR UNA PROPIEDAD POR ID

  async buscarPorId(request: Request, response: Response) {

    try {

      // Los parámetros de Express siempre llegan como string.
      //
      // Por eso convertimos el id a número.
      const id = Number(request.params.id);


      // Comprobamos que realmente sea un número.
      if (isNaN(id)) {

        return response.status(400).json({
          mensaje: "El ID de la propiedad no es válido",
        });
      }


      // Buscamos la propiedad utilizando el service.
      const propiedad = await propiedadService.buscarPorId(id);


      // Devolvemos la propiedad encontrada.
      return response.status(200).json(propiedad);

    } catch (error) {

      // Si el service dice que no existe,
      // devolvemos 404.
      if (
        error instanceof Error &&
        error.message === "Propiedad no encontrada"
      ) {

        return response.status(404).json({
          mensaje: error.message,
        });
      }


      console.error(error);

      return response.status(500).json({
        mensaje: "Error al buscar la propiedad",
      });
    }
  }

  // CREAR UNA PROPIEDAD

  async crear(request: Request, response: Response) {

    try {

      // Validamos todos los datos recibidos
      // utilizando el DTO.
      const resultado = crearPropiedadSchema.safeParse(
        request.body
      );


      // Si los datos no cumplen el schema,
      // devolvemos error 400.
      if (!resultado.success) {

        return response.status(400).json({
          mensaje: "Los datos de la propiedad no son válidos",
          errores: resultado.error.issues,
        });
      }


      // resultado.data contiene los datos
      // ya validados por Zod.
      const datos = resultado.data;


      // IMPORTANTE:
      //
      // El DTO recibe:
      //
      // inmobiliariaId: 1
      //
      // Pero la Entity necesita:
      //
      // inmobiliaria: { id: 1 }
      //
      // Por eso hacemos la transformación acá.
      const propiedad = await propiedadService.crear({

        titulo: datos.titulo,

        descripcion: datos.descripcion,

        tipo: datos.tipo,

        operacion: datos.operacion,

        precio: String(datos.precio),

        moneda: datos.moneda,

        direccion: datos.direccion,

        zona: datos.zona,

        superficieCubiertaM2: 
          datos.superficieCubiertaM2 != null 
          ? String(datos.superficieCubiertaM2) 
          : null,

        superficieTotalM2:
          String(datos.superficieTotalM2),

        ambientes:
          datos.ambientes ?? null,

        dormitorios:
          datos.dormitorios ?? null,

        banios:
          datos.banios ?? null,

        antiguedadAnios:
          datos.antiguedadAnios ?? null,

        tags:
          datos.tags ?? [],

        inmobiliaria: {
          id: datos.inmobiliariaId,
        } as Inmobiliaria
      });


      // La propiedad fue creada correctamente.
      return response.status(201).json(propiedad);

    } catch (error) {

      console.error(error);

      return response.status(500).json({
        mensaje: "Error al crear la propiedad",
      });
    }
  }

  // ACTUALIZAR UNA PROPIEDAD

  async actualizar(request: Request, response: Response) {

    try {

      // Convertimos el ID de string a number.
      const id = Number(request.params.id);


      // Validamos el ID.
      if (isNaN(id)) {

        return response.status(400).json({
          mensaje: "El ID de la propiedad no es válido",
        });
      }


      // Validamos el body utilizando
      // el schema de actualización.
      const resultado =
        actualizarPropiedadSchema.safeParse(
          request.body
        );


      // Si el body no es válido,
      // devolvemos 400.
      if (!resultado.success) {

        return response.status(400).json({
          mensaje: "Los datos de actualización no son válidos",
          errores: resultado.error.issues,
        });
      }


      const datos = resultado.data;


      // Creamos un objeto con los datos
      // que realmente necesita la Entity.
      //
      // No mandamos inmobiliariaId directamente
      // porque no existe como atributo de Propiedad.
      const datosActualizacion: any = {

        ...datos,

      };


      // Si mandaron inmobiliariaId,
      // lo transformamos a la relación inmobiliaria.
      if (datos.inmobiliariaId !== undefined) {

        datosActualizacion.inmobiliaria = {
          id: datos.inmobiliariaId,
        };

        // Eliminamos inmobiliariaId porque
        // no pertenece a la Entity.
        delete datosActualizacion.inmobiliariaId;
      }


      // TypeORM guarda los DECIMAL como string.
      //
      // Convertimos los números del DTO.
      if (datos.precio !== undefined) {

        datosActualizacion.precio =
          String(datos.precio);
      }


      if (datos.superficieTotalM2 !== undefined) {

        datosActualizacion.superficieTotalM2 =
          String(datos.superficieTotalM2);
      }


      if (datos.superficieCubiertaM2 !== undefined) {

        datosActualizacion.superficieCubiertaM2 =
          datos.superficieCubiertaM2 === null
            ? null
            : String(datos.superficieCubiertaM2);
      }


      // Llamamos al service para realizar
      // la actualización.
      const propiedad =
        await propiedadService.actualizar(
          id,
          datosActualizacion
        );


      // Devolvemos la propiedad modificada.
      return response.status(200).json(propiedad);

    } catch (error) {

      // Propiedad inexistente.
      if (
        error instanceof Error &&
        error.message === "Propiedad no encontrada"
      ) {

        return response.status(404).json({
          mensaje: error.message,
        });
      }


      // Propiedad finalizada.
      if (
        error instanceof Error &&
        (
          error.message ===
            "No se puede editar una propiedad finalizada" ||

          error.message ===
            "No se puede editar una propiedad con una visita confirmada"
        )
      ) {

        return response.status(409).json({
          mensaje: error.message,
        });
      }


      console.error(error);

      return response.status(500).json({
        mensaje: "Error al actualizar la propiedad",
      });
    }
  }

  // CAMBIAR ESTADO DE UNA PROPIEDAD

  async cambiarEstado(request: Request, response: Response) {

    try {

      // Convertimos el ID.
      const id = Number(request.params.id);


      // Validamos el ID.
      if (isNaN(id)) {

        return response.status(400).json({
          mensaje: "El ID de la propiedad no es válido",
        });
      }


      // El estado nuevo llega desde el body.
      const { estado } = request.body;


      // Comprobamos que el estado exista.
      if (
        !Object.values(EstadoPropiedad).includes(
          estado
        )
      ) {

        return response.status(400).json({
          mensaje: "El estado de la propiedad no es válido",
        });
      }


      // El service se encarga de comprobar
      // si el cambio de estado está permitido.
      const propiedad =
        await propiedadService.cambiarEstado(
          id,
          estado
        );


      // Devolvemos la propiedad actualizada.
      return response.status(200).json(propiedad);

    } catch (error) {

      if (
        error instanceof Error &&
        error.message === "Propiedad no encontrada"
      ) {

        return response.status(404).json({
          mensaje: error.message,
        });
      }


      if (
        error instanceof Error &&
        (
          error.message ===
            "La propiedad ya se encuentra en ese estado" ||

          error.message ===
            "Cambio de estado de propiedad no permitido"
        )
      ) {

        return response.status(409).json({
          mensaje: error.message,
        });
      }


      console.error(error);

      return response.status(500).json({
        mensaje: "Error al cambiar el estado de la propiedad",
      });
    }
  }

  // ELIMINAR UNA PROPIEDAD

  async eliminar(request: Request, response: Response) {

    try {

      // Convertimos el ID.
      const id = Number(request.params.id);


      // Validamos el ID.
      if (isNaN(id)) {

        return response.status(400).json({
          mensaje: "El ID de la propiedad no es válido",
        });
      }


      // Le pedimos al service que elimine
      // la propiedad.
      await propiedadService.eliminar(id);


      // 204 significa que se realizó correctamente
      // pero no hay contenido para devolver.
      return response.status(204).send();

    } catch (error) {

      // La propiedad no existe.
      if (
        error instanceof Error &&
        error.message === "Propiedad no encontrada"
      ) {

        return response.status(404).json({
          mensaje: error.message,
        });
      }


      // No se puede eliminar por las reglas
      // de negocio del service.
      if (
        error instanceof Error &&
        (
          error.message ===
            "No se puede eliminar una propiedad con una visita confirmada" ||

          error.message ===
            "No se puede eliminar una propiedad finalizada"
        )
      ) {

        return response.status(409).json({
          mensaje: error.message,
        });
      }


      console.error(error);

      return response.status(500).json({
        mensaje: "Error al eliminar la propiedad",
      });
    }
  }
}


// Creamos una única instancia del controller.
//
// Después la vamos a utilizar desde las rutas.
export const propiedadController =
  new PropiedadController();