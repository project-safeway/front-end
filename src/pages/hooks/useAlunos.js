import { useState, useEffect } from 'react';

/**
 * Hook para buscar todos os alunos
 * Útil em: Páginas de listagem, seletores de alunos, relatórios
 */
export function useAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlunos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:8080/alunos');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar alunos');
        }
        
        const data = await response.json();
        setAlunos(data);
      } catch (err) {
        console.error('Erro ao carregar alunos:', err);
        setError(err.message);
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, []);

  return { alunos, loading, error, refresh: () => fetchAlunos() };
}

/**
 * Hook para buscar alunos por escola
 * Útil em: Filtros por escola, atribuição de itinerários
 */
export function useAlunosPorEscola(escolaId) {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!escolaId) {
      setAlunos([]);
      return;
    }

    const fetchAlunos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8080/alunos?escolaId=${escolaId}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar alunos da escola');
        }
        
        const data = await response.json();
        setAlunos(data);
      } catch (err) {
        console.error('Erro ao carregar alunos da escola:', err);
        setError(err.message);
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [escolaId]);

  return { alunos, loading, error };
}

/**
 * Hook para buscar um aluno específico com todos os detalhes
 * Útil em: Páginas de detalhes, edição de aluno
 */
export function useAluno(alunoId) {
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!alunoId) {
      setAluno(null);
      return;
    }

    const fetchAluno = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8080/alunos/${alunoId}`);
        
        if (!response.ok) {
          throw new Error('Aluno não encontrado');
        }
        
        const data = await response.json();
        setAluno(data);
      } catch (err) {
        console.error('Erro ao carregar aluno:', err);
        setError(err.message);
        setAluno(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAluno();
  }, [alunoId]);

  return { aluno, loading, error };
}
