import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor.entity";

const repo = AppDataSource.getRepository(Vendedor);

export const vendedorRepository = {

  listar: () => repo.find({ relations: ["inmobiliaria"] }),

  buscarPorId: (id: string) =>
    repo.findOne({ where: { id }, relations: ["inmobiliaria"] }),

  buscarPorEmail: (email: string) => repo.findOne({ where: { email } }),

  crear: (datos: Partial<Vendedor>) => repo.save(repo.create(datos)),

  actualizar: (vendedor: Vendedor) => repo.save(vendedor),

  eliminar: (id: string) => repo.delete(id),
};