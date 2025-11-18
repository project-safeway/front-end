import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { TabelaEdicaoItinerario } from "../components/TabelaEdicaoItinerario";
import { Botao } from "../components/Botao";
import AdicionarAlunoModal from "../components/AdicionarAlunoModal";
import ItinerarioService from '../services/itinerarioService';
import TransporteService from '../services/transporteService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EdicaoItinerario() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const itinerarioId = Number(searchParams.get("itinerarioId"));

    const [itinerario, setItinerario] = useState(null);
    const [alunosItinerario, setAlunosItinerario] = useState([]);
    const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        carregarDados();
    }, [itinerarioId]);

    const carregarDados = async () => {
        setIsLoading(true);
        try {
            // Carregar todos os alunos do transporte primeiro (para ter os dados completos)
            const alunosTransporte = await TransporteService.listarAlunos(1);
            console.log('[EdicaoItinerario] Alunos disponíveis:', alunosTransporte);
            setAlunosDisponiveis(alunosTransporte);

            // Carregar itinerário
            const itinerarioData = await ItinerarioService.buscarPorId(itinerarioId);
            console.log('[EdicaoItinerario] Dados do itinerário:', itinerarioData);
            setItinerario(itinerarioData);

            // Carregar alunos do itinerário
            if (itinerarioData.alunos && itinerarioData.alunos.length > 0) {
                console.log('[EdicaoItinerario] Alunos raw do backend:', itinerarioData.alunos);
                
                const alunosFormatados = itinerarioData.alunos.map(alunoIt => {
                    const idAluno = alunoIt.alunoId || alunoIt.idAluno || alunoIt.id;
                    const alunoCompleto = alunosTransporte.find(a => a.id === idAluno);
                    
                    const alunoFormatado = {
                        id: idAluno,
                        nomeAluno: alunoIt.nomeAluno || alunoCompleto?.nomeAluno || alunoCompleto?.nome || '-',
                        responsavel: alunoIt.responsavel || alunoIt.nomeResponsavel || alunoCompleto?.responsavel || '-',
                        escola: alunoIt.escola?.nome || alunoIt.escola || alunoCompleto?.escola || '-',
                        enderecoId: alunoIt.idEndereco || alunoIt.enderecoId || alunoIt.fkEndereco || alunoCompleto?.enderecoId || alunoCompleto?.idEndereco,
                        ordemEmbarque: alunoIt.ordemEmbarque
                    };
                    
                    console.log('[EdicaoItinerario] Aluno mapeado:', { 
                        original: alunoIt, 
                        completo: alunoCompleto,
                        formatado: alunoFormatado 
                    });
                    return alunoFormatado;
                });
                
                // Ordenar pela ordem de embarque
                alunosFormatados.sort((a, b) => (a.ordemEmbarque || 0) - (b.ordemEmbarque || 0));
                
                setAlunosItinerario(alunosFormatados);
            } else {
                console.log('[EdicaoItinerario] Nenhum aluno no itinerário');
                setAlunosItinerario([]);
            }

        } catch (error) {
            console.error('[EdicaoItinerario] Erro ao carregar dados:', error);
            toast.error(`Erro ao carregar dados: ${error.message}`, { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setItinerario((prev) => ({ ...prev, [field]: value }));
    };

    const handleMoverAluno = (index, direcao) => {
        const novoArray = [...alunosItinerario];
        if (direcao === "up" && index > 0) {
            [novoArray[index - 1], novoArray[index]] = [novoArray[index], novoArray[index - 1]];
        }
        if (direcao === "down" && index < novoArray.length - 1) {
            [novoArray[index + 1], novoArray[index]] = [novoArray[index], novoArray[index + 1]];
        }
        setAlunosItinerario(novoArray);
    };

    const handleAdicionarAluno = async (aluno, endereco) => {
        try {
            // Calcular a próxima ordem de embarque (última posição + 1)
            const proximaOrdem = alunosItinerario.length + 1;
            
            // Adicionar aluno ao itinerário via API
            await ItinerarioService.adicionarAluno(itinerarioId, {
                alunoId: aluno.id,
                ordemEmbarque: proximaOrdem,
                enderecoId: endereco.id
            });

            // Atualizar lista local garantindo que os campos estejam corretos
            const alunoFormatado = {
                id: aluno.id,
                nomeAluno: aluno.nomeAluno || aluno.nome,
                responsavel: aluno.responsavel || aluno.nomeResponsavel,
                escola: aluno.escola,
                endereco: `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`,
                enderecoId: endereco.id
            };
            
            setAlunosItinerario(prev => [...prev, alunoFormatado]);
            toast.success(`Aluno adicionado na posição ${proximaOrdem}º`, { theme: "colored" });
        } catch (error) {
            toast.error(`Erro ao adicionar aluno: ${error.message}`, { theme: "colored" });
            throw error;
        }
    };

    const handleRemoverAluno = async (alunoId) => {
        if (!alunoId || alunoId === 'undefined') {
            toast.error('ID do aluno inválido', { theme: "colored" });
            return;
        }
        
        const confirmar = window.confirm("Tem certeza que deseja remover este aluno do itinerário?");
        if (!confirmar) return;

        try {
            await ItinerarioService.removerAluno(itinerarioId, alunoId);
            setAlunosItinerario(prev => prev.filter(a => a.id !== alunoId));
            toast.success("Aluno removido com sucesso!", { theme: "colored" });
        } catch (error) {
            toast.error(`Erro ao remover aluno: ${error.message}`, { theme: "colored" });
        }
    };

    const handleSalvar = async () => {
        setIsSaving(true);
        try {
            // Validar se todos os alunos têm endereço
            const alunosSemEndereco = alunosItinerario.filter(aluno => !aluno.enderecoId);
            
            if (alunosSemEndereco.length > 0) {
                const nomesAlunos = alunosSemEndereco.map(a => a.nomeAluno).join(', ');
                toast.error(
                    `Os seguintes alunos não possuem endereço cadastrado: ${nomesAlunos}. Remova-os ou adicione um endereço.`,
                    { theme: "colored", autoClose: 5000 }
                );
                setIsSaving(false);
                return;
            }

            // Preparar lista de alunos com ordem de embarque e endereço
            const alunosComOrdem = alunosItinerario.map((aluno, index) => ({
                alunoId: aluno.id,
                ordemEmbarque: index + 1,
                enderecoId: aluno.enderecoId
            }));

            // Preparar dados do itinerário no formato esperado pelo backend
            const dadosAtualizacao = {
                nome: itinerario.nome,
                horarioInicio: itinerario.horarioInicio,
                horarioFim: itinerario.horarioFim,
                tipoViagem: itinerario.tipoViagem,
                ativo: itinerario.ativo !== undefined ? itinerario.ativo : true,
                alunos: alunosComOrdem
            };

            // Atualizar itinerário (inclui alunos e ordem)
            await ItinerarioService.atualizar(itinerarioId, dadosAtualizacao);

            toast.success("Alterações salvas com sucesso!", { theme: "colored" });
            
            // Aguardar um pouco para mostrar o toast antes de redirecionar
            setTimeout(() => {
                navigate("/itinerarios");
            }, 1500);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error(`Erro ao salvar alterações: ${error.message}`, { theme: "colored" });
        } finally {
            setIsSaving(false);
        }
    };

    const cabecalho = ["Nome do aluno", "Escola", "Responsável"];
    const fields = ["nomeAluno", "escola", "responsavel"];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
                    <p className="mt-4 text-navy-600">Carregando itinerário...</p>
                </div>
            </div>
        );
    }

    if (!itinerario) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-navy-600 mb-4">Itinerário não encontrado.</p>
                    <Link
                        to="/itinerarios"
                        className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-500"
                    >
                        <ArrowBackIcon fontSize="small" />
                        Voltar para Itinerários
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            {/* Breadcrumb */}
            <Link
                to="/itinerarios"
                className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
            >
                <ArrowBackIcon fontSize="small" />
                <span>Voltar</span>
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-primary-50 rounded-xl">
                    <EditIcon className="text-primary-400 text-4xl" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-navy-900">Editar Itinerário</h1>
                    <p className="text-navy-600">
                        Altere as informações e gerencie os alunos
                    </p>
                </div>
            </div>

            {/* Formulário */}
            <div className="bg-white p-6 rounded-2xl shadow mb-8">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Informações do Itinerário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                            Nome do Itinerário *
                        </label>
                        <input
                            type="text"
                            value={itinerario.nome}
                            onChange={(e) => handleChange("nome", e.target.value)}
                            className="w-full border border-offwhite-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                            placeholder="Ex: Rota Centro"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                            Horário Início *
                        </label>
                        <input
                            type="time"
                            value={itinerario.horarioInicio}
                            onChange={(e) => handleChange("horarioInicio", e.target.value)}
                            className="w-full border border-offwhite-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                            Horário Fim *
                        </label>
                        <input
                            type="time"
                            value={itinerario.horarioFim}
                            onChange={(e) => handleChange("horarioFim", e.target.value)}
                            className="w-full border border-offwhite-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                            Tipo de Viagem *
                        </label>
                        <select
                            value={itinerario.tipoViagem}
                            onChange={(e) => handleChange("tipoViagem", e.target.value)}
                            className="w-full border border-offwhite-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                        >
                            <option value="SO_IDA">Ida</option>
                            <option value="SO_VOLTA">Volta</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Seção de Alunos */}
            <div className="bg-white p-6 rounded-2xl shadow mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-navy-900">
                            Ordem de Embarque dos Alunos ({alunosItinerario.length})
                        </h3>
                        <p className="text-sm text-navy-600">
                            A ordem define a sequência em que o motorista buscará os alunos
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-colors"
                    >
                        <PersonAddIcon fontSize="small" />
                        Adicionar Aluno
                    </button>
                </div>

                {alunosItinerario.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-offwhite-300 rounded-lg">
                        <PersonAddIcon className="text-navy-300 text-6xl mx-auto mb-4" />
                        <p className="text-navy-600 mb-2">Nenhum aluno adicionado</p>
                        <p className="text-sm text-navy-500 mb-4">
                            Clique em "Adicionar Aluno" para começar
                        </p>
                    </div>
                ) : (
                    <TabelaEdicaoItinerario
                        cabecalho={cabecalho}
                        dados={alunosItinerario}
                        fields={fields}
                        onMover={handleMoverAluno}
                        onRemover={handleRemoverAluno}
                    />
                )}
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 justify-end">
                <button
                    onClick={() => navigate("/itinerarios")}
                    className="px-6 py-2.5 border-2 border-offwhite-300 text-navy-700 rounded-lg hover:bg-offwhite-50 transition-colors font-medium"
                    disabled={isSaving}
                >
                    Cancelar
                </button>
                <Botao
                    texto={isSaving ? "Salvando..." : "Salvar Alterações"}
                    onClick={handleSalvar}
                    disabled={isSaving}
                />
            </div>

            {/* Modal de Adicionar Aluno */}
            <AdicionarAlunoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAdicionarAluno}
                alunosDisponiveis={alunosDisponiveis}
                alunosJaAdicionados={alunosItinerario}
            />
        </div>
    );
}