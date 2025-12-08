import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import { listarMensalidades } from '../services/mensalidadeService'

export function PaymentsPanel({ selectedMonth, selectedYear }) {
    const navigate = useNavigate()
    const [mensalidades, setMensalidades] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadMensalidades()
    }, [selectedMonth, selectedYear])

    const loadMensalidades = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            // Calcula o primeiro e último dia do mês selecionado
            const primeiroDia = new Date(selectedYear, selectedMonth - 1, 1)
            const ultimoDia = new Date(selectedYear, selectedMonth, 0)
            
            const dataInicio = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
            const dataFim = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${ultimoDia.getDate()}`
            
            // Usa o mesmo endpoint que o Financeiro
            const params = {
                dataInicio,
                dataFim,
                size: 1000
            }
            
            const response = await listarMensalidades(params)
            const allMensalidades = response?.content || []
            
            setMensalidades(allMensalidades)
        } catch (err) {
            console.error('Erro ao carregar mensalidades:', err)
            setError('Não foi possível carregar os pagamentos')
            setMensalidades([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleCardClick = (status) => {
        if (totais[`quantidade${status === 'PENDENTE' ? 'Pendente' : status === 'ATRASADO' ? 'Atrasado' : 'Pago'}`] > 0) {
            navigate('/financeiro', { state: { filtroStatus: status } });
        }
    }

    // Calcula totais diretamente das mensalidades
    const calcularTotais = () => {
        const pendentes = mensalidades.filter(m => m.status === 'PENDENTE')
        const atrasados = mensalidades.filter(m => m.status === 'ATRASADO')
        const pagos = mensalidades.filter(m => m.status === 'PAGO')
        
        return {
            totalPendente: pendentes.reduce((sum, m) => sum + Number(m.valorMensalidade || 0), 0),
            totalAtrasado: atrasados.reduce((sum, m) => sum + Number(m.valorMensalidade || 0), 0),
            totalPago: pagos.reduce((sum, m) => sum + Number(m.valorMensalidade || 0), 0),
            quantidadePendente: pendentes.length,
            quantidadeAtrasado: atrasados.length,
            quantidadePago: pagos.length
        }
    }

    const totais = calcularTotais()

    const cards = [
        {
            title: 'Pendentes',
            status: 'PENDENTE',
            quantidade: totais.quantidadePendente,
            valor: totais.totalPendente,
            icon: <PendingIcon className="text-yellow-500" fontSize="large" />,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-300',
            textColor: 'text-yellow-700',
            hoverBg: 'hover:bg-yellow-100'
        },
        {
            title: 'Em Atraso',
            status: 'ATRASADO',
            quantidade: totais.quantidadeAtrasado,
            valor: totais.totalAtrasado,
            icon: <WarningIcon className="text-red-500" fontSize="large" />,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-300',
            textColor: 'text-red-700',
            hoverBg: 'hover:bg-red-100'
        },
        {
            title: 'Pagos',
            status: 'PAGO',
            quantidade: totais.quantidadePago,
            valor: totais.totalPago,
            icon: <CheckCircleIcon className="text-green-500" fontSize="large" />,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-300',
            textColor: 'text-green-700',
            hoverBg: 'hover:bg-green-100'
        }
    ]

    const mesNome = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <>
            <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 h-full flex flex-col">
                <div className="mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-navy-900">Status no Mês</h3>
                    </div>
                    <p className="text-xs text-navy-500 mt-1">{mesNome}</p>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-400 border-t-transparent"></div>
                            <p className="text-navy-600 text-sm mt-2">Carregando pagamentos...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                            <button
                                onClick={loadMensalidades}
                                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col space-y-3">
                        {cards.map((card) => (
                            <div
                                key={card.status}
                                onClick={() => handleCardClick(card.status)}
                                className={`${card.bgColor} border-2 ${card.borderColor} rounded-lg p-3 ${card.hoverBg} transition-all ${card.quantidade > 0 ? 'cursor-pointer hover:shadow-md' : 'opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        {card.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-navy-900 text-sm mb-1">{card.title}</h4>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-xl font-bold text-navy-900">
                                                {card.quantidade}
                                            </p>
                                            <p className="text-xs text-navy-600">
                                                {card.quantidade === 1 ? 'aluno' : 'alunos'}
                                            </p>
                                        </div>
                                        <p className={`text-sm font-semibold ${card.textColor} mt-1`}>
                                            R$ {card.valor.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                {card.quantidade > 0 && (
                                    <p className="text-xs text-navy-500 mt-2 text-center">
                                        Clique para ir ao Financeiro
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}