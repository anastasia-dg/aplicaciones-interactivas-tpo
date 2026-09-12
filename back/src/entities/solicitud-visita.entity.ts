// Importamos las herramientas necesarias de TypeORM.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// Importamos la propiedad que se quiere visitar.
import { Propiedad } from "./propiedad.entity";

// Importamos el enum donde están definidos
// los posibles estados de una solicitud.
import { EstadoSolicitudVisita } from "./enums";

// Esta clase representa la tabla "solicitudes_visita".
@Entity("solicitudes_visita")
export class SolicitudVisita {

  // Identificador único de la solicitud.
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Nombre de la persona que solicita la visita.
  @Column({ length: 120 })
  nombreSolicitante!: string;

  // Teléfono de la persona interesada.
  //
  // Es obligatorio
  @Column({ length: 40 })
  telefonoSolicitante!: string;

  // Fecha y hora que propone el interesado. (se valida en el servicio)
  @Column({ type: "timestamp" })
  fechaHoraPropuesta!: Date;

  // Mensaje adicional.
  //
  // Es opcional
  @Column({
    type: "text",
    nullable: true,
  })
  mensaje!: string | null;

  // Estado actual de la solicitud.
  //
  // Cuando se crea una solicitud empieza
  // automáticamente como PENDIENTE.
  @Column({
    type: "enum",
    enum: EstadoSolicitudVisita,
    default: EstadoSolicitudVisita.PENDIENTE,
  })
  estado!: EstadoSolicitudVisita;

  // Muchas solicitudes de visita pueden
  // pertenecer a una misma propiedad.
  @ManyToOne(() => Propiedad, {
    nullable: false,
    onDelete: "CASCADE",
  })

  // Clave foránea.
  @JoinColumn({ name: "propiedad_id" })

  // Propiedad que la persona quiere visitar.
  propiedad!: Propiedad;

  // Fecha automática en la que se creó la solicitud.
  @CreateDateColumn()
  fechaCreacion!: Date;
}