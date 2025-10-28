export function Tabela({
  cabecalho = [],
  dados = [],
  fields = null,
  renderCell = null,
  renderActions = null,
  status = false,
  statusField = null,
  onRowClick = null
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
            {status && (
              <th className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            )}
            {renderActions && (
              <th className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((row, rowIndex) => {
            const isObjectRow = fields && typeof row === "object" && !Array.isArray(row)
            let cells = []
            let statusValue = null

            if (isObjectRow) {
              cells = fields.map((key) => {
                return renderCell ? renderCell(row, key) : row[key]
              })
              statusValue = statusField ? row[statusField] : null
            } else if (Array.isArray(row)) {
              cells = row.slice(0, -1)
              statusValue = row[row.length - 1]
            }

            const getStatusBadge = (value) => {
              if (typeof value === "boolean") {
                return value ? (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-lg">
                    Presente
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-lg">
                    Ausente
                  </span>
                )
              }

              const map = {
                PAGO: "bg-green-100 text-green-800",
                PENDENTE: "bg-yellow-100 text-yellow-800",
                ATRASADO: "bg-red-100 text-red-800",
                DEFAULT: "bg-gray-100 text-gray-800"
              }
              const style = map[value] || map.DEFAULT
              return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
                  {value ?? "—"}
                </span>
              )
            }

            return (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
                className={`hover:bg-gray-50 cursor-pointer transition ${
                  onRowClick ? "hover:bg-primary-50" : ""
                }`}
              >
                {cells.map((cell, cidx) => (
                  <td key={cidx} className="px-4 py-3 text-sm text-center text-gray-700 sm:px-4 sm:py-3">
                    {cell ?? "-"}
                  </td>
                ))}

                {status && (
                  <td className="px-4 py-3 text-sm text-center">
                    {getStatusBadge(statusValue)}
                  </td>
                )}

                {renderActions && (
                  <td className="px-4 py-3 text-sm text-center">{renderActions(row)}</td>
                )}
              </tr>
            )
          })}

          {dados.length === 0 && (
            <tr>
              <td
                colSpan={cabecalho.length + (status ? 1 : 0) + (renderActions ? 1 : 0)}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                Nenhum registro encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
