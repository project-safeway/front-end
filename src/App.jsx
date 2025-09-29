import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CardChamada } from "./components/CardChamada";

export default function App() {
  return (
    <div>
      <Header />
      {/* <main style={{ minHeight: "2rem", padding: "2rem" }}>
        <h1>Bem-vindo ao SafeWay</h1>
        <p>Conteúdo principal aqui...</p>
      </main> */}

      <CardChamada></CardChamada>
      <Footer />
    </div>
  );
}