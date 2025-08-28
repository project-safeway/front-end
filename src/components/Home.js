import { useAuth } from "react-oidc-context";

export default function Home() {
  const auth = useAuth();

  if (auth.isLoading) return <div>Carregando...</div>;
  if (auth.error) return <div>Erro: {auth.error.message}</div>;

  if (!auth.isAuthenticated) {
    return (
      <div>
        <h1>Bem-vindo</h1>
        <button onClick={() => auth.signinRedirect()}>Login</button>
      </div>
    );
  }

  const handleLogout = async () => {
    const clientId = "64vn0omuqsoifksqnujdu89erd";
    const redirect = `${window.location.origin}/`; // http://localhost:3000/

    try { await auth.removeUser(); } catch {}

    await auth.signoutRedirect({
      post_logout_redirect_uri: redirect,           // OIDC padrão
      extraQueryParams: {
        client_id: clientId,                        // exigido pelo Cognito
        logout_uri: redirect                        // exigido pelo Cognito
      }
    });
  };

  return (
    <div>
      <h2>Olá, {auth.user?.profile?.email}</h2>
      <pre>ID Token: {auth.user?.id_token}</pre>
      <pre>Access Token: {auth.user?.access_token}</pre>
      <pre>Refresh Token: {auth.user?.refresh_token}</pre>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}