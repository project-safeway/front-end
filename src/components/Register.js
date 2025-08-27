import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("Common");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, role, tel1: "123456789" })
    });
    const data = await response.text();
    alert(data);

    navigate("/confirm", { state: { email } });
  };

  return (
    <div>
      <input placeholder="Nome" onChange={e => setNome(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
      <button onClick={handleSubmit}>Registrar</button>
    </div>
  );
}

export default Register;