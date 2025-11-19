import React, { useEffect, useState, useCallback } from "react";
import { Tabela } from "../components/Tabela";
import {
  listarMensalidades,
  pagarMensalidade,
  criarMensalidade
} from "../services/mensalidadeService";
import { listarPagamentos, criarPagamento as criarPagamentoService } from "../services/pagamentoService";
import { listarFuncionarios } from "../services/funcionarioService";

export default function Financeiro() {
  const [aba, setAba] = useState("mensalidades"); // 'mensalidades' | 'pagamentos' | 'funcionarios' | 'despesas'
  const [mensalidades, setMensalidades] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  // despesas locais (pode ser substituído por endpoint se existir)
  const [despesas, setDespesas] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState([]);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [modalContexto, setModalContexto] = useState(null); // 'mensalidade' | 'pagamento' | 'funcionario' | 'novaMensalidade'
  const [modalItem, setModalItem] = useState(null);

  const [formPagamento, setFormPagamento] = useState({
    valorPagamento: "",
    dataPagamento: new Date().toISOString().slice(0, 10),
    idFuncionario: "",
    mensalidadeId: ""
  });

  const [formNovaMensalidade, setFormNovaMensalidade] = useState({
    alunoId: "",
    dataVencimento: new Date().toISOString().slice(0, 10),
    valorMensalidade: ""
  });

  // inline states para adicionar pagamento direto na linha
  const [pagamentosEmLinha, setPagamentosEmLinha] = useState({});

  // carregar mensalidades
  const carregarMensalidades = useCallback(async function () {
    try {
      const params = {};
      if (filtroStatus.length) params.status = filtroStatus;
      if (filtroDataInicio) params.dataInicio = filtroDataInicio;
      if (filtroDataFim) params.dataFim = filtroDataFim;
      const res = await listarMensalidades(params);
      const lista = Array.isArray(res) ? res : (res?.content ?? []);
      setMensalidades(lista);
    } catch (err) {
      console.error("carregarMensalidades:", err);
      setMensalidades([]);
    }
  }, [filtroStatus, filtroDataInicio, filtroDataFim]);

  // carregar pagamentos
  const carregarPagamentos = useCallback(async function () {
    try {
      const params = {}; // pode adicionar filtros
      const res = await listarPagamentos(params);
      const lista = Array.isArray(res) ? res : (res?.content ?? []);
      setPagamentos(lista);
    } catch (err) {
      console.error("carregarPagamentos:", err);
      setPagamentos([]);
    }
  }, []);

  // carregar funcionarios
  async function carregarFuncionarios() {
    try {
      const res = await listarFuncionarios();
      const lista = Array.isArray(res) ? res : (res?.content ?? []);
      setFuncionarios(lista);
    } catch (err) {
      console.error("carregarFuncionarios:", err);
      setFuncionarios([]);
    }
  }

  useEffect(() => { carregarMensalidades(); }, [carregarMensalidades]);
  useEffect(() => { if (aba === "pagamentos") carregarPagamentos(); }, [aba, carregarPagamentos]);
  useEffect(() => { if (aba === "funcionarios") carregarFuncionarios(); }, [aba]);

  // --- KPIs: totais do mês atual ---
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1; // 1-12

  function isInCurrentMonth(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;
    return d.getFullYear() === anoAtual && (d.getMonth() + 1) === mesAtual;
  }

  const totalReceitaMes = pagamentos.reduce((acc, p) => {
    const data = p.dataPagamento ?? p.dataPagemento ?? p.data ?? "";
    if (!isInCurrentMonth(data)) return acc;
    const valor = Number(p.valorPagamento ?? p.valor ?? 0) || 0;
    return acc + valor;
  }, 0);

  const totalDespesasMes = despesas.reduce((acc, d) => {
    const data = d.dataDespesa ?? d.data ?? "";
    if (!isInCurrentMonth(data)) return acc;
    const valor = Number(d.valorDespesa ?? d.valor ?? 0) || 0;
    return acc + valor;
  }, 0);

  const saldoMes = totalReceitaMes - totalDespesasMes;
  const statusFinanceiro = saldoMes >= 0 ? "Positivo" : "Negativo";

  function formatCurrency(v) {
    return `R$ ${Number(v || 0).toFixed(2)}`;
  }
  // --- fim KPIs ---

  // ações
  async function handlePagarMensalidade(id) {
    if (!window.confirm("Confirmar pagamento desta mensalidade?")) return;
    try {
      await pagarMensalidade(id);
      await Promise.all([carregarMensalidades(), carregarPagamentos()]);
    } catch (err) {
      console.error("handlePagarMensalidade:", err);
      alert("Erro ao marcar pago. Veja console.");
    }
  }

  function abrirModalPagamento(item = null, contexto = "mensalidade") {
    setModalContexto(contexto);
    setModalItem(item);
    setFormPagamento({
      valorPagamento: "",
      dataPagamento: new Date().toISOString().slice(0, 10),
      idFuncionario: contexto === "funcionario" ? (item?.id ?? "") : "",
      mensalidadeId: contexto === "mensalidade" && item ? (item.idMensalidade ?? item.id) : ""
    });
    setModalAberto(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function abrirModalNovaMensalidade() {
    setModalContexto("novaMensalidade");
    setModalItem(null);
    setFormNovaMensalidade({
      alunoId: "",
      dataVencimento: new Date().toISOString().slice(0, 10),
      valorMensalidade: ""
    });
    setModalAberto(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fecharModal() {
    setModalAberto(false);
    setModalContexto(null);
    setModalItem(null);
  }

  function handleFormPagamentoChange(e) {
    const { name, value } = e.target;
    setFormPagamento(prev => ({ ...prev, [name]: value }));
  }

  function handleFormNovaMensalidadeChange(e) {
    const { name, value } = e.target;
    setFormNovaMensalidade(prev => ({ ...prev, [name]: value }));
  }

  async function salvarPagamentoModal(e) {
    e.preventDefault();
    const body = {
      dataPagamento: formPagamento.dataPagamento,
      valorPagamento: parseFloat(formPagamento.valorPagamento)
    };
    if (isNaN(body.valorPagamento) || body.valorPagamento <= 0) return alert("Informe um valor válido");
    try {
      const idFuncionario = formPagamento.idFuncionario ? parseInt(formPagamento.idFuncionario, 10) : undefined;
      const mensalidadeId = formPagamento.mensalidadeId ? parseInt(formPagamento.mensalidadeId, 10) : undefined;

      // Se o usuário selecionou uma mensalidade, primeiro marca como paga (PATCH) e depois registra o pagamento.
      if (mensalidadeId) {
        try {
          await pagarMensalidade(mensalidadeId);
        } catch (err) {
          // não interrompe: ainda tentamos criar o registro de pagamento
          console.warn("pagarMensalidade falhou (continuando para criar pagamento):", err);
        }
      }

      await criarPagamentoService(body, idFuncionario);
      await Promise.all([carregarMensalidades(), carregarPagamentos(), carregarFuncionarios()]);
      fecharModal();
    } catch (err) {
      console.error("salvarPagamentoModal:", err);
      alert("Erro ao criar pagamento. Veja console.");
    }
  }

  async function salvarNovaMensalidade(e) {
    e.preventDefault();
    const payload = {
      alunoId: formNovaMensalidade.alunoId ? parseInt(formNovaMensalidade.alunoId, 10) : undefined,
      dataVencimento: formNovaMensalidade.dataVencimento,
      valorMensalidade: parseFloat(formNovaMensalidade.valorMensalidade)
    };
    if (!payload.alunoId) return alert("Informe o ID do aluno");
    if (isNaN(payload.valorMensalidade) || payload.valorMensalidade <= 0) return alert("Informe um valor válido");
    try {
      await criarMensalidade(payload);
      await carregarMensalidades();
      fecharModal();
    } catch (err) {
      console.error("salvarNovaMensalidade:", err);
      alert("Erro ao criar mensalidade. Veja console.");
    }
  }

  // pagamentos em linha (reutilizável)
  function abrirPagamentoEmLinha(chave, contexto = "mensalidade") {
    setPagamentosEmLinha(prev => ({ ...prev, [chave]: { valorPagamento: "", dataPagamento: new Date().toISOString().slice(0, 10), idFuncionario: "", contexto, aberto: true } }));
  }

  function fecharPagamentoEmLinha(chave) {
    setPagamentosEmLinha(prev => {
      const copy = { ...prev }; delete copy[chave]; return copy;
    });
  }

  function mudarPagamentoEmLinha(chave, e) {
    const { name, value } = e.target;
    setPagamentosEmLinha(prev => ({ ...prev, [chave]: { ...prev[chave], [name]: value } }));
  }

  async function enviarPagamentoEmLinha(e, chave) {
    e.preventDefault();
    const estado = pagamentosEmLinha[chave];
    if (!estado) return;
    const body = { dataPagamento: estado.dataPagamento, valorPagamento: parseFloat(estado.valorPagamento) };
    if (isNaN(body.valorPagamento) || body.valorPagamento <= 0) return alert("Valor inválido");
    try {
      const idFuncionario = estado.idFuncionario ? parseInt(estado.idFuncionario, 10) : undefined;
      await criarPagamentoService(body, idFuncionario);
      await Promise.all([carregarMensalidades(), carregarPagamentos()]);
      fecharPagamentoEmLinha(chave);
    } catch (err) {
      console.error("enviarPagamentoEmLinha:", err);
      alert("Erro ao registrar pagamento. Veja console.");
    }
  }

  // filtros simples
  const mensalidadesFiltradas = mensalidades.filter(m => {
    if (!filtroTexto) return true;
    const s = filtroTexto.toLowerCase();
    const id = String(m.idMensalidade ?? m.id ?? "");
    const nome = (m.aluno?.nome ?? m.alunoNome ?? "").toLowerCase();
    return id.includes(s) || nome.includes(s);
  });

  const pagamentosFiltrados = pagamentos.filter(p => {
    if (!filtroTexto) return true;
    const s = filtroTexto.toLowerCase();
    const funcNome = (p.funcionario?.nome ?? "").toLowerCase();
    return funcNome.includes(s) || String(p.id ?? p.pagamentoId ?? "").includes(s);
  });

  const funcionariosFiltrados = funcionarios.filter(f => {
    if (!filtroTexto) return true;
    const s = filtroTexto.toLowerCase();
    return (f.nome ?? "").toLowerCase().includes(s) || String(f.id ?? "").includes(s);
  });

  // cabeçalhos
  const cabMens = ["ID", "Aluno", "Vencimento", "Valor", "Valor pago", "Data pagamento", "Status"];
  const camposMens = ["idMensalidade", "alunoNome", "dataVencimento", "valorMensalidade", "valorPagamento", "dataPagamento", "status"];

  const cabPag = ["ID", "Data pagamento", "Valor", "Funcionário"];
  const camposPag = ["id", "dataPagamento", "valorPagamento", "funcionarioNome"];

  const cabFunc = ["ID", "Nome", "CPF", "Transporte"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Financeiro</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow flex flex-col">
            <span className="text-sm text-gray-500">Despesas (mês atual)</span>
            <span className="text-2xl font-bold mt-2">{formatCurrency(totalDespesasMes)}</span>
          </div>

          <div className="p-4 bg-white rounded shadow flex flex-col">
            <span className="text-sm text-gray-500">Receita (mês atual)</span>
            <span className="text-2xl font-bold mt-2">{formatCurrency(totalReceitaMes)}</span>
          </div>

          <div className={`p-4 rounded shadow flex flex-col justify-between ${saldoMes >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status financeiro</span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${saldoMes >= 0 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>{statusFinanceiro}</span>
            </div>
            <div className="mt-3">
              <div className="text-sm text-gray-500">Saldo do mês</div>
              <div className="text-2xl font-bold">{formatCurrency(saldoMes)}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setAba("mensalidades")} className={`px-4 py-2 rounded ${aba === "mensalidades" ? "bg-blue-600 text-white" : "bg-white border"}`}>Mensalidades</button>
          <button onClick={() => setAba("pagamentos")} className={`px-4 py-2 rounded ${aba === "pagamentos" ? "bg-blue-600 text-white" : "bg-white border"}`}>Pagamentos</button>
          <button onClick={() => setAba("funcionarios")} className={`px-4 py-2 rounded ${aba === "funcionarios" ? "bg-blue-600 text-white" : "bg-white border"}`}>Funcionários</button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => { if (aba === "mensalidades") carregarMensalidades(); else if (aba === "pagamentos") carregarPagamentos(); else if (aba === "funcionarios") carregarFuncionarios(); }} className="px-3 py-2 bg-gray-200 rounded">Recarregar</button>
            <input placeholder="Filtrar por texto" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} className="p-2 border rounded w-64" />
          </div>
        </div>

        {aba === "mensalidades" && (
          <section className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Mensalidades</h2>
              <div className="flex gap-2">
                <button onClick={abrirModalNovaMensalidade} className="px-3 py-2 bg-green-600 text-white rounded">Adicionar mensalidade</button>
                <button onClick={() => abrirModalPagamento(null, "mensalidade")} className="px-3 py-2 bg-blue-500 text-white rounded">Novo pagamento</button>
              </div>
            </div>

            <Tabela
              cabecalho={cabMens}
              dados={mensalidadesFiltradas.map(m => ({
                ...m,
                idMensalidade: m.idMensalidade ?? m.id,
                alunoNome: m.aluno?.nome ?? m.alunoNome ?? "-",
                dataPagamento: m.dataPagamento ?? m.dataPagemento ?? "-"
              }))}
              fields={camposMens}
              status={false}
              renderCell={(row, key) => {
                if (key === "valorMensalidade" || key === "valorPagamento") return `R$ ${Number(row[key] || 0).toFixed(2)}`;
                return row[key] ?? "-";
              }}
              renderActions={(row) => {
                const id = row.idMensalidade || row.id;
                const chave = `mens-${id}`;
                const estado = pagamentosEmLinha[chave];
                return (
                  <div className="flex flex-col gap-2">
                    {!estado?.aberto ? (
                      <div className="flex gap-2">
                        <button onClick={() => abrirPagamentoEmLinha(chave, "mensalidade")} className="px-2 py-1 bg-green-600 text-white rounded">Adicionar pagamento</button>
                        <button onClick={() => handlePagarMensalidade(id)} className="px-2 py-1 bg-orange-400 text-white rounded">Marcar pago</button>
                        <button onClick={() => abrirModalPagamento(row, "mensalidade")} className="px-2 py-1 bg-blue-500 text-white rounded">Abrir modal</button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => enviarPagamentoEmLinha(e, chave)} className="flex gap-2 items-center">
                        <input name="valorPagamento" value={estado.valorPagamento} onChange={(e) => mudarPagamentoEmLinha(chave, e)} placeholder="Valor" className="p-1 border rounded w-24" required />
                        <input type="date" name="dataPagamento" value={estado.dataPagamento} onChange={(e) => mudarPagamentoEmLinha(chave, e)} className="p-1 border rounded" required />
                        <input name="idFuncionario" value={estado.idFuncionario} onChange={(e) => mudarPagamentoEmLinha(chave, e)} placeholder="ID func." className="p-1 border rounded w-24" />
                        <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded">Salvar</button>
                        <button type="button" onClick={() => fecharPagamentoEmLinha(chave)} className="px-2 py-1 bg-gray-200 rounded">Cancelar</button>
                      </form>
                    )}
                  </div>
                );
              }}
            />
          </section>
        )}

        {aba === "pagamentos" && (
          <section className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Lista de pagamentos</h2>
              <div className="flex gap-2">
                <button onClick={() => abrirModalPagamento(null, "pagamento")} className="px-3 py-2 bg-green-600 text-white rounded">Novo pagamento</button>
              </div>
            </div>

            <Tabela
              cabecalho={cabPag}
              dados={pagamentosFiltrados.map(p => ({
                ...p,
                id: p.id ?? p.pagamentoId ?? p.pk ?? "",
                dataPagamento: p.dataPagamento ?? p.dataPagemento ?? "-",
                valorPagamento: p.valorPagamento ?? p.valor ?? 0,
                funcionarioNome: p.funcionario?.nome ?? (p.funcionarioNome ?? "-")
              }))}
              fields={camposPag}
              status={false}
              renderCell={(row, key) => {
                if (key === "valorPagamento") return `R$ ${Number(row[key] || 0).toFixed(2)}`;
                return row[key] ?? "-";
              }}
              renderActions={(row) => {
                const chave = `pay-${row.id}`;
                const estado = pagamentosEmLinha[chave];
                return (
                  <div className="flex gap-2 items-center">
                    {!estado?.aberto ? (
                      <div className="flex gap-2">
                        <button onClick={() => abrirPagamentoEmLinha(chave, "pagamento")} className="px-2 py-1 bg-green-600 text-white rounded">Adicionar</button>
                        <button onClick={() => abrirModalPagamento(row, "pagamento")} className="px-2 py-1 bg-blue-500 text-white rounded">Editar/Ver</button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => enviarPagamentoEmLinha(e, chave)} className="flex gap-2 items-center">
                        <input name="valorPagamento" value={estado.valorPagamento} onChange={(e) => mudarPagamentoEmLinha(chave, e)} placeholder="Valor" className="p-1 border rounded w-24" required />
                        <input type="date" name="dataPagamento" value={estado.dataPagamento} onChange={(e) => mudarPagamentoEmLinha(chave, e)} className="p-1 border rounded" required />
                        <input name="idFuncionario" value={estado.idFuncionario} onChange={(e) => mudarPagamentoEmLinha(chave, e)} placeholder="ID func." className="p-1 border rounded w-24" />
                        <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded">Salvar</button>
                        <button type="button" onClick={() => fecharPagamentoEmLinha(chave)} className="px-2 py-1 bg-gray-200 rounded">Cancelar</button>
                      </form>
                    )}
                  </div>
                );
              }}
            />
          </section>
        )}

        {aba === "funcionarios" && (
          <section className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-medium mb-3">Funcionários</h2>
            <Tabela
              cabecalho={cabFunc}
              dados={funcionariosFiltrados.map(f => ({ ...f, id: f.id ?? f.funcionarioId ?? "", transporte: f.transporte?.placa ? `${f.transporte.modelo ?? ""} / ${f.transporte.placa}` : "-" }))}
              fields={["id", "nome", "cpf", "transporte"]}
              status={false}
              renderCell={(row, key) => row[key] ?? "-"}
              renderActions={(row) => {
                const chave = `func-${row.id}`;
                const estado = pagamentosEmLinha[chave];
                return (
                  <div className="flex gap-2 items-center">
                    {!estado?.aberto ? (
                      <div className="flex gap-2">
                        <button onClick={() => abrirPagamentoEmLinha(chave, "funcionario")} className="px-2 py-1 bg-green-600 text-white rounded">Registrar pagamento</button>
                        <button onClick={() => abrirModalPagamento(row, "funcionario")} className="px-2 py-1 bg-blue-500 text-white rounded">Abrir modal</button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => enviarPagamentoEmLinha(e, chave)} className="flex gap-2 items-center">
                        <input name="valorPagamento" value={estado.valorPagamento} onChange={(e) => mudarPagamentoEmLinha(chave, e)} placeholder="Valor" className="p-1 border rounded w-24" required />
                        <input type="date" name="dataPagamento" value={estado.dataPagamento} onChange={(e) => mudarPagamentoEmLinha(chave, e)} className="p-1 border rounded" required />
                        <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded">Salvar</button>
                        <button type="button" onClick={() => fecharPagamentoEmLinha(chave)} className="px-2 py-1 bg-gray-200 rounded">Cancelar</button>
                      </form>
                    )}
                  </div>
                );
              }}
            />
          </section>
        )}

        {/* Modal reutilizável */}
        {modalAberto && modalContexto !== "novaMensalidade" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={fecharModal} />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
              <h2 className="text-lg font-semibold mb-3">
                {modalContexto === "funcionario" ? `Pagamento - ${modalItem?.nome ?? modalItem?.id}` :
                 modalContexto === "pagamento" ? `Pagamento` :
                 `Pagamento - ${((modalItem?.aluno?.nome ?? modalItem?.alunoNome ?? modalItem?.id) || "")}`}
              </h2>
              <form onSubmit={salvarPagamentoModal} className="space-y-3">
                {/* Dropdown de mensalidades (populado via GET /mensalidades) */}
                <div>
                  <label className="block text-sm font-medium mb-1">Mensalidade (opcional)</label>
                  <select
                    name="mensalidadeId"
                    value={formPagamento.mensalidadeId}
                    onChange={handleFormPagamentoChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">-- Nenhuma / selecionar mensalidade --</option>
                    {mensalidades.map(m => {
                      const id = m.idMensalidade ?? m.id;
                      const label = `${id} — ${m.aluno?.nome ?? m.alunoNome ?? "-" } — ${m.dataVencimento ?? "-"}`;
                      return <option key={id} value={id}>{label}</option>;
                    })}
                  </select>
                </div>

                <input name="valorPagamento" value={formPagamento.valorPagamento} onChange={handleFormPagamentoChange} placeholder="Valor (ex: 50.00)" className="w-full p-2 border rounded" required />
                <input type="date" name="dataPagamento" value={formPagamento.dataPagamento} onChange={handleFormPagamentoChange} className="w-full p-2 border rounded" required />
                <input name="idFuncionario" value={formPagamento.idFuncionario} onChange={handleFormPagamentoChange} placeholder="ID do funcionário (opcional)" className="w-full p-2 border rounded" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={fecharModal} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>
                  <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para nova mensalidade */}
        {modalAberto && modalContexto === "novaMensalidade" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={fecharModal} />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
              <h2 className="text-lg font-semibold mb-3">Nova mensalidade</h2>
              <form onSubmit={salvarNovaMensalidade} className="space-y-3">
                <input name="alunoId" value={formNovaMensalidade.alunoId} onChange={handleFormNovaMensalidadeChange} placeholder="ID do aluno" className="w-full p-2 border rounded" required />
                <input name="valorMensalidade" value={formNovaMensalidade.valorMensalidade} onChange={handleFormNovaMensalidadeChange} placeholder="Valor mensalidade (ex: 150.00)" className="w-full p-2 border rounded" required />
                <input type="date" name="dataVencimento" value={formNovaMensalidade.dataVencimento} onChange={handleFormNovaMensalidadeChange} className="w-full p-2 border rounded" required />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={fecharModal} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>
                  <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}