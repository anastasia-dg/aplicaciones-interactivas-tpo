import { Request, Response } from "express";
import {
  crearPropiedadSchema,
  actualizarPropiedadSchema,
  cambiarEstadoPropiedadSchema,
  listarPropiedadesSchema,
} from "../dtos/propiedad-dto";
import { propiedadService } from "../services/propiedad-service";


class PropiedadController {

  // Devuelve las propiedades filtradas y paginadas
  async listar(request: Request, response: Response) {

    try {

      // Validamos los query params
      // con el mismo patrón que usamos para el body en crear/actualizar
      const resultado = listarPropiedadesSchema.safeParse(
        request.query
      );

      if (!resultado.success) {
        return response.status(400).json({
          mensaje: "Los filtros de búsqueda no son válidos",
          errores: resultado.error.issues,
        });
      }

      const filtros = resultado.data;

      const { propiedades, paginacion } =
        await propiedadService.listar(filtros);

      return response.status(200).json({
        propiedades,
        paginacion,
      });

    } catch (error) {

      console.error(error);

      return response.status(500).json({
        mensaje: "Error al obtener las propiedades",
      });
    }
  }


  // Busca una propiedad por su ID.
  async buscarPorId(request: Request, response: Response) {

    try {

      // Los parámetros de Express llegan como string,
      // por eso convertimos el ID a number.
      const id = Number(request.params.id);

      // Si no se pudo convertir correctamente, devolvemos 400.
      if (isNaN(id)) {
        return response.status(400).json({
          mensaje: "El ID de la propiedad no es válido",
        });
      }

      // Le pedimos al Service que busque la propiedad.
      const propiedad = await propiedadService.buscarPorId(id);

      return response.status(200).json(propiedad);

    } catch (error) {

      // Si el Service no encontró la propiedad, devolvemos 404.
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


  // Crea una propiedad.
  async crear(request: Request, response: Response) {

    try {

      // Validamos el body usando el DTO de creación.
      const resultado = crearPropiedadSchema.safeParse(
        request.body
      );

      // Si los datos no cumplen con el DTO,
      // devolvemos un error 400.
      if (!resultado.success) {
        return response.status(400).json({
          mensaje: "Los datos de la propiedad no son válidos",
          errores: resultado.error.issues,
        });
      }

      // Acá tenemos los datos ya validados por Zod.
      const datos = resultado.data;

      // Mandamos directamente los datos al Service.
      const propiedad = await propiedadService.crear(datos);

      return response.status(201).json(propiedad);

    } catch (error) {

      console.error(error);

      return response.status(500).json({
        mensaje: "Error al crear la propiedad",
      });
    }
  }


  // Actualiza una propiedad.
  async actualizar(request: Request, response: Response) {

    try {

      // Convertimos el ID que viene en la URL a number.
      const id = Number(request.params.id);

      if (isNaN(id)) {
        return response.status(400).json({
          mensaje: "El ID de la propiedad no es válido",
        });
      }

      // Validamos el body con el DTO de actualización.
      const resultado = actualizarPropiedadSchema.safeParse(
        request.body
      );

      if (!resultado.success) {
        return response.status(400).json({
          mensaje: "Los datos de actualización no son válidos",
          errores: resultado.error.issues,
        });
      }

      // Datos ya validados.
      const datos = resultado.data;

      // Mandamos los datos al Service.
      const propiedad = await propiedadService.actualizar(
        id,
        datos
      );

      return response.status(200).json(propiedad);

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

      // Estas son reglas de negocio que pueden impedir
      // que la propiedad sea modificada.
      if (
        error instanceof Error &&
        (
          error.message ===
            "No se puede modificar una propiedad finalizada" ||

          error.message ===
            "No se puede modificar una propiedad con visitas confirmadas"
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


  // Cambia el estado de una propiedad.
  async cambiarEstado(request: Request, response: Response) {

    try {

      const id = Number(request.params.id);

      if (isNaN(id)) {
        return response.status(400).json({
          mensaje: "El ID de la propiedad no es válido",
        });
      }

      // Sacamos el nuevo estado del body
      // Validamos el body con el DTO de cambio de estado.
      const resultado =
        cambiarEstadoPropiedadSchema.safeParse(request.body);

      // Si el estado no existe dentro de EstadoPropiedad el DTO rechaza los datos
      if (!resultado.success) {
        return response.status(400).json({
          mensaje: "El estado de la propiedad no es válido",
          errores: resultado.error.issues,
        });
      }

      // Sacamos los datos que Zod ya validó
      const datos = resultado.data;

      // El Controller solamente valida que el estado exista
      //
      // El Service decide si realmente está permitido
      // pasar del estado actual al nuevo estado.
      const propiedad =
        await propiedadService.cambiarEstado(
          id,
          datos.estado
        );

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

      // Si el cambio de estado no está permitido,
      // devolvemos conflicto.
      if (
        error instanceof Error &&
        (
          error.message ===
            "La propiedad ya se encuentra en ese estado" ||

          error.message.startsWith(
            "No se puede cambiar de"
          ) ||

          error.message ===
            "La propiedad debe tener al menos una foto para ser publicada" ||

          error.message ===
            "La propiedad debe tener exactamente una foto de portada"
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


  // Elimina una propiedad.
  async eliminar(request: Request, response: Response) {

    try {

      const id = Number(request.params.id);

      if (isNaN(id)) {
        return response.status(400).json({
          mensaje: "El ID de la propiedad no es válido",
        });
      }

      // El Service controla si realmente
      // se puede eliminar la propiedad.
      await propiedadService.eliminar(id);

      // 204 significa que salió bien,
      // pero no tenemos contenido para devolver.
      return response.status(204).send();

    } catch (error) {

      if (
        error instanceof Error &&
        error.message === "Propiedad no encontrada"
      ) {
        return response.status(404).json({
          mensaje: error.message,
        });
      }

      // Reglas de negocio que pueden impedir eliminarla.
      if (
        error instanceof Error &&
        (
          error.message ===
            "No se puede eliminar una propiedad con visitas confirmadas" ||

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

// Creamos una sola instancia para usarla desde las rutas.
export const propiedadController =
  new PropiedadController();