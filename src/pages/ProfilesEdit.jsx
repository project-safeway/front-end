// ProfilesEdit.jsx
import React from "react";

export default function ProfilesEdit() {
  return (
    <div className="container mx-auto mt-4 pb-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <div className="md:w-1/4 w-full">
          <div className="bg-white rounded shadow p-4 mb-6">
            {/* MiniCardProfile */}
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              MiniCardProfile
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            {/* UserRequestsCard */}
            <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              UserRequestsCard
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="md:w-3/4 w-full flex flex-col gap-4">
          {/* Dados Pessoais */}
          <div className="bg-white rounded shadow px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Dados Pessoais</span>
              <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2" disabled>
                <span className="material-icons text-base">edit</span>
                Editar
              </button>
            </div>
            <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              ProfilePersonalData
            </div>
          </div>
          {/* Endereço */}
          <div className="bg-white rounded shadow px-6 py-4">
            <div className="flex items-center mb-4">
              <span className="font-semibold text-lg">Endereço</span>
              <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2" disabled>
                <span className="material-icons text-base">add_circle_outline</span>
                Novo Endereço
              </button>
            </div>
            <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              ProfileAddress
            </div>
          </div>
          {/* Contato */}
          <div className="bg-white rounded shadow px-6 py-4">
            <div className="flex items-center mb-4">
              <span className="font-semibold text-lg">Contato</span>
              <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2" disabled>
                <span className="material-icons text-base">add_circle_outline</span>
                Novo Contato
              </button>
            </div>
            <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              ProfileContact
            </div>
          </div>
          {/* Dados Bancários */}
          <div className="bg-white rounded shadow px-6 py-4">
            <div className="flex items-center mb-4">
              <span className="font-semibold text-lg">Dados Bancários</span>
              <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2" disabled>
                <span className="material-icons text-base">add_circle_outline</span>
                Novo Dado Bancário
              </button>
            </div>
            <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              ProfileBankData
            </div>
          </div>
          {/* Botões de ação */}
          <div className="flex justify-end gap-3 mt-6">
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50" disabled>
              Cancelar
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}