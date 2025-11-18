import React, { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import RouteIcon from "@mui/icons-material/Route"
import { CardChamada } from "../components/CardChamada"
import { Tabela } from "../components/Tabela"

export default function Chamada() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const itinerarioId = searchParams.get('itinerarioId')
  
  const [alunos, setAlunos] = useState([
    { id: 1, nomeAluno: "João Silva", presente: false, responsavel: "Maria Silva", escola: "Escola A", sala: "101" },
    { id: 2, nomeAluno: "Ana Souza", presente: false, responsavel: "Carlos Souza", escola: "Escola B", sala: "202" },
    { id: 3, nomeAluno: "Pedro Oliveira", presente: false, responsavel: "Ana Oliveira", escola: "Escola C", sala: "303" },
    { id: 4, nomeAluno: "Lucas Santos", presente: false, responsavel: "Fernanda Santos", escola: "Escola D", sala: "404" },
    { id: 5, nomeAluno: "Mariana Lima", presente: false, responsavel: "João Lima", escola: "Escola E", sala: "505" },
    { id: 6, nomeAluno: "Gabriel Costa", presente: false, responsavel: "Roberto Costa", escola: "Escola F", sala: "606" },
    { id: 7, nomeAluno: "Beatriz Fernandes", presente: false, responsavel: "Cláudia Fernandes", escola: "Escola G", sala: "707" },
    { id: 8, nomeAluno: "Rafael Almeida", presente: false, responsavel: "Sônia Almeida", escola: "Escola H", sala: "808" }
  ])

  const [indiceAtual, setIndiceAtual] = useState(0)

  const marcarPresenca = (presente) => {
    const alunoAtual = alunos[indiceAtual]
    const atualizados = alunos.map(a =>
      a.id === alunoAtual.id ? { ...a, presente } : a
    )
    setAlunos(atualizados)
    proximoAluno()
  }

  const proximoAluno = () => {
    if (indiceAtual < alunos.length - 1) setIndiceAtual(indiceAtual + 1)
    else alert("Chamada finalizada!")
  }

  const alunoAtual = alunos[indiceAtual]
  const cabecalho = ["ID", "Nome", "Escola", "Sala"]
  const fields = ["id", "nomeAluno", "escola", "sala"]

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-50 rounded-xl">
            <AssignmentTurnedInIcon className="text-primary-400 text-4xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-navy-900">Chamada</h1>
            <p className="text-navy-600">Registre a presença dos alunos nas rotas</p>
          </div>
        </div>
        
        {/* Botão de Visualizar Rota */}
        {itinerarioId && (
          <button
            onClick={() => navigate(`/rotas-otimizadas?itinerarioId=${itinerarioId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md"
          >
            <RouteIcon fontSize="small" />
            <span>Ver Rota</span>
          </button>
        )}
      </div>

      {/* Card do Aluno Atual */}
      {alunoAtual ? (
        <CardChamada
          aluno={alunoAtual}
          onPresente={() => marcarPresenca(true)}
          onAusente={() => marcarPresenca(false)}
          onProximo={proximoAluno}
        />
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-offwhite-200">
          <AssignmentTurnedInIcon className="text-navy-300 text-6xl mb-4" />
          <h2 className="text-2xl font-semibold text-navy-800 mb-2">Chamada finalizada!</h2>
          <p className="text-navy-600 mb-6">Todos os alunos foram registrados.</p>
          <button
            onClick={() => setIndiceAtual(0)}
            className="px-6 py-3 bg-primary-400 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors"
          >
            Nova Chamada
          </button>
        </div>
      )}

      {/* Resumo / Tabela */}
      <div className="mt-10">
        <Tabela
          cabecalho={cabecalho}
          dados={alunos}
          fields={fields}
          renderCell={(row, key) => row[key]}
          status={true}
          statusField="presente"
          onRowClick={(row, index) => setIndiceAtual(index)}
        />
      </div>
    </div>
  )
}
