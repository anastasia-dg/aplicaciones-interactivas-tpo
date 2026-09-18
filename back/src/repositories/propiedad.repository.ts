import { AppDataSource } from "../config/data-source";
import { Propiedad } from "../entities/propiedad.entity";
import { TipoPropiedad } from "../entities/enums";

const repo = AppDataSource.getRepository(Propiedad);

export const propiedadRepository = {
  listar: () => repo.find({ relations: ["fotos", "inmobiliaria"] }),

  buscarPorId: (id: string) =>
    repo.findOne({
      where: { id },
      relations: ["fotos", "comentarios", "inmobiliaria", "solicitudesVisita"],
    }),
    
  buscarPorTipo: (
    tipo: TipoPropiedad,
    page: number,
    limit: number
  ) =>
    repo.find({ 
      where: { tipo },
      relations: ["fotos", "inmobiliaria"],
      // Saltea las propiedades de las páginas anteriores
      skip: (page - 1) * limit,

      // Cantidad de propiedades por página
      take: limit,
    }),

  crear: (datos: Partial<Propiedad>) => repo.save(repo.create(datos)),

  actualizar: (propiedad: Propiedad) => repo.save(propiedad),

  eliminar: (id: string) => repo.delete(id),
};
