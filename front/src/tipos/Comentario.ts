// Representa un comentario guardado en la base de datos.
export type Comentario = {
  id: number;
  nombreAutor: string;
  pregunta: string;
  respuesta: string | null;
  fechaCreacion: string;
};
