export type SolicitudVisita = {
  id: number;
  nombreSolicitante: string;
  telefonoSolicitante: string;
  fechaHoraPropuesta: string;
  mensaje: string | null;
  estado: string;
  fechaCreacion: string;

  // Cada solicitud está relacionada con una propiedad.
  propiedad: {
    id: number;
    titulo: string;
  };
};
