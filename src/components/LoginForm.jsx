import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Botao } from "./Botao";
import { isValidEmail, isValidPassword } from "../utils/validators";

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setErro("Email inválido");
      return;
    }

    if (!isValidPassword(senha)) {
      setErro("Senha inválida");
      return;
    }

    setErro("");
    localStorage.setItem("usuario", JSON.stringify({ email }));
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:
          <input type="email" value={email} placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
        </label>
        <br />
        <label>Senha:
          <input type="password" value={senha} placeholder="Senha" onChange={e => setSenha(e.target.value)} />
        </label>
        <br />
        {erro && <p style={{ color: "red" }}>{erro}</p>}
        <Botao texto="Entrar" type="submit" />
      </form>
      <p>Não tem conta? <Link to="/cadastroEmpresa">Cadastre-se</Link></p>
    </div>
  );
}
