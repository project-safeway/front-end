import React from "react";
import { Link } from "react-router-dom";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Chamada() {
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
          <AssignmentTurnedInIcon className="text-primary-400 text-4xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Chamada</h1>
          <p className="text-navy-600">Registre a presença dos alunos nas rotas</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-8">
        <div className="text-center py-12">
          <AssignmentTurnedInIcon className="text-navy-300 text-6xl mb-4" />
          <h2 className="text-2xl font-semibold text-navy-800 mb-2">
            Módulo de Chamada
          </h2>
          <p className="text-navy-600 mb-6">
            Em breve: Sistema de registro de presença dos alunos
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-primary-400 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors">
              Nova Chamada
            </button>
            <button className="px-6 py-3 bg-offwhite-200 hover:bg-offwhite-300 text-navy-800 font-medium rounded-lg transition-colors">
              Ver Histórico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
