// Importamos las herramientas necesarias de TypeORM.
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// Importamos Inmobiliaria porque
// cada reseña pertenece a una inmobiliaria.
import { Inmobiliaria } from "./inmobiliaria.entity";

// Esta clase representa la tabla "reseñas".
@Entity("reseñas")

//calificacion debe ser un número entero entre 1 y 5.
//
// Este Check agrega esa restricción
// directamente en la base de datos.
@Check(`"calificacion" >= 1 AND "calificacion" <= 5`)
export class Reseña {

  // Identificador único de la reseña.
  // Se genera automáticamente como UUID.
  @PrimaryGeneratedColumn()
  id!: number;

  // Nombre de la persona que escribió la reseña.
  @Column({ type: "varchar", length: 120 })
  nombreAutor!: string;

  // Contenido de la reseña.
  //
  // La consigna dice que el contenido es obligatorio.
  @Column({ type: "text" })
  contenido!: string;

  // Calificación de la inmobiliaria.
  //
  // smallint sirve para guardar números enteros pequeños.
  // En este caso solamente se permiten valores entre 1 y 5.
  @Column({ type: "smallint" })
  calificacion!: number;

  // Muchas reseñas pueden pertenecer
  // a una misma inmobiliaria.
  //
  // Se lee:
  // "Muchas reseñas pertenecen a una inmobiliaria".
  @ManyToOne(() => Inmobiliaria, {
    nullable: false,

    // Si se elimina la inmobiliaria,
    // también se eliminan sus reseñas.
    onDelete: "CASCADE",
  })

  // Define el nombre de la clave foránea
  // que se va a guardar en la tabla "reseñas".
  @JoinColumn({ name: "inmobiliaria_id" })

  // Inmobiliaria a la que pertenece la reseña.
  inmobiliaria!: Inmobiliaria;

  // Guarda automáticamente la fecha
  // en la que se creó la reseña.
  @CreateDateColumn()
  fechaCreacion!: Date;
}