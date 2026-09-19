import { actividadRepository } from "../repositories/actividad.repository";
import { Actividad } from "../entities/actividad.entity";


class ActividadService {

  // Devuelve todas las actividades guardadas.
  listar(): Promise<Actividad[]> {
    return actividadRepository.listar();
  }


  //BUSCAR UNA ACTIVIDAD POR ID
  async buscarPorId(id: number): Promise<Actividad> {

    // Le pedimos al Repository que busque una actividad con ese ID
    const actividad = await actividadRepository.buscarPorId(id);

    // Si no encontró ninguna, devuelve null y lanzamos error
    if (!actividad) {
      throw new Error("Actividad no encontrada");
    }

    // Si existe, la devolvemos.
    return actividad;
  }


  //BUSCAR ACTIVIDADES DE UNA INMOBILIARIA ESPECIFICA
  buscarPorInmobiliaria(inmobiliariaId: number): Promise<Actividad[]> {
    return actividadRepository.buscarPorInmobiliaria(inmobiliariaId);
  }

  //CREAR UNA ACTIVIDAD (SE TIENE QUE CREAR AUTOMATICAMENTE)
  async crear(datos: Partial<Actividad>): Promise<Actividad> {
    return actividadRepository.crear(datos);
  }


  //MARCAR UNA ACTIVIDAD COMO LEIDA
    async marcarComoLeida(id: number): Promise<Actividad> {

    // Primero buscamos la actividad.
    // Usamos nuestro propio buscarPorId() porque ya controla que la actividad exista
    const actividad = await this.buscarPorId(id);

    // Cambiamos la propiedad "leida" a true.
    actividad.leida = true;

    // Guardamos el cambio utilizando el Repository.
    return actividadRepository.actualizar(actividad);
  }


  //ELIMINAR ACTIVIDAD

  async eliminar(id: number): Promise<void> {
    // Primero comprobamos que la actividad exista.
    await this.buscarPorId(id);

    // Si existe, le pedimos al Repository que la elimine.
    await actividadRepository.eliminar(id);
  }
}


// Creamos una instancia del Service.
export const actividadService = new ActividadService();