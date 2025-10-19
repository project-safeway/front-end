import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

export default function ProcessesList() {
  const [processos, setProcessos] = useState([]);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    // Simulação de dados - substitua por chamada à API
    const dadosProcessos = [
      {
        id: 1,
        numero: "0001234-56.2025.8.26.0100",
        cliente: "João Silva",
        status: "em_andamento",
        prazo: "2025-10-25",
      },
      {
        id: 2,
        numero: "0007890-12.2025.8.26.0200",
        cliente: "Maria Santos",
        status: "urgente",
        prazo: "2025-10-20",
      },
      {
        id: 3,
        numero: "0003456-78.2025.8.26.0300",
        cliente: "Pedro Costa",
        status: "concluido",
        prazo: "2025-10-15",
      },
      {
        id: 4,
        numero: "0009012-34.2025.8.26.0400",
        cliente: "Ana Paula",
        status: "em_andamento",
        prazo: "2025-10-30",
      },
    ];
    setProcessos(dadosProcessos);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "em_andamento":
        return <AccessTimeIcon className="text-blue-500" />;
      case "urgente":
        return <WarningIcon className="text-red-500" />;
      case "concluido":
        return <CheckCircleIcon className="text-green-500" />;
      default:
        return <GavelIcon />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      em_andamento: "Em Andamento",
      urgente: "Urgente",
      concluido: "Concluído",
    };
    return statusMap[status] || status;
  };

  const processosFiltrados =
    filtro === "todos"
      ? processos
      : processos.filter((p) => p.status === filtro);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Processos Recentes</h3>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="todos">Todos</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="urgente">Urgentes</option>
          <option value="concluido">Concluídos</option>
        </select>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {processosFiltrados.length > 0 ? (
          processosFiltrados.map((processo) => (
            <Link
              key={processo.id}
              to={`/processo/${processo.id}`}
              className="block"
            >
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(processo.status)}
                    <div>
                      <p className="font-medium text-sm">{processo.numero}</p>
                      <p className="text-xs text-gray-600">
                        {processo.cliente}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Prazo: {new Date(processo.prazo).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      processo.status === "urgente"
                        ? "bg-red-100 text-red-700"
                        : processo.status === "concluido"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {getStatusText(processo.status)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">
            Nenhum processo encontrado.
          </p>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link
          to="/processos"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Ver todos os processos →
        </Link>
      </div>
    </div>
  );
}
