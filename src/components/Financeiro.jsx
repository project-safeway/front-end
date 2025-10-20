import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "./Navbar";
import { Tabela } from "./Tabela";

export function Financeiro() {
    const [recebimentos, setRecebimentos] = useState([]);
    const [clients, setClients] = useState([]); // lista de clientes para o select
    const [filter, setFilter] = useState("");
    const [editingId, setEditingId] = useState(null);

    // date filters
    const [dateFilterCombinada, setDateFilterCombinada] = useState({ from: "", to: "" });
    const [dateFilterRecebimento, setDateFilterRecebimento] = useState({ from: "", to: "" });

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // "novo" | "edit" | "pagamento"
    const [modalData, setModalData] = useState(null);
    const [modalForm, setModalForm] = useState({
        // fields for novo / edit
        cliente: "",
        dataCombinada: "",
        valorAReceber: "",
        valorRecebido: "",
        diaRecebimento: "",
        // fields for pagamento
        clientId: "", // id do recebimento/cliente selecionado
        valor: "",
        data: ""
    });

    const sample = [
        {
            id: 1,
            cliente: "João Silva",
            dataCombinada: "2025-10-20",
            valorAReceber: 200.0,
            valorRecebido: 0.0,
            diaRecebimento: "",
            pagamentos: []
        },
        {
            id: 2,
            cliente: "Maria Souza",
            dataCombinada: "2025-10-22",
            valorAReceber: 150.0,
            valorRecebido: 150.0,
            diaRecebimento: "2025-10-22",
            pagamentos: [{ id: 1, valor: 150.0, data: "2025-10-22" }]
        }
    ];

    // --- load recebimentos (backend-ready) ---
    useEffect(() => {
        async function load() {
            try {
                // futuro: const res = await axios.get("/api/recebimentos");
                // setRecebimentos(res.data);
                const stored = localStorage.getItem("recebimentos");
                if (stored) setRecebimentos(JSON.parse(stored));
                else setRecebimentos(sample);
            } catch (err) {
                const stored = localStorage.getItem("recebimentos");
                if (stored) setRecebimentos(JSON.parse(stored));
                else setRecebimentos(sample);
            }
        }
        load();
    }, []);

    // --- populate clients for the pagamento select ---
    useEffect(() => {
        async function loadClients() {
            try {
                // ajustar endpoint quando a API estiver pronta
                const res = await axios.get("/api/clientes");
                // espera [{ id, nome }] ou similar; tenta mapear campos comuns
                const mapped = res.data.map(c => ({
                    id: c.id ?? c.clientId ?? c.idCliente ?? c.id,
                    nome: c.nome ?? c.nomeCliente ?? c.nome_completo ?? c.clientName ?? String(c)
                }));
                setClients(mapped);
            } catch (err) {
                // fallback: derivar lista de clientes únicos a partir dos recebimentos atuais
                const unique = [];
                const seen = new Set();
                recebimentos.forEach(r => {
                    const key = String(r.id) + "||" + (r.cliente ?? "");
                    if (!seen.has(key)) {
                        seen.add(key);
                        unique.push({ id: r.id, nome: r.cliente });
                    }
                });
                setClients(unique);
            }
        }
        loadClients();
    }, [recebimentos]);

    useEffect(() => {
        localStorage.setItem("recebimentos", JSON.stringify(recebimentos));
    }, [recebimentos]);

    const nextId = () => (recebimentos.length ? Math.max(...recebimentos.map(r => r.id)) + 1 : 1);

    // delete (prepared for backend)
    const handleDelete = async (id) => {
        if (!window.confirm("Confirma exclusão deste recebimento?")) return;
        try {
            // futuro: await axios.delete(`/api/recebimentos/${id}`);
            setRecebimentos(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            setRecebimentos(prev => prev.filter(r => r.id !== id));
        }
    };

    // --- modal helpers ---
    const openNewModal = () => {
        setModalType("novo");
        setModalData(null);
        setModalForm({
            cliente: "",
            dataCombinada: "",
            valorAReceber: "",
            valorRecebido: "",
            diaRecebimento: "",
            clientId: "",
            valor: "",
            data: new Date().toISOString().slice(0, 10)
        });
        setModalOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openEditModal = (item) => {
        setModalType("edit");
        setModalData(item);
        setModalForm({
            cliente: item.cliente ?? "",
            dataCombinada: item.dataCombinada ?? "",
            valorAReceber: item.valorAReceber ?? "",
            valorRecebido: item.valorRecebido ?? "",
            diaRecebimento: item.diaRecebimento ?? "",
            clientId: item.id ?? "",
            valor: "",
            data: ""
        });
        setModalOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openPagamentoModal = (item) => {
        setModalType("pagamento");
        setModalData(item);
        setModalForm(prev => ({
            ...prev,
            clientId: item?.id ?? (clients[0]?.id ?? ""),
            valor: "",
            data: new Date().toISOString().slice(0, 10)
        }));
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType(null);
        setModalData(null);
        setModalForm({
            cliente: "",
            dataCombinada: "",
            valorAReceber: "",
            valorRecebido: "",
            diaRecebimento: "",
            clientId: "",
            valor: "",
            data: ""
        });
    };

    const handleModalFormChange = (e) => {
        const { name, value } = e.target;
        setModalForm(prev => ({ ...prev, [name]: value }));
    };

    // save novo via modal (prepared for backend)
    const handleSaveNewModal = async (e) => {
        e.preventDefault();
        const novo = {
            id: nextId(),
            cliente: modalForm.cliente,
            dataCombinada: modalForm.dataCombinada,
            valorAReceber: parseFloat(modalForm.valorAReceber) || 0,
            valorRecebido: parseFloat(modalForm.valorRecebido) || 0,
            diaRecebimento: modalForm.diaRecebimento || "",
            pagamentos: modalForm.valorRecebido ? [{ id: 1, valor: parseFloat(modalForm.valorRecebido), data: modalForm.diaRecebimento || "" }] : []
        };
        try {
            // futuro: const res = await axios.post("/api/recebimentos", novo);
            // setRecebimentos(prev => [res.data, ...prev]);
            setRecebimentos(prev => [novo, ...prev]);
            closeModal();
        } catch (err) {
            setRecebimentos(prev => [novo, ...prev]);
            closeModal();
        }
    };

    // save edit via modal (prepared for backend)
    const handleSaveEditModal = async (e) => {
        e.preventDefault();
        if (!modalData) return;
        const id = modalData.id;
        const updatedItem = {
            ...modalData,
            cliente: modalForm.cliente ?? modalData.cliente,
            dataCombinada: modalForm.dataCombinada ?? modalData.dataCombinada,
            valorAReceber: parseFloat(modalForm.valorAReceber) || 0,
            valorRecebido: parseFloat(modalForm.valorRecebido) || 0,
            diaRecebimento: modalForm.diaRecebimento || ""
        };
        try {
            // futuro: const res = await axios.put(`/api/recebimentos/${id}`, updatedItem);
            // setRecebimentos(prev => prev.map(r => r.id === id ? res.data : r));
            setRecebimentos(prev => prev.map(r => r.id === id ? updatedItem : r));
            closeModal();
        } catch (err) {
            setRecebimentos(prev => prev.map(r => r.id === id ? updatedItem : r));
            closeModal();
        }
    };

    // add pagamento via modal (prepared for backend)
    const handleSavePagamentoModal = async (e) => {
        e.preventDefault();
        // targetId vem do select clientId; se vazio, usa modalData.id
        const targetId = parseInt(modalForm.clientId, 10) || modalData?.id;
        if (!targetId) return alert("Selecione um cliente válido");
        const valor = parseFloat(modalForm.valor);
        const data = modalForm.data || new Date().toISOString().slice(0, 10);
        if (isNaN(valor) || valor <= 0) return alert("Informe um valor válido");
        try {
            // futuro: const res = await axios.post(`/api/recebimentos/${targetId}/pagamento`, { valor, data });
            setRecebimentos(prev => prev.map(r => {
                if (r.id === targetId) {
                    const nextPagamentoId = (r.pagamentos && r.pagamentos.length) ? Math.max(...r.pagamentos.map(p => p.id)) + 1 : 1;
                    const novoPagamento = { id: nextPagamentoId, valor, data };
                    const pagamentos = [...(r.pagamentos || []), novoPagamento];
                    const valorRecebido = (r.valorRecebido || 0) + valor;
                    return { ...r, pagamentos, valorRecebido, diaRecebimento: data };
                }
                return r;
            }));
            closeModal();
        } catch (err) {
            setRecebimentos(prev => prev.map(r => {
                if (r.id === targetId) {
                    const nextPagamentoId = (r.pagamentos && r.pagamentos.length) ? Math.max(...r.pagamentos.map(p => p.id)) + 1 : 1;
                    const novoPagamento = { id: nextPagamentoId, valor, data };
                    const pagamentos = [...(r.pagamentos || []), novoPagamento];
                    const valorRecebido = (r.valorRecebido || 0) + valor;
                    return { ...r, pagamentos, valorRecebido, diaRecebimento: data };
                }
                return r;
            }));
            closeModal();
        }
    };

    // date helper
    const inRange = (dateStr, from, to) => {
        if (!from && !to) return true;
        if (!dateStr) return false;
        if (from && dateStr < from) return false;
        if (to && dateStr > to) return false;
        return true;
    };

    // filtro por id ou cliente + filtros de datas (data combinada e data de recebimento/pagamentos)
    const filtered = recebimentos.filter(r => {
        if (filter) {
            const s = filter.toLowerCase();
            if (!(String(r.id).includes(s) || r.cliente.toLowerCase().includes(s))) return false;
        }

        if (!inRange(r.dataCombinada, dateFilterCombinada.from, dateFilterCombinada.to)) return false;

        if (dateFilterRecebimento.from || dateFilterRecebimento.to) {
            const dia = r.diaRecebimento;
            const pagamentos = r.pagamentos || [];
            const anyPagamentoInRange = pagamentos.some(p => inRange(p.data, dateFilterRecebimento.from, dateFilterRecebimento.to));
            const diaInRange = inRange(dia, dateFilterRecebimento.from, dateFilterRecebimento.to);
            if (!diaInRange && !anyPagamentoInRange) return false;
        }

        return true;
    });

    // NOTE: removed 'Pagamentos' column from table header and fields per request
    const cabecalho = ["ID", "Cliente", "Data combinada", "Valor a receber", "Valor recebido", "Dia do recebimento"];
    const fields = ["id", "cliente", "dataCombinada", "valorAReceber", "valorRecebido", "diaRecebimento"];

    const clearFilters = () => {
        setFilter("");
        setDateFilterCombinada({ from: "", to: "" });
        setDateFilterRecebimento({ from: "", to: "" });
    };

    // expose startEdit for table actions
    const startEdit = (item) => openEditModal(item);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Financeiro - Recebimentos da Van</h1>

                <section className="mt-2 bg-white p-4 rounded shadow flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <button onClick={openNewModal} className="px-4 py-2 bg-orange-400 text-white rounded cursor-pointer">Adicionar recebimento</button>
                    </div>

                    <div className="ml-auto w-full sm:w-auto">
                        <input
                            placeholder="Filtrar por ID ou cliente"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="p-2 border rounded w-full sm:w-64"
                        />
                    </div>
                </section>

                {/* date filters card */}
                <section className="mt-4 bg-white p-4 rounded shadow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm font-medium mb-2">Período - Data combinada</div>
                            <div className="flex gap-2 items-center">
                                <input type="date" value={dateFilterCombinada.from} onChange={e => setDateFilterCombinada(prev => ({ ...prev, from: e.target.value }))} className="p-2 border rounded" />
                                <span className="mx-1">até</span>
                                <input type="date" value={dateFilterCombinada.to} onChange={e => setDateFilterCombinada(prev => ({ ...prev, to: e.target.value }))} className="p-2 border rounded" />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm font-medium mb-2">Período - Recebimento / Pagamentos</div>
                            <div className="flex gap-2 items-center">
                                <input type="date" value={dateFilterRecebimento.from} onChange={e => setDateFilterRecebimento(prev => ({ ...prev, from: e.target.value }))} className="p-2 border rounded" />
                                <span className="mx-1">até</span>
                                <input type="date" value={dateFilterRecebimento.to} onChange={e => setDateFilterRecebimento(prev => ({ ...prev, to: e.target.value }))} className="p-2 border rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-3">
                        <button type="button" onClick={clearFilters} className="px-3 py-2 bg-gray-200 rounded">Limpar filtros</button>
                    </div>
                </section>

                <section className="mt-6">
                    <Tabela
                        cabecalho={cabecalho}
                        dados={filtered}
                        fields={fields}
                        status={false}
                        renderCell={(row, key) => {
                            if (key === "valorAReceber" || key === "valorRecebido") return `R$ ${Number(row[key] || 0).toFixed(2)}`;
                            return row[key] ?? "-";
                        }}
                        renderActions={(row) => (
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => startEdit(row)} className="px-2 py-1 bg-yellow-300 rounded">Editar</button>
                                <button onClick={() => handleDelete(row.id)} className="px-2 py-1 bg-red-500 text-white rounded">Excluir</button>
                                {/* botão de "Adicionar pagamento" removido da tabela conforme solicitado */}
                            </div>
                        )}
                    />
                </section>

                <p className="text-sm text-gray-500 mt-4">
                    Observação: os dados são salvos no localStorage enquanto o endpoint do backend não estiver pronto.
                </p>
            </div>

            {/* Navbar no final da página para mobile */}
            <div className="mt-8">
                <Navbar />
            </div>

            {/* Modal overlay (novo / edit / pagamento) */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal} />
                    <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
                        {/* Novo recebimento */}
                        {modalType === "novo" && (
                            <>
                                <h2 className="text-lg font-semibold mb-3">Adicionar recebimento</h2>
                                <form onSubmit={handleSaveNewModal} className="space-y-3">
                                    <input name="cliente" value={modalForm.cliente} onChange={handleModalFormChange} className="w-full p-2 border rounded" placeholder="Cliente" required />
                                    <span>Data Combinada para recebimento</span>
                                    <input type="date" name="dataCombinada" value={modalForm.dataCombinada} onChange={handleModalFormChange} className="w-full p-2 border rounded" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <span>Valor a Receber</span>
                                        <input name="valorAReceber" value={modalForm.valorAReceber} onChange={handleModalFormChange} placeholder="Valor a receber" className="p-2 border rounded" />
                                        <span>Valor Recebido</span>
                                        <input name="valorRecebido" value={modalForm.valorRecebido} onChange={handleModalFormChange} placeholder="Valor recebido (opcional)" className="p-2 border rounded" />
                                    </div>
                                    <span>Data do Recebimento</span>
                                    <input type="date" name="diaRecebimento" value={modalForm.diaRecebimento} onChange={handleModalFormChange} className="w-full p-2 border rounded" />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={closeModal} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>
                                        <button type="submit" className="px-3 py-2 bg-orange-400 text-white rounded">Adicionar</button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Edit recebimento */}
                        {modalType === "edit" && modalData && (
                            <>
                                <h2 className="text-lg font-semibold mb-3">Editar recebimento #{modalData.id}</h2>
                                <form onSubmit={handleSaveEditModal} className="space-y-3">
                                    <input name="cliente" value={modalForm.cliente} onChange={handleModalFormChange} className="w-full p-2 border rounded" required />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" name="dataCombinada" value={modalForm.dataCombinada} onChange={handleModalFormChange} className="p-2 border rounded" />
                                        <input type="date" name="diaRecebimento" value={modalForm.diaRecebimento} onChange={handleModalFormChange} className="p-2 border rounded" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="valorAReceber" value={modalForm.valorAReceber} onChange={handleModalFormChange} placeholder="Valor a receber" className="p-2 border rounded" />
                                        <input name="valorRecebido" value={modalForm.valorRecebido} onChange={handleModalFormChange} placeholder="Valor recebido" className="p-2 border rounded" />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={closeModal} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>
                                        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Salvar</button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Pagamento (permanece disponível via modal, mas trigger removido da tabela) */}
                        {modalType === "pagamento" && (
                            <>
                                <h2 className="text-lg font-semibold mb-3">Adicionar pagamento</h2>

                                <form onSubmit={handleSavePagamentoModal} className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Cliente</label>
                                        <select
                                            name="clientId"
                                            value={modalForm.clientId}
                                            onChange={handleModalFormChange}
                                            className="w-full p-2 border rounded"
                                            required
                                        >
                                            <option value="">Selecione um cliente...</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.nome}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <input name="valor" value={modalForm.valor} onChange={handleModalFormChange} placeholder="Valor (ex: 50.00)" className="w-full p-2 border rounded" required />
                                    <input type="date" name="data" value={modalForm.data} onChange={handleModalFormChange} className="w-full p-2 border rounded" required />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={closeModal} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>
                                        <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Adicionar</button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}