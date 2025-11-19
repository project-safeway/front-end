import PropTypes from "prop-types";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";

export function TabelaEdicaoItinerario({ 
  cabecalho = [], 
  dados = [], 
  fields = null, 
  onMover = null,
  onRemover = null 
}) {
  return (
    <div className="w-full mx-auto overflow-x-auto rounded-2xl shadow-lg bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {cabecalho.map((item, index) => (
              <th
                key={index}
                className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {item}
              </th>
            ))}
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ordem de Embarque
            </th>
            {onRemover && (
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((row, index) => (
            <tr
              key={row.id || index}
              className="hover:bg-primary-50 transition"
            >
              {fields.map((key, cidx) => (
                <td
                  key={cidx}
                  className="px-4 py-3 text-sm text-center text-gray-700"
                >
                  {row[key] ?? "-"}
                </td>
              ))}

              {/* Coluna de ordem com botões */}
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-semibold text-sm mr-2">
                    {index + 1}º
                  </span>
                  
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                    onClick={() => onMover && onMover(index, "up")}
                    title="Mover para cima (prioridade maior)"
                    disabled={index === 0}
                  >
                    <ArrowUpward
                      fontSize="small"
                      className={`${
                        index === 0 ? "text-gray-300" : "text-gray-600"
                      }`}
                    />
                  </button>

                  <button
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                    onClick={() => onMover && onMover(index, "down")}
                    title="Mover para baixo (prioridade menor)"
                    disabled={index === dados.length - 1}
                  >
                    <ArrowDownward
                      fontSize="small"
                      className={`${
                        index === dados.length - 1
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>
              </td>

              {/* Coluna de ações (remover) */}
              {onRemover && (
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onRemover(row.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Remover aluno do itinerário"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </td>
              )}
            </tr>
          ))}

          {dados.length === 0 && (
            <tr>
              <td
                colSpan={cabecalho.length + (onRemover ? 2 : 1)}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                Nenhum aluno encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

TabelaEdicaoItinerario.propTypes = {
  cabecalho: PropTypes.arrayOf(PropTypes.string).isRequired,
  dados: PropTypes.arrayOf(PropTypes.object).isRequired,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  onMover: PropTypes.func.isRequired,
  onRemover: PropTypes.func,
};