// Importamos herramientas de TypeORM.
// Estas herramientas sirven para decirle a TypeORM
// cómo tiene que crear y manejar la tabla en la base de datos.
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Inmobiliaria } from "./inmobiliaria.entity";

// @Entity indica que esta clase representa una tabla de la base de datos.
// En este caso, la tabla se va a llamar "vendedores".
@Entity("vendedores")
export class Vendedor {

  // Esta será la clave primaria de la tabla.
  // Se genera automáticamente como UUID.
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Columna para guardar el nombre completo del vendedor.
  // Puede tener como máximo 120 caracteres.
  @Column({ type: "varchar", length: 120 })
  nombreCompleto!: string;

  // Columna para guardar el email.
  // unique: true significa que no puede haber dos vendedores
  // con el mismo email.
  @Column({ type: "varchar", unique: true, length: 255 })
  email!: string;

  // Acá se guarda la contraseña en formato hash.
  // No se debería guardar la contraseña directamente.
  @Column({ type: "varchar", length: 255 })
  contrasenaHash!: string;

  // Teléfono del vendedor.
  // nullable: true significa que puede quedar vacío.
  @Column({ type: "varchar", nullable: true, length: 40 })
  telefono!: string | null;

  //RELACION CON INMOBILIARIA
  //Un vendedor tiene una inmobiliaria
  @OneToOne(
    () => Inmobiliaria,
    (inmobiliaria) => inmobiliaria.vendedor
  )
  inmobiliaria!: Inmobiliaria;


  // Guarda automáticamente la fecha en la que se creó el vendedor.
  @CreateDateColumn()
  fechaCreacion!: Date;
}