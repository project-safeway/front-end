import { useState } from "react";
import { useLocation } from "react-router-dom";

function ConfirmEmail() {
  const location = useLocation();
  const emailFromRegister = location.state?.email || "";
  const [email, setEmail] = useState(emailFromRegister);
  const [code, setCode] = useState("");

  const handleConfirm = async () => {
    const response = await fetch("http://localhost:8080/auth/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, confirmationCode: code })
    });
    const data = await response.text();
    alert(data);
  };

  return (
    <div>
      <h2>Confirme seu cadastro</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="Código"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button onClick={handleConfirm}>Confirmar</button>
    </div>
  );
}

export default ConfirmEmail;