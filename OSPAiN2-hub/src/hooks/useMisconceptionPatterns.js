"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const ws_1 = require("ws");
const useMisconceptionPatterns = (wsEndpoint) => {
    const [patterns, setPatterns] = (0, react_1.useState)([]);
    const [analysis, setAnalysis] = (0, react_1.useState)({
        totalPatterns: 0,
        typeDistribution: {},
        severityDistribution: {},
        impactDistribution: {},
        mostCommonPatterns: [],
        recentPatterns: []
    });
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [selectedPattern, setSelectedPattern] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let ws = null;
        let reconnectTimeout;
        let isConnected = false;
        const connect = () => {
            try {
                ws = new ws_1.WebSocket(wsEndpoint);
                ws.onopen = () => {
                    console.log('Connected to misconception pattern WebSocket');
                    isConnected = true;
                    setError(null);
                };
                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data.toString());
                        if (data.type === 'patterns') {
                            setPatterns(data.patterns);
                            analyzePatterns(data.patterns);
                        }
                        else if (data.type === 'update') {
                            setPatterns(prevPatterns => {
                                const updatedPatterns = [...prevPatterns];
                                const index = updatedPatterns.findIndex(p => p.id === data.pattern.id);
                                if (index >= 0) {
                                    updatedPatterns[index] = data.pattern;
                                }
                                else {
                                    updatedPatterns.push(data.pattern);
                                }
                                analyzePatterns(updatedPatterns);
                                return updatedPatterns;
                            });
                        }
                    }
                    catch (err) {
                        console.error('Error processing WebSocket message:', err);
                    }
                };
                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError(new Error('Failed to connect to misconception pattern service'));
                };
                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                    isConnected = false;
                    // Attempt to reconnect after 5 seconds
                    reconnectTimeout = setTimeout(() => {
                        if (!isConnected) {
                            connect();
                        }
                    }, 5000);
                };
            }
            catch (err) {
                console.error('Error creating WebSocket connection:', err);
                setError(new Error('Failed to create WebSocket connection'));
            }
        };
        const analyzePatterns = (currentPatterns) => {
            const typeDistribution = {};
            const severityDistribution = {};
            const impactDistribution = {};
            const patternFrequency = {};
            currentPatterns.forEach(pattern => {
                // Update type distribution
                typeDistribution[pattern.type] = (typeDistribution[pattern.type] || 0) + 1;
                // Update severity distribution
                severityDistribution[pattern.severity] = (severityDistribution[pattern.severity] || 0) + 1;
                // Update impact distribution
                impactDistribution[pattern.impact] = (impactDistribution[pattern.impact] || 0) + 1;
                // Track pattern frequency
                patternFrequency[pattern.id] = pattern.occurrences;
            });
            // Sort patterns by frequency for most common patterns
            const mostCommonPatterns = [...currentPatterns]
                .sort((a, b) => b.occurrences - a.occurrences)
                .slice(0, 5);
            // Sort patterns by timestamp for recent patterns
            const recentPatterns = [...currentPatterns]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5);
            setAnalysis({
                totalPatterns: currentPatterns.length,
                typeDistribution,
                severityDistribution,
                impactDistribution,
                mostCommonPatterns,
                recentPatterns
            });
            setIsLoading(false);
        };
        // Initial connection
        connect();
        // Cleanup
        return () => {
            if (ws) {
                ws.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [wsEndpoint]);
    return {
        patterns,
        analysis,
        isLoading,
        error,
        selectedPattern,
        setSelectedPattern
    };
};
exports.default = useMisconceptionPatterns;
//# sourceMappingURL=useMisconceptionPatterns.js.map