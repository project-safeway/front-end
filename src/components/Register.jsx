import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Botao } from "./Botao";
import { Input } from "./Input";

export function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tel, setTel] = useState("");
  const [role, setRole] = useState("Common");
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, role, tel })
    });

    const data = await response.text();
    alert(data);

    navigate("/login");
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[url('/public/fundo-form.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70"></div>
      <form onSubmit={handleSubmit}
        className="relative flex flex-col justify-center items-center w-5/6 max-w-2xl p-10 rounded-3xl bg-orange/20 backdrop-blur-md shadow-lg">
        <div className="w-full flex flex-col gap-4">

          <h2 className="text-4xl font-bold text-left text-white mb-2">Que bom ter você aqui,</h2>
          <h3 className="text-lg text-left text-white mb-6 font-normal">
            Insira suas informações e comece a explorar tudo o que preparamos para você!
          </h3>

          <label className="text-white text-sm text-left" htmlFor="nome">Nome</label>
          <Input onChange={e => setNome(e.target.value)}
            id="nome" placeholder="Nome" type="text"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="nome">Email</label>
          <Input onChange={e => setEmail(e.target.value)}
            id="email" placeholder="Email" type="email"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="nome">Telefone</label>
          <Input onChange={e => setTel(e.target.value)}
            id="telefone" placeholder="Telefone" type="text"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="senha">Senha</label>
          <Input onChange={e => setSenha(e.target.value)}
            id="senha" placeholder="Senha" type="password"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <label className="text-white text-sm text-left" htmlFor="senha">Confirmar Senha</label>
          <Input onChange={e => setConfirmarSenha(e.target.value)}
            id="confirmarSenha" placeholder="Confirmar Senha" type="password"
            className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

          <Botao cor="laranja" texto="Cadastrar" type="submit" tamanho="w-full px-3 py-3 text-2xl" />

          <div className="mt-6 text-center">
            <span className="text-white text-sm">Já possui uma conta? <a href="./login" className="font-bold underline">Entre</a></span>
          </div>
        </div>
      </form>
    </div>
  );
}