import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useEnderecos, useAlunos, useItinerarios, useAlunosItinerario } from './hooks';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function MapaRotaEscolar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itinerarioIdUrl = searchParams.get('itinerarioId');
  
  const [rota, setRota] = useState(null);
  const [itinerarioSelecionado, setItinerarioSelecionado] = useState(itinerarioIdUrl || null);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState({ lat: -23.55, lng: -46.63 });
  
  // Modal de adicionar aluno
  const [modalAberto, setModalAberto] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState('');
  const [enderecoSelecionado, setEnderecoSelecionado] = useState('');
  
  // Hooks customizados
  const { itinerarios, loading: loadingItinerarios } = useItinerarios();
  const { alunos, loading: loadingAlunos } = useAlunos();
  const { alunos: alunosItinerario, refresh: refreshAlunosItinerario } = useAlunosItinerario(itinerarioSelecionado);
  const { enderecos, loading: loadingEnderecos, error: erroEnderecos } = useEnderecos(alunoSelecionado);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "SUA_API_KEY_AQUI"
  });

  // Carrega itinerário da URL automaticamente
  useEffect(() => {
    if (itinerarioIdUrl) {
      setItinerarioSelecionado(itinerarioIdUrl);
    }
  }, [itinerarioIdUrl]);

  // Otimiza rota automaticamente quando há alunos e itinerário selecionado
  useEffect(() => {
    if (itinerarioSelecionado && alunosItinerario && alunosItinerario.length > 0 && !rota) {
      otimizarRotaDoItinerario();
    }
  }, [itinerarioSelecionado, alunosItinerario]);

  const adicionarAlunoAoItinerario = async () => {
    if (!alunoSelecionado || !enderecoSelecionado) {
      alert('Selecione aluno e endereço');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/itinerarios/${itinerarioSelecionado}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoId: parseInt(alunoSelecionado),
          enderecoId: parseInt(enderecoSelecionado),
          ordem: null
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar aluno');
      }

      alert('✅ Aluno adicionado ao itinerário!');
      
      // Atualiza a lista de alunos do itinerário
      refreshAlunosItinerario();
      
      // Fecha o modal e limpa seleções
      setModalAberto(false);
      setAlunoSelecionado('');
      setEnderecoSelecionado('');
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      alert('❌ Erro ao adicionar aluno: ' + error.message);
    }
  };

  const otimizarRotaDoItinerario = async () => {
    if (!itinerarioSelecionado) {
      alert('Selecione um itinerário');
      return;
    }

    if (!alunosItinerario || alunosItinerario.length === 0) {
      alert('⚠️ Adicione alunos ao itinerário antes de otimizar a rota');
      return;
    }

    setLoading(true);
    try {

      const pontosParada = alunosItinerario.map(aluno => ({
        id: `${aluno.nome} - ${aluno.enderecoCompleto}`,
        localizacao: {
          lat: aluno.enderecoLatitude,
          lng: aluno.enderecoLongitude
        }
      }));

      pontosParada.push({
        id: 'Escola',
        localizacao: { lat: -23.574434, lng: -46.623934 }
      });

      const request = {
        veiculo: {
          id: "VAN-ESCOLAR-01",
          localizacaoInicial: pontosParada[0].localizacao,
          localizacaoFinal: pontosParada[0].localizacao
        },
        pontosParada: pontosParada,
        otimizarOrdem: true
      };

      const response = await fetch('http://localhost:8080/rotas/otimizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error('Erro ao otimizar rota');

      const data = await response.json();
      setRota(data);

      if (data.paradas.length > 0) {
        setCenter(data.paradas[0].localizacao);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao otimizar rota: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div style={styles.loading}>Carregando mapa...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        {/* Breadcrumb */}
        <Link
          to="/itinerarios"
          style={styles.breadcrumb}
        >
          <ArrowBackIcon fontSize="small" />
          <span>Voltar aos Itinerários</span>
        </Link>
        
        <h2>Otimização de Rotas</h2>

        <div style={styles.formGroup}>
          <label>Selecione o Itinerário:</label>
          <select
            value={itinerarioSelecionado || ''}
            onChange={(e) => setItinerarioSelecionado(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Escolha um itinerário --</option>
            {itinerarios.map(it => (
              <option key={it.id} value={it.id}>
                {it.nome} - {it.turno}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          disabled={!itinerarioSelecionado}
          style={styles.buttonSecondary}
        >
          ➕ Adicionar Aluno
        </button>

        <button
          onClick={otimizarRotaDoItinerario}
          disabled={loading || !itinerarioSelecionado}
          style={styles.button}
        >
          {loading ? 'Otimizando...' : '🚀 Otimizar Rota'}
        </button>

        {rota && (
          <div style={styles.info}>
            <h3>📊 Resumo da Rota</h3>
            <p><strong>🛣️ Distância:</strong> {(rota.distanciaTotal / 1000).toFixed(2)} km</p>
            <p><strong>⏱️ Tempo:</strong> {Math.floor(rota.tempoTotal / 60)} min</p>
            <p><strong>📍 Paradas:</strong> {rota.paradas.length}</p>

            <h4>🚏 Ordem de Embarque:</h4>
            <ol style={styles.list}>
              {rota.paradas.map((parada, idx) => (
                <li key={idx}>
                  {parada.idParada}
                  <small style={styles.small}>
                    {parada.horarioChegada ? ` - ${parada.horarioChegada}` : ''}
                  </small>
                </li>
              ))}
            </ol>

            <button
              onClick={() => window.open(gerarLinkGoogleMaps(rota), '_blank')}
              style={styles.buttonGoogle}
            >
              🗺️ Abrir no Google Maps
            </button>
            
            <button
              onClick={() => window.open(gerarLinkWaze(rota), '_blank')}
              style={styles.buttonWaze}
            >
              🚗 Abrir no Waze
            </button>
          </div>
        )}
      </div>

      <div style={styles.mapContainer}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={13}
        >
          {rota?.paradas.map((parada, idx) => (
            <Marker
              key={idx}
              position={parada.localizacao}
              label={`${idx + 1}`}
              title={parada.idParada}
            />
          ))}

          {rota && (
            <Polyline
              path={rota.paradas.map(p => p.localizacao)}
              options={{
                strokeColor: '#2196F3',
                strokeWeight: 4,
                strokeOpacity: 0.8
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Modal de Adicionar Aluno */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>➕ Adicionar Aluno ao Itinerário</h3>

            <div style={styles.formGroup}>
              <label>Selecione o Aluno:</label>
              <select
                value={alunoSelecionado}
                onChange={(e) => {
                  setAlunoSelecionado(e.target.value);
                  setEnderecoSelecionado('');
                }}
                style={styles.select}
              >
                <option value="">-- Escolha um aluno --</option>
                {alunos.map(aluno => (
                  <option key={aluno.idAluno} value={aluno.idAluno}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </div>

            {alunoSelecionado && (
              <div style={styles.formGroup}>
                <label>Selecione o Endereço:</label>
                {loadingEnderecos ? (
                  <div style={styles.loadingBox}>
                    <p>⏳ Carregando endereços...</p>
                  </div>
                ) : erroEnderecos ? (
                  <div style={styles.errorBox}>
                    <p>❌ {erroEnderecos}</p>
                  </div>
                ) : enderecos.length === 0 ? (
                  <div style={styles.warningBox}>
                    <p>⚠️ Nenhum endereço cadastrado para este aluno</p>
                    <small>Cadastre um endereço primeiro</small>
                  </div>
                ) : (
                  <>
                    <select
                      value={enderecoSelecionado}
                      onChange={(e) => setEnderecoSelecionado(e.target.value)}
                      style={styles.select}
                    >
                      <option value="">-- Escolha um endereço --</option>
                      {enderecos.map(end => (
                        <option key={end.id} value={end.id}>
                          📍 {end.logradouro}, {end.numero} - {end.bairro}
                          {end.principal && ' ⭐ (Principal)'}
                        </option>
                      ))}
                    </select>
                    <small style={styles.hint}>
                      💡 {enderecos.length} endereço(s) disponível(is)
                    </small>
                  </>
                )}
              </div>
            )}

            <div style={styles.modalButtons}>
              <button onClick={() => setModalAberto(false)} style={styles.buttonCancel}>
                ❌ Cancelar
              </button>
              <button
                onClick={adicionarAlunoAoItinerario}
                disabled={!alunoSelecionado || !enderecoSelecionado}
                style={styles.buttonConfirm}
              >
                ✅ Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function gerarLinkGoogleMaps(rota) {
  const waypoints = rota.paradas
    .map(p => `${p.localizacao.lat},${p.localizacao.lng}`)
    .join('/');
  return `https://www.google.com/maps/dir/${waypoints}`;
}

function gerarLinkWaze(rota) {
  if (!rota?.paradas?.[0]) return '';
  const firstPoint = rota.paradas[0];
  return `https://waze.com/ul?ll=${firstPoint.localizacao.lat},${firstPoint.localizacao.lng}&navigate=yes`;
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100%'
  },
  sidebar: {
    width: '350px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    overflowY: 'auto',
    borderRight: '1px solid #ddd'
  },
  mapContainer: {
    flex: 1
  },
  formGroup: {
    marginBottom: '15px'
  },
  select: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '10px'
  },
  buttonSecondary: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px'
  },
  buttonGoogle: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#34A853',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  buttonWaze: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#00d4ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  breadcrumb: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#1976d2',
    textDecoration: 'none',
    marginBottom: '20px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  info: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  list: {
    paddingLeft: '20px',
    marginTop: '10px'
  },
  small: {
    fontSize: '12px',
    color: '#666',
    display: 'block'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90%'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  buttonCancel: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonConfirm: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  loadingBox: {
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    color: '#1976d2',
    textAlign: 'center',
    marginTop: '5px'
  },
  errorBox: {
    padding: '15px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    color: '#c62828',
    textAlign: 'center',
    marginTop: '5px'
  },
  warningBox: {
    padding: '15px',
    backgroundColor: '#fff3e0',
    borderRadius: '4px',
    color: '#e65100',
    textAlign: 'center',
    marginTop: '5px'
  },
  hint: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '12px'
  }
};

export default MapaRotaEscolar;