// Importamos herramientas de TypeORM.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// Importamos Propiedad porque cada registro del historial
// pertenece a una propiedad.
import { Propiedad } from "./propiedad.entity";

// Importamos el enum de estados.
import { EstadoPropiedad } from "./enums";

// Representa la tabla donde guardamos
// todos los cambios de estado.
@Entity("historial_estado_propiedad")
export class HistorialEstadoPropiedad {

  // Identificador único del cambio.
  @PrimaryGeneratedColumn()
  id!: number;

  // Estado que tenía la propiedad antes del cambio.
  @Column({
    type: "enum",
    enum: EstadoPropiedad,
  })
  estadoAnterior!: EstadoPropiedad;

  // Estado al que pasó la propiedad.
  @Column({
    type: "enum",
    enum: EstadoPropiedad,
  })
  estadoNuevo!: EstadoPropiedad;

  // Muchos registros de historial
  // pueden pertenecer a una misma propiedad.
  @ManyToOne(() => Propiedad, {

    // Todo historial tiene obligatoriamente una propiedad.
    nullable: false,

    // Si algún día se elimina la propiedad,
    // también se eliminan automáticamente sus registros de historial.
    onDelete: "CASCADE",
  })

  // Nombre de la clave foránea.
  @JoinColumn({ name: "propiedad_id" })

  // Propiedad a la que pertenece este cambio.
  propiedad!: Propiedad;

  // Guarda automáticamente cuándo ocurrió el cambio.
  @CreateDateColumn()
  fechaCreacion!: Date;
}