import { useState, useEffect } from 'react';
import * as THREE from 'three';
// Use proper type imports to avoid TypeScript errors
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Custom hook for setting up a Three.js scene
 * @param containerId - ID of the container element
 * @returns The Three.js scene, camera, and renderer
 */
export const useThreeJs = (containerId: string) => {
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);

  useEffect(() => {
    // Only run once on mount
    if (scene && camera && renderer) return;

    // Get the container element
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create scene
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0xf0f0f0);

    // Create camera
    const newCamera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    newCamera.position.z = 5;

    // Create renderer
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(newRenderer.domElement);

    // Create controls
    const newControls = new OrbitControls(newCamera, newRenderer.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 0.25;

    // Set state
    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setControls(newControls);

    // Handle window resize
    const handleResize = () => {
      if (!container || !newCamera || !newRenderer) return;

      newCamera.aspect = container.clientWidth / container.clientHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (newControls) newControls.update();
      if (newRenderer && newScene && newCamera) {
        newRenderer.render(newScene, newCamera);
      }
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (newRenderer && container) {
        container.removeChild(newRenderer.domElement);
        newRenderer.dispose();
      }
    };
  }, [containerId, scene, camera, renderer]);

  return { scene, camera, renderer, controls };
};

export default useThreeJs;
