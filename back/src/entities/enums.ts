// Tipos posibles de propiedad.
export enum TipoPropiedad {
  CASA = "CASA",
  DEPARTAMENTO = "DEPARTAMENTO",
  TERRENO = "TERRENO",
  LOCAL = "LOCAL",
}

// Tipos de operación posibles.
export enum TipoOperacion {
  VENTA = "VENTA",
  ALQUILER = "ALQUILER",
}

// Estados posibles de una propiedad.
export enum EstadoPropiedad {
  BORRADOR = "BORRADOR",
  PUBLICADA = "PUBLICADA",
  RESERVADA = "RESERVADA",
  PAUSADA = "PAUSADA",
  VENDIDA = "VENDIDA",
  ALQUILADA = "ALQUILADA",
  CANCELADA = "CANCELADA",
}

// Estados posibles de una solicitud de visita.
export enum EstadoSolicitudVisita {
  PENDIENTE = "PENDIENTE",
  CONFIRMADA = "CONFIRMADA",
  REALIZADA = "REALIZADA",
  CANCELADA = "CANCELADA",
  RECHAZADA = "RECHAZADA",
}

// Tipos de actividad/notificación que puede recibir una inmobiliaria.
export enum TipoActividad {

  // Se creó un nuevo comentario en una propiedad.
  COMENTARIO = "COMENTARIO",

  // Alguien pidió visitar una propiedad.
  SOLICITUD_VISITA = "SOLICITUD_VISITA",

  // Una propiedad cambió de estado.
  CAMBIO_ESTADO_PROPIEDAD = "CAMBIO_ESTADO_PROPIEDAD",

  // Alguien dejó una nueva reseña.
  RESENA = "RESENA",
}