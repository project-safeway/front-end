import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";

export default function AdicionarAlunoModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  alunosDisponiveis,
  alunosJaAdicionados 
}) {
  const [busca, setBusca] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar alunos que já estão no itinerário
  const alunosFiltrados = alunosDisponiveis
    .filter(aluno => !alunosJaAdicionados.some(a => a.id === aluno.id))
    .filter(aluno => 
      aluno.nomeAluno.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.escola?.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.responsavel?.toLowerCase().includes(busca.toLowerCase())
    );

  useEffect(() => {
    if (!isOpen) {
      setBusca("");
      setAlunoSelecionado(null);
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!alunoSelecionado) return;

    setIsSubmitting(true);
    try {
      await onAdd(alunoSelecionado);
      handleClose();
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setBusca("");
    setAlunoSelecionado(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-offwhite-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-400 rounded-lg">
              <PersonAddIcon className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-navy-900">
                Adicionar Aluno ao Itinerário
              </h2>
              <p className="text-sm text-navy-600">
                Selecione um aluno disponível
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            disabled={isSubmitting}
            title="Fechar"
          >
            <CloseIcon className="text-navy-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-offwhite-200">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Buscar por nome, escola ou responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Lista de Alunos */}
        <div className="flex-1 overflow-y-auto p-6">
          {alunosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <SchoolIcon className="text-navy-300 text-6xl mx-auto mb-4" />
              <p className="text-navy-600 mb-2">
                {"Nenhum aluno encontrado"}
              </p>
              <p className="text-sm text-navy-500">
                {busca ? "Tente buscar por outro termo" : "Não há mais alunos disponíveis"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alunosFiltrados.map((aluno) => (
                <button
                  key={aluno.id}
                  type="button"
                  onClick={() => setAlunoSelecionado(aluno)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    alunoSelecionado?.id === aluno.id
                      ? "border-primary-400 bg-primary-50"
                      : "border-offwhite-300 hover:border-primary-200 hover:bg-offwhite-50"
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-navy-900">
                          {aluno.nomeAluno}
                        </h3>
                        {alunoSelecionado?.id === aluno.id && (
                          <span className="px-2 py-0.5 bg-primary-400 text-white text-xs rounded-full">
                            Selecionado
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-navy-600">
                        {aluno.escola && (
                          <div className="flex items-center gap-2">
                            <SchoolIcon fontSize="small" className="text-primary-400" />
                            <span>{aluno.escola}</span>
                          </div>
                        )}
                        {aluno.responsavel && (
                          <div>
                            <span className="font-medium">Responsável:</span> {aluno.responsavel}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-offwhite-200 bg-offwhite-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-2.5 border-2 border-offwhite-300 text-navy-700 rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!alunoSelecionado || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg font-medium"
          >
            <PersonAddIcon fontSize="small" />
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Adicionando...
              </>
            ) : (
              'Adicionar Aluno'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

AdicionarAlunoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  alunosDisponiveis: PropTypes.array.isRequired,
  alunosJaAdicionados: PropTypes.array.isRequired,
};