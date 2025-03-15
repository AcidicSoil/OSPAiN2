import { useState } from 'react';

/**
 * Interface for Three.js dependencies mock
 * This is a simplified version without actual Three.js to reduce errors
 */
export interface ThreeJsDependencies {
  // Dummy objects to prevent TypeScript errors
  THREE: any;
  OrbitControls: any;
}

/**
 * Simplified hook that mocks Three.js dependencies
 * Returns dummy objects to prevent errors while removing 3D functionality
 * @returns Object with mock dependencies, loading state, and no errors
 */
const useThreeJs = () => {
  // Mock implementation that returns dummy objects
  const [dependencies] = useState<ThreeJsDependencies>({
    THREE: {
      // Minimal mock implementation
      Object3D: class {},
      Vector3: class {},
      Scene: class {},
      Color: class {},
    },
    OrbitControls: class {},
  });

  const [isLoading] = useState<boolean>(false);
  const [error] = useState<Error | null>(null);

  return { dependencies, isLoading, error };
};

export default useThreeJs;
