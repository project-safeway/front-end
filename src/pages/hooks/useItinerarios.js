import { useState, useEffect } from 'react';

/**
 * Hook para buscar todos os itinerários
 * Útil em: Listagem de itinerários, seletores
 */
export function useItinerarios() {
  const [itinerarios, setItinerarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItinerarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/itinerarios');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar itinerários');
      }
      
      const data = await response.json();
      setItinerarios(data);
    } catch (err) {
      console.error('Erro ao carregar itinerários:', err);
      setError(err.message);
      setItinerarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerarios();
  }, []);

  return { itinerarios, loading, error, refresh: fetchItinerarios };
}

/**
 * Hook para buscar um itinerário específico com detalhes
 * Útil em: Páginas de detalhes, edição
 */
export function useItinerario(itinerarioId) {
  const [itinerario, setItinerario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itinerarioId) {
      setItinerario(null);
      return;
    }

    const fetchItinerario = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8080/itinerarios/${itinerarioId}`);
        
        if (!response.ok) {
          throw new Error('Itinerário não encontrado');
        }
        
        const data = await response.json();
        setItinerario(data);
      } catch (err) {
        console.error('Erro ao carregar itinerário:', err);
        setError(err.message);
        setItinerario(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerario();
  }, [itinerarioId]);

  return { itinerario, loading, error };
}

/**
 * Hook para buscar alunos de um itinerário específico
 * Útil em: Visualização de rotas, chamada, gestão de paradas
 */
export function useAlunosItinerario(itinerarioId) {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlunos = async () => {
    if (!itinerarioId) {
      setAlunos([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8080/itinerarios/${itinerarioId}/alunos`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar alunos do itinerário');
      }
      
      const data = await response.json();
      setAlunos(data);
    } catch (err) {
      console.error('Erro ao carregar alunos do itinerário:', err);
      setError(err.message);
      setAlunos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [itinerarioId]);

  return { alunos, loading, error, refresh: fetchAlunos };
}
