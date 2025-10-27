import React, { useState } from 'react';

export function CadastroAluno() {
  const [form, setForm] = useState({
    nome: '',
    dataNascimento: '',
    escola: '',
    responsavel1: '',
    telefone1: '',
    responsavel2: '',
    telefone2: '',
    rua: '',
    numeroCasa: '',
    sala: '',
    serie: '',
    turma: '',
    periodo: '',
  });

  const [status, setStatus] = useState('');
  const [step, setStep] = useState(1);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Enviando...');
    try {
      // Substitua a URL abaixo pelo endpoint real
      const res = await fetch('https://seu-endpoint.com/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('Cadastro realizado com sucesso!');
        setForm({
          nome: '',
          dataNascimento: '',
          escola: '',
          responsavel1: '',
          telefone1: '',
          responsavel2: '',
          telefone2: '',
          rua: '',
          numeroCasa: '',
          sala: '',
          serie: '',
          turma: '',
          periodo: '',
        });
        setStep(1);
      } else {
        setStatus('Erro ao cadastrar.');
      }
    } catch {
      setStatus('Erro de conexão.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto mt-8 p-8 rounded-lg shadow-lg"
      style={{ backgroundColor: '#f4f5f6' }}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Cadastro de Aluno</h2>
      {step === 1 && (
        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col text-gray-700 font-medium">
            Nome do Aluno*:
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Data de Nascimento*:
            <input
              type="date"
              name="dataNascimento"
              value={form.dataNascimento}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Nome da Escola*:
            <input
              name="escola"
              value={form.escola}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Nome do Responsável*:
            <input
              name="responsavel1"
              value={form.responsavel1}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Telefone do Responsável*:
            <input
              name="telefone1"
              value={form.telefone1}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Nome do Segundo Responsável (opcional):
            <input
              name="responsavel2"
              value={form.responsavel2}
              onChange={handleChange}
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Telefone do Segundo Responsável (opcional):
            <input
              name="telefone2"
              value={form.telefone2}
              onChange={handleChange}
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <button
            type="button"
            className="w-full mt-6 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors"
            onClick={() => setStep(2)}
          >
            Próxima
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col text-gray-700 font-medium">
            Rua*:
            <input
              name="rua"
              value={form.rua}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Número da Casa*:
            <input
              name="numeroCasa"
              value={form.numeroCasa}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Sala*:
            <input
              name="sala"
              value={form.sala}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Série*:
            <input
              name="serie"
              value={form.serie}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Turma*:
            <input
              name="turma"
              value={form.turma}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Período*:
            <input
              name="periodo"
              value={form.periodo}
              onChange={handleChange}
              required
              className="mt-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="w-1/2 py-2 px-4 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded transition-colors"
              onClick={() => setStep(1)}
            >
              Voltar
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors"
            >
              Cadastrar
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 text-center text-sm text-gray-600">{status}</div>
    </form>
  );
}