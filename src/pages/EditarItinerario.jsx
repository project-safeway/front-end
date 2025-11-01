import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { TabelaEdicaoItinerario } from "../components/TabelaEdicaoItinerario";
import { Botao } from "../components/Botao";

export default function EditarItinerario() {
    const [searchParams] = useSearchParams();
    const itinerarioId = Number(searchParams.get("itinerarioId"));

    const [itinerarios, setItinerarios] = useState([
        { id: 1, nome: "Itinerário 1", dataInicio: "2025-10-01", dataFim: "2025-12-31", tipoViagem: "Ida" },
        { id: 2, nome: "Itinerário 2", dataInicio: "2025-11-01", dataFim: "2025-12-31", tipoViagem: "Volta" },
        { id: 3, nome: "Itinerário 3", dataInicio: "2025-09-15", dataFim: "2025-11-30", tipoViagem: "Ida e Volta" },
    ]);

    const [alunos, setAlunos] = useState([
        { id: 1, nomeAluno: "João Silva", responsavel: "Maria Silva", escola: "Escola A" },
        { id: 2, nomeAluno: "Ana Souza", responsavel: "Carlos Souza", escola: "Escola B" },
        { id: 3, nomeAluno: "Pedro Oliveira", responsavel: "Ana Oliveira", escola: "Escola C" },
        { id: 4, nomeAluno: "Lucas Santos", responsavel: "Fernanda Santos", escola: "Escola D" },
    ]);

    const [itinerario, setItinerario] = useState(null);

    useEffect(() => {
        const encontrado = itinerarios.find((i) => i.id === itinerarioId);
        if (encontrado) setItinerario({ ...encontrado });
    }, [itinerarioId, itinerarios]);

    const handleChange = (field, value) => {
        setItinerario((prev) => ({ ...prev, [field]: value }));
    };

    const handleMoverAluno = (index, direcao) => {
        const novoArray = [...alunos];
        if (direcao === "up" && index > 0) {
            [novoArray[index - 1], novoArray[index]] = [novoArray[index], novoArray[index - 1]];
        }
        if (direcao === "down" && index < novoArray.length - 1) {
            [novoArray[index + 1], novoArray[index]] = [novoArray[index], novoArray[index + 1]];
        }
        setAlunos(novoArray);
    };

    const handleSalvar = () => {
        console.log("Novo itinerário salvo:", itinerario);
        console.log("Ordem dos alunos:", alunos.map((a) => a.nomeAluno));
        alert("Alterações salvas com sucesso!");
    };

    const cabecalho = ["Nome do aluno", "Escola", "Responsável"];
    const fields = ["nomeAluno", "escola", "responsavel"];

    if (!itinerario) {
        return (
            <div className="p-6 text-center text-gray-500">
                Itinerário não encontrado.
            </div>
        );
    }

    return (
        <div className="py-6">
            {/* Breadcrumb */}
            <Link
                to="/itinerarios"
                className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
            >
                <ArrowBackIcon fontSize="small" />
                <span>Voltar</span>
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-primary-50 rounded-xl">
                    <EditIcon className="text-primary-400 text-4xl" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-navy-900">Editar Itinerário</h1>
                    <p className="text-navy-600">
                        Altere as informações e a ordem dos alunos
                    </p>
                </div>
            </div>

            {/* Formulário */}
            <div className="bg-white p-6 rounded-2xl shadow mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Nome do Itinerário</label>
                        <input
                            type="text"
                            value={itinerario.nome}
                            onChange={(e) => handleChange("nome", e.target.value)}
                            className="w-full border rounded-lg p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Data Início</label>
                        <input
                            type="date"
                            value={itinerario.dataInicio}
                            onChange={(e) => handleChange("dataInicio", e.target.value)}
                            className="w-full border rounded-lg p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Data Fim</label>
                        <input
                            type="date"
                            value={itinerario.dataFim}
                            onChange={(e) => handleChange("dataFim", e.target.value)}
                            className="w-full border rounded-lg p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Tipo de Viagem</label>
                        <select
                            value={itinerario.tipoViagem}
                            onChange={(e) => handleChange("tipoViagem", e.target.value)}
                            className="w-full border rounded-lg p-2"
                        >
                            <option value="Ida">Ida</option>
                            <option value="Volta">Volta</option>
                            <option value="Ida e Volta">Ida e Volta</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Botao
                    texto="Salvar Alterações"
                    onClick={handleSalvar}
                 />
            </div>

            {/* Tabela de alunos */}
            <h2 className="text-lg font-semibold text-navy-900 mb-3">Ordem dos Alunos</h2>
            <TabelaEdicaoItinerario
                cabecalho={cabecalho}
                dados={alunos}
                fields={fields}
                onMover={handleMoverAluno}
            />
        </div>
    );
}
