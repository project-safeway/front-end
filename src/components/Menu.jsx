import { Navbar } from "./Navbar";
import { Cards } from "./Cards";
import { useNavigate } from "react-router-dom";

export function Menu(){
    const navigate = useNavigate();

    return (
        <div className="justify-center">
            <h1 className="text-center font-bold mt-4">Menu Principal</h1>
            <div className="grid grid-cols-2 gap-2 px-4 py-4 mb-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <Cards img="/chamada.png" label="Chamada" navegarPara="chamada" />
                <Cards img="/rotas.png" label="Rotas" navegarPara="rotas" />
                <Cards img="/itinerarios.png" label="Itinerários" navegarPara="itinerarios" />
                <Cards img="/alunos.png" label="Alunos" navegarPara="alunos" />
                <Cards img="/financeiro.png" label="Financeiro" navegarPara="financeiro" />
                <Cards img="/historico.png" label="Histórico" navegarPara="historico" />
            </div>
            <Navbar />
        </div>
    );
}