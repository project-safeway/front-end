import PropTypes from "prop-types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export function CardChamada({
  aluno,
  indiceAtual,
  totalAlunos,
  onPresente,
  onAusente,
  onProximo,
  isUltimoAluno = false,
}) {
  const jaRegistrado = aluno.presente !== null;

  return (
    <div className="bg-white rounded-xl shadow-lg px-8 py-8 border border-offwhite-200">
      {/* Indicador de progresso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-navy-600">
            Aluno {indiceAtual + 1} de {totalAlunos}
          </span>
          <span className="text-sm text-navy-500">
            {aluno.ordemEmbarque}º na ordem de embarque
          </span>
        </div>
        <div className="w-full bg-offwhite-200 rounded-full h-2">
          <div
            className="bg-primary-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((indiceAtual + 1) / totalAlunos) * 100}%` }}
          />
        </div>
      </div>

      {/* Informações do aluno */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-navy-900 mb-4">
            {aluno.nomeAluno}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-navy-700">
            <div>
              <span className="font-semibold text-navy-900">Responsável:</span>
              <p className="text-navy-600">{aluno.responsavel}</p>
            </div>
            <div>
              <span className="font-semibold text-navy-900">Escola:</span>
              <p className="text-navy-600">{aluno.escola}</p>
            </div>
            {aluno.sala && (
              <div>
                <span className="font-semibold text-navy-900">Sala:</span>
                <p className="text-navy-600">{aluno.sala}</p>
              </div>
            )}
          </div>

          {/* Status já registrado */}
          {jaRegistrado && (
            <div className="mt-4">
              {aluno.presente ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircleIcon fontSize="small" />
                  <span className="font-medium">Já marcado como PRESENTE</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                  <CancelIcon fontSize="small" />
                  <span className="font-medium">Já marcado como AUSENTE</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[280px]">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onAusente}
              disabled={jaRegistrado && !aluno.presente}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              <CancelIcon fontSize="small" />
              Ausente
            </button>
            <button
              onClick={onPresente}
              disabled={jaRegistrado && aluno.presente}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              <CheckCircleIcon fontSize="small" />
              Presente
            </button>
          </div>

          {!isUltimoAluno && (
            <button
              onClick={onProximo}
              className="flex items-center justify-center gap-2 w-full py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-all hover:shadow-lg"
            >
              Próximo Aluno
              <NavigateNextIcon fontSize="small" />
            </button>
          )}

          {isUltimoAluno && (
            <div className="text-center py-2 text-sm text-navy-600 font-medium bg-primary-50 rounded-lg">
              Último aluno da lista
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

CardChamada.propTypes = {
  aluno: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nomeAluno: PropTypes.string.isRequired,
    responsavel: PropTypes.string,
    escola: PropTypes.string,
    sala: PropTypes.string,
    ordemEmbarque: PropTypes.number,
    presente: PropTypes.bool,
  }).isRequired,
  indiceAtual: PropTypes.number.isRequired,
  totalAlunos: PropTypes.number.isRequired,
  onPresente: PropTypes.func.isRequired,
  onAusente: PropTypes.func.isRequired,
  onProximo: PropTypes.func.isRequired,
  isUltimoAluno: PropTypes.bool,
};