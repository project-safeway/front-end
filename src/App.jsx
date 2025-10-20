import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm }  from './components/LoginForm';
import { Menu }  from './components/Menu';
import { Register } from './components/Register';
import { Chamada } from './components/Chamada';
import { CadastroAluno } from './components/CadastroAluno';
import { Financeiro } from './components/Financeiro';
import { Rotas } from './components/Rotas';
import { Configuracoes } from './components/Configuracoes';
import { Itinerarios } from './components/itinerarios';
import { Alunos } from './components/Alunos';
import { Historico } from './components/Historico';

function isLoggedIn() {
  return true;
}

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

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

        <Route path="/chamada" element={
          <PrivateRoute>
            <Chamada />
          </PrivateRoute>
        } />

        <Route path="/financeiro" element={
          <PrivateRoute>
            <Financeiro />
          </PrivateRoute>
        } />

        <Route path="/rotas" element={
          <PrivateRoute>
            <Rotas />
          </PrivateRoute>
        } />

        <Route path="/configuracoes" element={
          <PrivateRoute>
            <Configuracoes />
          </PrivateRoute>
        } />

        <Route path="/itinerarios" element={
          <PrivateRoute>
            <Itinerarios />
          </PrivateRoute>
        } />

        <Route path="/alunos" element={
          <PrivateRoute>
            <Alunos />
          </PrivateRoute>
        } />

        <Route path="/alunos/cadastrar" element={
          <PrivateRoute>
            <CadastroAluno />
          </PrivateRoute>
        } />

        <Route path="/historico" element={
          <PrivateRoute>
            <Historico />
          </PrivateRoute>
        } />
        

        <Route path="*" element={<Navigate to={isLoggedIn() ? "/menu" : "/login"} />} />
        <Route path="/alunos" element={<CadastroAluno />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;