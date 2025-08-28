import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import Register from "./components/Register";
import ConfirmEmail from "./components/ConfirmEmail";
import Home from "./components/Home";

function App() {
  const auth = useAuth();

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Erro: {auth.error.message}</div>;

  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/register">Registrar</Link> |{" "}
        <Link to="/confirm">Confirmar</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm" element={<ConfirmEmail />} />
      </Routes>
    </div>
  );
}

export default App;