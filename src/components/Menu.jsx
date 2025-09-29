import { Navbar } from "./Navbar";
import { Cards } from "./Cards";

export function Menu(){
    return (
        <div className="justify-center">
            <h1 className="text-center font-bold mt-4">Menu Principal</h1>
            <div className="grid grid-cols-2 gap-6 px-4 py-8">
                <Cards img="/chamada.png" label="Chamada" />
                <Cards img="/rotas.png" label="Rotas" />
                <Cards img="/itinerarios.png" label="Itinerários" />
                <Cards img="/alunos.png" label="Alunos" />
                <Cards img="/financeiro.png" label="Financeiro" />
                <Cards img="/historico.png" label="Histórico" />
            </div>
            <Navbar />
        </div>
    );
}