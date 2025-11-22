// src/pages/AlunoDetalhe.jsx
import { useEffect, useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

export default function AlunoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [escolas, setEscolas] = useState([])
  const [responsavelSelecionado, setResponsavelSelecionado] = useState(0)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places', 'geometry']
  })

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

    if (typeof aluno.escola === 'object' && aluno.escola.nome) {
      return aluno.escola.nome
    }

    const fromId = escolasById.get(String(aluno.escola))
    return fromId || aluno.escola
  }, [aluno.escola, escolasById])

  // Coordenadas do responsável selecionado para o mapa
  const coordenadasResponsavel = useMemo(() => {
    if (!responsaveis.length) return null
    const resp = responsaveis[responsavelSelecionado]
    if (!resp?.endereco?.latitude || !resp?.endereco?.longitude) return null
    
    return {
      lat: parseFloat(resp.endereco.latitude),
      lng: parseFloat(resp.endereco.longitude)
    }
  }, [responsaveis, responsavelSelecionado])

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
            nomeAluno: dadosAluno?.nome ?? '',
            nascimento: (dadosAluno?.dtNascimento || '').slice(0, 10),
            escola: dadosAluno?.escola ?? '',
            sala: dadosAluno?.sala ?? '',
            serie: String(dadosAluno?.serie ?? ''),
            turno: dadosAluno?.turno ?? '',
            professor: dadosAluno?.professor ?? '',
            endereco: dadosAluno?.escola?.endereco?.logradouro ?? '',
            bairro: dadosAluno?.escola?.endereco?.bairro ?? '',
            cidade: dadosAluno?.escola?.endereco?.cidade ?? '',
            cep: dadosAluno?.escola?.endereco?.cep ?? '',
            mensalidade: String(dadosAluno?.valorPadraoMensalidade ?? ''),
            vencimentoDia: String(dadosAluno?.diaVencimento ?? ''),
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-offwhite-50 to-offwhite-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent mb-4"></div>
          <p className="text-navy-700 text-lg font-medium">Carregando informações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link
          to="/alunos"
          className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Voltar para Alunos</span>
        </Link>

        {/* Header minimalista */}
        <div className="bg-white rounded-2xl shadow-sm border border-offwhite-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary-50 rounded-xl">
                <SchoolIcon className="text-primary-400 text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-navy-900 mb-1">{aluno.nomeAluno || 'Aluno'}</h1>
                <p className="text-navy-600">Visualização completa do cadastro</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/alunos/${id}/editar`)}
              className="px-5 py-2.5 rounded-lg border-2 border-primary-400 text-primary-400 hover:bg-primary-50 font-semibold transition-all"
            >
              Editar Cadastro
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Dados, Financeiro e Mapa */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card Dados do Aluno */}
            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Dados do Aluno</h2>
              <div className="space-y-3">
                <InfoItem label="Nome" value={aluno.nomeAluno} />
                <InfoItem label="Nascimento" value={aluno.nascimento} />
              </div>
            </div>

            {/* Card Financeiro */}
            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Financeiro</h2>
              <div className="space-y-3">
                <InfoItem label="Mensalidade" value={`R$ ${aluno.mensalidade || '0,00'}`} />
                <InfoItem label="Dia de vencimento" value={aluno.vencimentoDia} />
              </div>
            </div>

            {/* Mapa do Responsável */}
            {responsaveis.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
                <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Localização do Responsável</h2>

                {/* Seletor de Responsável */}
                {responsaveis.length > 1 && (
                  <div className="mb-4">
                    <label className="text-sm text-navy-600 mb-2 block">Selecione o responsável:</label>
                    <select
                      value={responsavelSelecionado}
                      onChange={(e) => setResponsavelSelecionado(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    >
                      {responsaveis.map((r, idx) => (
                        <option key={idx} value={idx}>
                          {r.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Informações do Responsável Selecionado */}
                <div className="mb-4 p-4 bg-offwhite-50 rounded-lg space-y-2">
                  <p className="font-semibold text-navy-900">{responsaveis[responsavelSelecionado]?.nome}</p>
                  <div className="flex items-center gap-2 text-sm text-navy-600">
                    <PhoneIcon fontSize="small" />
                    <span>{responsaveis[responsavelSelecionado]?.tel1 || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-navy-600">
                    <LocationOnIcon fontSize="small" />
                    <span>
                      {responsaveis[responsavelSelecionado]?.endereco?.logradouro}, {responsaveis[responsavelSelecionado]?.endereco?.numero}
                    </span>
                  </div>
                </div>

                {/* Mapa */}
                {isLoaded && coordenadasResponsavel ? (
                  <div className="rounded-xl overflow-hidden border-2 border-offwhite-200 h-64">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={coordenadasResponsavel}
                      zoom={15}
                    >
                      <Marker
                        position={coordenadasResponsavel}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#F04848',
                          fillOpacity: 1,
                          strokeColor: 'white',
                          strokeWeight: 2
                        }}
                      />
                    </GoogleMap>
                  </div>
                ) : (
                  <div className="h-64 bg-offwhite-100 rounded-xl flex items-center justify-center text-navy-500">
                    {!isLoaded ? 'Carregando mapa...' : 'Coordenadas não disponíveis'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna Direita - Informações Escolares, Responsáveis e Logística */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Informações Escolares */}
            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Informações Escolares</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Escola" value={nomeEscola} />
                <InfoItem label="Endereço" value={aluno.endereco} />
                <InfoItem label="Bairro" value={aluno.bairro} />
                <InfoItem label="Cidade" value={aluno.cidade} />
                <InfoItem label="CEP" value={aluno.cep} />
                <InfoItem label="Sala" value={aluno.sala} />
                <InfoItem label="Série" value={aluno.serie} />
                <InfoItem label="Turno" value={aluno.turno} />
                <InfoItem label="Professor" value={aluno.professor} />
              </div>
            </div>

            {/* Card Responsáveis */}
            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Responsáveis</h2>

              {responsaveis?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {responsaveis.map((r, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xl p-5 border-2 transition-all cursor-pointer ${
                        responsavelSelecionado === i 
                          ? 'border-primary-400 bg-primary-50 shadow-md' 
                          : 'border-offwhite-200 bg-offwhite-50 hover:border-primary-200'
                      }`}
                      onClick={() => setResponsavelSelecionado(i)}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`p-2 rounded-lg ${responsavelSelecionado === i ? 'bg-primary-100' : 'bg-white'}`}>
                          <PersonIcon className={responsavelSelecionado === i ? 'text-primary-500' : 'text-navy-400'} />
                        </div>
                        <p className="font-bold text-navy-900">{r.nome}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <PhoneIcon fontSize="small" className="text-navy-400 mt-0.5" />
                          <span className="text-navy-700">{r.tel1 || '—'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <EmailIcon fontSize="small" className="text-navy-400 mt-0.5" />
                          <span className="text-navy-700">{r.email || '—'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <LocationOnIcon fontSize="small" className="text-navy-400 mt-0.5" />
                          <span className="text-navy-700">
                            {r.endereco?.logradouro}, {r.endereco?.numero}<br />
                            {r.endereco?.bairro} - {r.endereco?.cidade}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-navy-500">
                  <PersonIcon className="text-4xl mb-2 opacity-30" />
                  <p>Nenhum responsável cadastrado</p>
                </div>
              )}
            </div>

            {/* Card Logística */}
            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Logística de Transporte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Ponto de Embarque" value={aluno.pontoEmbarque} />
                <InfoItem label="Horário Ida" value={aluno.horarioIda} />
                <InfoItem label="Horário Volta" value={aluno.horarioVolta} />
                <div className="md:col-span-2 p-4 bg-offwhite-50 rounded-lg">
                  <p className="text-sm text-navy-600 mb-2 font-medium">Observações</p>
                  <p className="text-navy-900">{aluno.observacoes || 'Nenhuma observação registrada'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para exibir informações
function InfoItem({ label, value }) {
  return (
    <div className="p-3 bg-offwhite-50 rounded-lg">
      <p className="text-xs text-navy-500 mb-1 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-navy-900 font-semibold">{value || '—'}</p>
    </div>
  )
}
