
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Buscamos el elemento root del HTML.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Mostramos nuestra aplicación */}
    <App />
  </StrictMode>
);
