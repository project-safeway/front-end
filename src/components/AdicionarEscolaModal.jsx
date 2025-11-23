import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import escolasService from "../services/escolasService";

export default function AdicionarEscolaModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  escolasDisponiveis,
  escolasJaAdicionadas 
}) {
  const [busca, setBusca] = useState("");
  const [escolaSelecionada, setEscolaSelecionada] = useState(null);
  const [enderecoEscola, setEnderecoEscola] = useState(null);
  const [isLoadingEndereco, setIsLoadingEndereco] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar escolas que já estão no itinerário
  const escolasFiltradas = escolasDisponiveis
    .filter(escola => !escolasJaAdicionadas.some(e => e.id === escola.id))
    .filter(escola => 
      escola.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      escola.cidade?.toLowerCase().includes(busca.toLowerCase())
    );

  useEffect(() => {
    if (!isOpen) {
      setBusca("");
      setEscolaSelecionada(null);
      setEnderecoEscola(null);
    }
  }, [isOpen]);

  // Buscar endereço quando uma escola for selecionada
  useEffect(() => {
    if (escolaSelecionada) {
      carregarEnderecoEscola(escolaSelecionada.id);
    } else {
      setEnderecoEscola(null);
    }
  }, [escolaSelecionada]);

  const carregarEnderecoEscola = async (escolaId) => {
    setIsLoadingEndereco(true);
    try {
      const endereco = await escolasService.getEnderecoEscola(escolaId);
      setEnderecoEscola(endereco);
    } catch (error) {
      console.error("Erro ao carregar endereço da escola:", error);
      setEnderecoEscola(null);
    } finally {
      setIsLoadingEndereco(false);
    }
  };

  const handleAdd = async () => {
    if (!escolaSelecionada || !enderecoEscola) return;

    setIsSubmitting(true);
    try {
      await onAdd(escolaSelecionada, enderecoEscola);
      handleClose();
    } catch (error) {
      console.error("Erro ao adicionar escola:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setBusca("");
    setEscolaSelecionada(null);
    setEnderecoEscola(null);
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
        <div className="flex justify-between items-center p-6 border-b border-offwhite-200 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <SchoolIcon className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-navy-900">
                Adicionar Escola ao Itinerário
              </h2>
              <p className="text-sm text-navy-600">
                Selecione uma escola disponível
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
              placeholder="Buscar por nome ou cidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Lista de Escolas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {escolasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <SchoolIcon className="text-navy-300 text-6xl mx-auto mb-4" />
              <p className="text-navy-600 mb-2">
                {"Nenhuma escola encontrada"}
              </p>
              <p className="text-sm text-navy-500">
                {busca ? "Tente buscar por outro termo" : "Não há mais escolas disponíveis"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {escolasFiltradas.map((escola) => (
                <button
                  key={escola.id}
                  type="button"
                  onClick={() => setEscolaSelecionada(escola)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    escolaSelecionada?.id === escola.id
                      ? "border-green-500 bg-green-50"
                      : "border-offwhite-300 hover:border-green-300 hover:bg-offwhite-50"
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-navy-900">
                          {escola.nome}
                        </h3>
                        {escolaSelecionada?.id === escola.id && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                            Selecionada
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-navy-600">
                        {escola.cidade && (
                          <div className="flex items-center gap-2">
                            <LocationOnIcon fontSize="small" className="text-green-500" />
                            <span>{escola.cidade}</span>
                          </div>
                        )}
                        {escola.telefone && (
                          <div>
                            <span className="font-medium">Telefone:</span> {escola.telefone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Endereço da Escola Selecionada */}
          {escolaSelecionada && (
            <div className="mt-6 pt-6 border-t-2 border-offwhite-200">
              <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <LocationOnIcon className="text-green-500" />
                Endereço da Escola
              </h3>
              
              {isLoadingEndereco ? (
                <div className="text-center py-8">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
                  <p className="text-navy-600 mt-2">Carregando endereço...</p>
                </div>
              ) : !enderecoEscola ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
                  <p className="text-yellow-800 font-medium">
                    Nenhum endereço cadastrado para esta escola
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Cadastre um endereço antes de adicionar ao itinerário
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="font-medium text-navy-900">
                    {enderecoEscola.logradouro}, {enderecoEscola.numero}
                  </p>
                  <p className="text-sm text-navy-600 mt-1">
                    {enderecoEscola.bairro} - {enderecoEscola.cidade}/{enderecoEscola.estado}
                  </p>
                  {enderecoEscola.complemento && (
                    <p className="text-xs text-navy-500 mt-1">
                      {enderecoEscola.complemento}
                    </p>
                  )}
                  {enderecoEscola.cep && (
                    <p className="text-xs text-navy-500 mt-1">
                      CEP: {enderecoEscola.cep}
                    </p>
                  )}
                </div>
              )}
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
            disabled={!escolaSelecionada || !enderecoEscola || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg font-medium"
          >
            <AddLocationIcon fontSize="small" />
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Adicionando...
              </>
            ) : (
              'Adicionar Escola'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

AdicionarEscolaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  escolasDisponiveis: PropTypes.array.isRequired,
  escolasJaAdicionadas: PropTypes.array.isRequired,
};
