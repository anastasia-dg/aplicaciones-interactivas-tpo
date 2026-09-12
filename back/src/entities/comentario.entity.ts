// Importamos herramientas de TypeORM.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// Importamos Propiedad porque
// cada comentario pertenece a una propiedad.
import { Propiedad } from "./propiedad.entity";

// Esta clase representa la tabla "comentarios".
@Entity("comentarios")
export class Comentario {

  // Identificador único del comentario.
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Nombre de la persona interesada
  // que realiza la consulta.
  @Column({ length: 120 })
  nombreAutor!: string;

  // Pregunta o contenido del comentario.
  @Column({ type: "text" })
  pregunta!: string;

  // Respuesta del vendedor.
  //
  // Es opcional porque cuando el interesado
  // crea el comentario todavía no fue respondido.
  //
  // Se permite solo una respuesta
  @Column({
    type: "text",
    nullable: true,
  })
  respuesta!: string | null;

  // Muchos comentarios pueden pertenecer
  // a una misma propiedad.
  @ManyToOne(() => Propiedad, {
    nullable: false,
    onDelete: "CASCADE",
  })

  // Clave foránea que apunta a la propiedad.
  @JoinColumn({ name: "propiedad_id" })

  // Propiedad sobre la que se hizo la pregunta.
  propiedad!: Propiedad;

  // Fecha automática en la que se creó el comentario.
  @CreateDateColumn()
  fechaCreacion!: Date;
}