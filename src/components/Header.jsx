import React from "react";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="logo">LOGO</div>
      <nav className="nav">
        <a href="#">Quem Somos</a>
        <a href="#">Valores</a>
        <a href="#">Contate-nos</a>
      </nav>
      <button className="btn-acessar">Acessar</button>
    </header>
  );
}
