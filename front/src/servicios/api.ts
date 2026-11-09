// Dirección del backend.
// Primero busca VITE_API_URL y, si no existe, usa localhost:3000.
export const API_URL = //crea una constante que podemos usar en otros archivos
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"; //import.meta.env.VITE_API_URL: busca la dirección del backend en las variables de entorno de Vite
