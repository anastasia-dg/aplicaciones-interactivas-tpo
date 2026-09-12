// Importamos las herramientas necesarias de TypeORM.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// Importamos la entidad Vendedor,
// porque una inmobiliaria está relacionada con un vendedor.
import { Vendedor } from "./vendedor.entity";

// Esta clase representa la tabla "inmobiliarias".
@Entity("inmobiliarias")
export class Inmobiliaria {

  // Clave primaria generada automáticamente.
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Nombre de fantasía de la inmobiliaria.
  // unique: true porque no puede repetirse.
  @Column({ unique: true, length: 120 })
  nombre!: string;

  // Descripción de la inmobiliaria.
  // type: "text" permite guardar textos más largos.
  @Column({ type: "text" })
  descripcion!: string;

  // Dirección URL donde se encuentra el logo.
  // Es opcional.
  @Column({ nullable: true, length: 500 })
  urlLogo!: string | null;

  // Teléfono público de contacto.
  @Column({ length: 40 })
  telefonoContacto!: string;

  // Email público de contacto.
  @Column({ length: 255 })
  emailContacto!: string;

  // Dirección física de la oficina.
  // Es opcional.
  @Column({ nullable: true, length: 255 })
  direccionOficina!: string | null;

  // Relación uno a uno con Vendedor.
  // Significa que cada inmobiliaria tiene un vendedor asociado.
  @OneToOne(() => Vendedor, { nullable: false })

  // Define el nombre de la columna que guarda
  // la referencia al vendedor en la base de datos.
  @JoinColumn({ name: "vendedor_id" })

  // Acá queda guardado el vendedor relacionado.
  vendedor!: Vendedor;

  // Fecha automática de creación de la inmobiliaria.
  @CreateDateColumn()
  fechaCreacion!: Date;
}