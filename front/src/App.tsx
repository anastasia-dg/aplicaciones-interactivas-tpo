import { BrowserRouter, Routes, Route } from "react-router-dom";
//BrowserRouter permite navegar entre paginas
//Routes agrupa las rutas de la aplicacion
//Route indica que pantalla mostrar segun la url
import Encabezado from "./componentes/Encabezado";
import Inicio from "./paginas/Inicio";
import DetallePropiedad from "./paginas/DetallePropiedad";
import SolicitudesVisita from "./paginas/SolicitudesVisita";
import Login from "./paginas/Login";
import PanelVendedor from "./paginas/PanelVendedor";
import MisPropiedades from "./paginas/MisPropiedades";
import NuevaPropiedad from "./paginas/NuevaPropiedad";
import EditarPropiedad from "./paginas/EditarPropiedad";
import Consultas from "./paginas/Consultas";
import Actividad from "./paginas/Actividad";
import Reportes from "./paginas/Reportes";
import MiInmobiliaria from "./paginas/MiInmobiliaria";

// Componente temporal para mostrar el nombre de cada pantalla.
function Pagina({ titulo }: { titulo: string }) {
  return <h1>{titulo}</h1>;
}

export default function App() {
    return (
        <BrowserRouter>
            {/* Encabezado visible en todas las páginas */}
            <Encabezado />
            <Routes>
                {/* Páginas públicas */}
                <Route path="/" element={<Inicio />} />
                <Route path="/propiedades" element={<Pagina titulo="Propiedades" />} />
                <Route
                    path="/propiedades/:id"
                    element={<DetallePropiedad />}
                />
                <Route path="/inmobiliarias/:id" element={<Pagina titulo="Perfil de inmobiliaria" />} />

                {/* Registro e inicio de sesión */}
                <Route path="/registro" element={<Pagina titulo="Registro" />} />
                <Route path="/login" element={<Login />} />

                {/* Páginas del vendedor */}
                <Route path="/panel" element={<PanelVendedor />} />
                <Route path="/panel/propiedades" element={<MisPropiedades />} />
                <Route path="/panel/propiedades/nueva" element={<NuevaPropiedad />} />
                <Route path="/panel/propiedades/:id/editar" element={<EditarPropiedad />} />
                <Route path="/panel/visitas" element={<SolicitudesVisita />} />
                <Route path="/panel/consultas" element={<Consultas />} />
                <Route path="/panel/actividad" element={<Actividad />} />
                <Route path="/panel/reportes" element={<Reportes />} />
                <Route path="/panel/inmobiliaria" element={<MiInmobiliaria />} />

                {/* Página para direcciones que no existen */}
                <Route path="*" element={<Pagina titulo="Página no encontrada" />} />
            </Routes>
        </BrowserRouter>
    );
}
