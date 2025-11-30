import { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SchoolIcon from "@mui/icons-material/School";
import RouteIcon from "@mui/icons-material/Route";
import { TabelaPlanejamentoRotas } from "../components/TabelaPlanejamentoRotas";
import { Botao } from "../components/Botao";
import AdicionarAlunoModal from "../components/AdicionarAlunoModal";
import AdicionarEscolaModal from "../components/AdicionarEscolaModal";
import ItinerarioService from '../services/itinerarioService';
import TransporteService from '../services/transporteService';
import EscolasService from '../services/escolasService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showSwal } from '../utils/swal.jsx';

export default function EdicaoItinerario() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const itinerarioId = Number(searchParams.get("itinerarioId"));
    const { user } = useAuth();

    const [itinerario, setItinerario] = useState(null);
    const [alunosItinerario, setAlunosItinerario] = useState([]);
    const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
    const [escolasItinerario, setEscolasItinerario] = useState([]);
    const [escolasDisponiveis, setEscolasDisponiveis] = useState([]);
    const [itensTrajeto, setItensTrajeto] = useState([]); // Lista unificada
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEscolaOpen, setIsModalEscolaOpen] = useState(false);

    useEffect(() => {
        carregarDados();
    }, [itinerarioId]);

    // Sincronizar lista unificada quando alunos ou escolas mudarem
    useEffect(() => {
        const itensUnificados = [
            ...alunosItinerario.map(aluno => ({ ...aluno, tipo: 'aluno' })),
            ...escolasItinerario.map(escola => ({ ...escola, tipo: 'escola' }))
        ];

        // Ordenar por ordemGlobal se disponível, senão usar ordem específica
        itensUnificados.sort((a, b) => {
            const ordemA = a.ordemGlobal || (a.tipo === 'aluno' ? (a.ordemEmbarque || 0) : (a.ordemVisita || 0));
            const ordemB = b.ordemGlobal || (b.tipo === 'aluno' ? (b.ordemEmbarque || 0) : (b.ordemVisita || 0));
            return ordemA - ordemB;
        });

        setItensTrajeto(itensUnificados);
    }, [alunosItinerario, escolasItinerario]);

    const carregarDados = async () => {
        setIsLoading(true);
        try {
            // Carregar todos os alunos do transporte do usuário logado
            const transporteId = user?.transportId || user?.idTransporte || 1;
            const alunosTransporte = await TransporteService.listarAlunos(transporteId);
            setAlunosDisponiveis(alunosTransporte);

            // Carregar escolas disponíveis
            const escolasData = await EscolasService.getEscolas();
            setEscolasDisponiveis(escolasData);

            // Carregar itinerário
            const itinerarioData = await ItinerarioService.buscarPorId(itinerarioId);
            setItinerario(itinerarioData);

            // Carregar alunos do itinerário
            if (itinerarioData.alunos && itinerarioData.alunos.length > 0) {
                const alunosFormatados = itinerarioData.alunos.map(alunoIt => {
                    const idAluno = alunoIt.alunoId || alunoIt.idAluno || alunoIt.id;
                    const alunoCompleto = alunosTransporte.find(a => a.id === idAluno);

                    const alunoFormatado = {
                        id: idAluno,
                        nomeAluno: alunoIt.nomeAluno || alunoCompleto?.nomeAluno || alunoCompleto?.nome || '-',
                        responsavel: alunoIt.responsavel || alunoIt.nomeResponsavel || alunoCompleto?.responsavel || '-',
                        escola: alunoIt.escola?.nome || alunoIt.escola || alunoCompleto?.escola || '-',
                        enderecoId: alunoIt.idEndereco || alunoIt.enderecoId || alunoIt.fkEndereco || alunoCompleto?.enderecoId || alunoCompleto?.idEndereco,
                        ordemEmbarque: alunoIt.ordemEmbarque,
                        ordemGlobal: alunoIt.ordemGlobal || alunoIt.ordemEmbarque // Usar ordemGlobal se existir
                    };

                    return alunoFormatado;
                });

                setAlunosItinerario(alunosFormatados);
            } else {
                setAlunosItinerario([]);
            }

            // Carregar escolas do itinerário
            if (itinerarioData.escolas && itinerarioData.escolas.length > 0) {
                const escolasFormatadas = itinerarioData.escolas.map((escolaIt, index) => {
                     const escolaFormatada = {
                        id: escolaIt.escolaId || escolaIt.idEscola || escolaIt.id || escolaIt.fkEscola,
                        nome: escolaIt.nome || escolaIt.nomeEscola || escolaIt.escola?.nome || '-',
                        cidade: escolaIt.cidade || escolaIt.escola?.cidade || '-',
                        enderecoId: escolaIt.enderecoId || escolaIt.idEndereco || escolaIt.fkEndereco,
                        ordemVisita: escolaIt.ordemVisita || escolaIt.ordem || (index + 1),
                        ordemGlobal: escolaIt.ordemGlobal || (escolaIt.ordemVisita || (index + 1))  // Usar ordemGlobal se existir
                    };
                    
                    return escolaFormatada;
                });

                setEscolasItinerario(escolasFormatadas);
            } else {
                setEscolasItinerario([]);
            }

        } catch (error) {
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

    const handleMoverItem = async (index, direcao) => {
        const novoArray = [...itensTrajeto];
        if (direcao === "up" && index > 0) {
            [novoArray[index - 1], novoArray[index]] = [novoArray[index], novoArray[index - 1]];
        }
        if (direcao === "down" && index < novoArray.length - 1) {
            [novoArray[index + 1], novoArray[index]] = [novoArray[index], novoArray[index + 1]];
        }

        // Atualizar as ordens e separar de volta em alunos e escolas
        const alunosAtualizados = [];
        const escolasAtualizadas = [];

        novoArray.forEach((item, idx) => {
            if (item.tipo === 'aluno') {
                alunosAtualizados.push({ ...item, ordemEmbarque: idx + 1 });
            } else {
                escolasAtualizadas.push({ ...item, ordemVisita: idx + 1 });
            }
        });

        try {
            // Reordenar alunos via API
            if (alunosAtualizados.length > 0) {
                const idsAlunos = alunosAtualizados.map(a => a.id);
                await ItinerarioService.reordenarAlunos(itinerarioId, idsAlunos);
            }

            // Reordenar escolas via API
            if (escolasAtualizadas.length > 0) {
                const idsEscolas = escolasAtualizadas.map(e => e.id);
                await ItinerarioService.reordenarEscolas(itinerarioId, idsEscolas);
            }

            // Atualizar estado local
            setAlunosItinerario(alunosAtualizados);
            setEscolasItinerario(escolasAtualizadas);
            
            toast.success('Ordem atualizada com sucesso!', { theme: "colored" });
        } catch (error) {
            toast.error(`Erro ao reordenar: ${error.message}`, { theme: "colored" });
        }
    };

    const handleRemoverItem = async (tipo, id) => {
        if (tipo === 'aluno') {
            await handleRemoverAluno(id);
        } else {
            await handleRemoverEscola(id);
        }
    };

    // Função utilitária para garantir formato HH:mm:ss
    function padTime(t) {
        if (t && t.length === 8) return t;
        if (t && t.length === 5) return t + ':00';
        return t;
    }

    const handleReordenarPorDrag = async (fromIndex, toIndex) => {
        try {
            // Criar cópia do array
            const novoArray = [...itensTrajeto];
            
            // Remover o item da posição original e inserir na nova posição
            const [itemMovido] = novoArray.splice(fromIndex, 1);
            novoArray.splice(toIndex, 0, itemMovido);

            // Calcular ordens específicas para cada tipo
            let ordemAlunoAtual = 1;
            let ordemEscolaAtual = 1;
            
            const paradas = novoArray.map((item, globalIndex) => {
                if (item.tipo === 'aluno') {
                    return {
                        tipo: 'ALUNO',
                        id: item.id,
                        ordemGlobal: globalIndex + 1,
                        ordemEspecifica: ordemAlunoAtual++
                    };
                } else {
                    return {
                        tipo: 'ESCOLA',
                        id: item.id,
                        ordemGlobal: globalIndex + 1,
                        ordemEspecifica: ordemEscolaAtual++
                    };
                }
            });

            // Preparar dados para atualização
            const dadosAtualizacao = {
                nome: itinerario.nome,
                horarioInicio: padTime(itinerario.horarioInicio),
                horarioFim: padTime(itinerario.horarioFim),
                tipoViagem: itinerario.tipoViagem,
                ativo: itinerario.ativo !== undefined ? itinerario.ativo : true,
                paradas: paradas
            };

            // Atualizar via API usando PUT /itinerarios/{id}
            await ItinerarioService.atualizar(itinerarioId, dadosAtualizacao);

            // Recarregar dados para obter as ordens atualizadas do backend
            await carregarDados();
            
            toast.success('Ordem atualizada com sucesso!', { theme: "colored" });
        } catch (error) {
            console.error('[handleReordenarPorDrag] ERRO:', error);
            toast.error(`Erro ao reordenar: ${error.message}`, { theme: "colored" });
            // Recarregar dados em caso de erro para manter sincronizado
            await carregarDados();
        }
    };

    const handleAdicionarAluno = async (aluno, endereco) => {
        try {
            // Calcular a próxima ordem de embarque
            const proximaOrdem = itensTrajeto.filter(item => item.tipo === 'aluno').length + 
                               itensTrajeto.filter(item => item.tipo === 'escola').length + 1;

            const dadosAluno = {
                alunoId: aluno.id,
                ordemEmbarque: proximaOrdem,
                enderecoId: endereco.id
            };

            // Adicionar via API
            await ItinerarioService.adicionarAluno(itinerarioId, dadosAluno);

            // Atualizar lista local
            const alunoFormatado = {
                id: aluno.id,
                nomeAluno: aluno.nomeAluno || aluno.nome,
                responsavel: aluno.responsavel || aluno.nomeResponsavel,
                escola: aluno.escola,
                endereco: `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`,
                enderecoId: endereco.id,
                ordemEmbarque: proximaOrdem
            };

            setAlunosItinerario(prev => [...prev, alunoFormatado]);
            toast.success(`Aluno ${aluno.nomeAluno || aluno.nome} adicionado com sucesso!`, { theme: "colored" });
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

            const { isConfirmed } = await showSwal({
              title: 'Remover aluno',
              text: 'Tem certeza que deseja remover este aluno do itinerário?',
              icon: 'warning',
              confirmButtonText: 'Sim, remover',
              cancelButtonText: 'Cancelar',
              showCancelButton: true
            });
            if (!isConfirmed) return;

        try {
            // Remover via API
            await ItinerarioService.removerAluno(itinerarioId, alunoId);
            
            // Atualizar lista local
            setAlunosItinerario(prev => prev.filter(a => a.id !== alunoId));
            toast.success("Aluno removido com sucesso!", { theme: "colored" });
        } catch (error) {
            toast.error(`Erro ao remover aluno: ${error.message}`, { theme: "colored" });
        }
    };

    const handleMoverEscola = (index, direcao) => {
        const novoArray = [...escolasItinerario];
        if (direcao === "up" && index > 0) {
            [novoArray[index - 1], novoArray[index]] = [novoArray[index], novoArray[index - 1]];
        }
        if (direcao === "down" && index < novoArray.length - 1) {
            [novoArray[index + 1], novoArray[index]] = [novoArray[index], novoArray[index + 1]];
        }
        setEscolasItinerario(novoArray);
    };

    const handleAdicionarEscola = async (escola, endereco) => {
        try {
            // Calcular a próxima ordem de visita
            const proximaOrdem = itensTrajeto.filter(item => item.tipo === 'aluno').length + 
                               itensTrajeto.filter(item => item.tipo === 'escola').length + 1;

            const dadosEscola = {
                escolaId: escola.id,
                ordemVisita: proximaOrdem,
                enderecoId: endereco.id
            };

            // Adicionar via API
            await ItinerarioService.adicionarEscola(itinerarioId, dadosEscola);

            // Atualizar lista local
            const escolaFormatada = {
                id: escola.id,
                nome: escola.nome,
                cidade: escola.cidade || '-',
                enderecoId: endereco.id,
                endereco: `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`,
                ordemVisita: proximaOrdem
            };

            setEscolasItinerario(prev => [...prev, escolaFormatada]);
            toast.success(`Escola ${escola.nome} adicionada com sucesso!`, { theme: "colored" });
        } catch (error) {
            toast.error(`Erro ao adicionar escola: ${error.message}`, { theme: "colored" });
            throw error;
        }
    };

    const handleRemoverEscola = async (escolaId) => {
        if (!escolaId || escolaId === 'undefined') {
            toast.error('ID da escola inválido', { theme: "colored" });
            return;
        }

            const { isConfirmed } = await showSwal({
              title: 'Remover escola',
              text: 'Tem certeza que deseja remover esta escola do itinerário?',
              icon: 'warning',
              confirmButtonText: 'Sim, remover',
              cancelButtonText: 'Cancelar',
              showCancelButton: true
            });
            if (!isConfirmed) return;

        try {
            // Remover via API
            await ItinerarioService.removerEscola(itinerarioId, escolaId);
            
            // Atualizar lista local
            setEscolasItinerario(prev => prev.filter(e => e.id !== escolaId));
            toast.success("Escola removida com sucesso!", { theme: "colored" });
        } catch (error) {
            toast.error(`Erro ao remover escola: ${error.message}`, { theme: "colored" });
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

            // Recalcular ordens baseadas na lista unificada atual
            const itensOrdenados = [...itensTrajeto];
            
            // Calcular ordens específicas para cada tipo
            let ordemAlunoAtual = 1;
            let ordemEscolaAtual = 1;
            
            const paradas = itensOrdenados.map((item, globalIndex) => {
                if (item.tipo === 'aluno') {
                    return {
                        tipo: 'ALUNO',
                        id: item.id,
                        ordemGlobal: globalIndex + 1,
                        ordemEspecifica: ordemAlunoAtual++
                    };
                } else {
                    return {
                        tipo: 'ESCOLA',
                        id: item.id,
                        ordemGlobal: globalIndex + 1,
                        ordemEspecifica: ordemEscolaAtual++
                    };
                }
            });

            // Preparar dados do itinerário
            const dadosAtualizacao = {
                nome: itinerario.nome,
                horarioInicio: padTime(itinerario.horarioInicio),
                horarioFim: padTime(itinerario.horarioFim),
                tipoViagem: itinerario.tipoViagem,
                ativo: itinerario.ativo !== undefined ? itinerario.ativo : true,
                paradas: paradas
            };

            // Atualizar itinerário
            await ItinerarioService.atualizar(itinerarioId, dadosAtualizacao);

            toast.success("Alterações salvas com sucesso!", { theme: "colored" });

            // Aguardar um pouco para mostrar o toast antes de redirecionar
            setTimeout(() => {
                navigate("/itinerarios");
            }, 1500);
        } catch (error) {
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
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <Link
                    to="/itinerarios"
                    className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
                >
                    <ArrowBackIcon fontSize="small" />
                    <span>Voltar para Itinerários</span>
                </Link>

                {/* Header minimalista */}
                <div className="bg-white rounded-2xl shadow-sm border border-offwhite-200 p-8 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary-50 rounded-xl">
                            <EditIcon className="text-primary-400 text-4xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-navy-900 mb-1">Editar Itinerário</h1>
                            <p className="text-navy-600">
                                Altere as informações e gerencie o planejamento de rotas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulário */}
                <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-8 mb-8">
                    <h3 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Informações do Itinerário</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">
                                Nome do Itinerário *
                            </label>
                            <input
                                type="text"
                                value={itinerario.nome}
                                onChange={(e) => handleChange("nome", e.target.value)}
                                required
                                className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
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
                                required
                                className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
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
                                required
                                className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">
                                Tipo de Viagem *
                            </label>
                            <select
                                value={itinerario.tipoViagem}
                                onChange={(e) => handleChange("tipoViagem", e.target.value)}
                                required
                                className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            >
                                <option value="SO_IDA">Ida</option>
                                <option value="SO_VOLTA">Volta</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seção de Planejamento de Rotas (Alunos e Escolas) */}
                <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-primary-50 to-green-50 rounded-xl">
                                <RouteIcon className="text-primary-500 text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-navy-900">
                                    Planejamento de Rotas
                                </h3>
                                <p className="text-sm text-navy-600 mt-1">
                                    {alunosItinerario.length} aluno(s) • {escolasItinerario.length} escola(s)
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary-400 hover:bg-primary-500 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                            >
                                <PersonAddIcon fontSize="small" />
                                Adicionar Aluno
                            </button>
                            <button
                                onClick={() => setIsModalEscolaOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                            >
                                <SchoolIcon fontSize="small" />
                                Adicionar Escola
                            </button>
                        </div>
                    </div>

                    {itensTrajeto.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-offwhite-300 rounded-xl bg-offwhite-50">
                            <RouteIcon className="text-navy-300 text-6xl mx-auto mb-4 opacity-40" />
                            <p className="text-navy-600 font-medium mb-2">Nenhum item no trajeto</p>
                            <p className="text-sm text-navy-500 mb-4">
                                Adicione alunos e escolas para planejar sua rota
                            </p>
                        </div>
                    ) : (
                        <TabelaPlanejamentoRotas
                            dados={itensTrajeto}
                            onRemover={handleRemoverItem}
                            onReordenar={handleReordenarPorDrag}
                        />
                    )}
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => navigate("/itinerarios")}
                        className="px-6 py-2.5 border-2 border-offwhite-300 hover:border-navy-400 text-navy-700 rounded-lg font-medium transition-all"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSalvar}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>

                {/* Modal de Adicionar Aluno */}
                <AdicionarAlunoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleAdicionarAluno}
                    alunosDisponiveis={alunosDisponiveis}
                    alunosJaAdicionados={alunosItinerario}
                />

                {/* Modal de Adicionar Escola */}
                <AdicionarEscolaModal
                    isOpen={isModalEscolaOpen}
                    onClose={() => setIsModalEscolaOpen(false)}
                    onAdd={handleAdicionarEscola}
                    escolasDisponiveis={escolasDisponiveis}
                    escolasJaAdicionadas={escolasItinerario}
                />
            </div>
        </div>
    );
}