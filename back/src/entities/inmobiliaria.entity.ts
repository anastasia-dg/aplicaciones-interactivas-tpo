// Importamos las herramientas necesarias de TypeORM.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

//importamos entidades que vamos a relacionar
import { Vendedor } from "./vendedor.entity";
import { Propiedad } from "./propiedad.entity";
import { Reseña } from "./reseña.entity";
import { Actividad } from "./actividad.entity";

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

  // Dirección de la oficina.
  // Es opcional.
  @Column({ nullable: true, length: 255 })
  direccionOficina!: string | null;

  
  // RELACION CON VENDEDOR (uno a uno)
  //cada inmobiliaria tiene un vendedor
  @OneToOne(
  () => Vendedor,
  (vendedor) => vendedor.inmobiliaria, //del lado del vendedor la relacion se llama inmobiliaria
  { nullable: false }
)
@JoinColumn({ name: "vendedor_id" })
vendedor!: Vendedor;

  //RELACION CON PROPIEDAD
  // Una inmobiliaria puede tener muchas propiedades.
  @OneToMany(
    () => Propiedad,
    (propiedad) => propiedad.inmobiliaria
  )
  propiedades!: Propiedad[];

  //RELACION CON RESENA
  // Una inmobiliaria puede recibir muchas resenas.
  @OneToMany(
    () => Reseña,
    (reseña) => reseña.inmobiliaria
  )
  reseñas!: Reseña[];

  //RELACION CON ACTIVIDAD
  // Una inmobiliaria puede tener muchas actividades
  @OneToMany(
    () => Actividad,
    (actividad) => actividad.inmobiliaria
  )
  actividades!: Actividad[]; 


  // Fecha automática de creación de la inmobiliaria.
  @CreateDateColumn()
  fechaCreacion!: Date;
}