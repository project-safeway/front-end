import PropTypes from "prop-types";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export function TabelaPlanejamentoRotas({ 
  dados = [], 
  onMover = null,
  onRemover = null,
  onReordenar = null // Nova prop para reordenação por drag and drop
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      // Chamar callback de reordenação se fornecido
      if (onReordenar) {
        onReordenar(draggedIndex, dropIndex);
      }
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full mx-auto overflow-x-auto rounded-2xl shadow-lg bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Arrastar
            </th>
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ordem
            </th>
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Informações
            </th>
            {onRemover && (
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item, index) => {
            const isEscola = item.tipo === 'escola';
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            
            return (
              <tr
                key={`${item.tipo}-${item.id}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  ${isDragging ? 'opacity-70 bg-blue-50' : 'opacity-100'}
                  ${isDragOver ? 'border-t-4 border-primary-500 bg-primary-50' : ''}
                  hover:${isEscola ? 'bg-green-50' : 'bg-primary-50'} 
                  transition-all
                `}
              >
                {/* Coluna de Arrastar */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <DragIndicatorIcon className="text-gray-400" fontSize="small" />
                  </div>
                </td>

                {/* Coluna de Ordem */}
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center w-10 h-10 ${
                    isEscola ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                  } rounded-full font-semibold text-base`}>
                    {index + 1}º
                  </span>
                </td>

                {/* Coluna de Nome */}
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    {isEscola ? (
                      <span className="text-gray-700 font-medium">{item.nome}</span>
                    ) : (
                      <span className="text-gray-700 font-medium">{item.nomeAluno}</span>
                    )}
                  </div>
                </td>

                {/* Coluna de Informações */}
                <td className="px-4 py-3 text-sm text-center text-gray-600">
                  {isEscola ? (
                    <span>{item.cidade || '-'}</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">
                        <strong>Escola:</strong> {item.escola || '-'}
                      </span>
                      <span className="text-xs">
                        <strong>Resp.:</strong> {item.responsavel || '-'}
                      </span>
                    </div>
                  )}
                </td>

                {/* Coluna de ações (remover) */}
                {onRemover && (
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onRemover(item.tipo, item.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title={`Remover ${isEscola ? 'escola' : 'aluno'} do itinerário`}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}

          {dados.length === 0 && (
            <tr>
              <td
                colSpan={onRemover ? 5 : 4}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                Nenhum aluno ou escola adicionado ao trajeto
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

TabelaPlanejamentoRotas.propTypes = {
  dados: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemover: PropTypes.func,
  onReordenar: PropTypes.func,
};
