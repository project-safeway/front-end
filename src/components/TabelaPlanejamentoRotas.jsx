import PropTypes from "prop-types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

// Componente para cada item/linha da lista
function SortableItem({ item, index, onRemover }) {
  const isEscola = item.tipo === 'escola';
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:${isEscola ? 'bg-green-50' : 'bg-primary-50'}`}
    >
      {/* Coluna de Arrastar (agora com os listeners do dnd-kit) */}
      <td className="px-4 py-3" data-label="Arrastar">
        <button 
          {...attributes} 
          {...listeners}
          className="cursor-grab touch-none flex items-center justify-center w-full"
        >
          <DragIndicatorIcon className="text-gray-400" fontSize="small" />
        </button>
      </td>

      {/* Coluna de Ordem */}
      <td className="px-4 py-3" data-label="Ordem">
        <span className={`inline-flex items-center justify-center w-10 h-10 ${
          isEscola ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
        } rounded-full font-semibold text-base`}>
          {index + 1}º
        </span>
      </td>

      {/* Coluna de Nome */}
      <td className="px-4 py-3 text-sm text-left" data-label="Nome">
        <span className="text-gray-700 font-medium">{isEscola ? item.nome : item.nomeAluno}</span>
      </td>

      {/* Coluna de Informações */}
      <td className="px-4 py-3 text-sm text-left text-gray-600" data-label="Informações">
        {isEscola ? (
          <span>{item.cidade || '-'}</span>
        ) : (
          <div className="flex flex-col gap-1 text-right sm:text-left">
            <span className="text-xs"><strong>Escola:</strong> {item.escola || '-'}</span>
            <span className="text-xs"><strong>Resp.:</strong> {item.responsavel || '-'}</span>
          </div>
        )}
      </td>

      {/* Coluna de ações (remover) */}
      {onRemover && (
        <td className="px-4 py-3" data-label="Ações">
          <button
            onClick={() => onRemover(item.tipo, item.id)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title={`Remover ${isEscola ? 'escola' : 'aluno'} do itinerário`}
          >
            <DeleteIcon />
          </button>
        </td>
      )}
    </tr>
  );
}

SortableItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onRemover: PropTypes.func,
};


// Componente principal da Tabela
export function TabelaPlanejamentoRotas({ dados = [], onRemover }) {
  return (
    <>
      <style>
        {`
          @media (max-width: 640px) {
            .responsive-table thead { display: none; }
            .responsive-table tr {
              display: block;
              margin-bottom: 1rem;
              border: 1px solid #e5e7eb;
              border-radius: 0.75rem;
              padding: 0.5rem;
              box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            }
            .responsive-table td {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.75rem 0.5rem;
              border-bottom: 1px solid #f3f4f6;
            }
            .responsive-table td:last-child { border-bottom: none; }
            .responsive-table td::before {
              content: attr(data-label);
              font-weight: 600;
              margin-right: 1rem;
              color: #374151;
            }
            .responsive-table td[data-label="Arrastar"] {
              justify-content: center;
              background-color: #f9fafb;
              border-radius: 0.5rem;
              margin-bottom: 0.5rem;
            }
          }
        `}
      </style>
      <div className="w-full mx-auto overflow-x-auto rounded-2xl bg-white sm:shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 responsive-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Arrastar</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ordem</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Informações</th>
              {onRemover && <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dados.map((item, index) => (
              <SortableItem key={item.id} item={item} index={index} onRemover={onRemover} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

TabelaPlanejamentoRotas.propTypes = {
  dados: PropTypes.array.isRequired,
  onRemover: PropTypes.func,
};
