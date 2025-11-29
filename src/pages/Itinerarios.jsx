import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MapIcon from "@mui/icons-material/Map";
import MySwal from '../utils/swal';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CardItinerario } from "../components/CardItinerario";
import { Botao } from "../components/Botao";
import ItinerarioModal from "../components/ItinerarioModal";
import ItinerarioService from '../services/itinerarioService';
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Itinerarios() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itinerarioSelecionado, setItinerarioSelecionado] = useState(null);
  const [itinerarios, setItinerarios] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 896);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 896);
    window.addEventListener("resize", handleResize);
    carregarItinerarios();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const carregarItinerarios = async () => {
    setIsLoading(true);
    try {
      const data = await ItinerarioService.listarTodos();

      if (data.length === 0) {
        toast.info(
          'Nenhum itinerário cadastrado. Clique em "Cadastrar Itinerário" para começar!',
          { theme: "colored", toastId: "sem-itinerarios" }
        );
      }

      setItinerarios(data);
    } catch (error) {
      toast.error(`Erro ao carregar itinerários: ${error.message}`, { theme: "colored" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveItinerario = async (novo) => {
    try {
      if (itinerarioSelecionado) {
        await ItinerarioService.atualizar(itinerarioSelecionado.id, novo);
        toast.success("Itinerário atualizado com sucesso!", { theme: "colored" });
      } else {
        await ItinerarioService.criar(novo);
        toast.success("Itinerário criado com sucesso!", { theme: "colored" });
      }
      await carregarItinerarios();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Erro ao salvar itinerário: ${error.message}`, { theme: "colored" });
    }
  }

  const handleDeleteItinerario = async (id) => {
    const { isConfirmed } = await MySwal.fire({
      title: 'Excluir itinerário',
      text: 'Tem certeza que deseja excluir este itinerário? Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    setIsDeleting(id);
    try {
      await ItinerarioService.desativar(id);
      toast.success("Itinerário excluído com sucesso!", { theme: "colored" });
      await carregarItinerarios();
    } catch (error) {
      toast.error(`Erro ao excluir itinerário: ${error.message}`, { theme: "colored" });
    } finally {
      setIsDeleting(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-navy-600">Carregando itinerários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Voltar ao Início</span>
        </Link>

        {/* Header minimalista */}
        <div className="bg-white rounded-2xl shadow-sm border border-offwhite-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary-50 rounded-xl">
                <MapIcon className="text-primary-400 text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-navy-900 mb-1">Itinerários</h1>
                <p className="text-navy-600">Gerencie suas rotas de transporte</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setItinerarioSelecionado(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-all shadow-sm hover:shadow-md"
            >
              + Cadastrar Itinerário
            </button>
          </div>
        </div>

        {/* Lista de Itinerários */}
        <div
          className={`grid gap-4 ${
            isMobile
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
            onEdit={() =>
              navigate(`/edicao-itinerario?itinerarioId=${itinerario.id}`)
            }
            onDelete={() => handleDeleteItinerario(itinerario.id)}
            onHistorico={() =>
              navigate(`/historico?itinerarioId=${itinerario.id}`)
            }
            onIniciarPresenca={() =>
              navigate(`/chamada?itinerarioId=${itinerario.id}`)
            }
          />
        ))}
        </div>

        <ItinerarioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItinerario}
          onDelete={handleDeleteItinerario}
          itinerario={itinerarioSelecionado}
        />
      </div>
    </div>
  );
}
