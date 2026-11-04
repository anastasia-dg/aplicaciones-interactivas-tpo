// Repository es el tipo que nos da TypeORM para trabajar con una entidad
import { AppDataSource } from "../config/data-source";
import { Propiedad } from "../entities/propiedad.entity";
import {Repository,FindOptionsWhere,ILike,Between,MoreThanOrEqual,LessThanOrEqual, Raw,} from "typeorm";
import { ListarPropiedadesDto } from "../dtos/propiedad-dto";
import { EstadoPropiedad } from "../entities/enums";

class PropiedadRepository {

  // Este getter obtiene el Repository de TypeORM para la entidad Propiedad
  // Con él podemos hacer operaciones en la BD: buscar, guardar, eliminar
  //
  // Se obtiene cuando lo necesitamos y NO al cargar el archivo
  private get repository(): Repository<Propiedad> {
    return AppDataSource.getRepository(Propiedad);
  }

  // Arma el "where" de TypeORM a partir de los filtros recibidos.
  // Solo agregamos una condición si ese filtro realmente vino.
  private construirWhere(
  filtros: ListarPropiedadesDto
): FindOptionsWhere<Propiedad> | FindOptionsWhere<Propiedad>[] {

    const where: FindOptionsWhere<Propiedad> = {};

    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.operacion) {
      where.operacion = filtros.operacion;
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.moneda) {
      where.moneda = filtros.moneda;
    }

    // Búsqueda parcial: "belgrano" encuentra "Belgrano Sur".
    if (filtros.zona) {
      where.zona = ILike(`%${filtros.zona}%`);
    }

    // Rango de precio: si vinieron los dos límites usamos Between,
    // si vino uno solo usamos el operador que corresponda.
    if (
      filtros.precioMin !== undefined &&
      filtros.precioMax !== undefined
    ) {
      where.precio = Between(
        String(filtros.precioMin),
        String(filtros.precioMax)
      );
    } else if (filtros.precioMin !== undefined) {
      where.precio = MoreThanOrEqual(String(filtros.precioMin));
    } else if (filtros.precioMax !== undefined) {
      where.precio = LessThanOrEqual(String(filtros.precioMax));
    }

    if (filtros.ambientesMin !== undefined) {
      where.ambientes = MoreThanOrEqual(filtros.ambientesMin);
    }

    if (filtros.dormitoriosMin !== undefined) {
      where.dormitorios = MoreThanOrEqual(filtros.dormitoriosMin);
    }

    if (filtros.baniosMin !== undefined) {
      where.banios = MoreThanOrEqual(filtros.baniosMin);
    }

    // Filtramos por amenities.
    // Como "tags" es un simple-array, TypeORM lo guarda como texto separado por comas.
    if (filtros.amenities) {
      const amenities = filtros.amenities
        .split(",")
        .map((amenity) => amenity.trim())
        .filter((amenity) => amenity.length > 0);

      if (amenities.length > 0) {
        where.tags = Raw(
          (alias) =>
            amenities
              .map(
                (_, index) =>
                  `(',' || LOWER(${alias}) || ',') LIKE :amenity${index}`
              )
              .join(" AND "),
          Object.fromEntries(
            amenities.map((amenity, index) => [
              `amenity${index}`,
              `%,${amenity.toLowerCase()},%`,
            ])
          )
        );
      }
    }

    // Si viene un texto de búsqueda, buscamos ese texto
    // tanto en el título COMO en la descripción.
    if (filtros.texto) {
      return [
        {
          ...where,
          titulo: ILike(`%${filtros.texto}%`),
        },
        {
          ...where,
          descripcion: ILike(`%${filtros.texto}%`),
        },
      ];
    }

