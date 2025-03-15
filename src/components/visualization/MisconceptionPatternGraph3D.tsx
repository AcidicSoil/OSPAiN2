import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';
import useGraphLayoutCalculation from '../../hooks/useGraphLayoutCalculation';
import './VisualizationStyles.css';

interface MisconceptionPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  connections: string[];
  position?: Vector3;
}

interface NodeProps {
  pattern: MisconceptionPattern;
  position: [number, number, number];
  color: string;
  scale: number;
  onClick: () => void;
  isSelected: boolean;
}

interface SceneProps {
  patterns: MisconceptionPattern[];
  onPatternSelect: (pattern: MisconceptionPattern) => void;
}

interface MisconceptionPatternGraph3DProps {
  patterns: MisconceptionPattern[];
  onPatternSelect?: (pattern: MisconceptionPattern) => void;
}

// Node component representing a misconception pattern
const Node: React.FC<NodeProps> = ({ pattern, position, color, scale, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Add pulsing animation to selected nodes
  useFrame(({ clock }) => {
    if (meshRef.current && isSelected) {
      meshRef.current.scale.x = scale * (1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
      meshRef.current.scale.y = scale * (1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
      meshRef.current.scale.z = scale * (1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
    } else if (meshRef.current) {
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={isSelected ? '#ff9500' : color}
        emissive={isSelected ? '#ff4500' : '#000000'}
        emissiveIntensity={isSelected ? 0.5 : 0}
        roughness={0.7}
      />
    </mesh>
  );
};

// Edge component representing connections between patterns
const Edge: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}> = ({ start, end, color }) => {
  const ref = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (ref.current) {
      // Calculate midpoint
      const midX = (start[0] + end[0]) / 2;
      const midY = (start[1] + end[1]) / 2;
      const midZ = (start[2] + end[2]) / 2;

      // Set position to midpoint
      ref.current.position.set(midX, midY, midZ);

      // Calculate direction vector
      const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);

      // Calculate rotation
      ref.current.lookAt(new THREE.Vector3(...end));

      // Set scale to match distance
      const distance = direction.length();
      ref.current.scale.set(0.1, 0.1, distance);
    }
  }, [start, end]);

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
      <meshStandardMaterial color={color} opacity={0.6} transparent />
    </mesh>
  );
};

// Scene component containing all nodes and edges
const Scene: React.FC<SceneProps> = ({ patterns, onPatternSelect }) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // Use our custom hook instead of manual position calculation
  const positions = useGraphLayoutCalculation(patterns, {
    radius: patterns.length * 0.8,
    iterations: 100,
    springLength: 2.5,
    springStrength: 0.1,
    repulsionStrength: 10,
    damping: 0.8,
  });

  const handleNodeClick = (pattern: MisconceptionPattern) => {
    setSelectedPattern(pattern.id);
    if (onPatternSelect) {
      onPatternSelect(pattern);
    }
  };

  // Calculate colors based on frequency
  const getNodeColor = (frequency: number) => {
    const colors = [
      '#4285F4', // blue (low frequency)
      '#34A853', // green
      '#FBBC05', // yellow
      '#EA4335', // red (high frequency)
    ];

    const index = Math.min(Math.floor(frequency * colors.length), colors.length - 1);
    return colors[index];
  };

  // Calculate scale based on frequency
  const getNodeScale = (frequency: number) => {
    return 0.5 + frequency * 0.5;
  };

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.5} />

      {/* Directional light */}
      <directionalLight position={[10, 10, 10]} intensity={0.8} />

      {/* Draw nodes */}
      {patterns.map((pattern) => {
        const position = positions[pattern.id] || [0, 0, 0];
        const color = getNodeColor(pattern.frequency);
        const scale = getNodeScale(pattern.frequency);

        return (
          <Node
            key={pattern.id}
            pattern={pattern}
            position={position}
            color={color}
            scale={scale}
            onClick={() => handleNodeClick(pattern)}
            isSelected={selectedPattern === pattern.id}
          />
        );
      })}

      {/* Draw edges */}
      {patterns.map((pattern) => {
        const startPosition = positions[pattern.id];

        if (!startPosition) return null;

        return pattern.connections.map((targetId) => {
          const endPosition = positions[targetId];

          if (!endPosition) return null;

          return (
            <Edge
              key={`${pattern.id}-${targetId}`}
              start={startPosition}
              end={endPosition}
              color="#aaaaaa"
            />
          );
        });
      })}
    </>
  );
};

// Main component
const MisconceptionPatternGraph3D: React.FC<MisconceptionPatternGraph3DProps> = ({
  patterns,
  onPatternSelect = () => {},
}) => {
  return (
    <div
      className="misconception-pattern-graph-container"
      style={{ width: '100%', height: '500px' }}
    >
      <Canvas>
        <Scene patterns={patterns} onPatternSelect={onPatternSelect} />
        <OrbitControls enableDamping dampingFactor={0.25} />
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
      </Canvas>
    </div>
  );
};

export default MisconceptionPatternGraph3D;
