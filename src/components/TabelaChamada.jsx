import PropTypes from "prop-types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export function TabelaChamada({ alunos, onRowClick, alunoAtualId }) {
  const getStatusBadge = (presente) => {
    if (presente === true) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-lg">
          <CheckCircleIcon fontSize="small" />
          Presente
        </span>
      );
    }
    if (presente === false) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-lg">
          <CancelIcon fontSize="small" />
          Ausente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gray-400 text-white rounded-lg">
        <HelpOutlineIcon fontSize="small" />
        Não registrado
      </span>
    );
  };

  return (
    <div className="w-full mx-auto overflow-x-auto rounded-2xl shadow-lg bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ordem
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome do Aluno
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Escola
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Responsável
            </th>
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alunos.map((aluno, index) => {
            const isAlunoAtual = aluno.id === alunoAtualId;
            return (
              <tr
                key={aluno.id}
                onClick={() => onRowClick && onRowClick(aluno, index)}
                className={`transition cursor-pointer ${
                  isAlunoAtual
                    ? "bg-primary-100 hover:bg-primary-150"
                    : "hover:bg-primary-50"
                }`}
              >
                <td className="px-4 py-3 text-sm text-center">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                      isAlunoAtual
                        ? "bg-primary-400 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {aluno.ordemEmbarque}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {aluno.nomeAluno}
                  {isAlunoAtual && (
                    <span className="ml-2 text-xs text-primary-600 font-semibold">
                      (Atual)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {aluno.escola || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {aluno.responsavel || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(aluno.presente)}
                </td>
              </tr>
            );
          })}
          {alunos.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                Nenhum aluno encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Resumo na parte inferior */}
      {alunos.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-navy-900 font-bold">{alunos.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon fontSize="small" className="text-green-600" />
              <span className="font-semibold text-gray-700">Presentes:</span>
              <span className="text-green-600 font-bold">
                {alunos.filter((a) => a.presente === true).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CancelIcon fontSize="small" className="text-red-600" />
              <span className="font-semibold text-gray-700">Ausentes:</span>
              <span className="text-red-600 font-bold">
                {alunos.filter((a) => a.presente === false).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HelpOutlineIcon fontSize="small" className="text-gray-500" />
              <span className="font-semibold text-gray-700">
                Não registrados:
              </span>
              <span className="text-gray-600 font-bold">
                {alunos.filter((a) => a.presente === null).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

TabelaChamada.propTypes = {
  alunos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nomeAluno: PropTypes.string.isRequired,
      escola: PropTypes.string,
      responsavel: PropTypes.string,
      ordemEmbarque: PropTypes.number,
      presente: PropTypes.bool,
    })
  ).isRequired,
  onRowClick: PropTypes.func,
  alunoAtualId: PropTypes.number,
};