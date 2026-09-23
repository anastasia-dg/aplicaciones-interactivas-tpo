import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { HistorialEstadoPropiedad } from "../entities/historial-estado-propiedad.entity";
import { EstadoPropiedad } from "../entities/enums";


class HistorialEstadoPropiedadRepository {

  // Obtiene el repository de TypeORM correspondiente
  // a HistorialEstadoPropiedad.
  private get repository(): Repository<HistorialEstadoPropiedad> {
    return AppDataSource.getRepository(HistorialEstadoPropiedad);
  }


  // Busca TODOS los registros del historial.
  // También trae la propiedad relacionada.
  listar(): Promise<HistorialEstadoPropiedad[]> {
    return this.repository.find({
      relations: ["propiedad"],
    });
  }

  // Busca UN registro del historial según su ID.
  // Devuelve el registro o null si no existe.
  buscarPorId(id: number): Promise<HistorialEstadoPropiedad | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["propiedad"],
    });
  }

  // Busca todo el historial de una propiedad determinada.
  buscarPorPropiedad(
    propiedadId: number
  ): Promise<HistorialEstadoPropiedad[]> {

    return this.repository.find({
      where: {
        propiedad: {
          id: propiedadId,
        },
      },

      relations: ["propiedad"],

      // Ordenamos por fecha desde el cambio más antiguo
      // hasta el cambio más reciente.
      order: {
        fechaCreacion: "ASC",
      },
    });
  }

  // Crea un nuevo registro en el historial.
  //
  //ej si una propiedad pasa:
  // PUBLICADA a RESERVADA
  crear(
    datos: Partial<HistorialEstadoPropiedad>
  ): Promise<HistorialEstadoPropiedad> {

    // create() arma el objeto en memoria.
    const historial = this.repository.create(datos);

    // save() lo guarda en PostgreSQL.
    return this.repository.save(historial);
  }

  // Cuenta cuántas propiedades se vendieron o alquilaron cada mes en una inmobiliaria
  async contarOperacionesPorMes(inmobiliariaId: number) {

    const resultados = await this.repository
      .createQueryBuilder("historial")

      // Relacionamos el historial con la propiedad
      .innerJoin("historial.propiedad", "propiedad")

      // Relacionamos la propiedad con su inmobiliaria
      .innerJoin("propiedad.inmobiliaria", "inmobiliaria")

      // Obtenemos el mes en el que cambió de estado
      // Cuando ocurrio el cambio?
      .select(
        "TO_CHAR(historial.fechaCreacion, 'YYYY-MM')",
        "mes"
      )

      // Obtenemos el nuevo estado de la propiedad
      // A que estado paso la propiedad?
      .addSelect("historial.estadoNuevo", "estado")

      // Contamos cuántas operaciones hubo
      // Cuantas veces encontramos ese estado durante ese mes?
      .addSelect("COUNT(historial.id)", "cantidad")

      // Filtramos por inmobiliaria
      .where("inmobiliaria.id = :inmobiliariaId", {
        inmobiliariaId,
      })

      // Solo nos interesan las ventas y los alquileres
      // .andWhere() agrega otra condicion a la condicion anterior
      .andWhere("historial.estadoNuevo IN (:...estados)", { //IN siginifica que este dentro de esta lista (VENDIDA O ALQUILADA)
        estados: [
          EstadoPropiedad.VENDIDA,
          EstadoPropiedad.ALQUILADA,
        ],
      })

      // Agrupamos por mes y estado
      // Asi PostgreSQL pone juntas las ventas de agosto, los alquileres de agosto, las ventas de septiembre, etc
      .groupBy(
        "TO_CHAR(historial.fechaCreacion, 'YYYY-MM')"
      )
      .addGroupBy("historial.estadoNuevo")

      // Ordenamos cronológicamente. desde el mas antiguo al mas reciente
      .orderBy("mes", "ASC")

      // Ejecutamos la consulta
      .getRawMany();

    return resultados.map((resultado) => ({ // recorremos los resultados y convertimos cantidad en numero
      mes: resultado.mes,
      estado: resultado.estado,
      cantidad: Number(resultado.cantidad),
    }));
  }


  // Cuenta cuántas propiedades se publicaron por primera vez cada mes en una inmobiliaria (PUBLICADA)
  async contarPublicacionesPorMes(inmobiliariaId: number) {

    const resultados = await this.repository
      .createQueryBuilder("historial")

      // Relacionamos el historial con las propiedades
      .innerJoin("historial.propiedad", "propiedad")

      // Relacionamos las propiedades con sus inmobiliarias
      .innerJoin("propiedad.inmobiliaria", "inmobiliaria")

      // Obtenemos el mes en que se publicó la propiedad
      .select(
        "TO_CHAR(MIN(historial.fechaCreacion), 'YYYY-MM')", //MIN busca la fecha mas antigua, asi contamos solo su primera publicacion
        "mes"
      )

      // Obtenemos el ID de la propiedad
      .addSelect("propiedad.id", "propiedadId")

      // Buscamos solamente esta inmobiliaria
      .where("inmobiliaria.id = :inmobiliariaId", {
        inmobiliariaId,
      })

      // Solo nos interesan los cambios a PUBLICADA
      .andWhere("historial.estadoNuevo = :estado", {
        estado: EstadoPropiedad.PUBLICADA,
      })

      // Agrupamos por propiedad para encontrar su primera publicación
      .groupBy("propiedad.id")

      // Ejecutamos la consulta
      .getRawMany();

    // Contamos cuantas primeras publicaciones hubo cada mes
    // Creamos el objeto donde cada clave es un mes y cada valor es la cant de publicaciones de ese mes
    const publicacionesPorMes: Record<string, number> = {};

    //recorremos resultadoS
    for (const resultado of resultados) { //resultadoS es el array completo y resultadO es un elemento dentro de ese array
      const mes = resultado.mes; //guardamos el mes del elemento que estamos recorriendo


      //Busca cuántas publicaciones hay guardadas para ese mes (o usa 0 si todavía no hay ninguna)
      //le suma 1 y guarda la nueva cantidad
      publicacionesPorMes[mes] =
        (publicacionesPorMes[mes] ?? 0) + 1;
    }

    // Convertimos el resultado en un array con Object.entries()
    return Object.entries(publicacionesPorMes)

      // sort() ordena los meses 
      // mesA es el primer mes que estamos comparando y mesB es el segundo
      // localeCompare() compara los textos y determina cual debe ir primero
      .sort(([mesA], [mesB]) => mesA.localeCompare(mesB))
      .map(([mes, cantidad]) => ({ // map() le da el formato final
        mes,
        cantidad,
      }));
  }

  // Calcula el promedio de días que tardan las propiedades de una inmobiliaria en venderse o alquilarse
  async calcularTiempoPromedio(inmobiliariaId: number) {

    // Traemos el historial de las propiedades de esta inmobiliaria
    const historiales = await this.repository
      .createQueryBuilder("historial")
      .innerJoinAndSelect("historial.propiedad", "propiedad")
      .innerJoin("propiedad.inmobiliaria", "inmobiliaria")
      .where("inmobiliaria.id = :inmobiliariaId", {
        inmobiliariaId,
      })
      .orderBy("historial.fechaCreacion", "ASC")
      .getMany();

    // Creamos un Map para guardar las fechas de cada propiedad
    // La clave es el ID de la propiedad (number)
    // El valor es un objeto con sus fechas de publicación y finalización
    const fechas = new Map<number, {
      publicacion?: Date;
      finalizacion?: Date;
    }>();

    // Recorremos uno por uno todos los registros del historial
    for (const historial of historiales) {

      // Obtenemos el ID de la propiedad a la que pertenece este registro
      const propiedadId = historial.propiedad.id;

      // Buscamos si ya tenemos fechas guardadas para esta propiedad
      // Si todavía no tenemos ninguna, empezamos con un objeto vacío {}
      const datos = fechas.get(propiedadId) ?? {};

      // Comprobamos si el nuevo estado de la propiedad es PUBLICADA
      // y comprobamos que todavía no hayamos guardado su publicación
      if (
        historial.estadoNuevo === EstadoPropiedad.PUBLICADA &&
        !datos.publicacion
      ) {
        datos.publicacion = historial.fechaCreacion; // Guardamos la fecha en la que se publicó por primera vez
      }

      // Comprobamos si la propiedad se vendió o se alquiló
      if (
        historial.estadoNuevo === EstadoPropiedad.VENDIDA ||
        historial.estadoNuevo === EstadoPropiedad.ALQUILADA
      ) {
        datos.finalizacion = historial.fechaCreacion; // Guardamos la fecha en la que se concretó la operación
      }

      // Guardamos en el Map las fechas que tenemos de esta propiedad, si ya existía, actualizamos sus datos
      fechas.set(propiedadId, datos);
    }

    //Creamos una variable para sumar los días que tardó cada propiedad
    let totalDias = 0;

    // Creamos una variable para contar las propiedades vendidas o alquiladas
    let cantidad = 0;

    // Recorremos las fechas que guardamos
    for (const datos of fechas.values()) {

      // Verificamos que la propiedad tenga las dos fechas: cuando se publicó y cuándo se vendió o alquiló
      if (datos.publicacion && datos.finalizacion) {

        // Calculamos la diferencia entre las dos fechas.
        // Convertimos las dos fechas a milisegundos y las restamos así obtenemos cuánto tiempo pasó entre ambas
        const diferencia =
          datos.finalizacion.getTime() -
          datos.publicacion.getTime();

        // Convertimos los milisegundos en días
        // 1000 milisegundos = 1 segundo
        // 60 segundos = 1 minuto
        // 60 minutos = 1 hora
        // 24 horas = 1 día
        const dias = diferencia / (1000 * 60 * 60 * 24);

        // Sumamos los días de esta propiedad al total
        totalDias += dias;
        cantidad++; // Sumamos 1 a la cantidad de propiedades que estamos contando
      }
    }

    // Si todavía no hubo ventas ni alquileres devolvemos null porque no hay un promedio que calcular
    if (cantidad === 0) {
      return null;
    }

    // Dividimos el total de días entre la cantidad de propiedades
    // toFixed(2) limita el resultado a dos decimales
    // Number() convierte el resultado nuevamente a número
    return Number((totalDias / cantidad).toFixed(2));
  }
}


// Creamos una instancia para poder usar este repository
export const historialEstadoPropiedadRepository = new HistorialEstadoPropiedadRepository();