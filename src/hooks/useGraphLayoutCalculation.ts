import { useState, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Pattern data interface for graph nodes
 */
interface Pattern {
  id: string;
  frequency: number;
  connections: string[];
}

/**
 * Custom hook that calculates 3D positions for graph nodes
 * using force-directed layout algorithm
 *
 * @param patterns - Array of pattern objects to position
 * @param options - Configuration options for the layout algorithm
 * @returns Object with calculated positions for each node
 */
export const useGraphLayoutCalculation = <T extends Pattern>(
  patterns: T[],
  options: {
    radius?: number;
    iterations?: number;
    springLength?: number;
    springStrength?: number;
    repulsionStrength?: number;
    damping?: number;
  } = {},
) => {
  const [positions, setPositions] = useState<Record<string, [number, number, number]>>({});

  useEffect(() => {
    if (!patterns.length) return;

    // Set default options
    const {
      radius = patterns.length * 0.8,
      iterations = 100,
      springLength = 2,
      springStrength = 0.1,
      repulsionStrength = 5,
      damping = 0.9,
    } = options;

    // Initialize positions in a spherical layout
    const initialPositions: Record<string, THREE.Vector3> = {};

    patterns.forEach((pattern, index) => {
      const phi = Math.acos(-1 + (2 * index) / patterns.length);
      const theta = Math.sqrt(patterns.length * Math.PI) * phi;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      initialPositions[pattern.id] = new THREE.Vector3(x, y, z);
    });

    // Create connection map for faster lookup
    const connectionMap: Record<string, string[]> = {};
    patterns.forEach((pattern) => {
      connectionMap[pattern.id] = pattern.connections;
    });

    // Run force-directed layout algorithm
    let currentPositions = { ...initialPositions };
    let velocities: Record<string, THREE.Vector3> = {};

    // Initialize velocities
    Object.keys(currentPositions).forEach((id) => {
      velocities[id] = new THREE.Vector3(0, 0, 0);
    });

    // Run iterations
    for (let i = 0; i < iterations; i++) {
      // Calculate forces
      const forces: Record<string, THREE.Vector3> = {};

      // Initialize forces
      Object.keys(currentPositions).forEach((id) => {
        forces[id] = new THREE.Vector3(0, 0, 0);
      });

      // Apply spring forces (attraction between connected nodes)
      patterns.forEach((pattern) => {
        const sourcePos = currentPositions[pattern.id];

        pattern.connections.forEach((targetId) => {
          if (!currentPositions[targetId]) return;

          const targetPos = currentPositions[targetId];
          const direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
          const distance = direction.length();

          // Skip if nodes are at the same position
          if (distance === 0) return;

          // Calculate spring force
          direction.normalize();
          const force = direction.multiplyScalar(springStrength * (distance - springLength));

          forces[pattern.id].add(force);
          forces[targetId].sub(force); // Equal and opposite force
        });
      });

      // Apply repulsion forces (between all nodes)
      const patternIds = Object.keys(currentPositions);

      for (let j = 0; j < patternIds.length; j++) {
        const id1 = patternIds[j];
        const pos1 = currentPositions[id1];

        for (let k = j + 1; k < patternIds.length; k++) {
          const id2 = patternIds[k];
          const pos2 = currentPositions[id2];

          const direction = new THREE.Vector3().subVectors(pos1, pos2);
          const distance = direction.length();

          // Skip if nodes are at the same position
          if (distance === 0) continue;

          // Calculate repulsion force (inverse square law)
          direction.normalize();
          const force = direction.multiplyScalar(repulsionStrength / (distance * distance));

          forces[id1].add(force);
          forces[id2].sub(force);
        }
      }

      // Update velocities and positions
      Object.keys(currentPositions).forEach((id) => {
        // Update velocity with force and damping
        velocities[id].add(forces[id]);
        velocities[id].multiplyScalar(damping);

        // Update position
        currentPositions[id].add(velocities[id]);
      });
    }

    // Convert to [x, y, z] format for component consumption
    const finalPositions: Record<string, [number, number, number]> = {};

    Object.entries(currentPositions).forEach(([id, vector]) => {
      finalPositions[id] = [vector.x, vector.y, vector.z];
    });

    setPositions(finalPositions);
  }, [patterns, options]);

  return positions;
};

export default useGraphLayoutCalculation;
