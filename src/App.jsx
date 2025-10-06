import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm }  from './components/LoginForm';
import { Menu }  from './components/Menu';
import { Register } from './components/Register';
import { Tabela } from './components/Tabela';
import { CadastroAluno } from './components/CadastroAluno';

function isLoggedIn() {
  return true;
}

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

const tabelaCabecalho = ["Coluna 1", "Coluna 2", "Coluna 3"];
const tabelaDados = [
  [1, 2, 3, 'AUSENTE'],
  [4, 5, 6, 'PRESENTE']
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={
          <PrivateRoute>
            <Menu />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to={isLoggedIn() ? "/menu" : "/login"} />} />
        <Route path='/tabela' element={
          <Tabela cabecalho={tabelaCabecalho} dados={tabelaDados} status={true} />
        } />
        <Route path="/alunos" element={<CadastroAluno />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;