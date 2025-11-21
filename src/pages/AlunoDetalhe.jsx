// src/pages/AlunoDetalhe.jsx
import { useEffect, useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

export default function AlunoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [escolas, setEscolas] = useState([])

  const [aluno, setAluno] = useState({
    nomeAluno: '',
    nascimento: '',
    escola: '',        // pode vir nome ou id, abaixo resolvemos
    sala: '',
    serie: '',
    turno: '',
    professor: '',
    endereco: '',
    bairro: '',
    cidade: '',
    cep: '',
    mensalidade: '',
    vencimentoDia: '',
    pontoEmbarque: '',
    horarioIda: '',
    horarioVolta: '',
    observacoes: '',
  })

  const [responsaveis, setResponsaveis] = useState([])

  // Mapa de escolas para resolver ID -> nome
  const escolasById = useMemo(() => {
    const m = new Map()
    for (const e of escolas) m.set(String(e.id), e.nome)
    return m
  }, [escolas])

  const nomeEscola = useMemo(() => {
    if (!aluno.escola) return ''
    // se veio id, tenta mapear; se já for nome, retorna direto
    const fromId = escolasById.get(String(aluno.escola))
    return fromId || aluno.escola
  }, [aluno.escola, escolasById])

  useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          setCarregando(true)
          const [listaEscolas, dadosAluno] = await Promise.all([
            escolasService.getEscolas(),
            alunosService.getAlunoById(id),
          ])

          if (!alive) return
          setEscolas(Array.isArray(listaEscolas) ? listaEscolas : (listaEscolas?.items ?? []))

          setAluno({
            nomeAluno: dadosAluno?.nomeAluno ?? '',
            nascimento: (dadosAluno?.nascimento || '').slice(0, 10),
            escola: dadosAluno?.escolaId ?? dadosAluno?.escola ?? '',
            sala: dadosAluno?.sala ?? '',
            serie: dadosAluno?.serie ?? '',
            turno: dadosAluno?.turno ?? '',
            professor: dadosAluno?.professor ?? '',
            endereco: dadosAluno?.endereco ?? '',
            bairro: dadosAluno?.bairro ?? '',
            cidade: dadosAluno?.cidade ?? '',
            cep: dadosAluno?.cep ?? '',
            mensalidade: String(dadosAluno?.mensalidade ?? ''),
            vencimentoDia: String(dadosAluno?.vencimentoDia ?? ''),
            pontoEmbarque: dadosAluno?.pontoEmbarque ?? '',
            horarioIda: dadosAluno?.horarioIda ?? '',
            horarioVolta: dadosAluno?.horarioVolta ?? '',
            observacoes: dadosAluno?.observacoes ?? '',
          })

          setResponsaveis(
            Array.isArray(dadosAluno?.responsaveis) ? dadosAluno.responsaveis : []
          )
        } catch (e) {
          console.error('[AlunoDetalhe] Erro ao carregar:', e)
        } finally {
          if (alive) setCarregando(false)
        }
      })()
    return () => { alive = false }
  }, [id])

  if (carregando) {
    return (
      <div className="py-6">
        <p className="text-navy-700">Carregando...</p>
      </div>
    )
  }

  const Row = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-offwhite-200 last:border-b-0">
      <span className="text-navy-600 text-sm">{label}</span>
      <span className="text-navy-900 font-medium text-sm text-right">{value || '—'}</span>
    </div>
  )

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <Link
        to="/alunos"
        className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Voltar para Alunos</span>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-50 rounded-xl">
            <SchoolIcon className="text-primary-400 text-4xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-navy-900">{aluno.nomeAluno || 'Aluno'}</h1>
            <p className="text-navy-600">Visualização do cadastro</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/alunos/${id}/editar`)}
          className="px-5 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-medium transition-colors"
        >
          Editar
        </button>
      </div>

      {/* Content */}
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1 – Dados + Financeiro */}
        <section className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-offwhite-300 bg-white p-4">
            <p className="text-navy-900 font-semibold mb-3">Dados do Aluno</p>
            <Row label="Nome" value={aluno.nomeAluno} />
            <Row label="Nascimento" value={aluno.nascimento} />
            <Row label="Endereço" value={aluno.endereco} />
            <Row label="Cidade" value={aluno.cidade} />
            <Row label="CEP" value={aluno.cep} />
          </div>

          <div className="rounded-xl border border-offwhite-300 bg-white p-4">
            <p className="text-navy-900 font-semibold mb-3">Financeiro</p>
            <Row label="Mensalidade (R$)" value={aluno.mensalidade} />
            <Row label="Dia de vencimento" value={aluno.vencimentoDia} />
          </div>
        </section>

        {/* Coluna 2–3 – Escolares, Responsáveis, Logística */}
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-offwhite-300 bg-white p-4">
            <p className="text-navy-900 font-semibold mb-3">Informações Escolares</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Row label="Escola" value={nomeEscola} />
              <Row label="Sala" value={aluno.sala} />
              <Row label="Série" value={aluno.serie} />
              <Row label="Turno" value={aluno.turno} />
              <Row label="Professor" value={aluno.professor} />
            </div>
          </div>

          <div className="rounded-xl border border-offwhite-300 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-navy-900 font-semibold">Responsáveis</p>
            </div>

            {responsaveis?.length ? (
              <div className="space-y-6">
                {responsaveis.map((r, i) => (
                  <div key={i} className="rounded-lg border border-offwhite-300 p-4">
                    <p className="font-medium text-navy-800 mb-2">Responsável {i + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Row label="Nome" value={r.nome} />
                      <Row label="Telefone" value={r.telefone} />
                      <Row label="Endereço" value={r.endereco} />
                      <Row label="Bairro" value={r.bairro} />
                      <Row label="Cidade" value={r.cidade} />
                      <Row label="CEP" value={r.cep} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-600">Nenhum responsável cadastrado.</p>
            )}
          </div>

          <div className="rounded-xl border border-offwhite-300 bg-white p-4">
            <p className="text-navy-900 font-semibold mb-3">Logística</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Row label="Ponto de Embarque/Desembarque" value={aluno.pontoEmbarque} />
              <Row label="Horário Ida" value={aluno.horarioIda} />
              <Row label="Horário Volta" value={aluno.horarioVolta} />
              <div className="md:col-span-2">
                <span className="text-navy-600 text-sm block mb-2">Observações</span>
                <p className="text-navy-900 text-sm">{aluno.observacoes || '—'}</p>
              </div>
            </div>
          </div>

          {/* Ações secundárias */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/alunos"
              className="px-5 py-2.5 rounded-lg bg-offwhite-200 hover:bg-offwhite-300 text-navy-800 font-medium transition-colors"
            >
              Voltar
            </Link>
            <button
              type="button"
              onClick={() => navigate(`/alunos/${id}/editar`)}
              className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-colors"
            >
              Editar
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
