import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Botao } from "./Botao";
import { Input } from "./Input";
import axios from "axios";

export function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }

    try {
      const payload = {
        nome,
        email,
        senha,
        telefone,
        transporte: {
          placa,
          modelo,
          capacidade: capacidade ? parseInt(capacidade) : null,
        },
      };

      const response = await axios.post("/auth/register", payload);
      alert(response.data);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        alert(error.response.data);
      } else {
        alert("Erro ao cadastrar. Tente novamente mais tarde.");
      }
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[url('/public/fundo-form.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70"></div>
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col justify-center items-center w-5/6 max-w-2xl p-10 rounded-3xl bg-orange/20 backdrop-blur-md shadow-lg"
      >
        <div className="w-full flex flex-col gap-4">

          <h2 className="text-4xl font-bold text-left text-white mb-2">
            Que bom ter você aqui,
          </h2>
          <h3 className="text-lg text-left text-white mb-6 font-normal">
            Insira suas informações e comece a explorar tudo o que preparamos para você!
          </h3>

          <label className="text-white text-sm text-left" htmlFor="nome">Nome</label>
          <Input onChange={e => setNome(e.target.value)} id="nome" placeholder="Nome" type="text"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="email">Email</label>
          <Input onChange={e => setEmail(e.target.value)} id="email" placeholder="Email" type="email"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="telefone">Telefone</label>
          <Input onChange={e => setTelefone(e.target.value)} id="telefone" placeholder="Telefone" type="text"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          {/* Campos de transporte */}
          <label className="text-white text-sm text-left" htmlFor="placa">Placa do Transporte</label>
          <Input onChange={e => setPlaca(e.target.value)} id="placa" placeholder="Placa" type="text"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="modelo">Modelo</label>
          <Input onChange={e => setModelo(e.target.value)} id="modelo" placeholder="Modelo" type="text"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="capacidade">Capacidade</label>
          <Input onChange={e => setCapacidade(e.target.value)} id="capacidade" placeholder="Capacidade" type="number"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="senha">Senha</label>
          <Input onChange={e => setSenha(e.target.value)} id="senha" placeholder="Senha" type="password"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="confirmarSenha">Confirmar Senha</label>
          <Input onChange={e => setConfirmarSenha(e.target.value)} id="confirmarSenha" placeholder="Confirmar Senha" type="password"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          {erro && <p className="text-red-500 text-sm mt-1">{erro}</p>}

          <Botao cor="laranja" texto="Cadastrar" type="submit" tamanho="w-full px-3 py-3 text-2xl" />

          <div className="mt-6 text-center">
            <span className="text-white text-sm">
              Já possui uma conta?{" "}
              <a href="./login" className="font-bold underline">Entre</a>
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
