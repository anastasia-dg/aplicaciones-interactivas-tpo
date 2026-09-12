// Importamos herramientas de TypeORM.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// Importamos el enum que define
// los posibles tipos de actividad.
import { TipoActividad } from "./enums";

// Importamos Inmobiliaria porque el feed
// corresponde a una inmobiliaria.
import { Inmobiliaria } from "./inmobiliaria.entity";

// Esta clase representa la tabla "actividades".
@Entity("actividades")
export class Actividad {

  // Identificador único de la actividad.
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Indica qué tipo de evento ocurrió.
  //
  // Puede ser:
  // COMENTARIO
  // SOLICITUD_VISITA
  // CAMBIO_ESTADO_PROPIEDAD
  // RESENA
  @Column({
    type: "enum",
    enum: TipoActividad,
  })
  tipo!: TipoActividad;

  // Texto que describe qué ocurrió.
  //
  // Por ejemplo:
  // "Nueva consulta en Casa con pileta"
  //
  // Este campo es una decisión de implementación
  // para poder mostrar la información dentro del feed.
  @Column({ type: "text" })
  descripcion!: string;

  // Indica si el vendedor ya vio
  // esta notificación.
  //
  // Cuando se crea empieza como no leída.
  @Column({ default: false })
  leida!: boolean;

  // Muchas actividades pueden pertenecer
  // a una misma inmobiliaria.
  @ManyToOne(() => Inmobiliaria, {
    nullable: false,
    onDelete: "CASCADE",
  })

  // Clave foránea.
  @JoinColumn({ name: "inmobiliaria_id" })

  // Inmobiliaria cuyo vendedor recibirá
  // esta actividad/notificación.
  inmobiliaria!: Inmobiliaria;

  // Momento en el que ocurrió la actividad.
  @CreateDateColumn()
  fechaCreacion!: Date;
}