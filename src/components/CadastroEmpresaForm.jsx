import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Botao } from "./Botao";

export default function CadastroEmpresaForm() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aqui você poderia enviar os dados para backend
    localStorage.setItem("usuario", JSON.stringify({ email }));
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Cadastre sua empresa</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome:
          <input type="text" value={nome} placeholder="Nome" onChange={e => setNome(e.target.value)} />
        </label>
        <br />
        <label>Email:
          <input type="email" value={email} placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
        </label>
        <br />
        <label>Senha:
          <input type="password" value={senha} placeholder="Senha" onChange={e => setSenha(e.target.value)} />
        </label>
        <br />
        <Botao texto="Cadastrar" type="submit" />
      </form>
       <p>Já tem conta? <Link to="/login">Faça Login</Link></p>
    </div>
  );
}
