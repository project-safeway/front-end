import React from "react";

export function Tabela({
    cabecalho = [],
    dados = [],
    fields = null,
    renderCell = null,
    renderActions = null,
    status = false,
    statusField = null
}) {
     return (
        <div className="w-full max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {cabecalho.map((item, index) => (
                            <th key={index} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {item}
                            </th>
                        ))}
                        {status && (
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        )}
                        {renderActions && (
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {dados.map((row, rowIndex) => {
                        const isObjectRow = fields && typeof row === "object" && !Array.isArray(row);
                        let cells = [];
                        let statusValue = null;

                        if (isObjectRow) {
                            cells = fields.map((key) => {
                                return renderCell ? renderCell(row, key) : row[key];
                            });
                            statusValue = statusField ? row[statusField] : null;
                        } else if (Array.isArray(row)) {
                            cells = row.slice(0, -1);
                            statusValue = row[row.length - 1];
                        }

                        return (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {cells.map((cell, cidx) => (
                                    <td key={cidx} className="px-4 py-3 text-sm text-center text-gray-700">
                                        {cell ?? "-"}
                                    </td>
                                ))}

                                {status && (
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className={
                                            `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                            ${statusValue === "PAGO" ? "bg-green-100 text-green-800" :
                                              statusValue === "PENDENTE" ? "bg-yellow-100 text-yellow-800" :
                                              statusValue === "ATRASADO" ? "bg-red-100 text-red-800" :
                                              "bg-gray-100 text-gray-800"}`
                                        }>
                                             {statusValue ?? "—"}
                                        </span>
                                    </td>
                                )}

                                {renderActions && (
                                    <td className="px-4 py-3 text-sm text-center">
                                        {renderActions(row)}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    {dados.length === 0 && (
                        <tr>
                            <td colSpan={cabecalho.length + (status ? 1 : 0) + (renderActions ? 1 : 0)} className="px-4 py-6 text-center text-sm text-gray-500">
                                Nenhum registro encontrado
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}