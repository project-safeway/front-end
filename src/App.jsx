import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AppRoutes } from "./AppRoutes";

export default function App() {
  const location = useLocation();
  
  // Páginas sem header/footer
  const somenteFormulario = location.pathname === "/login" || location.pathname === "/cadastroEmpresa";

  return (
    <div>
      {!somenteFormulario && <Header />}
      <main style={{ minHeight: "70vh", padding: "2rem" }}>
        <AppRoutes />
      </main>
      {!somenteFormulario && <Footer />}
    </div>
  );
}
