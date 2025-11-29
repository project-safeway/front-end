import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import HistoryIcon from "@mui/icons-material/History";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Tabela } from "../components/Tabela";
import ItinerarioService from "../services/itinerarioService";
import ChamadaService from "../services/chamadaService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Historico() {
  const [searchParams, setSearchParams] = useSearchParams();
  const itinerarioId = Number(searchParams.get("itinerarioId"));

  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    statusChamada: [],
    escola: "",
    ordem: "az",
  });

  const [itinerario, setItinerario] = useState(null);
  const [itinerarios, setItinerarios] = useState([]);
  const [historicoData, setHistoricoData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginacao, setPaginacao] = useState({
    page: 0,
    size: 100,
    totalElements: 0,
    totalPages: 0,
  });

  // Carrega lista de itinerários para o select
  useEffect(() => {
    carregarItinerarios();
  }, []);

  // Carrega o histórico quando o itinerário ou filtros mudam
  useEffect(() => {
    if (itinerarioId) {
      carregarHistorico();
    }
  }, [itinerarioId, filtros.statusChamada, paginacao.page]);

  const carregarItinerarios = async () => {
    try {
      const response = await ItinerarioService.buscarTodos();
      const listaItinerarios = response.content || response || [];
      setItinerarios(listaItinerarios);

      // Se não houver itinerário selecionado, seleciona o primeiro
      if (!itinerarioId && listaItinerarios.length > 0) {
        const primeiroId = listaItinerarios[0].id;
        setSearchParams({ itinerarioId: primeiroId });
      }
    } catch (error) {
      toast.error("Erro ao carregar itinerários", { theme: "colored" });
    }
  };

  const carregarHistorico = async () => {
    setIsLoading(true);
    try {
      // Carrega dados do itinerário
      const itinerarioData = await ItinerarioService.buscarPorId(itinerarioId);
      setItinerario(itinerarioData);

      // Carrega histórico de chamadas
      const params = {
        page: paginacao.page,
        size: paginacao.size,
        sortField: "id",
        sortDirection: "desc",
      };

      if (filtros.statusChamada.length > 0) {
        params.status = filtros.statusChamada;
      }

      const historicoResponse = await ChamadaService.buscarHistoricoChamadas(
        itinerarioId,
        params
      );

      console.log("Histórico Response:", historicoResponse);

      // Processa os dados do histórico
      const chamadas = historicoResponse.content || [];
      console.log("Chamadas encontradas:", chamadas);
      
      const dadosProcessados = processarDadosHistorico(chamadas, itinerarioData);
      console.log("Dados processados:", dadosProcessados);

      setHistoricoData(dadosProcessados);
      setPaginacao({
        page: historicoResponse.number || 0,
        size: historicoResponse.size || 100,
        totalElements: historicoResponse.totalElements || 0,
        totalPages: historicoResponse.totalPages || 0,
      });
    } catch (error) {
      toast.error(`Erro ao carregar histórico: ${error.message}`, {
        theme: "colored",
      });
      setHistoricoData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processarDadosHistorico = (chamadas, itinerarioData) => {
    const dados = [];

    chamadas.forEach((chamada) => {
      const alunosChamada = chamada.alunos || [];
      const alunosItinerario = chamada.itinerario?.alunos || [];

      alunosChamada.forEach((ca) => {
        const alunoInfo = ca.aluno || {};
        const escolaInfo = alunoInfo.escola || {};
        
        // Busca o responsável nos dados do itinerário usando o nome do aluno
        const alunoItinerario = alunosItinerario.find(
          (a) => a.nomeAluno === alunoInfo.nome
        );
        
        dados.push({
          id: `${chamada.id}-${alunoInfo.nome}`,
          chamadaId: chamada.id,
          nomeAluno: alunoInfo.nome || "Sem nome",
          escola: escolaInfo.nome || "Não informado",
          responsavel: alunoItinerario?.nomeResponsavel || "Não informado",
          sala: alunoInfo.sala || "",
          data: formatarData(ca.dataHora),
          horarioRegistro: formatarHorario(ca.dataHora),
          presente: ca.presenca === "PRESENTE",
          statusChamada: chamada.status,
          dataCompleta: new Date(ca.dataHora),
        });
      });
    });

    return dados;
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const formatarHorario = (dataISO) => {
    if (!dataISO) return "-";
    const data = new Date(dataISO);
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Aplica filtros locais (escola, data, ordem)
  const aplicarFiltrosLocais = (dados) => {
    console.log("Aplicando filtros locais em:", dados);
    console.log("Filtros atuais:", filtros);
    
    let filtrados = [...dados];

    // Filtro por escola
    if (filtros.escola) {
      filtrados = filtrados.filter((d) => d.escola === filtros.escola);
      console.log("Após filtro escola:", filtrados);
    }

    // Filtro por data início
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio);
      filtrados = filtrados.filter((d) => d.dataCompleta >= dataInicio);
      console.log("Após filtro data início:", filtrados);
    }

    // Filtro por data fim
    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      filtrados = filtrados.filter((d) => d.dataCompleta <= dataFim);
      console.log("Após filtro data fim:", filtrados);
    }

    // Ordenação
    if (filtros.ordem === "az") {
      filtrados.sort((a, b) => a.nomeAluno.localeCompare(b.nomeAluno));
    } else if (filtros.ordem === "za") {
      filtrados.sort((a, b) => b.nomeAluno.localeCompare(a.nomeAluno));
    }

    console.log("Dados filtrados final:", filtrados);
    return filtrados;
  };

  const dadosFiltrados = aplicarFiltrosLocais(historicoData);
  console.log("Renderizando com dados filtrados:", dadosFiltrados);

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleStatusChamadaChange = (e) => {
    const valor = e.target.value;
    if (!valor) {
      setFiltros((prev) => ({ ...prev, statusChamada: [] }));
    } else {
      setFiltros((prev) => ({ ...prev, statusChamada: [valor] }));
    }
  };

  const handleItinerarioChange = (e) => {
    const novoId = e.target.value;
    setSearchParams({ itinerarioId: novoId });
  };

  const escolasUnicas = [
    ...new Set(historicoData.map((d) => d.escola).filter(Boolean)),
  ];

  const cabecalho = [
    "Nome do aluno",
    "Escola",
    "Responsável",
    "Data",
    "Horário",
    "Status",
  ];
  const fields = [
    "nomeAluno",
    "escola",
    "responsavel",
    "data",
    "horarioRegistro",
    "statusChamada",
  ];

  // Estatísticas
  const totalPresentes = dadosFiltrados.filter((d) => d.presente).length;
  const totalAusentes = dadosFiltrados.filter((d) => !d.presente).length;
  const totalRegistros = dadosFiltrados.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-navy-600">Carregando histórico...</p>
        </div>
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
          <HistoryIcon className="text-primary-400 text-4xl" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-navy-900">Histórico</h1>
          <p className="text-navy-600">
            Visualize o histórico de presença por itinerário
          </p>
          {itinerario && (
            <p className="text-sm text-gray-500 mt-1">
              {itinerario.nome} • {itinerario.turno} • {itinerario.tipoViagem}
            </p>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-4">
          <p className="text-sm text-navy-600 mb-1">Total de Registros</p>
          <p className="text-2xl font-bold text-navy-900">{totalRegistros}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-4">
          <p className="text-sm text-navy-600 mb-1">Presenças</p>
          <p className="text-2xl font-bold text-green-600">{totalPresentes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-4">
          <p className="text-sm text-navy-600 mb-1">Ausências</p>
          <p className="text-2xl font-bold text-red-600">{totalAusentes}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-4 mb-6">
        <h3 className="text-sm font-semibold text-navy-900 mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
              className="w-full border border-offwhite-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
              className="w-full border border-offwhite-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">
              Status Chamada
            </label>
            <select
              value={filtros.statusChamada[0] || ""}
              onChange={handleStatusChamadaChange}
              className="w-full border border-offwhite-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">
              Escola
            </label>
            <select
              value={filtros.escola}
              onChange={(e) => handleFiltroChange("escola", e.target.value)}
              className="w-full border border-offwhite-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              {escolasUnicas.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">
              Ordenar por
            </label>
            <select
              value={filtros.ordem}
              onChange={(e) => handleFiltroChange("ordem", e.target.value)}
              className="w-full border border-offwhite-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="az">Alunos A–Z</option>
              <option value="za">Alunos Z–A</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">
              Itinerário
            </label>
            <select
              value={itinerarioId || ""}
              onChange={handleItinerarioChange}
              className="w-full border border-offwhite-300 rounded-lg px-3 py-2 text-sm"
            >
              {itinerarios.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-8 text-center">
          <p className="text-navy-600">Carregando dados...</p>
        </div>
      ) : dadosFiltrados.length > 0 ? (
        <Tabela
          cabecalho={cabecalho}
          dados={dadosFiltrados}
          fields={fields}
          status={true}
          statusField="presente"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-8 text-center">
          <HistoryIcon className="text-offwhite-400 text-6xl mb-4 mx-auto" />
          <p className="text-navy-900 font-semibold mb-2">
            Nenhum registro encontrado
          </p>
          <p className="text-navy-600 text-sm">
            {historicoData.length === 0 
              ? "Não há histórico de chamadas para este itinerário."
              : "Tente ajustar os filtros para encontrar registros."}
          </p>
          {historicoData.length === 0 && (
            <p className="text-navy-500 text-xs mt-2">
              Total de chamadas carregadas: {historicoData.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}