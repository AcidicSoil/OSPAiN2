"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThreeJs = void 0;
const react_1 = require("react");
const THREE = __importStar(require("three"));
// Use proper type imports to avoid TypeScript errors
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
/**
 * Custom hook for setting up a Three.js scene
 * @param containerId - ID of the container element
 * @returns The Three.js scene, camera, and renderer
 */
const useThreeJs = (containerId) => {
    const [scene, setScene] = (0, react_1.useState)(null);
    const [camera, setCamera] = (0, react_1.useState)(null);
    const [renderer, setRenderer] = (0, react_1.useState)(null);
    const [controls, setControls] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        // Only run once on mount
        if (scene && camera && renderer)
            return;
        // Get the container element
        const container = document.getElementById(containerId);
        if (!container)
            return;
        // Create scene
        const newScene = new THREE.Scene();
        newScene.background = new THREE.Color(0xf0f0f0);
        // Create camera
        const newCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        newCamera.position.z = 5;
        // Create renderer
        const newRenderer = new THREE.WebGLRenderer({ antialias: true });
        newRenderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(newRenderer.domElement);
        // Create controls
        const newControls = new OrbitControls_1.OrbitControls(newCamera, newRenderer.domElement);
        newControls.enableDamping = true;
        newControls.dampingFactor = 0.25;
        // Set state
        setScene(newScene);
        setCamera(newCamera);
        setRenderer(newRenderer);
        setControls(newControls);
        // Handle window resize
        const handleResize = () => {
            if (!container || !newCamera || !newRenderer)
                return;
            newCamera.aspect = container.clientWidth / container.clientHeight;
            newCamera.updateProjectionMatrix();
            newRenderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', handleResize);
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (newControls)
                newControls.update();
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
exports.useThreeJs = useThreeJs;
exports.default = exports.useThreeJs;
//# sourceMappingURL=useThreeJs.js.map