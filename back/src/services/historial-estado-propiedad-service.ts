import { historialEstadoPropiedadRepository } from "../repositories/historial-estado-propiedad.repository";
import { HistorialEstadoPropiedad } from "../entities/historial-estado-propiedad.entity";


class HistorialEstadoPropiedadService {
    // Devuelve todos los registros de cambios de estado que existen en la base de datos.
  listar(): Promise<HistorialEstadoPropiedad[]> {
    return historialEstadoPropiedadRepository.listar();
  }


  //BUSCAR REGISTRO POR ID
  async buscarPorId(id: number): Promise<HistorialEstadoPropiedad> {
    // Le pedimos al Repository que busque el registro con ese ID
    const historial = await historialEstadoPropiedadRepository.buscarPorId(id);

    // Si devuelve null, significa que ese registro de historial no existe
    if (!historial) {
      throw new Error(
        "Registro de historial no encontrado"
      );
    }
    // Si existe, lo devolvemos.
    return historial;
  }

  // BUSCAR EL HISTORIAL DE UNA PROPIEDAD
  buscarPorPropiedad(propiedadId: number): Promise<HistorialEstadoPropiedad[]> {
    return historialEstadoPropiedadRepository.buscarPorPropiedad(propiedadId);
  }

  // CREAR UN REGISTRO DE HISTORIAL
  async crear(datos: Partial<HistorialEstadoPropiedad>): Promise<HistorialEstadoPropiedad> {
    // El historial se crea cuando una propiedad
    // cambia de estado.
    return historialEstadoPropiedadRepository.crear(datos);
  }


  // NO HAY ACTUALIZAR NI ELIMINAR
}

// Creamos una instancia
export const historialEstadoPropiedadService =
  new HistorialEstadoPropiedadService();