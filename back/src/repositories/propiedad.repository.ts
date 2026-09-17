import { AppDataSource } from "../config/data-source";
import { Propiedad } from "../entities/propiedad.entity";

const repo = AppDataSource.getRepository(Propiedad);

export const propiedadRepository = {
  listar: () => repo.find({ relations: ["fotos", "inmobiliaria"] }),

  buscarPorId: (id: string) =>
    repo.findOne({
      where: { id },
      relations: ["fotos", "comentarios", "inmobiliaria", "solicitudesVisita"],
    }),

  crear: (datos: Partial<Propiedad>) => repo.save(repo.create(datos)),

  actualizar: (propiedad: Propiedad) => repo.save(propiedad),

  eliminar: (id: string) => repo.delete(id),
};