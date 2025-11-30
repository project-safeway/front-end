import React, { useState, useEffect } from "react";
import { showSwal } from '../utils/swal.jsx';
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CardChamada } from "../components/CardChamada";
import { TabelaChamada } from "../components/TabelaChamada";
import ItinerarioService from "../services/itinerarioService";
import ChamadaService from "../services/chamadaService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Chamada() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const itinerarioId = Number(searchParams.get("itinerarioId"));

  const [alunos, setAlunos] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [chamadaId, setChamadaId] = useState(null);
  const [itinerario, setItinerario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [chamadaFinalizada, setChamadaFinalizada] = useState(false);

  useEffect(() => {
    if (!itinerarioId) {
      toast.error("ID do itinerário não fornecido", { theme: "colored" });
      navigate("/itinerarios");
      return;
    }
    inicializarChamada();
  }, [itinerarioId]);

  const inicializarChamada = async () => {
    setIsLoading(true);
    try {
      const itinerarioData = await ItinerarioService.buscarPorId(itinerarioId);
      setItinerario(itinerarioData);

      if (!itinerarioData.alunos || itinerarioData.alunos.length === 0) {
        toast.warning("Este itinerário não possui alunos cadastrados.", {
          theme: "colored",
        });
        setTimeout(() => navigate("/itinerarios"), 2000);
        return;
      }

      const chamadaResponse = await ChamadaService.iniciarChamada(itinerarioId);
      setChamadaId(chamadaResponse.id);

      const rawAlunos =
        itinerarioData.alunos ||
        (itinerarioData.itinerario && itinerarioData.itinerario.alunos) ||
        [];

      const alunosFormatados = rawAlunos
        .slice()
        .sort((a, b) => (a.ordemEmbarque ?? a.ordemGlobal ?? 0) - (b.ordemEmbarque ?? b.ordemGlobal ?? 0))
        .map((aluno) => ({
          id: aluno.alunoId || aluno.idAluno || aluno.id,
          nomeAluno: aluno.nomeAluno || aluno.nome || "Sem nome",
          responsavel: aluno.nomeResponsavel || aluno.responsavel || "Não informado",
          escola: aluno.nomeEscola || "Não informado",
          sala: aluno.sala || null,
          ordemEmbarque: aluno.ordemEmbarque ?? aluno.ordemGlobal ?? 0,
          presente: null,
        }));

      setAlunos(alunosFormatados);
      toast.success("Chamada iniciada com sucesso!", { theme: "colored" });
    } catch (error) {
      if (error.message.includes("já existe uma chamada em andamento")) {
        toast.error(
          "Já existe uma chamada em andamento para este itinerário. Finalize a chamada anterior primeiro.",
          { theme: "colored", autoClose: 5000 }
        );
      } else {
        toast.error(`Erro ao iniciar chamada: ${error.message}`, {
          theme: "colored",
        });
      }
      
      setTimeout(() => navigate("/itinerarios"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const marcarPresenca = (presente) => {
    const alunoAtual = alunos[indiceAtual];
    const atualizados = alunos.map((a) =>
      a.id === alunoAtual.id ? { ...a, presente } : a
    );
    setAlunos(atualizados);
    proximoAluno();
  };

  const proximoAluno = () => {
    if (indiceAtual < alunos.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    } else {
      toast.info("Último aluno registrado! Finalize a chamada.", {
        theme: "colored",
      });
    }
  };

  const finalizarChamada = async () => {
    const alunosNaoRegistrados = alunos.filter((a) => a.presente === null);
    
    if (alunosNaoRegistrados.length > 0) {
      const { isConfirmed } = await showSwal({
        title: 'Finalizar chamada',
        text: `Ainda há ${alunosNaoRegistrados.length} aluno(s) sem registro de presença. Deseja finalizar mesmo assim?`,
        icon: 'warning',
        confirmButtonText: 'Sim, finalizar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true
      });
      if (!isConfirmed) return;
    }

    setIsFinalizando(true);
    try {
      const presencas = {};
      alunos.forEach((aluno) => {
        if (aluno.presente !== null) {
          presencas[aluno.id] = aluno.presente ? "PRESENTE" : "AUSENTE";
        }
      });

      await ChamadaService.registrarPresenca(chamadaId, presencas);

      await ChamadaService.alterarStatusChamada(itinerarioId, "FINALIZADA");

      setChamadaFinalizada(true);
      toast.success("Chamada finalizada com sucesso!", { theme: "colored" });

      setTimeout(() => {
        navigate("/itinerarios");
      }, 2000);
    } catch (error) {
      toast.error(`Erro ao finalizar chamada: ${error.message}`, {
        theme: "colored",
      });
    } finally {
      setIsFinalizando(false);
    }
  };

  const cancelarChamada = async () => {
    const { isConfirmed } = await showSwal({
      title: 'Cancelar chamada',
      text: 'Tem certeza que deseja cancelar esta chamada? Todos os registros serão perdidos.',
      icon: 'warning',
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Voltar',
      showCancelButton: true
    });
    if (!isConfirmed) return;

    try {
      await ChamadaService.alterarStatusChamada(itinerarioId, "CANCELADA");
      toast.info("Chamada cancelada.", { theme: "colored" });
      navigate("/itinerarios");
    } catch (error) {
      toast.error(`Erro ao cancelar chamada: ${error.message}`, {
        theme: "colored",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-navy-600">Iniciando chamada...</p>
        </div>
      </div>
    );
  }

  const alunoAtual = alunos[indiceAtual];
  const totalPresentes = alunos.filter((a) => a.presente === true).length;
  const totalAusentes = alunos.filter((a) => a.presente === false).length;
  const totalRegistrados = totalPresentes + totalAusentes;

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
          <AssignmentTurnedInIcon className="text-primary-400 text-4xl" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-navy-900">Chamada</h1>
          <p className="text-navy-600">
            {itinerario?.nome || "Registre a presença dos alunos"}
          </p>
        </div>
      </div>

      {/* Card do Aluno Atual ou Finalização */}
      {!chamadaFinalizada && alunoAtual ? (
        <div className="mb-6">
          <CardChamada
            aluno={alunoAtual}
            indiceAtual={indiceAtual}
            totalAlunos={alunos.length}
            onPresente={() => marcarPresenca(true)}
            onAusente={() => marcarPresenca(false)}
            onProximo={proximoAluno}
            isUltimoAluno={indiceAtual === alunos.length - 1}
          />

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={cancelarChamada}
              className="px-6 py-2.5 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
              disabled={isFinalizando}
            >
              Cancelar Chamada
            </button>
            <button
              onClick={finalizarChamada}
              className="px-6 py-2.5 bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isFinalizando || totalRegistrados === 0}
            >
              {isFinalizando ? "Finalizando..." : "Finalizar Chamada"}
            </button>
          </div>
        </div>
      ) : chamadaFinalizada ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-offwhite-200 mb-6">
          <AssignmentTurnedInIcon className="text-green-500 text-6xl mb-4" />
          <h2 className="text-2xl font-semibold text-navy-800 mb-2">
            Chamada Finalizada!
          </h2>
          <p className="text-navy-600 mb-2">
            Todos os registros foram salvos com sucesso.
          </p>
          <p className="text-sm text-navy-500">
            Presentes: {totalPresentes} | Ausentes: {totalAusentes}
          </p>
        </div>
      ) : null}

      {/* Tabela */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">
          Resumo da Chamada
        </h3>
        <TabelaChamada
          alunos={alunos}
          onRowClick={(aluno, index) => {
            if (!chamadaFinalizada) {
              setIndiceAtual(index);
              toast.info(`Navegando para ${aluno.nomeAluno}`, {
                theme: "colored",
                autoClose: 1500,
              });
            }
          }}
          alunoAtualId={alunoAtual?.id}
        />
      </div>
    </div>
  );
}