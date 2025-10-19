import React, { useState } from "react";
import EventIcon from "@mui/icons-material/Event";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import BuildIcon from "@mui/icons-material/Build";
import GroupIcon from "@mui/icons-material/Group";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function EventsPanel() {
  const [eventos] = useState([
    {
      id: 1,
      titulo: "Manutenção Ônibus 03",
      data: "20/10/2025",
      tipo: "manutencao",
      prioridade: "alta",
    },
    {
      id: 2,
      titulo: "Reunião com Pais - Rota 3",
      data: "22/10/2025",
      tipo: "reuniao",
      prioridade: "media",
    },
    {
      id: 3,
      titulo: "Vencimento Seguro",
      data: "25/10/2025",
      tipo: "vencimento",
      prioridade: "alta",
    },
    {
      id: 4,
      titulo: "Treinamento Motoristas",
      data: "28/10/2025",
      tipo: "treinamento",
      prioridade: "baixa",
    },
  ]);

  const getIconByType = (tipo) => {
    switch (tipo) {
      case "manutencao":
        return <BuildIcon className="text-primary-400" />;
      case "reuniao":
        return <GroupIcon className="text-navy-500" />;
      case "vencimento":
        return <NotificationsActiveIcon className="text-red-500" />;
      case "treinamento":
        return <EventIcon className="text-green-500" />;
      default:
        return <EventIcon />;
    }
  };

  const getPriorityColor = (prioridade) => {
    switch (prioridade) {
      case "alta":
        return "bg-red-100 text-red-700 border-red-300";
      case "media":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "baixa":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-navy-900">Próximos Eventos</h3>
        <button className="p-2 hover:bg-primary-50 rounded-lg transition-colors">
          <AddCircleOutlineIcon className="text-primary-400" />
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {eventos.length > 0 ? (
          eventos.map((evento) => (
            <div
              key={evento.id}
              className="bg-white border border-offwhite-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-offwhite-100 rounded-lg group-hover:bg-offwhite-200 transition-colors">
                  {getIconByType(evento.tipo)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-navy-900 mb-1 group-hover:text-primary-500 transition-colors">
                    {evento.titulo}
                  </h4>
                  <p className="text-xs text-navy-600 mb-2">{evento.data}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(
                      evento.prioridade
                    )}`}
                  >
                    {evento.prioridade === "alta"
                      ? "Alta Prioridade"
                      : evento.prioridade === "media"
                      ? "Média Prioridade"
                      : "Baixa Prioridade"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <EventIcon className="text-navy-300 text-5xl mb-2" />
            <p className="text-navy-500 text-sm">Nenhum evento próximo</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-offwhite-200">
        <button className="w-full text-primary-500 hover:text-primary-600 text-sm font-medium py-2 hover:bg-primary-50 rounded-lg transition-all">
          Ver todos os eventos →
        </button>
      </div>
    </div>
  );
}
