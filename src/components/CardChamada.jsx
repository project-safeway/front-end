import React from "react";

export function CardChamada({ aluno }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col w-full max-w-2xl mx-auto m-8">
            <div className="flex flex-row items-center w-full gap-6">
                
                <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-400">
                        <img src={aluno?.foto || "/vite.svg"} alt={aluno?.nome || "Foto do aluno"} className="w-full h-full object-cover" />
                    </div>
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-blue-950 mb-1 truncate">{aluno?.nome || "NOME"}</h3>
                    <p className="text-gray-700 truncate"><span className="font-bold">Responsável:</span> {aluno?.responsavel || "RESPONSÁVEL"}</p>
                    <p className="text-gray-700 truncate"><span className="font-bold">Escola:</span> {aluno?.escola || "ESCOLA"}</p>
                    <p className="text-gray-700"><span className="font-bold">Sala:</span> {aluno?.sala || "SALA"}</p>
                    <p className="text-gray-700"><span className="font-bold">Turma:</span> {aluno?.turma || "TURMA"}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2 justify-center">
                    <div className="flex gap-2">
                        <button className="px-4 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer text-base font-bold flex items-center justify-center">AUSENTE</button>
                        <button className="px-4 py-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer text-base font-bold flex items-center justify-center">PRESENTE</button>
                    </div>
                    <button className="w-full py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 transition cursor-pointer text-base mt-2">PRÓXIMA CRIANÇA</button>
                </div>
            </div>
            
            
        </div>
    );
}
