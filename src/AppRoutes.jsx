import { Route, Routes } from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import CadastroEmpresaForm from "./components/CadastroEmpresaForm";

export function AppRoutes(){
    return(
        <Routes>
            <Route path="/login" element={<LoginForm/>} />
            <Route path="/cadastroEmpresa" element={<CadastroEmpresaForm/>} />
        </Routes>
    );
}

