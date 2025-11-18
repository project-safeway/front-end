import { useState, useEffect } from 'react';

/**
 * Hook para buscar todas as escolas
 * Útil em: Seletores, listagens, cadastros
 */
export function useEscolas() {
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEscolas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/escolas');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar escolas');
      }
      
      const data = await response.json();
      setEscolas(data);
    } catch (err) {
      console.error('Erro ao carregar escolas:', err);
      setError(err.message);
      setEscolas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscolas();
  }, []);

  return { escolas, loading, error, refresh: fetchEscolas };
}

/**
 * Hook para buscar uma escola específica
 * Útil em: Páginas de detalhes, edição
 */
export function useEscola(escolaId) {
  const [escola, setEscola] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!escolaId) {
      setEscola(null);
      return;
    }

    const fetchEscola = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8080/escolas/${escolaId}`);
        
        if (!response.ok) {
          throw new Error('Escola não encontrada');
        }
        
        const data = await response.json();
        setEscola(data);
      } catch (err) {
        console.error('Erro ao carregar escola:', err);
        setError(err.message);
        setEscola(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEscola();
  }, [escolaId]);

  return { escola, loading, error };
}
