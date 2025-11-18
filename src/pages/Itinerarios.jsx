import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MapIcon from "@mui/icons-material/Map";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CardItinerario } from "../components/CardItinerario";
import { Botao } from "../components/Botao";
import ItinerarioModal from "../components/ItinerarioModal";

export default function Itinerarios() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itinerarioSelecionado, setItinerarioSelecionado] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 896);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 896);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [alunos] = useState([
    { id: 1, nomeAluno: "João Silva", presente: false, responsavel: "Maria Silva", escola: "Escola A", sala: "101" },
    { id: 2, nomeAluno: "Ana Souza", presente: false, responsavel: "Carlos Souza", escola: "Escola B", sala: "202" },
    { id: 3, nomeAluno: "Pedro Oliveira", presente: false, responsavel: "Ana Oliveira", escola: "Escola C", sala: "303" },
    { id: 4, nomeAluno: "Lucas Santos", presente: false, responsavel: "Fernanda Santos", escola: "Escola D", sala: "404" },
  ]);

  const [itinerarios, setItinerarios] = useState([
    { id: 1, nome: "Itinerário 1", horarioInicio: "07:00", horarioFim: "08:00", tipoViagem: "Ida", ativo: true, alunos },
    { id: 2, nome: "Itinerário 2", horarioInicio: "08:00", horarioFim: "09:00", tipoViagem: "Volta", ativo: true, alunos },
    { id: 3, nome: "Itinerário 3", horarioInicio: "09:00", horarioFim: "10:00", tipoViagem: "Ida", ativo: true, alunos },
    { id: 4, nome: "Itinerário 4", horarioInicio: "10:00", horarioFim: "11:00", tipoViagem: "Volta", ativo: true, alunos },
  ]);

  const handleSaveItinerario = async (novo) => {
    setItinerarios((prev) => {
      if (itinerarioSelecionado) {
        return prev.map((i) => (i.id === itinerarioSelecionado.id ? { ...i, ...novo } : i));
      }
      return [...prev, { ...novo, id: Date.now() }];
    });
  };

  const handleDeleteItinerario = async (id) => {
    setItinerarios((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Voltar ao Início</span>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-primary-50 rounded-xl">
          <MapIcon className="text-primary-400 text-4xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Itinerários</h1>
          <p className="text-navy-600">Gerencie seus itinerários</p>
        </div>
      </div>

      {/* Botão principal */}
      <Botao
        texto="Cadastrar Itinerário"
        onClick={() => {
          setItinerarioSelecionado(null);
          setIsModalOpen(true);
        }}
      />

      <ItinerarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItinerario}
        onDelete={handleDeleteItinerario}
        itinerario={itinerarioSelecionado}
      />

      {/* Lista de Itinerários */}
      <div
        className={`grid gap-4 py-4 ${isMobile
            ? "grid-cols-1 place-items-center"
            : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
      >
        {itinerarios.map((itinerario) => (
          <CardItinerario
            key={itinerario.id}
            label={itinerario.nome}
            tamanho="w-full sm:w-72 h-48"
            horarioInicio={itinerario.horarioInicio}
            horarioFim={itinerario.horarioFim}
            tipoViagem={itinerario.tipoViagem}
            onVisualizarRota={() => navigate(`/rotas-otimizadas?itinerarioId=${itinerario.id}`)}
            onEdit={() => navigate(`/edicao-itinerario?itinerarioId=${itinerario.id}`)}
            onDelete={() => handleDeleteItinerario(itinerario.id)}
            onHistorico={() => navigate(`/historico?itinerarioId=${itinerario.id}`)}
            onIniciarPresenca={() => navigate(`/chamada?itinerarioId=${itinerario.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
