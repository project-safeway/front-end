import React from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';

export function ModalConfirmacao({ 
  aberto, 
  onFechar, 
  onConfirmar, 
  titulo, 
  mensagem, 
  tipo = 'warning' 
}) {
  if (!aberto) return null;

  const cores = {
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    danger: 'bg-red-100 text-red-800 border-red-300',
    success: 'bg-green-100 text-green-800 border-green-300'
  };

  const icones = {
    warning: <WarningIcon className="text-yellow-600" fontSize="large" />,
    danger: <WarningIcon className="text-red-600" fontSize="large" />,
    success: <CheckCircleIcon className="text-green-600" fontSize="large" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onFechar} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 z-10 animate-fadeIn">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-full ${cores[tipo]} border-2`}>
            {icones[tipo]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {titulo}
            </h3>
            <p className="text-sm text-gray-600">
              {mensagem}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onFechar}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <ClearIcon fontSize="small" />
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              tipo === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : tipo === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <CheckCircleIcon fontSize="small" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}