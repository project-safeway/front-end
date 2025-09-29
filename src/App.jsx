import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm }  from './components/LoginForm';
import { Menu }  from './components/Menu';

function isLoggedIn() {
  return false;
}

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/menu" element={
          <PrivateRoute>
            <Menu />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to={isLoggedIn() ? "/menu" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;