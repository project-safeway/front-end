export function Tabela({ cabecalho, dados, status = true }) {
    return (
        <div className="w-4/5 pr-10 pl-10 pb-15 mx-auto my-10 overflow-hidden rounded-4xl shadow-xl ">
        <table className="min-w-full ">
            <thead>
                <tr>
                    {cabecalho.map((item, index) => (
                        <th key={index} className="pt-10 pb-5 text-center border-b text-gray-500 border-gray-200 font-bold">
                            {item}
                        </th>
                    ))}
                    {status && 
                        <th className="pt-10 pb-5 text-center border-b text-gray-500 border-gray-200 font-bold">Status</th>}
                </tr>
            </thead>
            <tbody>
                {dados.map((linha, index) => {
                    const statusValue = linha[linha.length - 1];
                    return (
                        <tr key={index} className="hover:bg-gray-100">
                            {linha.slice(0, -1).map((celula, idx) => (
                                <td key={idx} className="p-4 text-center border-b border-gray-200">
                                    {celula}
                                </td>
                            ))}
                            {status && 
                                <td className="p-3 text-center w-0 border-b border-gray-200">
                                    <span className={`px-3 py-3 rounded-full font-bold shadow ${
                                        statusValue === "PRESENTE"
                                            ? "bg-green-600 text-white"
                                            : statusValue === "AUSENTE"
                                            ? "bg-red-600 text-white"
                                            : ""
                                    }`}>
                                        {statusValue}
                                    </span>
                                </td>}
                        </tr>
                    );
                })}
            </tbody>
        </table>
        </div>
    );
}