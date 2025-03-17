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
exports.useGraphLayoutCalculation = void 0;
const react_1 = require("react");
const THREE = __importStar(require("three"));
/**
 * Custom hook that calculates 3D positions for graph nodes
 * using force-directed layout algorithm
 *
 * @param patterns - Array of pattern objects to position
 * @param options - Configuration options for the layout algorithm
 * @returns Object with calculated positions for each node
 */
const useGraphLayoutCalculation = (patterns, options = {}) => {
    const [positions, setPositions] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        if (!patterns.length)
            return;
        // Set default options
        const { radius = patterns.length * 0.8, iterations = 100, springLength = 2, springStrength = 0.1, repulsionStrength = 5, damping = 0.9, } = options;
        // Initialize positions in a spherical layout
        const initialPositions = {};
        patterns.forEach((pattern, index) => {
            const phi = Math.acos(-1 + (2 * index) / patterns.length);
            const theta = Math.sqrt(patterns.length * Math.PI) * phi;
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            initialPositions[pattern.id] = new THREE.Vector3(x, y, z);
        });
        // Create connection map for faster lookup
        const connectionMap = {};
        patterns.forEach((pattern) => {
            connectionMap[pattern.id] = pattern.connections;
        });
        // Run force-directed layout algorithm
        let currentPositions = { ...initialPositions };
        let velocities = {};
        // Initialize velocities
        Object.keys(currentPositions).forEach((id) => {
            velocities[id] = new THREE.Vector3(0, 0, 0);
        });
        // Run iterations
        for (let i = 0; i < iterations; i++) {
            // Calculate forces
            const forces = {};
            // Initialize forces
            Object.keys(currentPositions).forEach((id) => {
                forces[id] = new THREE.Vector3(0, 0, 0);
            });
            // Apply spring forces (attraction between connected nodes)
            patterns.forEach((pattern) => {
                const sourcePos = currentPositions[pattern.id];
                pattern.connections.forEach((targetId) => {
                    if (!currentPositions[targetId])
                        return;
                    const targetPos = currentPositions[targetId];
                    const direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
                    const distance = direction.length();
                    // Skip if nodes are at the same position
                    if (distance === 0)
                        return;
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
                    if (distance === 0)
                        continue;
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
        const finalPositions = {};
        Object.entries(currentPositions).forEach(([id, vector]) => {
            finalPositions[id] = [vector.x, vector.y, vector.z];
        });
        setPositions(finalPositions);
    }, [patterns, options]);
    return positions;
};
exports.useGraphLayoutCalculation = useGraphLayoutCalculation;
exports.default = exports.useGraphLayoutCalculation;
//# sourceMappingURL=useGraphLayoutCalculation.js.map