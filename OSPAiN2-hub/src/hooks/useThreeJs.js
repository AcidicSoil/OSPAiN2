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
const react_1 = require("react");
const THREE = __importStar(require("three"));
const OrbitControls_js_1 = require("three/examples/jsm/controls/OrbitControls.js");
/**
 * Custom hook for loading Three.js and related dependencies
 *
 * @returns Object containing the loaded dependencies, loading state, and any error
 */
const useThreeJs = () => {
    const [dependencies, setDependencies] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const loadDependencies = async () => {
            try {
                setIsLoading(true);
                // Verify Three.js is properly loaded
                if (!THREE) {
                    throw new Error('THREE.js library failed to load');
                }
                // Verify OrbitControls is properly loaded
                if (!OrbitControls_js_1.OrbitControls) {
                    throw new Error('THREE.OrbitControls failed to load');
                }
                // Set dependencies
                setDependencies({
                    THREE,
                    OrbitControls: OrbitControls_js_1.OrbitControls,
                });
                setError(null);
            }
            catch (err) {
                console.error('Error loading Three.js dependencies:', err);
                setError(err instanceof Error ? err : new Error('Failed to load Three.js dependencies'));
            }
            finally {
                setIsLoading(false);
            }
        };
        loadDependencies();
    }, []);
    return { dependencies, isLoading, error };
};
exports.default = useThreeJs;
//# sourceMappingURL=useThreeJs.js.map