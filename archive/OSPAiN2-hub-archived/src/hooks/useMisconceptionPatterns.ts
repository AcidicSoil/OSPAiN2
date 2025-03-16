import { useState, useEffect } from 'react';

// Define the pattern structure without 3D dependencies
export interface MisconceptionPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  connections: string[];
}

// Simple analysis object structure
interface PatternAnalysis {
  typeDistribution: Record<string, number>;
  frequencyDistribution: Record<string, number>;
  mostCommonPatterns: MisconceptionPattern[];
  recentPatterns: MisconceptionPattern[];
}

/**
 * Simplified hook that returns static misconception pattern data
 * This removes WebSocket dependency and returns mock data
 *
 * @returns Object containing patterns, analysis, and UI state
 */
const useMisconceptionPatterns = () => {
  const [patterns, setPatterns] = useState<MisconceptionPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<MisconceptionPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Generate mock analysis data
  const analysis: PatternAnalysis = {
    typeDistribution: {
      'Context Confusion': 35,
      Hallucination: 45,
      'Over-Confidence': 28,
      Conflation: 15,
      'Knowledge Gap': 22,
    },
    frequencyDistribution: {
      high: 38,
      medium: 72,
      low: 35,
    },
    mostCommonPatterns: [],
    recentPatterns: [],
  };

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);

    try {
      // Mock data instead of WebSocket
      const mockPatterns: MisconceptionPattern[] = [
        {
          id: '1',
          name: 'Context Confusion',
          description: 'Model fails to maintain context throughout a conversation',
          frequency: 75,
          connections: ['2', '5'],
        },
        {
          id: '2',
          name: 'Hallucination',
          description: 'Generation of content not supported by provided information',
          frequency: 92,
          connections: ['1', '3', '4'],
        },
        {
          id: '3',
          name: 'Over-Confidence',
          description: 'High confidence in incorrect or unverified statements',
          frequency: 67,
          connections: ['2', '5'],
        },
        {
          id: '4',
          name: 'Conflation',
          description: 'Merging distinct concepts inappropriately',
          frequency: 41,
          connections: ['2', '5'],
        },
        {
          id: '5',
          name: 'Knowledge Gap',
          description: 'Missing essential information for task completion',
          frequency: 58,
          connections: ['1', '3', '4'],
        },
      ];

      // Set patterns after "loading"
      setTimeout(() => {
        setPatterns(mockPatterns);
        analysis.mostCommonPatterns = [...mockPatterns]
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 3);
        analysis.recentPatterns = [...mockPatterns].sort(() => Math.random() - 0.5).slice(0, 3);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error in useMisconceptionPatterns hook:', err);
      setError(err instanceof Error ? err : new Error('An error occurred'));
      setIsLoading(false);
    }

    // No cleanup needed since we're not using WebSockets anymore
  }, []);

  return {
    patterns,
    analysis,
    isLoading,
    error,
    selectedPattern,
    setSelectedPattern,
  };
};

export default useMisconceptionPatterns;
