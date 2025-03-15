import React from 'react';
import { Vector3 } from 'three';
import './VisualizationStyles.css';

// Keep the interface for compatibility
interface MisconceptionPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  connections: string[];
  position?: Vector3;
}

interface MisconceptionPatternGraph3DProps {
  patterns: MisconceptionPattern[];
  onPatternSelect?: (pattern: MisconceptionPattern) => void;
  height?: string;
  width?: string;
}

/**
 * Simplified MisconceptionPatternGraph3D component
 * This is a non-3D version that simply displays pattern data as JSON
 * replacing the Three.js implementation to reduce errors
 */
const MisconceptionPatternGraph3D: React.FC<MisconceptionPatternGraph3DProps> = ({
  patterns,
  onPatternSelect,
  height = '400px',
  width = '100%',
}) => {
  return (
    <div
      className="misconception-pattern-graph-container"
      style={{
        width,
        height,
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        overflow: 'auto',
        backgroundColor: '#f5f5f5',
      }}
    >
      <h3>Pattern Visualization (Simplified JSON View)</h3>
      <p>The 3D visualization has been temporarily removed to simplify the application.</p>

      <div>
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            onClick={() => onPatternSelect && onPatternSelect(pattern)}
            style={{
              cursor: 'pointer',
              margin: '8px 0',
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h4>{pattern.name}</h4>
            <p>{pattern.description}</p>
            <div>
              <strong>Frequency:</strong> {pattern.frequency}
            </div>
            <div>
              <strong>Connections:</strong> {pattern.connections.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisconceptionPatternGraph3D;
