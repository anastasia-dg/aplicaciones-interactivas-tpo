// Datos de una foto.
export type FotoPropiedad = {
  id: number;
  url: string;
  orden: number;
  esPortada: boolean;
};

 // Datos de la inmobiliaria que publica la propiedad.
export type Inmobiliaria = {
  id: number;
  nombre: string;
  descripcion: string;
  urlLogo: string | null;
  telefonoContacto: string;
  emailContacto: string;
  direccionOficina: string | null;
};


// Datos de una propiedad.
export type Propiedad = {
  inmobiliaria: any;
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  tipo: string;
  operacion: string;
  precio: number | string;
  moneda: string;
  zona: string;
  direccion: string;
  ambientes: number | null;
  dormitorios: number | null;
  superficieTotalM2: number | string | null;
  fotos: FotoPropiedad[]; // Lista de fotos
};

// Respuesta del backend al listar propiedades.
export type RespuestaPropiedades = {
  propiedades: Propiedad[];
  inmobiliaria: Inmobiliaria;
};
