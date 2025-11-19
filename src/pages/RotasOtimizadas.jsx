import { GoogleMap, Marker, Polyline, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RouteIcon from '@mui/icons-material/Route';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import rotasService from '../services/rotasService';
import alunosService from '../services/alunosService';
import { toast } from 'react-toastify';

function RotasOtimizadas() {
  const [searchParams] = useSearchParams();
  const itinerarioIdUrl = searchParams.get('itinerarioId');
  
  const [rota, setRota] = useState(null);
  const [itinerario, setItinerario] = useState(null);
  const [alunosItinerario, setAlunosItinerario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [center, setCenter] = useState({ lat: -23.55, lng: -46.63 });
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [modoNavegacao, setModoNavegacao] = useState(false);

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
      console.warn('[RotasOtimizadas] Geolocalização não suportada');
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
        
        console.log('[RotasOtimizadas] Localização atualizada:', newLocation);
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
        console.error('[RotasOtimizadas] Erro ao obter localização:', error);
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
      console.log('[RotasOtimizadas] Localização obtida, recalculando rota...');
      buscarDirecoesReais(rota.paradas);
    }
  }, [userLocation]);

  const carregarDadosItinerario = async () => {
    setLoading(true);
    setErro('');

    try {
      // Busca dados do itinerário
      const itData = await rotasService.buscarItinerario(itinerarioIdUrl);
      setItinerario(itData);

      // Busca alunos do itinerário
      const alunosData = await rotasService.buscarAlunosDoItinerario(itinerarioIdUrl);
      setAlunosItinerario(alunosData);

      if (alunosData.length === 0) {
        setErro('Este itinerário não possui alunos cadastrados');
        toast.warning('Adicione alunos ao itinerário antes de visualizar a rota', { theme: 'colored' });
        return;
      }

      // Otimiza a rota automaticamente
      await otimizarRota(alunosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro(error.message || 'Erro ao carregar dados do itinerário');
      toast.error('Erro ao carregar dados do itinerário', { theme: 'colored' });
    } finally {
      setLoading(false);
    }
  };

  const otimizarRota = async (alunos) => {
    try {
      console.log('[RotasOtimizadas] Dados dos alunos recebidos:', alunos);

      // Buscar coordenadas para cada aluno usando o enderecoId
      const alunosComCoordenadas = await Promise.all(
        alunos.map(async (aluno) => {
          try {
            if (!aluno.enderecoId) {
              console.error(`[RotasOtimizadas] Aluno ${aluno.nomeAluno} não possui enderecoId`);
              return null;
            }

            // Buscar dados do endereço incluindo coordenadas
            const endereco = await alunosService.getEnderecoById(aluno.enderecoId);
            console.log(`[RotasOtimizadas] Endereço do aluno ${aluno.nomeAluno}:`, endereco);

            return {
              ...aluno,
              endereco: endereco,
              enderecoCompleto: `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`,
              latitude: endereco.latitude,
              longitude: endereco.longitude
            };
          } catch (error) {
            console.error(`[RotasOtimizadas] Erro ao buscar endereço do aluno ${aluno.nomeAluno}:`, error);
            toast.error(`Não foi possível obter o endereço de ${aluno.nomeAluno}`, { theme: 'colored' });
            return null;
          }
        })
      );

      // Filtrar alunos que não conseguiram obter coordenadas
      const alunosValidos = alunosComCoordenadas.filter(a => a !== null);

      if (alunosValidos.length === 0) {
        throw new Error('Nenhum aluno possui endereço com coordenadas válidas');
      }

      console.log('[RotasOtimizadas] Alunos com coordenadas:', alunosValidos);

      // Valida e prepara os pontos de parada
      const pontosParada = alunosValidos
        .map(aluno => {
          const lat = parseFloat(aluno.latitude);
          const lng = parseFloat(aluno.longitude);

          console.log(`[RotasOtimizadas] Aluno ${aluno.nomeAluno}:`, {
            latitude: aluno.latitude,
            longitude: aluno.longitude,
            lat_parsed: lat,
            lng_parsed: lng,
            isValidLat: !isNaN(lat) && lat >= -90 && lat <= 90,
            isValidLng: !isNaN(lng) && lng >= -180 && lng <= 180
          });

          return {
            aluno,
            id: `${aluno.nomeAluno}`,
            endereco: aluno.enderecoCompleto,
            localizacao: { lat, lng }
          };
        })
        .filter(ponto => {
          // Remove pontos com coordenadas inválidas
          const isValid = 
            !isNaN(ponto.localizacao.lat) && 
            !isNaN(ponto.localizacao.lng) &&
            ponto.localizacao.lat >= -90 && 
            ponto.localizacao.lat <= 90 &&
            ponto.localizacao.lng >= -180 && 
            ponto.localizacao.lng <= 180;

          if (!isValid) {
            console.error(`[RotasOtimizadas] Aluno ${ponto.aluno.nomeAluno} tem coordenadas inválidas:`, ponto.localizacao);
            toast.error(`Aluno ${ponto.aluno.nomeAluno} não possui endereço com coordenadas válidas`, { theme: 'colored' });
          }

          return isValid;
        });

      if (pontosParada.length === 0) {
        throw new Error('Nenhum aluno possui coordenadas válidas para traçar a rota');
      }

      // Adiciona a escola como destino final
      pontosParada.push({
        id: 'Escola',
        endereco: 'Escola Destino',
        localizacao: { lat: -23.574434, lng: -46.623934 }
      });

      const request = {
        veiculo: {
          id: "VAN-ESCOLAR-01",
          localizacaoInicial: pontosParada[0].localizacao,
          localizacaoFinal: pontosParada[pontosParada.length - 1].localizacao
        },
        pontosParada: pontosParada,
        otimizarOrdem: true
      };

      console.log('[RotasOtimizadas] Request para API:', request);

      const resultado = await rotasService.otimizarRota(request);
      console.log('[RotasOtimizadas] Resultado da API:', resultado);

      // O backend retorna: { distanciaTotal, tempoTotal, paradas, metricas, provedor }
      // Mas as coordenadas das paradas estão zeradas, então precisamos preenchê-las
      
      const paradasComCoordenadas = resultado.paradas.map(parada => {
        // Encontrar o ponto original correspondente pelo ID
        const pontoOriginal = pontosParada.find(p => p.id === parada.idParada);
        
        return {
          ...parada,
          localizacao: pontoOriginal ? pontoOriginal.localizacao : parada.localizacao
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

      console.log('[RotasOtimizadas] Rota otimizada montada:', rotaOtimizada);

      setRota(rotaOtimizada);

      // Buscar direções reais (caminho pelas ruas) após otimizar
      await buscarDirecoesReais(paradasComCoordenadas);

      // Centraliza o mapa no primeiro ponto
      if (rotaOtimizada.paradas && rotaOtimizada.paradas.length > 0) {
        const primeiroPonto = rotaOtimizada.paradas[0].localizacao;
        if (primeiroPonto.lat !== 0 || primeiroPonto.lng !== 0) {
          setCenter(primeiroPonto);
        }
      }

      toast.success(`Rota otimizada! ${rotaOtimizada.distanciaKm.toFixed(2)} km em ${rotaOtimizada.duracaoMinutos} min`, { 
        theme: 'colored' 
      });
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
        
        console.log('[RotasOtimizadas] Usando localização do usuário como origem');
      } else {
        // Sem localização: primeira parada é origem
        origin = paradas[0].localizacao;
        // Paradas intermediárias são waypoints
        waypoints = paradas.slice(1, -1).map(parada => ({
          location: new window.google.maps.LatLng(parada.localizacao.lat, parada.localizacao.lng),
          stopover: true
        }));
        
        console.log('[RotasOtimizadas] Usando primeira parada como origem');
      }

      // Ponto de destino (última parada)
      const destination = paradas[paradas.length - 1].localizacao;

      console.log('[RotasOtimizadas] Buscando direções:', { origin, destination, waypoints });

      const result = await directionsService.route({
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypoints,
        optimizeWaypoints: false, // Já otimizamos antes
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      console.log('[RotasOtimizadas] Direções recebidas:', result);
      setDirectionsResponse(result);

    } catch (error) {
      console.error('[RotasOtimizadas] Erro ao buscar direções:', error);
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

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-[#34435F] text-xl">Carregando mapa...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className="w-[350px] p-5 bg-[#F4F5F6] overflow-y-auto border-r border-gray-300">
        {/* Breadcrumb */}
        <Link
          to="/itinerarios"
          className="inline-flex items-center gap-2 text-[#FB923C] no-underline mb-5 text-sm hover:text-[#172848] transition-colors"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Voltar aos Itinerários</span>
        </Link>
        
        <h2 className="text-[#172848] text-2xl font-bold mb-5">Rota Otimizada</h2>

        {/* Info do Itinerário */}
        {itinerario && (
          <div className="mb-5 p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <RouteIcon className="text-[#FB923C]" />
              <h3 className="text-[#34435F] font-semibold">{itinerario.nome}</h3>
            </div>
            <p className="text-[#34435F] text-sm">
              <strong>Turno:</strong> {itinerario.turno}
            </p>
            <p className="text-[#34435F] text-sm">
              <strong>Alunos:</strong> {alunosItinerario.length}
            </p>
          </div>
        )}

        {/* Loading/Error States */}
        {loading && (
          <div className="mb-5 p-4 bg-blue-50 text-blue-700 rounded-lg text-center">
            <p>Otimizando rota...</p>
          </div>
        )}

        {erro && (
          <div className="mb-5 p-4 bg-red-50 text-[#F04848] rounded-lg text-center">
            <p>{erro}</p>
          </div>
        )}

        {/* Resumo da Rota */}
        {rota && (
          <div className="mt-5 p-4 bg-white rounded-lg shadow">
            <h3 className="text-[#172848] font-semibold mb-3 text-lg">Resumo da Rota</h3>
            
            <div className="flex items-center gap-2 mb-2">
              <DirectionsCarIcon className="text-[#FB923C]" fontSize="small" />
              <p className="text-[#34435F]">
                <strong>Distância:</strong> {rota.distanciaKm ? rota.distanciaKm.toFixed(2) : (rota.distanciaTotal / 1000).toFixed(2)} km
              </p>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <AccessTimeIcon className="text-[#FB923C]" fontSize="small" />
              <p className="text-[#34435F]">
                <strong>Tempo:</strong> {rota.duracaoMinutos || Math.floor(rota.tempoTotal / 60)} min
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <PlaceIcon className="text-[#FB923C]" fontSize="small" />
              <p className="text-[#34435F]">
                <strong>Paradas:</strong> {rota.paradas.length}
              </p>
            </div>

            <h4 className="text-[#34435F] font-semibold mb-2">Ordem de Embarque:</h4>
            <ol className="pl-5 mt-2 space-y-1">
              {rota.paradas.map((parada, idx) => (
                <li key={idx} className="text-[#34435F]">
                  {parada.idParada}
                  {parada.horarioChegada && (
                    <small className="block text-xs text-gray-500">
                      {parada.horarioChegada}
                    </small>
                  )}
                </li>
              ))}
            </ol>

            <button
              onClick={() => window.open(gerarLinkGoogleMaps(rota), '_blank')}
              className="w-full mt-4 px-4 py-3 bg-[#4CCE5B] hover:bg-[#3cb54a] text-white font-medium rounded-lg transition-colors"
            >
              Abrir no Google Maps
            </button>

            {/* Botão de Navegação */}
            {!modoNavegacao ? (
              <button
                onClick={iniciarNavegacao}
                disabled={!userLocation}
                className="w-full mt-2 px-4 py-3 bg-[#172848] hover:bg-[#34435F] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userLocation ? 'Iniciar Navegação' : 'Aguardando localização...'}
              </button>
            ) : (
              <button
                onClick={pararNavegacao}
                className="w-full mt-2 px-4 py-3 bg-[#F04848] hover:bg-[#d93636] text-white font-medium rounded-lg transition-colors"
              >
                Parar Navegação
              </button>
            )}
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
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: isFirst ? '#4CCE5B' : isLast ? '#F04848' : '#FB923C',
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