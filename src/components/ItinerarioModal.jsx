import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ItinerarioModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  itinerario 
}) {
  const [formData, setFormData] = useState({
    nome: "",
    horarioInicio: "",
    horarioFim: "",
    tipoViagem: "Ida",
    ativo: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itinerario) {
      setFormData({
        nome: itinerario.nome || "",
        horarioInicio: itinerario.horarioInicio || "",
        horarioFim: itinerario.horarioFim || "",
        tipoViagem: itinerario.tipoViagem || "Ida",
        ativo: itinerario.ativo ?? true,
      });
    } else {
      setFormData({
        nome: "",
        horarioInicio: "",
        horarioFim: "",
        tipoViagem: "Ida",
        ativo: true,
      });
    }
  }, [itinerario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.horarioInicio) newErrors.horarioInicio = "Horário de início é obrigatório";
    if (!formData.horarioFim) newErrors.horarioFim = "Horário de fim é obrigatório";
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
      setErrors({ submit: "Erro ao salvar itinerário. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itinerario?.id) return;
    const confirmed = window.confirm("Tem certeza que deseja excluir este itinerário?");
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await onDelete(itinerario.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao deletar itinerário:", error);
      setErrors({ submit: "Erro ao deletar itinerário. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      horarioInicio: "",
      horarioFim: "",
      tipoViagem: "Ida",
      ativo: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-offwhite-200">
          <h2 className="text-xl font-semibold text-navy-900">
            {itinerario ? "Editar Itinerário" : "Novo Itinerário"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-offwhite-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <CloseIcon className="text-navy-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-navy-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none ${
                errors.nome ? "border-red-400" : "border-offwhite-300"
              }`}
              placeholder="Ex: Itinerário Centro"
              disabled={isSubmitting}
            />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </div>

          {/* Horário início */}
          <div>
            <label htmlFor="horarioInicio" className="block text-sm font-medium text-navy-700 mb-1">
              Horário de Início *
            </label>
            <input
              type="time"
              id="horarioInicio"
              name="horarioInicio"
              value={formData.horarioInicio}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none ${
                errors.horarioInicio ? "border-red-400" : "border-offwhite-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.horarioInicio && <p className="text-xs text-red-600 mt-1">{errors.horarioInicio}</p>}
          </div>

          {/* Horário fim */}
          <div>
            <label htmlFor="horarioFim" className="block text-sm font-medium text-navy-700 mb-1">
              Horário de Fim *
            </label>
            <input
              type="time"
              id="horarioFim"
              name="horarioFim"
              value={formData.horarioFim}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none ${
                errors.horarioFim ? "border-red-400" : "border-offwhite-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.horarioFim && <p className="text-xs text-red-600 mt-1">{errors.horarioFim}</p>}
          </div>

          {/* Tipo de viagem */}
          <div>
            <label htmlFor="tipoViagem" className="block text-sm font-medium text-navy-700 mb-1">
              Tipo de Viagem
            </label>
            <select
              id="tipoViagem"
              name="tipoViagem"
              value={formData.tipoViagem}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
              disabled={isSubmitting}
            >
              <option value="Ida">Ida</option>
              <option value="Volta">Volta</option>
            </select>
          </div>

          {/* Erro de submit */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            {itinerario && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-4 py-2 border border-offwhite-300 text-navy-700 rounded-lg hover:bg-offwhite-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon fontSize="small" />
              {isSubmitting ? "Salvando..." : "Salvar"}
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
