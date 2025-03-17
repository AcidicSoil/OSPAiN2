import axios from 'axios';
import { useCallback, useState } from 'react';

export interface ResearchTopic {
  topic: string;
  iterations?: number;
  includeSourceDetails?: boolean;
}

export interface ResearchSource {
  title: string;
  url: string;
  content: string;
}

export interface ResearchResult {
  summary: string;
  sources: ResearchSource[];
  iterations: {
    query: string;
    summary: string;
    gaps: string[];
  }[];
}

export function useDeepResearcher() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [taskId, setTaskId] = useState<string | null>(null);

  const startResearch = useCallback(async (researchTopic: ResearchTopic) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setResult(null);
    
    try {
      // Start research task on deep-researcher-ts
      const response = await axios.post('http://localhost:2024/api/research', {
        topic: researchTopic.topic,
        iterations: researchTopic.iterations || 3,
        includeSourceDetails: researchTopic.includeSourceDetails || true
      });
      
      const newTaskId = response.data.taskId;
      setTaskId(newTaskId);
      
      // Start polling for progress
      pollForResults(newTaskId);
      
      return newTaskId;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    }
  }, []);

  const pollForResults = useCallback(async (taskId: string) => {
    try {
      const intervalId = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`http://localhost:2024/api/research/${taskId}`);
          const { status, progress, result } = statusResponse.data;
          
          setProgress(progress);
          
          if (status === 'completed') {
            clearInterval(intervalId);
            setIsLoading(false);
            
            // Process with OpenManus for enhanced analysis
            try {
              const manusResponse = await axios.post('http://localhost:3006/api/analyze', {
                researchData: result,
                analysisType: 'research_enhancement'
              });
              
              setResult(manusResponse.data);
            } catch (manusErr) {
              console.warn('OpenManus enhancement failed, using original results', manusErr);
              setResult(result);
            }
          } else if (status === 'failed') {
            clearInterval(intervalId);
            setIsLoading(false);
            setError(statusResponse.data.error || 'Research failed');
          }
        } catch (pollErr) {
          console.error('Error polling for results:', pollErr);
          // Don't clear interval, try again
        }
      }, 2000);
      
      return () => clearInterval(intervalId);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, []);

  const cancelResearch = useCallback(async () => {
    if (!taskId) return;
    
    try {
      await axios.delete(`http://localhost:2024/api/research/${taskId}`);
      setIsLoading(false);
      setTaskId(null);
    } catch (err) {
      console.error('Error canceling research:', err);
    }
  }, [taskId]);

  return {
    startResearch,
    cancelResearch,
    result,
    isLoading,
    progress,
    error,
    taskId
  };
} 