    return where;
  }


  // Devuelve las propiedades que cumplen los filtros, paginadas

  async listar(
    filtros: ListarPropiedadesDto
  ): Promise<{ propiedades: Propiedad[]; total: number }> {

    
    // Construimos los filtros de búsqueda que mandó el visitante
    const filtrosBusqueda = this.construirWhere(filtros);

    // En el catálogo público solamente mostramos
    // propiedades que estén PUBLICADAS.
    const where = Array.isArray(filtrosBusqueda)
      ? filtrosBusqueda.map((condicion) => ({
        ...condicion,
        estado: EstadoPropiedad.PUBLICADA,
      }))
      : {
        ...filtrosBusqueda,
        estado: EstadoPropiedad.PUBLICADA,
      };


    const [propiedades, total] = await this.repository.findAndCount({
      where,
      relations: ["fotos", "inmobiliaria"],

      order: {
        [filtros.ordenarPor === "fecha"
          ? "fechaCreacion"
          : filtros.ordenarPor === "superficie"
          ? "superficieTotalM2"
          : "precio"]: filtros.orden,
      },

      // Página 1 = los primeros "limit" resultados.
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    });

    return { propiedades, total };
  }

  
  // Lista las propiedades del vendedor autenticado.
  // Incluye todos los estados: BORRADOR, PUBLICADA, etc.
  async listarMisPropiedades(
    filtros: ListarPropiedadesDto,
    vendedorId: number
  ): Promise<{ propiedades: Propiedad[]; total: number }> {

    // Reutilizamos los filtros existentes.
    const filtrosBusqueda = this.construirWhere(filtros);

    // Agregamos la condición de que la inmobiliaria
    // pertenezca al vendedor que inició sesión.
    const propietario = {
      inmobiliaria: {
        vendedor: {
          id: vendedorId,
        },
      },
    };

    // Si hay búsqueda por texto, debemos aplicar
    // el filtro de propietario a ambas condiciones.
    const where = Array.isArray(filtrosBusqueda)
      ? filtrosBusqueda.map((condicion) => ({
        ...condicion,
        ...propietario,
      }))
      : {
        ...filtrosBusqueda,
        ...propietario,
      };

    // Buscamos las propiedades y contamos el total.
    const [propiedades, total] = await this.repository.findAndCount({
      where,

      relations: ["fotos", "inmobiliaria"],

      order: {
        [filtros.ordenarPor === "fecha"
          ? "fechaCreacion"
          : filtros.ordenarPor === "superficie"
            ? "superficieTotalM2"
            : "precio"]: filtros.orden,
      },

      // Aplicamos la paginación.
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    });

    return { propiedades, total };
  }


  // Busca UNA propiedad según su ID.
  //
  // Puede devolver:
  // - una Propiedad si la encuentra
  // - null si no existe
  buscarPorId(id: number): Promise<Propiedad | null> {
    return this.repository.findOne({ //this.repository es el acceso a la tabla Propiedad en la base de datos
      where: { id },

      // Además de la propiedad, trae estos datos relacionados.
      relations: [
        "fotos",
        "comentarios",
        "inmobiliaria",
        "solicitudesVisita",
      ],
    });
  }

  
  // Busca una propiedad para mostrarla públicamente.
  // Solo devuelve propiedades PUBLICADAS.
  buscarPublicadaPorId(id: number): Promise<Propiedad | null> {
    return this.repository.findOne({
      where: {
        id,
        estado: EstadoPropiedad.PUBLICADA,
      },

      // Traemos únicamente los datos necesarios
      // para mostrar la publicación.
      relations: [
        "fotos",
        "comentarios",
        "inmobiliaria",
      ],

      // NO incluimos solicitudesVisita porque
      // contienen datos personales de los visitantes.
    });
  }



  // Recibe los datos de una nueva propiedad.
  //
  // Partial<Propiedad> significa que "datos" puede contener
  // solamente algunos atributos de Propiedad.
  crear(datos: Partial<Propiedad>): Promise<Propiedad> {

    // create() arma un objeto Propiedad con los datos recibidos.
    const propiedad = this.repository.create(datos);

    // save() guarda la propiedad en la base de datos.
    return this.repository.save(propiedad);
  }


  // Guarda los cambios realizados sobre una propiedad existente.
  actualizar(propiedad: Propiedad): Promise<Propiedad> {
    return this.repository.save(propiedad);
  }


  // Elimina una propiedad de la base de datos según su ID.
  eliminar(id: number) {
    return this.repository.delete(id);
  }


  //DASHBOARD

  // Cuenta las propiedades de una inmobiliaria agrupandolas por su estado actual
  // Cuantas propiedades hay en cada estado (publicada, borrador, reservada, etc)
  async contarPorEstado(inmobiliariaId: number) {

    //consulta sobre la tabla de propiedades
    const resultados = await this.repository
      // "propiedad" es el nombre que le damos a TypeORM para identificar a nuestra entity propiedad
      .createQueryBuilder("propiedad") // herramienta de TypeORM para construir consultas SQL

      // Relacionamos cada propiedad con su inmobiliaria
      .innerJoin("propiedad.inmobiliaria", "inmobiliaria") //"propiedad.inmobiliaria" la columna inmobiliaria en la tabla propiedad
      // "inmobiliaria" es el nombre que queresmos darle a ese dato en el resultado

      // Seleccionamos el estado de cada propiedad
      .select("propiedad.estado", "estado")

      // Contamos cuantas propiedades hay en cada estado, "cantidad" es el nombre del resultado
      .addSelect("COUNT(propiedad.id)", "cantidad")

      // Solo queremos las propiedades de esta inmobiliaria
      .where("inmobiliaria.id = :inmobiliariaId", {
        inmobiliariaId, // le pasamos el id que recibimos
      })

      // Agrupamos las propiedades que tienen el mismo estado
      // para obtener un conteo separado para publicada, borrador, etc
      .groupBy("propiedad.estado")

      // Ejecutamos la consulta
      .getRawMany();

    // Convertimos la cantidad a número
    return resultados.map((resultado) => ({ // map recorre cada elemento y lo devuelve con la forma que queremos (numeros)
      estado: resultado.estado,
      cantidad: Number(resultado.cantidad),
    }));
  }

  // Cuenta cuantas propiedades se crearon por mes para una inmobiliaria determinada
  async contarCreadasPorMes(inmobiliariaId: number) {

    const resultados = await this.repository
      .createQueryBuilder("propiedad")

      // Relacionamos las propiedades con su inmobiliaria
      .innerJoin("propiedad.inmobiliaria", "inmobiliaria")

      // Obtenemos el año y el mes de creación
      // TO_CHAR() es una funcion de PostgreSQL que convierte una fecha en texto con el formato correcto
      .select(
        "TO_CHAR(propiedad.fechaCreacion, 'YYYY-MM')",
        "mes"
      )

      // Contamos las propiedades creadas en cada mes
      .addSelect("COUNT(propiedad.id)", "cantidad")

      // Filtramos por inmobiliaria
      .where("inmobiliaria.id = :inmobiliariaId", {
        inmobiliariaId,
      })

      // Agrupamos por año y mes
      .groupBy(
        "TO_CHAR(propiedad.fechaCreacion, 'YYYY-MM')"
      )

      // Ordenamos desde el mes más antiguo
      .orderBy("mes", "ASC")

      .getRawMany();

    return resultados.map((resultado) => ({
      mes: resultado.mes,
      cantidad: Number(resultado.cantidad),
    }));
  }
}


// Creamos una instancia para poder usar este repository
export const propiedadRepository = new PropiedadRepository();
