import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import HistoryIcon from "@mui/icons-material/History";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Tabela } from "../components/Tabela";

export default function Historico() {
  const [searchParams] = useSearchParams();
  const itinerarioId = Number(searchParams.get("itinerarioId"));

  const [filtros, setFiltros] = useState({
    data: "",
    turno: "",
    escola: "",
    ordem: "az",
  });

  const [alunos] = useState([
    { id: 1, nomeAluno: "João Silva", responsavel: "Maria Silva", escola: "Escola A", sala: "101" },
    { id: 2, nomeAluno: "Ana Souza", responsavel: "Carlos Souza", escola: "Escola B", sala: "202" },
    { id: 3, nomeAluno: "Pedro Oliveira", responsavel: "Ana Oliveira", escola: "Escola C", sala: "303" },
    { id: 4, nomeAluno: "Lucas Santos", responsavel: "Fernanda Santos", escola: "Escola D", sala: "404" },
  ]);

  const [itinerarios] = useState([
    { id: 1, nome: "Itinerário 1", horarioInicio: "07:00", horarioFim: "08:00", tipoViagem: "Ida", turno: "Manhã", ativo: true },
    { id: 2, nome: "Itinerário 2", horarioInicio: "08:00", horarioFim: "09:00", tipoViagem: "Volta", turno: "Manhã", ativo: true },
    { id: 3, nome: "Itinerário 3", horarioInicio: "09:00", horarioFim: "10:00", tipoViagem: "Ida", turno: "Tarde", ativo: true },
    { id: 4, nome: "Itinerário 4", horarioInicio: "10:00", horarioFim: "11:00", tipoViagem: "Volta", turno: "Tarde", ativo: true },
  ]);

  // Histórico de presença com informações adicionais
  const [historicoPresenca] = useState([
    { data: "2025-10-28", alunoId: 1, itinerarioId: 1, presente: true, horarioRegistro: "07:15", turno: "Manhã" },
    { data: "2025-10-28", alunoId: 2, itinerarioId: 1, presente: true, horarioRegistro: "07:20", turno: "Manhã" },
    { data: "2025-10-28", alunoId: 3, itinerarioId: 1, presente: false, horarioRegistro: null, turno: "Manhã" },
    { data: "2025-10-29", alunoId: 1, itinerarioId: 1, presente: true, horarioRegistro: "07:12", turno: "Manhã" },
    { data: "2025-10-29", alunoId: 4, itinerarioId: 3, presente: true, horarioRegistro: "09:30", turno: "Tarde" },
    { data: "2025-10-30", alunoId: 2, itinerarioId: 1, presente: false, horarioRegistro: null, turno: "Manhã" },
  ]);

  const itinerarioSelecionado = itinerarios.find(i => i.id === itinerarioId);

  const [dadosFiltrados, setDadosFiltrados] = useState([]);

  useEffect(() => {
    if (!itinerarioSelecionado) return;

    // Filtra registros do histórico pelo itinerário
    let registros = historicoPresenca.filter(h => h.itinerarioId === itinerarioSelecionado.id);

    // Aplica filtros de data e turno
    if (filtros.data) registros = registros.filter(r => r.data === filtros.data);
    if (filtros.turno) registros = registros.filter(r => r.turno === filtros.turno);

    // Mapeia registros para incluir info do aluno
    let dados = registros.map(r => {
      const aluno = alunos.find(a => a.id === r.alunoId);
      return {
        ...aluno,
        presente: r.presente,
        data: r.data,
        horarioRegistro: r.horarioRegistro,
      };
    });

    // Filtro por escola
    if (filtros.escola) dados = dados.filter(d => d.escola === filtros.escola);

    // Ordenação
    if (filtros.ordem === "az") dados.sort((a, b) => a.nomeAluno.localeCompare(b.nomeAluno));
    else if (filtros.ordem === "za") dados.sort((a, b) => b.nomeAluno.localeCompare(a.nomeAluno));

    setDadosFiltrados(dados);
  }, [filtros, itinerarioSelecionado]);

  const cabecalho = ["Nome do aluno", "Escola", "Responsável", "Data", "Horário"];
  const fields = ["nomeAluno", "escola", "responsavel", "data", "horarioRegistro"];

  const escolasUnicas = [...new Set(alunos.map(a => a.escola))];

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
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Histórico</h1>
          <p className="text-navy-600">
            Visualize o histórico de presença por itinerário
          </p>
          {itinerarioSelecionado && (
            <p className="text-sm text-gray-500 mt-1">
              {itinerarioSelecionado.nome} • {itinerarioSelecionado.turno} • {itinerarioSelecionado.tipoViagem}
            </p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <input
          type="date"
          value={filtros.data}
          onChange={e => setFiltros(f => ({ ...f, data: e.target.value }))}
          className="border rounded-lg p-2"
        />
        <select
          value={filtros.turno}
          onChange={e => setFiltros(f => ({ ...f, turno: e.target.value }))}
          className="border rounded-lg p-2"
        >
          <option value="">Todos os turnos</option>
          <option value="Manhã">Manhã</option>
          <option value="Tarde">Tarde</option>
        </select>
        <select
          value={filtros.escola}
          onChange={e => setFiltros(f => ({ ...f, escola: e.target.value }))}
          className="border rounded-lg p-2"
        >
          <option value="">Todas as escolas</option>
          {escolasUnicas.map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select
          value={filtros.ordem}
          onChange={e => setFiltros(f => ({ ...f, ordem: e.target.value }))}
          className="border rounded-lg p-2"
        >
          <option value="az">Alunos A–Z</option>
          <option value="za">Alunos Z–A</option>
        </select>
        <select
          value={itinerarioId}
          onChange={e => (window.location.href = `?itinerarioId=${e.target.value}`)}
          className="border rounded-lg p-2"
        >
          {itinerarios.map(it => (
            <option key={it.id} value={it.id}>{it.nome}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <Tabela
        cabecalho={cabecalho}
        dados={dadosFiltrados}
        fields={fields}
        status={true}
        statusField="presente"
      />
    </div>
  );
}
