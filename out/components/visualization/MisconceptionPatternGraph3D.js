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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const THREE = __importStar(require("three"));
const useGraphLayoutCalculation_1 = __importDefault(require("../../hooks/useGraphLayoutCalculation"));
require("./VisualizationStyles.css");
// Node component representing a misconception pattern
const Node = ({ pattern, position, color, scale, onClick, isSelected }) => {
    const meshRef = (0, react_1.useRef)(null);
    // Add pulsing animation to selected nodes
    (0, fiber_1.useFrame)(({ clock }) => {
        if (meshRef.current && isSelected) {
            meshRef.current.scale.x = scale * (1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
            meshRef.current.scale.y = scale * (1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
            meshRef.current.scale.z = scale * (1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
        }
        else if (meshRef.current) {
            meshRef.current.scale.set(scale, scale, scale);
        }
    });
    return (<mesh ref={meshRef} position={position} onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}>
      <sphereGeometry args={[1, 32, 32]}/>
      <meshStandardMaterial color={isSelected ? '#ff9500' : color} emissive={isSelected ? '#ff4500' : '#000000'} emissiveIntensity={isSelected ? 0.5 : 0} roughness={0.7}/>
    </mesh>);
};
// Edge component representing connections between patterns
const Edge = ({ start, end, color }) => {
    const ref = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
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
    return (<mesh ref={ref}>
      <cylinderGeometry args={[0.05, 0.05, 1, 8]}/>
      <meshStandardMaterial color={color} opacity={0.6} transparent/>
    </mesh>);
};
// Scene component containing all nodes and edges
const Scene = ({ patterns, onPatternSelect }) => {
    const [selectedPattern, setSelectedPattern] = (0, react_1.useState)(null);
    // Use our custom hook instead of manual position calculation
    const positions = (0, useGraphLayoutCalculation_1.default)(patterns, {
        radius: patterns.length * 0.8,
        iterations: 100,
        springLength: 2.5,
        springStrength: 0.1,
        repulsionStrength: 10,
        damping: 0.8,
    });
    const handleNodeClick = (pattern) => {
        setSelectedPattern(pattern.id);
        if (onPatternSelect) {
            onPatternSelect(pattern);
        }
    };
    // Calculate colors based on frequency
    const getNodeColor = (frequency) => {
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
    const getNodeScale = (frequency) => {
        return 0.5 + frequency * 0.5;
    };
    return (<>
      {/* Ambient light */}
      <ambientLight intensity={0.5}/>

      {/* Directional light */}
      <directionalLight position={[10, 10, 10]} intensity={0.8}/>

      {/* Draw nodes */}
      {patterns.map((pattern) => {
            const position = positions[pattern.id] || [0, 0, 0];
            const color = getNodeColor(pattern.frequency);
            const scale = getNodeScale(pattern.frequency);
            return (<Node key={pattern.id} pattern={pattern} position={position} color={color} scale={scale} onClick={() => handleNodeClick(pattern)} isSelected={selectedPattern === pattern.id}/>);
        })}

      {/* Draw edges */}
      {patterns.map((pattern) => {
            const startPosition = positions[pattern.id];
            if (!startPosition)
                return null;
            return pattern.connections.map((targetId) => {
                const endPosition = positions[targetId];
                if (!endPosition)
                    return null;
                return (<Edge key={`${pattern.id}-${targetId}`} start={startPosition} end={endPosition} color="#aaaaaa"/>);
            });
        })}
    </>);
};
// Main component
const MisconceptionPatternGraph3D = ({ patterns, onPatternSelect = () => { }, }) => {
    return (<div className="misconception-pattern-graph-container" style={{ width: '100%', height: '500px' }}>
      <fiber_1.Canvas>
        <Scene patterns={patterns} onPatternSelect={onPatternSelect}/>
        <drei_1.OrbitControls enableDamping dampingFactor={0.25}/>
        <drei_1.PerspectiveCamera makeDefault position={[0, 0, 15]}/>
      </fiber_1.Canvas>
    </div>);
};
exports.default = MisconceptionPatternGraph3D;
//# sourceMappingURL=MisconceptionPatternGraph3D.js.map