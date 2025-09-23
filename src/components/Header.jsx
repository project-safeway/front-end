import React from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const usuarioLogado = localStorage.getItem("usuario");

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo">LOGO</div>
      <nav className="nav">
        <Link to="/">Quem Somos</Link>
        <Link to="/">Valores</Link>
        <Link to="/">Contate-nos</Link>
      </nav>
      {usuarioLogado ? (
        <button onClick={handleLogout} className="btn-acessar">Sair</button>
      ) : (
        <Link to="/login" className="btn-acessar">Acessar</Link>
      )}
    </header>
  );
}
