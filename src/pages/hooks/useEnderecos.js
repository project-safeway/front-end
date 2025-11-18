import { useState, useEffect } from 'react';

export function useEnderecos(alunoId) {
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!alunoId) {
      setEnderecos([]);
      setError(null);
      return;
    }

    const fetchEnderecos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8080/alunos/${alunoId}/enderecos`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar endereços');
        }
        
        const data = await response.json();
        setEnderecos(data);
      } catch (err) {
        console.error('Erro ao carregar endereços:', err);
        setError(err.message);
        setEnderecos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnderecos();
  }, [alunoId]);

  return { enderecos, loading, error };
}
