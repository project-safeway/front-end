import { Navbar } from "./Navbar";
import { useNavigate } from "react-router-dom";

export function Alunos() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Alunos</h1>
            <button style={{ marginBottom: "1rem", cursor: "pointer", backgroundColor: "orange", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "0.25rem" }} onClick={() => navigate("/alunos/cadastrar")}>Cadastrar Aluno</button>
            <Navbar />
        </div>
    );
}