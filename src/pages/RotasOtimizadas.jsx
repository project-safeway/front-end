import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import SchoolIcon from '@mui/icons-material/School';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RestoreIcon from '@mui/icons-material/Restore';
import rotasService from '../services/rotasService';
import alunosService from '../services/alunosService';
import escolasService from '../services/escolasService';
import { toast } from 'react-toastify';

function RotasOtimizadas() {
  const [searchParams] = useSearchParams();
  const itinerarioIdUrl = searchParams.get('itinerarioId');

  const [rota, setRota] = useState(null);
  const [rotaOriginal, setRotaOriginal] = useState(null); // Guardar rota original
  const [itinerario, setItinerario] = useState(null);
  const [alunosItinerario, setAlunosItinerario] = useState([]);
  const [escolasItinerario, setEscolasItinerario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [center, setCenter] = useState({ lat: -23.55, lng: -46.63 });
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [modoNavegacao, setModoNavegacao] = useState(false);
  const [usandoRotaOtimizada, setUsandoRotaOtimizada] = useState(false); // Controlar se está usando rota otimizada

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "SUA_API_KEY_AQUI",
    libraries: ['places', 'geometry']
  });

  useEffect(() => {
    if (itinerarioIdUrl) {
      carregarDadosItinerario();
    }
  }, [itinerarioIdUrl]);

  // Rastrear localização do usuário em tempo real
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading || 0,
          speed: position.coords.speed || 0
        };

        setUserLocation(newLocation);

        // Se modo navegação estiver ativo, atualizar câmera
        if (modoNavegacao && map) {
          map.panTo(newLocation);
          if (position.coords.heading) {
            map.setHeading(position.coords.heading);
          }
        }
      },
      (error) => {
        toast.error('Não foi possível obter sua localização', { theme: 'colored' });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [modoNavegacao, map]);

  // Recalcular direções quando localização do usuário for obtida
  useEffect(() => {
    if (userLocation && rota && rota.paradas && rota.paradas.length > 0) {
      buscarDirecoesReais(rota.paradas);
    }
  }, [userLocation]);

  const carregarDadosItinerario = async () => {
    setLoading(true);
    setErro('');

    try {
      // Busca dados completos do itinerário (inclui alunos e escolas com ordemGlobal)
      const itData = await rotasService.buscarItinerario(itinerarioIdUrl);
      setItinerario(itData);

      // Usar alunos e escolas do itinerário completo (têm ordemGlobal)
      const alunosData = itData.alunos || [];
      const escolasData = itData.escolas || [];

      setAlunosItinerario(alunosData);
      setEscolasItinerario(escolasData);

      console.log('[Carregamento] Alunos do itinerário:', alunosData);
      console.log('[Carregamento] Escolas do itinerário:', escolasData);

      if (alunosData.length === 0 && escolasData.length === 0) {
        setErro('Este itinerário não possui alunos ou escolas cadastradas');
        toast.warning('Adicione alunos ou escolas ao itinerário antes de visualizar a rota', { theme: 'colored' });
        return;
      }

      // Otimiza a rota automaticamente
      await otimizarRota(alunosData, escolasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro(error.message || 'Erro ao carregar dados do itinerário');
      toast.error('Erro ao carregar dados do itinerário', { theme: 'colored' });
    } finally {
      setLoading(false);
    }
  };

  const otimizarRota = async (alunos, escolas = [], forcarOtimizacao = false) => {
    try {
      // Criar lista unificada de itens (alunos + escolas) com ordem
      const itensUnificados = [
        ...alunos.map(aluno => ({
          ...aluno,
          tipo: 'aluno',
          ordem: aluno.ordemGlobal || aluno.ordemEmbarque || 0
        })),
        ...escolas.map(escola => ({
          ...escola,
          tipo: 'escola',
          ordem: escola.ordemGlobal || escola.ordemVisita || 0
        }))
      ];

      // Log para debug
      console.log('===== ORDEM DOS ITENS =====');
      itensUnificados.forEach(item => {
        const nome = item.tipo === 'aluno' ? item.nomeAluno : item.nome;
        console.log(`${item.tipo.toUpperCase()}: ${nome} - ordemGlobal: ${item.ordemGlobal}, ordemEspecifica: ${item.tipo === 'aluno' ? item.ordemEmbarque : item.ordemVisita}, ordem usada: ${item.ordem}`);
      });

      // Ordenar pela ordem global (prioriza ordemGlobal, senão usa ordem específica)
      itensUnificados.sort((a, b) => a.ordem - b.ordem);

      console.log('===== ORDEM APÓS SORT =====');
      itensUnificados.forEach((item, idx) => {
        const nome = item.tipo === 'aluno' ? item.nomeAluno : item.nome;
        console.log(`${idx + 1}. ${item.tipo.toUpperCase()}: ${nome} - ordem: ${item.ordem}`);
      });
      console.log('===========================');

      // Buscar coordenadas para cada item na ordem correta
      const itensComCoordenadas = await Promise.all(
        itensUnificados.map(async (item) => {
          try {
            if (item.tipo === 'aluno') {
              // Processar aluno
              if (!item.enderecoId) {
                return null;
              }

              const endereco = await alunosService.getEnderecoById(item.enderecoId);

              return {
                ...item,
                endereco: endereco,
                enderecoCompleto: `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`,
                latitude: endereco.latitude,
                longitude: endereco.longitude
              };
            } else {
              // Processar escola
              const escolaId = item.escolaId || item.idEscola || item.id;

              if (!escolaId) {
                return null;
              }

              const endereco = await escolasService.getEnderecoEscola(escolaId);

              return {
                ...item,
                endereco: endereco,
                enderecoCompleto: `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`,
                latitude: endereco.latitude,
                longitude: endereco.longitude
              };
            }
          } catch (error) {
            const nome = item.tipo === 'aluno' ? item.nomeAluno : (item.nome || item.nomeEscola);
            toast.error(`Não foi possível obter o endereço de ${nome}`, { theme: 'colored' });
            return null;
          }
        })
      );

      // Filtrar itens válidos e converter para pontos de parada
      const itensValidos = itensComCoordenadas.filter(item => item !== null);

      if (itensValidos.length === 0) {
        throw new Error('Nenhum ponto possui endereço com coordenadas válidas');
      }

      // Converter para pontos de parada mantendo a ordem
      const pontosParada = [];

      itensValidos.forEach((item, index) => {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);

        const nome = item.tipo === 'aluno' ? item.nomeAluno : (item.nome || item.nomeEscola);

        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          const ponto = {
            id: item.tipo === 'aluno' ? nome : `${nome}`,
            endereco: item.enderecoCompleto,
            localizacao: { lat, lng },
            tipo: item.tipo,
            ordem: item.ordem
          };

          // Adicionar dados específicos do tipo
          if (item.tipo === 'aluno') {
            ponto.aluno = item;
          } else {
            ponto.escola = item;
          }

          pontosParada.push(ponto);
        } else {
          toast.error(`${item.tipo === 'aluno' ? 'Aluno' : 'Escola'} ${nome} não possui endereço com coordenadas válidas`, { theme: 'colored' });
        }
      });

      if (pontosParada.length === 0) {
        throw new Error('Nenhum ponto de parada válido encontrado');
      }

      console.log('===== PONTOS DE PARADA ENVIADOS =====');
      pontosParada.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.id} - ordem: ${p.ordem}`);
      });
      console.log('======================================');

      const request = {
        veiculo: {
          id: "VAN-ESCOLAR-01",
          localizacaoInicial: pontosParada[0].localizacao,
          localizacaoFinal: pontosParada[pontosParada.length - 1].localizacao
        },
        pontosParada: pontosParada,
        otimizarOrdem: forcarOtimizacao // Usar parâmetro para decidir se otimiza ou mantém ordem
      };

      const resultado = await rotasService.otimizarRota(request);

      console.log('===== PARADAS RETORNADAS PELO BACKEND =====');
      resultado.paradas.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.idParada}`);
      });
      console.log('===========================================');

      // O backend retorna: { distanciaTotal, tempoTotal, paradas, metricas, provedor }
      // Mas as coordenadas das paradas estão zeradas, então precisamos preenchê-las

      const paradasComCoordenadas = resultado.paradas.map(parada => {
        // Encontrar o ponto original correspondente pelo ID
        const pontoOriginal = pontosParada.find(p => p.id === parada.idParada);

        return {
          ...parada,
          localizacao: pontoOriginal ? pontoOriginal.localizacao : parada.localizacao,
          tipo: pontoOriginal ? pontoOriginal.tipo : 'aluno' // Preservar tipo do ponto original
        };
      });

      // Montar estrutura de rota com coordenadas corretas
      const rotaOtimizada = {
        distanciaTotal: resultado.distanciaTotal,
        distanciaKm: resultado.distanciaTotal / 1000,
        tempoTotal: resultado.tempoTotal,
        duracaoMinutos: Math.round(resultado.tempoTotal / 60),
        paradas: paradasComCoordenadas,
        metricas: resultado.metricas,
        provedor: resultado.provedor
      };

      setRota(rotaOtimizada);

      // Salvar rota original na primeira vez (sem otimização)
      if (!forcarOtimizacao && !rotaOriginal) {
        setRotaOriginal(rotaOtimizada);
      }

      // Buscar direções reais (caminho pelas ruas) após otimizar
      await buscarDirecoesReais(paradasComCoordenadas);

      // Centraliza o mapa no primeiro ponto
      if (rotaOtimizada.paradas && rotaOtimizada.paradas.length > 0) {
        const primeiroPonto = rotaOtimizada.paradas[0].localizacao;
        if (primeiroPonto.lat !== 0 || primeiroPonto.lng !== 0) {
          setCenter(primeiroPonto);
        }
      }

      const mensagem = forcarOtimizacao
        ? `Rota otimizada pelo Google! ${rotaOtimizada.distanciaKm.toFixed(2)} km em ${rotaOtimizada.duracaoMinutos} min`
        : `Rota calculada! ${rotaOtimizada.distanciaKm.toFixed(2)} km em ${rotaOtimizada.duracaoMinutos} min`;

      toast.success(mensagem, { theme: 'colored' });
    } catch (error) {
      console.error('[RotasOtimizadas] Erro ao otimizar rota:', error);
      setErro(error.message || 'Erro ao calcular rota otimizada');
      toast.error(error.message || 'Erro ao calcular rota otimizada', { theme: 'colored' });
    }
  };

  const buscarDirecoesReais = async (paradas) => {
    if (!window.google || paradas.length < 2) return;

    try {
      const directionsService = new window.google.maps.DirectionsService();

      // Se tiver localização do usuário, sempre iniciar a rota da localização atual
      let origin;
      let waypoints;

      if (userLocation) {
        // Iniciar da localização do usuário
        origin = userLocation;
        // Todas as paradas viram waypoints (exceto a última que é o destino)
        waypoints = paradas.slice(0, -1).map(parada => ({
          location: new window.google.maps.LatLng(parada.localizacao.lat, parada.localizacao.lng),
          stopover: true
        }));

      } else {
        // Sem localização: primeira parada é origem
        origin = paradas[0].localizacao;
        // Paradas intermediárias são waypoints
        waypoints = paradas.slice(1, -1).map(parada => ({
          location: new window.google.maps.LatLng(parada.localizacao.lat, parada.localizacao.lng),
          stopover: true
        }));

      }

      // Ponto de destino (última parada)
      const destination = paradas[paradas.length - 1].localizacao;

      const result = await directionsService.route({
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypoints,
        optimizeWaypoints: false, // Já otimizamos antes
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(result);

    } catch (error) {
      toast.warning('Não foi possível carregar o caminho nas ruas', { theme: 'colored' });
    }
  };

  const iniciarNavegacao = async () => {
    if (!userLocation) {
      toast.error('Aguardando localização...', { theme: 'colored' });
      return;
    }

    setModoNavegacao(true);

    if (map) {
      // Configurar câmera em perspectiva (como Waze/Google Maps)
      map.setZoom(18);
      map.setMapTypeId('roadmap'); // Garantir que está em modo satélite/roadmap que suporta tilt

      // Aguardar um frame para aplicar tilt
      setTimeout(() => {
        if (map) {
          map.setTilt(45); // Ângulo de inclinação
          map.panTo(userLocation);

          if (userLocation.heading) {
            map.setHeading(userLocation.heading);
          }
        }
      }, 100);
    }

    // Recalcular rota incluindo localização do usuário
    if (rota && rota.paradas) {
      await buscarDirecoesReais(rota.paradas);
    }

    toast.success('Navegação iniciada!', { theme: 'colored' });
  };

  const pararNavegacao = () => {
    setModoNavegacao(false);

    if (map) {
      map.setTilt(0); // Voltar para visão de cima
      map.setZoom(13);
    }

    toast.info('Navegação encerrada', { theme: 'colored' });
  };

  const sugerirMelhorRota = async () => {
    if (!alunosItinerario.length && !escolasItinerario.length) {
      toast.warning('Não há dados para otimizar', { theme: 'colored' });
      return;
    }

    setLoading(true);
    try {
      toast.info('Calculando melhor rota...', { theme: 'colored' });
      await otimizarRota(alunosItinerario, escolasItinerario, true); // forcarOtimizacao = true
      setUsandoRotaOtimizada(true);
    } catch (error) {
      toast.error('Erro ao calcular melhor rota', { theme: 'colored' });
    } finally {
      setLoading(false);
    }
  };

  const voltarRotaOriginal = async () => {
    if (!alunosItinerario.length && !escolasItinerario.length) {
      toast.warning('Não há dados para recalcular', { theme: 'colored' });
      return;
    }

    setLoading(true);
    try {
      toast.info('Voltando para ordem cadastrada...', { theme: 'colored' });
      await otimizarRota(alunosItinerario, escolasItinerario, false); // forcarOtimizacao = false
      setUsandoRotaOtimizada(false);
    } catch (error) {
      toast.error('Erro ao recalcular rota', { theme: 'colored' });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-[#34435F] text-xl">Carregando mapa...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-[350px] p-5 bg-[#F4F5F6] border-r border-gray-300 flex flex-col">
        {/* Breadcrumb */}
        <Link
          to="/itinerarios"
          className="inline-flex items-center gap-2 text-[#FB923C] no-underline mb-4 text-sm hover:text-[#172848] transition-colors flex-shrink-0"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Voltar aos Itinerários</span>
        </Link>

        <h2 className="text-[#172848] text-2xl font-bold mb-4 flex-shrink-0">Rota Otimizada</h2>

        {/* Loading/Error States */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg text-center flex-shrink-0">
            <p>Otimizando rota...</p>
          </div>
        )}

        {erro && (
          <div className="mb-4 p-4 bg-red-50 text-[#F04848] rounded-lg text-center flex-shrink-0">
            <p>{erro}</p>
          </div>
        )}

        {/* Resumo da Rota - Único card */}
        {rota && (
          <div className="bg-white rounded-lg shadow flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
              <h3 className="text-[#172848] font-semibold text-lg">Resumo da Rota</h3>

              {/* Botão de sugestão ou voltar */}
              {!usandoRotaOtimizada ? (
                <button
                  onClick={sugerirMelhorRota}
                  disabled={loading}
                  className="p-2 rounded-full hover:bg-blue-50 transition-colors group relative disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sugerir melhor rota"
                >
                  <HelpOutlineIcon className="text-blue-500" fontSize="small" />
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Sugerir melhor rota
                  </span>
                </button>
              ) : (
                <button
                  onClick={voltarRotaOriginal}
                  disabled={loading}
                  className="p-2 rounded-full hover:bg-orange-50 transition-colors group relative disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Retornar"
                >
                  <RestoreIcon className="text-[#FB923C]" fontSize="small" />
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Retornar para ordem cadastrada
                  </span>
                </button>
              )}
            </div>

            <div className="p-4 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <DirectionsCarIcon className="text-[#FB923C]" fontSize="small" />
                <p className="text-[#34435F] text-sm">
                  <strong>Distância:</strong> {rota.distanciaKm ? rota.distanciaKm.toFixed(2) : (rota.distanciaTotal / 1000).toFixed(2)} km
                </p>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <AccessTimeIcon className="text-[#FB923C]" fontSize="small" />
                <p className="text-[#34435F] text-sm">
                  <strong>Tempo:</strong> {rota.duracaoMinutos || Math.floor(rota.tempoTotal / 60)} min
                </p>
              </div>

              <div className="flex items-center gap-2">
                <PlaceIcon className="text-[#FB923C]" fontSize="small" />
                <p className="text-[#34435F] text-sm">
                  <strong>Paradas:</strong> {rota.paradas.length}
                </p>
              </div>
            </div>

            <div className="px-4 pb-2 flex-shrink-0">
              <h4 className="text-[#34435F] font-semibold text-sm mb-2">Ordem de Paradas:</h4>
            </div>

            {/* Lista com scroll */}
            <div className="flex-1 overflow-y-auto px-4">
              <ol className="pl-5 space-y-1 pb-2">
                {rota.paradas.map((parada, idx) => {
                  const isEscola = parada.tipo === 'escola'
                  return (
                    <li key={idx} className="text-[#34435F] flex items-center gap-2">
                      {isEscola ? (
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="w-3 h-3 bg-[#FB923C] rounded-full"></span>
                      )}
                      <span className={isEscola ? 'font-small' : ''}>
                        {parada.idParada}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Legenda e botões - fixos no final */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="mb-3">
                <p className="text-xs text-[#34435F] font-semibold mb-2">Legenda:</p>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#FB923C] rounded-full"></span>
                    <span className="text-[#34435F]">Aluno</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-[#34435F]">Escola</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.open(gerarLinkGoogleMaps(rota), '_blank')}
                className="w-full mb-2 px-4 py-2.5 bg-[#4CCE5B] hover:bg-[#3cb54a] text-white font-medium rounded-lg transition-colors text-sm"
              >
                Abrir no Google Maps
              </button>

              {!modoNavegacao ? (
                <button
                  onClick={iniciarNavegacao}
                  disabled={!userLocation}
                  className="w-full px-4 py-2.5 bg-[#172848] hover:bg-[#34435F] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {userLocation ? 'Iniciar Navegação' : 'Aguardando localização...'}
                </button>
              ) : (
                <button
                  onClick={pararNavegacao}
                  className="w-full px-4 py-2.5 bg-[#F04848] hover:bg-[#d93636] text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Parar Navegação
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="flex-1">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={13}
          onLoad={(mapInstance) => setMap(mapInstance)}
          options={{
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            rotateControl: modoNavegacao,
            tilt: modoNavegacao ? 45 : 0
          }}
        >
          {/* Marcador do usuário/veículo */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: '#172848',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2,
                rotation: userLocation.heading || 0
              }}
              title="Sua localização"
              zIndex={1000}
            />
          )}

          {rota?.paradas.map((parada, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === rota.paradas.length - 1;
            const isEscola = parada.idParada?.includes('Escola:');

            // Cores diferentes para alunos e escolas
            let corMarcador = '#FB923C'; // Laranja padrão para alunos
            if (isEscola) {
              corMarcador = '#22C55E'; // Verde para escolas
            } else if (isFirst) {
              corMarcador = '#4CCE5B'; // Verde claro para primeiro
            } else if (isLast) {
              corMarcador = '#F04848'; // Vermelho para último
            }

            return (
              <Marker
                key={idx}
                position={parada.localizacao}
                label={{
                  text: `${idx + 1}`,
                  color: 'white',
                  fontWeight: 'bold'
                }}
                title={parada.idParada}
                icon={{
                  path: isEscola ? window.google.maps.SymbolPath.CIRCLE : window.google.maps.SymbolPath.CIRCLE,
                  scale: isEscola ? 15 : 12,
                  fillColor: corMarcador,
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 2
                }}
              />
            );
          })}

          {/* DirectionsRenderer para mostrar caminho nas ruas */}
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                suppressMarkers: true, // Não mostrar marcadores padrão (usamos os personalizados)
                polylineOptions: {
                  strokeColor: '#FB923C',
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                  geodesic: true,
                  icons: [{
                    icon: {
                      path: 'M 0,-1 0,1',
                      strokeOpacity: 1,
                      scale: 3
                    },
                    offset: '0',
                    repeat: '15px'
                  }]
                }
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

function gerarLinkGoogleMaps(rota) {
  const waypoints = rota.paradas
    .map(p => `${p.localizacao.lat},${p.localizacao.lng}`)
    .join('/');
  return `https://www.google.com/maps/dir/${waypoints}`;
}

export default RotasOtimizadas;