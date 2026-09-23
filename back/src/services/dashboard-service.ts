import { propiedadRepository } from "../repositories/propiedad.repository";
import { historialEstadoPropiedadRepository } from "../repositories/historial-estado-propiedad.repository";


export class DashboardService {

  // Obtenemos los reportes de una inmobiliaria
  async obtenerDashboard(inmobiliariaId: number) {

    // Contamos las propiedades según su estado actual
    const propiedadesPorEstado =
      await propiedadRepository.contarPorEstado(inmobiliariaId);

    // Contamos cuántas propiedades se publicaron por primera vez cada mes
    const publicacionesPorMes =
      await historialEstadoPropiedadRepository.contarPublicacionesPorMes(inmobiliariaId);

    // Contamos las ventas y los alquileres concretados cada mes
    const operacionesPorMes =
      await historialEstadoPropiedadRepository.contarOperacionesPorMes(inmobiliariaId);

    // Calculamos cuántos días tardan, en promedio, las propiedades en venderse o alquilarse
    const tiempoPromedioEnMercado =
      await historialEstadoPropiedadRepository.calcularTiempoPromedio(inmobiliariaId);

    // Devolvemos todos los resultados juntos.
    return {
      propiedadesPorEstado,
      publicacionesPorMes,
      operacionesPorMes,
      tiempoPromedioEnMercado,
    };
  }
}