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
exports.KnowledgeGraphManager = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class KnowledgeGraphManager extends events_1.EventEmitter {
    constructor(context) {
        super();
        this.isConnected = false;
        this.refreshInterval = null;
        this.context = context;
        this.serverUrl = 'http://localhost:3005'; // Default Knowledge Graph MCP server URL
    }
    async initialize() {
        const config = vscode.workspace.getConfiguration('cody');
        this.serverUrl = config.get('knowledgeGraph.serverUrl', this.serverUrl);
        const syncInterval = config.get('knowledgeGraph.syncInterval', 300) * 1000;
        try {
            await this.connect();
            this.setupRefreshInterval(syncInterval);
            // Listen for configuration changes
            vscode.workspace.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('cody.knowledgeGraph')) {
                    this.updateConfiguration();
                }
            });
            // Listen for file system changes
            vscode.workspace.onDidSaveTextDocument((doc) => {
                this.addDocumentToGraph(doc);
            });
            return Promise.resolve();
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    async connect() {
        try {
            // For simplicity, we're just checking if the server is accessible
            const response = await this.makeRequest('/status', 'GET');
            this.isConnected = response && response.status === 'ok';
            if (this.isConnected) {
                console.log('Successfully connected to Knowledge Graph server');
            }
            else {
                throw new Error('Failed to connect to Knowledge Graph server');
            }
        }
        catch (err) {
            console.error('Error connecting to Knowledge Graph server:', err);
            this.isConnected = false;
            throw err;
        }
    }
    updateConfiguration() {
        const config = vscode.workspace.getConfiguration('cody');
        this.serverUrl = config.get('knowledgeGraph.serverUrl', this.serverUrl);
        const syncInterval = config.get('knowledgeGraph.syncInterval', 300) * 1000;
        // Reset refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.setupRefreshInterval(syncInterval);
    }
    setupRefreshInterval(interval) {
        this.refreshInterval = setInterval(async () => {
            try {
                if (this.isConnected) {
                    await this.syncGraph();
                }
                else {
                    await this.connect();
                }
            }
            catch (err) {
                console.error('Error during graph refresh:', err);
            }
        }, interval);
    }
    async syncGraph() {
        try {
            const response = await this.makeRequest('/sync', 'POST', {
                workspace: vscode.workspace.name,
                timestamp: new Date().toISOString(),
            });
            console.log('Graph sync completed:', response);
            this.emit('graphSynced', response);
        }
        catch (err) {
            console.error('Error syncing graph:', err);
        }
    }
    async addDocumentToGraph(document) {
        try {
            if (!this.isConnected) {
                return;
            }
            const fileContent = document.getText();
            const fileUri = document.uri.toString();
            const fileName = document.fileName;
            const fileExtension = fileName.split('.').pop() || '';
            const response = await this.makeRequest('/document/add', 'POST', {
                uri: fileUri,
                fileName,
                extension: fileExtension,
                content: fileContent,
                timestamp: new Date().toISOString(),
            });
            console.log('Document added to graph:', response);
        }
        catch (err) {
            console.error('Error adding document to graph:', err);
        }
    }
    async searchGraph(query) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }
            const response = await this.makeRequest('/search', 'POST', { query });
            return response.nodes || [];
        }
        catch (err) {
            console.error('Error searching graph:', err);
            return [];
        }
    }
    async getRelatedNodes(nodeId) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }
            const response = await this.makeRequest(`/nodes/${nodeId}/related`, 'GET');
            return {
                nodes: response.nodes || [],
                relationships: response.relationships || [],
            };
        }
        catch (err) {
            console.error('Error getting related nodes:', err);
            return { nodes: [], relationships: [] };
        }
    }
    async makeRequest(endpoint, method, data) {
        // This is a simplified implementation. In a real extension, you would use
        // the appropriate HTTP client library like axios or node-fetch
        return new Promise((resolve, reject) => {
            try {
                // Mock response for development purposes
                if (endpoint === '/status') {
                    resolve({ status: 'ok' });
                }
                else if (endpoint === '/sync') {
                    resolve({ status: 'ok', nodesUpdated: 5, relationshipsUpdated: 8 });
                }
                else if (endpoint === '/document/add') {
                    resolve({ status: 'ok', nodeId: '123', added: true });
                }
                else if (endpoint === '/search') {
                    resolve({
                        nodes: [
                            { id: '1', label: 'File', type: 'file', properties: { path: '/src/index.ts' } },
                            { id: '2', label: 'Function', type: 'function', properties: { name: 'activate' } },
                        ],
                    });
                }
                else if (endpoint.includes('/related')) {
                    resolve({
                        nodes: [
                            { id: '3', label: 'Function', type: 'function', properties: { name: 'deactivate' } },
                        ],
                        relationships: [{ id: '101', source: '2', target: '3', type: 'CALLS', properties: {} }],
                    });
                }
                else {
                    reject(new Error(`Unknown endpoint: ${endpoint}`));
                }
            }
            catch (err) {
                reject(err);
            }
        });
    }
    dispose() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}
exports.KnowledgeGraphManager = KnowledgeGraphManager;
//# sourceMappingURL=KnowledgeGraphManager.js.map