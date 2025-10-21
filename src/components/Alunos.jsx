import { Navbar } from "./Navbar";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";

export function Alunos() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Alunos</h1>
            <button style={{ marginBottom: "1rem", cursor: "pointer", backgroundColor: "orange", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "0.25rem" }} onClick={() => navigate("/alunos/cadastrar")}>Cadastrar Aluno</button>
=======

export function Alunos() {
    return (
        <div>
            <h1>Alunos</h1>
>>>>>>> 18196026221075928923c412f0fb36c9782ddfbc
            <Navbar />
        </div>
    );
}