export function CardChamada({ aluno, onPresente, onAusente, onProximo }) {
    return (
        <div className="flex flex-row justify-between items-center bg-white rounded-xl shadow-md px-8 py-8 text-center border border-offwhite-200">
            <div className="flex flex-col items-center mr-8">
                <h3 className="text-2xl font-bold text-navy-900 mb-1">{aluno.nomeAluno}</h3>
                <p className="text-navy-700 mb-1">
                    <span className="font-semibold">Responsável:</span> {aluno.responsavel}
                </p>
                <p className="text-navy-700 mb-1">
                    <span className="font-semibold">Escola:</span> {aluno.escola}
                </p>
                <p className="text-navy-700 mb-4">
                    <span className="font-semibold">Sala:</span> {aluno.sala}
                </p>
            </div>

            <div className="flex flex-col items-center">

                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                    <button onClick={onAusente} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                        Ausente
                    </button>
                    <button onClick={onPresente} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                        Presente
                    </button>
                </div>

                <button
                    onClick={onProximo}
                    className="mt-6 w-full max-w-md py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                >
                    Próximo Aluno
                </button>
            </div>
        </div>
    )
}
