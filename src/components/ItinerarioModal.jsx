import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/Route";

export default function ItinerarioModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  itinerario 
}) {
  const [formData, setFormData] = useState({
    nome: "",
    transporteId: 1,
    horarioInicio: "",
    horarioFim: "",
    tipoViagem: "SO_IDA",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Horários sugeridos comuns
  const horariosComuns = [
    "06:00", "06:30", "07:00", "07:30", "08:00",
    "12:00", "12:30", "13:00", "13:30", "14:00",
    "17:00", "17:30", "18:00", "18:30", "19:00"
  ];

  useEffect(() => {
    if (itinerario) {
      setFormData({
        nome: itinerario.nome || "",
        transporteId: 1,
        horarioInicio: itinerario.horarioInicio || "",
        horarioFim: itinerario.horarioFim || "",
        tipoViagem: itinerario.tipoViagem || "SO_IDA",
      });
    } else {
      setFormData({
        nome: "",
        transporteId: 1,
        horarioInicio: "",
        horarioFim: "",
        tipoViagem: "SO_IDA",
      });
    }
    setErrors({});
  }, [itinerario, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleHorarioRapido = (campo, horario) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: horario,
    }));
    
    if (errors[campo]) {
      setErrors((prev) => ({ ...prev, [campo]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }
    
    if (!formData.horarioInicio) {
      newErrors.horarioInicio = "Horário de início é obrigatório";
    }
    
    if (!formData.horarioFim) {
      newErrors.horarioFim = "Horário de fim é obrigatório";
    }
    
    // Validar se horário de fim é maior que início
    if (formData.horarioInicio && formData.horarioFim) {
      if (formData.horarioFim <= formData.horarioInicio) {
        newErrors.horarioFim = "Horário de fim deve ser maior que o início";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar itinerário:", error);
      setErrors({ submit: error.message || "Erro ao salvar itinerário. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itinerario?.id) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o itinerário "${itinerario.nome}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await onDelete(itinerario.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao deletar itinerário:", error);
      setErrors({ submit: error.message || "Erro ao deletar itinerário. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    setFormData({
      nome: "",
      transporteId: 1,
      horarioInicio: "",
      horarioFim: "",
      tipoViagem: "SO_IDA",
    });
    setErrors({});
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
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-offwhite-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-400 rounded-lg">
              <DirectionsBusIcon className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-navy-900">
                {itinerario ? "Editar Itinerário" : "Novo Itinerário"}
              </h2>
              <p className="text-sm text-navy-600">
                {itinerario ? "Atualize as informações do itinerário" : "Preencha os dados do novo itinerário"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label htmlFor="nome" className="flex items-center gap-2 text-sm font-medium text-navy-700 mb-2">
                <RouteIcon fontSize="small" className="text-primary-400" />
                Nome do Itinerário *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all ${
                  errors.nome ? "border-red-400 bg-red-50" : "border-offwhite-300"
                }`}
                placeholder="Ex: Rota Centro - Matutino"
                disabled={isSubmitting}
                autoFocus
              />
              {errors.nome && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.nome}
                </p>
              )}
            </div>

            {/* Tipo de viagem */}
            <div className="md:col-span-2">
              <label htmlFor="tipoViagem" className="block text-sm font-medium text-navy-700 mb-2">
                Tipo de Viagem *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipoViagem: "SO_IDA" }))}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.tipoViagem === "SO_IDA"
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-offwhite-300 hover:border-primary-200"
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="font-semibold">🏫 Ida</div>
                  <div className="text-xs text-navy-600 mt-1">Para a escola</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipoViagem: "SO_VOLTA" }))}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.tipoViagem === "SO_VOLTA"
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-offwhite-300 hover:border-primary-200"
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="font-semibold">🏠 Volta</div>
                  <div className="text-xs text-navy-600 mt-1">Para casa</div>
                </button>
              </div>
            </div>
          </div>

          {/* Horários */}
          <div className="space-y-4 p-4 bg-offwhite-50 rounded-lg border border-offwhite-200">
            <div className="flex items-center gap-2 text-navy-700 font-medium">
              <AccessTimeIcon fontSize="small" className="text-primary-400" />
              Horários do Itinerário
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Horário Início */}
              <div>
                <label htmlFor="horarioInicio" className="block text-sm font-medium text-navy-700 mb-2">
                  Horário de Início *
                </label>
                <input
                  type="time"
                  id="horarioInicio"
                  name="horarioInicio"
                  value={formData.horarioInicio}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none text-lg font-mono ${
                    errors.horarioInicio ? "border-red-400 bg-red-50" : "border-offwhite-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.horarioInicio && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.horarioInicio}
                  </p>
                )}
                
                {/* Horários rápidos início */}
                <div className="mt-3">
                  <p className="text-xs text-navy-600 mb-2">Horários comuns:</p>
                  <div className="flex flex-wrap gap-2">
                    {horariosComuns.map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHorarioRapido('horarioInicio', h)}
                        className="px-3 py-1 text-xs border border-primary-200 rounded-md hover:bg-primary-50 hover:border-primary-400 transition-colors"
                        disabled={isSubmitting}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Horário Fim */}
              <div>
                <label htmlFor="horarioFim" className="block text-sm font-medium text-navy-700 mb-2">
                  Horário de Fim *
                </label>
                <input
                  type="time"
                  id="horarioFim"
                  name="horarioFim"
                  value={formData.horarioFim}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none text-lg font-mono ${
                    errors.horarioFim ? "border-red-400 bg-red-50" : "border-offwhite-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.horarioFim && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.horarioFim}
                  </p>
                )}
                
                {/* Horários rápidos fim */}
                <div className="mt-3">
                  <p className="text-xs text-navy-600 mb-2">Horários comuns:</p>
                  <div className="flex flex-wrap gap-2">
                    {horariosComuns.map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHorarioRapido('horarioFim', h)}
                        className="px-3 py-1 text-xs border border-primary-200 rounded-md hover:bg-primary-50 hover:border-primary-400 transition-colors"
                        disabled={isSubmitting}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Erro de submit */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-xl">❌</span>
              <div>
                <p className="font-medium text-red-900">Erro ao processar</p>
                <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-offwhite-200">
            {itinerario && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
              >
                <DeleteIcon fontSize="small" />
                Excluir
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border-2 border-offwhite-300 text-navy-700 rounded-lg hover:bg-offwhite-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg font-medium"
            >
              <SaveIcon fontSize="small" />
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

ItinerarioModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  itinerario: PropTypes.object,
};