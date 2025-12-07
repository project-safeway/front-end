import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import CloseIcon from '@mui/icons-material/Close'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import { showSwal } from '../utils/swal.jsx'

export default function TransacaoModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  transacao = null,
  categorias = [],
}) {
  const [formData, setFormData] = useState({
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    aluno: '',
    status: 'pendente',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (transacao) {
      setFormData({
        tipo: transacao.tipo || 'receita',
        categoria: transacao.categoria || '',
        descricao: transacao.descricao || '',
        valor: transacao.valor?.toString() || '',
        data: transacao.data || new Date().toISOString().split('T')[0],
        aluno: transacao.aluno || '',
        status: transacao.status || 'pendente',
      })
    } else {
      setFormData({
        tipo: 'receita',
        categoria: '',
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        aluno: '',
        status: 'pendente',
      })
    }
    setErrors({})
  }, [transacao, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpa erro do campo ao editar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório'
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória'
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória'
    }

    if (!formData.valor || isNaN(formData.valor) || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero'
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória'
    }

    if (formData.tipo === 'receita' && !formData.aluno?.trim()) {
      newErrors.aluno = 'Aluno é obrigatório para receitas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const transacaoData = {
        ...formData,
        valor: parseFloat(formData.valor),
      }

      await onSave(transacaoData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      setErrors({ submit: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
          const result = await showSwal({
            title: 'Excluir transação',
            text: 'Tem certeza que deseja excluir esta transação?',
            icon: 'warning',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
          });
          if (!result.isConfirmed) return;

    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setIsSubmitting(true)
      try {
        await onDelete(transacao.id)
        onClose()
      } catch (error) {
        console.error('Erro ao deletar transação:', error)
        setErrors({ submit: 'Erro ao deletar. Tente novamente.' })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  const categoriasFiltradas = categorias.filter(
    (cat) => cat.tipo === formData.tipo || cat.tipo === 'ambos'
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-offwhite-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <AttachMoneyIcon className="text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900">
                {transacao ? 'Editar Transação' : 'Nova Transação'}
              </h2>
              <p className="text-sm text-navy-600">
                {transacao ? 'Atualize os dados da transação' : 'Registre uma nova entrada ou saída'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-offwhite-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <CloseIcon className="text-navy-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-2">
              Tipo de Transação *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'tipo', value: 'receita' } })}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  formData.tipo === 'receita'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-offwhite-200 bg-offwhite-50 text-navy-600 hover:border-offwhite-300'
                }`}
              >
                <TrendingUpIcon />
                <span className="font-medium">Receita</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'tipo', value: 'despesa' } })}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  formData.tipo === 'despesa'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-offwhite-200 bg-offwhite-50 text-navy-600 hover:border-offwhite-300'
                }`}
              >
                <TrendingDownIcon />
                <span className="font-medium">Despesa</span>
              </button>
            </div>
            {errors.tipo && <p className="text-sm text-red-500 mt-1">{errors.tipo}</p>}
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Categoria *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {categoriasFiltradas.map((cat) => (
                  <option key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              {errors.categoria && <p className="text-sm text-red-500 mt-1">{errors.categoria}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="pendente">Pendente</option>
                <option value={formData.tipo === 'receita' ? 'recebido' : 'pago'}>
                  {formData.tipo === 'receita' ? 'Recebido' : 'Pago'}
                </option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Ex: Mensalidade João Silva - Outubro"
              className="w-full px-4 py-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            {errors.descricao && <p className="text-sm text-red-500 mt-1">{errors.descricao}</p>}
          </div>

          {/* Aluno (apenas para receitas) */}
          {formData.tipo === 'receita' && (
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Aluno *
              </label>
              <input
                type="text"
                name="aluno"
                value={formData.aluno}
                onChange={handleChange}
                placeholder="Nome do aluno"
                className="w-full px-4 py-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              {errors.aluno && <p className="text-sm text-red-500 mt-1">{errors.aluno}</p>}
            </div>
          )}

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              {errors.valor && <p className="text-sm text-red-500 mt-1">{errors.valor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Data *
              </label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              {errors.data && <p className="text-sm text-red-500 mt-1">{errors.data}</p>}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-offwhite-200">
            <div>
              {transacao && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Excluir
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-offwhite-300 hover:bg-offwhite-100 text-navy-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : transacao ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

TransacaoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  transacao: PropTypes.object,
  categorias: PropTypes.array,
}
