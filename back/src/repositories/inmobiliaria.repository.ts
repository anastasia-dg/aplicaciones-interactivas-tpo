import { AppDataSource } from "../config/data-source";
import { Inmobiliaria } from "../entities/inmobiliaria.entity";

const repo = AppDataSource.getRepository(Inmobiliaria);

export const inmobiliariaRepository = {

  listar: () => repo.find({ relations: ["vendedor"] }),

  buscarPorId: (id: string) =>
    repo.findOne({
      where: { id },
      relations: ["vendedor", "propiedades", "reseñas"],
    }),

  buscarPorNombre: (nombre: string) => repo.findOne({ where: { nombre } }),

  crear: (datos: Partial<Inmobiliaria>) => repo.save(repo.create(datos)),

  actualizar: (inmobiliaria: Inmobiliaria) => repo.save(inmobiliaria),

  eliminar: (id: string) => repo.delete(id),
};