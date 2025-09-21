import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div>
      <Header />
      <main style={{ minHeight: "70vh", padding: "2rem" }}>
        <h1>Bem-vindo ao SafeWay</h1>
        <p>Conteúdo principal aqui...</p>
      </main>
      <Footer />
    </div>
  );
}