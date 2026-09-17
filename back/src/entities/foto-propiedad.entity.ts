// Importamos herramientas de TypeORM.
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// Importamos Propiedad porque
// cada foto pertenece a una propiedad.
import { Propiedad } from "./propiedad.entity";

// Esta clase representa la tabla "fotos_propiedad".
@Entity("fotos_propiedad")
export class FotoPropiedad {

  // Identificador único de la foto.
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Dirección donde se encuentra guardada la imagen.
  @Column({ type: "varchar", length: 500 })
  url!: string;

  // Indica la posición de la foto dentro de la galería.
  @Column({ type: "integer" })
  orden!: number;

  // Indica si esta imagen es la portada
  // de la publicación.
  //
  // Por defecto una foto no es portada.
  @Column({ type: "boolean", default: false })
  esPortada!: boolean;

  // Muchas fotos pueden pertenecer
  // a una misma propiedad.
  @ManyToOne(() => Propiedad, {
    nullable: false,
    onDelete: "CASCADE",
  })

  // Clave foránea hacia Propiedad.
  @JoinColumn({ name: "propiedad_id" })

  // Propiedad a la que pertenece la foto.
  propiedad!: Propiedad;
}