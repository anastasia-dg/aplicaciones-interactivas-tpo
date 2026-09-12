// Importamos herramientas de TypeORM.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

// Importamos Inmobiliaria porque
// cada propiedad pertenece a una inmobiliaria.
import { Inmobiliaria } from "./inmobiliaria.entity";

// Importamos los enums para limitar
// los valores posibles de tipo, operación y estado.
import {
  EstadoPropiedad,
  TipoOperacion,
  TipoPropiedad,
} from "./enums";

// Esta clase representa la tabla "propiedades".
@Entity("propiedades")
export class Propiedad {

  // Clave primaria generada automáticamente.
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Título de la publicación.
  @Column({ length: 160 })
  titulo!: string;

  // Descripción completa de la propiedad.
  @Column({ type: "text" })
  descripcion!: string;

  // Tipo de propiedad.
  // Solo puede tener valores definidos en TipoPropiedad.
  @Column({
    type: "enum",
    enum: TipoPropiedad,
  })
  tipo!: TipoPropiedad;

  // Tipo de operación: venta o alquiler.
  @Column({
    type: "enum",
    enum: TipoOperacion,
  })
  operacion!: TipoOperacion;

  // Precio de la propiedad.
  //
  // precision: 14 = cantidad total máxima de dígitos.
  // scale: 2 = cantidad de números después de la coma.
  @Column({
    type: "decimal",
    precision: 14,
    scale: 2,
  })
  precio!: string;

  // Moneda utilizada.
  // Solo permitimos ARS o USD desde TypeScript.
  @Column({ length: 3 })
  moneda!: "ARS" | "USD";

  // Dirección de la propiedad.
  @Column({ length: 255 })
  direccion!: string;

  // Localidad, zona o barrio.
  @Column({ length: 120 })
  zona!: string;

  // Superficie cubierta.
  // Es opcional porque, por ejemplo, no aplica a terrenos.
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  superficieCubiertaM2!: string | null;

  // Superficie total de la propiedad o terreno.
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  superficieTotalM2!: string;

  // Cantidad de ambientes.
  // Es opcional.
  @Column({
    type: "smallint",
    nullable: true,
  })
  ambientes!: number | null;

  // Cantidad de dormitorios.
  // Es opcional.
  @Column({
    type: "smallint",
    nullable: true,
  })
  dormitorios!: number | null;

  // Cantidad de baños.
  // Es opcional.
  @Column({
    type: "smallint",
    nullable: true,
  })
  banios!: number | null;

  // Antigüedad de la propiedad en años.
  // Puede no informarse.
  @Column({
    type: "smallint",
    nullable: true,
  })
  antiguedadAnios!: number | null;

  // Lista de amenities o características.
  //
  // Ejemplo:
  // ["pileta", "cochera", "balcon"]
  @Column({
    type: "simple-array",
    default: "",
  })
  tags!: string[];

  // Estado actual de la propiedad.
  //
  // Si no se indica ningún estado al crearla,
  // queda automáticamente en BORRADOR.
  @Column({
    type: "enum",
    enum: EstadoPropiedad,
    default: EstadoPropiedad.BORRADOR,
  })
  estado!: EstadoPropiedad;

  // Relación muchos a uno.
  //
  // Muchas propiedades pueden pertenecer
  // a una misma inmobiliaria.
  @ManyToOne(() => Inmobiliaria, {
    nullable: false,
  })

  // Nombre de la clave foránea en la base de datos.
  @JoinColumn({ name: "inmobiliaria_id" })

  // Inmobiliaria dueña de esta propiedad.
  inmobiliaria!: Inmobiliaria;

  // Fecha automática en la que se creó la propiedad.
  @CreateDateColumn()
  fechaCreacion!: Date;

  // Fecha automática que se actualiza
  // cada vez que cambia la propiedad.
  @UpdateDateColumn()
  fechaActualizacion!: Date;
}