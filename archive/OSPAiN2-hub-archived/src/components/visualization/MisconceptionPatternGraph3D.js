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
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const three_1 = require("three");
const getTypeColor = (type) => {
    const colors = {
        hallucination: '#ff5555',
        overconfidence: '#ffaa00',
        inconsistency: '#ffff00',
        contextError: '#55aaff',
    };
    return colors[type] || '#aaaaaa';
};
const getSeveritySize = (severity) => {
    const sizes = {
        low: 0.3,
        medium: 0.5,
        high: 0.7,
    };
    return sizes[severity] || 0.3;
};
const getImpactIntensity = (impact) => {
    const intensities = {
        minimal: 0.5,
        moderate: 0.75,
        significant: 1.0,
    };
    return intensities[impact] || 0.5;
};
function Node({ pattern, position, onSelect }) {
    const meshRef = (0, react_1.useRef)(null);
    const [hovered, setHovered] = (0, react_1.useState)(false);
    (0, fiber_1.useFrame)(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x = meshRef.current.rotation.y += 0.01;
        }
    });
    const size = getSeveritySize(pattern.severity);
    const color = getTypeColor(pattern.type);
    const intensity = getImpactIntensity(pattern.impact);
    let Geometry;
    switch (pattern.type) {
        case 'hallucination':
            Geometry = (props) => (<sphereGeometry args={[size, 32, 32]} {...props}/>);
            break;
        case 'overconfidence':
            Geometry = (props) => (<boxGeometry args={[size, size, size]} {...props}/>);
            break;
        case 'inconsistency':
            Geometry = (props) => (<tetrahedronGeometry args={[size]} {...props}/>);
            break;
        case 'contextError':
            Geometry = (props) => (<octahedronGeometry args={[size]} {...props}/>);
            break;
        default:
            Geometry = (props) => (<sphereGeometry args={[size, 16, 16]} {...props}/>);
    }
    return (<mesh ref={meshRef} position={position} onClick={() => onSelect(pattern)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <Geometry />
      <meshPhongMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.5 : intensity} specular="#444444" shininess={30}/>
    </mesh>);
}
function Relationship({ start, end, }) {
    const points = [new three_1.Vector3(...start), new three_1.Vector3(...end)];
    return (<line>
      <bufferGeometry attach="geometry" setFromPoints={points}/>
      <lineBasicMaterial attach="material" color="#88aaff" transparent opacity={0.6} linewidth={1}/>
    </line>);
}
function Scene({ patterns, onPatternSelect, }) {
    const patternPositions = new Map();
    // Calculate positions
    patterns.forEach((pattern, index) => {
        const angle = (index / patterns.length) * Math.PI * 2;
        const radius = 5 + pattern.occurrences * 0.2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = pattern.impact === 'significant' ? 2 : pattern.impact === 'moderate' ? 0 : -2;
        patternPositions.set(pattern.id, [x, y, z]);
    });
    return (<>
      <ambientLight intensity={0.5}/>
      <directionalLight position={[10, 10, 10]} intensity={0.8}/>
      <pointLight position={[0, 10, 0]} intensity={1} distance={100} color="#3366ff"/>

      {/* Nodes */}
      {patterns.map((pattern) => {
            const position = patternPositions.get(pattern.id);
            return (<Node key={pattern.id} pattern={pattern} position={position} onSelect={(p) => onPatternSelect?.(p)}/>);
        })}

      {/* Relationships */}
      {patterns.map((pattern) => {
            if (!pattern.relationships?.length)
                return null;
            const sourcePosition = patternPositions.get(pattern.id);
            return pattern.relationships.map((targetId) => {
                const targetPosition = patternPositions.get(targetId);
                if (!targetPosition)
                    return null;
                return (<Relationship key={`${pattern.id}-${targetId}`} start={sourcePosition} end={targetPosition}/>);
            });
        })}
    </>);
}
const MisconceptionPatternGraph3D = ({ patterns, onPatternSelect, height = '600px', width = '100%', }) => {
    return (<div className="rounded-lg overflow-hidden shadow-lg" style={{ width, height }}>
      <fiber_1.Canvas>
        <Scene patterns={patterns} onPatternSelect={onPatternSelect}/>
        <drei_1.OrbitControls enableDamping dampingFactor={0.25}/>
        <drei_1.PerspectiveCamera makeDefault position={[0, 0, 15]}/>
      </fiber_1.Canvas>
    </div>);
};
exports.default = MisconceptionPatternGraph3D;
//# sourceMappingURL=MisconceptionPatternGraph3D.js.map