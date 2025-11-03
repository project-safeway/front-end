import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

export function TabelaEdicaoItinerario({
  cabecalho = [],
  dados = [],
  fields = null,
  onMover = null
}) {
  return (
    <div className="w-full mx-auto overflow-x-auto rounded-2xl shadow-lg bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {cabecalho.map((item, index) => (
              <th
                key={index}
                className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {item}
              </th>
            ))}
            <th className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ordem
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-primary-50 transition cursor-pointer"
            >
              {fields.map((key, cidx) => (
                <td
                  key={cidx}
                  className="px-4 py-3 text-sm text-center text-gray-700"
                >
                  {row[key] ?? "-"}
                </td>
              ))}

              {/* Coluna de ações para ordenar */}
              <td className="px-4 py-3 text-center flex justify-center gap-2">
                <button
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                  onClick={() => onMover && onMover(index, "up")}
                  title="Mover para cima"
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
                  title="Mover para baixo"
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
              </td>
            </tr>
          ))}

          {dados.length === 0 && (
            <tr>
              <td
                colSpan={cabecalho.length + 1}
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
