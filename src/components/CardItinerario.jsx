import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import RouteIcon from "@mui/icons-material/Route";
import Tooltip from "@mui/material/Tooltip";

import { useState } from "react";

export function CardItinerario({
    tamanho,
    label,
    horarioInicio,
    horarioFim,
    tipoViagem,
    onClick,
    onEdit,
    onDelete,
    onHistorico,
    onIniciarPresenca,
    onVisualizarRota,
}) {
    const [isStarting, setIsStarting] = useState(false);
    const handleStart = () => {
        if (isStarting) return;
        setIsStarting(true);
        onIniciarPresenca && onIniciarPresenca();
    };
    return (
        <div
            className={`${tamanho} flex flex-col justify-between bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-4 border border-gray-100 relative`}
        >
            {/* Cabeçalho */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="font-semibold text-lg text-gray-800">{label}</span>
                    <span
                        className={`text-xs max-w-fit mt-1 px-3 py-1 rounded-full ${tipoViagem === "SO_IDA"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                    >
                        {tipoViagem === "SO_IDA" ? "Ida" : "Volta"}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Tooltip title="Ver Rota" arrow>
                        <button
                            onClick={onVisualizarRota}
                            className="text-purple-500 hover:text-purple-700 transition"
                        >
                            <RouteIcon fontSize="small" />
                        </button>
                    </Tooltip>

                    <Tooltip title="Editar" arrow>
                        <button
                            onClick={onEdit}
                            className="text-blue-500 hover:text-blue-700 transition"
                        >
                            <EditIcon fontSize="small" />
                        </button>
                    </Tooltip>

                    <Tooltip title="Excluir" arrow>
                        <button
                            onClick={onDelete}
                            className="text-red-500 hover:text-red-700 transition"
                        >
                            <DeleteIcon fontSize="small" />
                        </button>
                    </Tooltip>

                    <Tooltip title="Histórico" arrow>
                        <button
                            onClick={onHistorico}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            <HistoryIcon fontSize="small" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Corpo */}
            <div className="flex flex-col items-start text-right gap-2">
                <span className="text-sm text-gray-700">
                    <Tooltip title="Horário" arrow>
                        <AccessTimeIcon fontSize="small" className="mr-1" />
                    </Tooltip>
                    {horarioInicio} - {horarioFim}
                </span>
            </div>

            {/* Rodapé */}
            <div className="flex justify-center mt-3">
                <button
                    onClick={handleStart}
                    disabled={isStarting}
                    className={`flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-1.5 px-3 rounded-full shadow-md transition ${isStarting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    <PlayCircleFilledWhiteIcon fontSize="small" />
                    {isStarting ? 'Aguarde...' : 'Iniciar Presença'}
                </button>
            </div>
        </div>
    );
}
