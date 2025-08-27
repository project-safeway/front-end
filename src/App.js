// App.js
import { useAuth } from "react-oidc-context";
import { Routes, Route, Link } from "react-router-dom";
import Register from "./components/Register";
import ConfirmEmail from "./components/ConfirmEmail";
// import Login from "./components/Login";

function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "64vn0omuqsoifksqnujdu89erd";
    const logoutUri = "https://d84l1y8p4kdic.cloudfront.net";
    const cognitoDomain = "https://us-east-1jmxja3mso.auth.us-east-1.amazoncognito.com";

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Erro: {auth.error.message}</div>;

  return (
    <div>
      <nav>
        {/* <Link to="/">Home</Link> |{" "} */}
        <Link to="/register">Registrar</Link> |{" "}
        <Link to="/confirm">Confirmar</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            auth.isAuthenticated ? (
              <div>
                <h2>Olá, {auth.user?.profile.email}</h2>
                <pre>ID Token: {auth.user?.id_token}</pre>
                <button onClick={() => signOutRedirect()}>Logout</button>
              </div>
            ) : (
              <div>
                <h1>Bem-vindo</h1>
                <button onClick={() => auth.signinRedirect()}>Login</button>
              </div>
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm" element={<ConfirmEmail />} />
        {/* <Route path="/home" element={<Home />} /> */}
      </Routes>
    </div>
  );
}

export default App;