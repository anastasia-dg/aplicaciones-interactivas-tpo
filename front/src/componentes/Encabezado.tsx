import { Link } from "react-router-dom"; //trae el componente de React Router para navegar sin recargar la página
import "../estilos/Encabezado.css"; //para aplicar los estilos al encabezado

// Componente que muestra el encabezado de la página.
export default function Encabezado() { //crea nuestro componente
    //header representa la parte superior de la página
    //nav contiene los enlaces del menú
    //<Link to="/">: lleva al inicio
    //className: permite aplicar estilos CSS
    //export default: permite utilizar el componente desde otros archivos
  return (
    <header className="encabezado">  
      {/* Nombre del marketplace */}
      <Link to="/" className="logo">
        InmoMarket
      </Link>

      {/* Menú de navegación */}
      <nav className="menu">
        <Link to="/">Inicio</Link>
        <Link to="/inmobiliarias">Inmobiliarias</Link>
        <Link to="/login" className="boton-ingresar">
          Ingresar como vendedor
        </Link>
      </nav>
    </header>
  );
}
