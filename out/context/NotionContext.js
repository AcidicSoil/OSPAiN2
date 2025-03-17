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
exports.useNotion = exports.NotionProvider = void 0;
const react_1 = __importStar(require("react"));
const NotionService_1 = __importDefault(require("../services/NotionService"));
const NotionContext = (0, react_1.createContext)(undefined);
const NotionProvider = ({ children }) => {
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [tasks, setTasks] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const initializeNotion = async () => {
            try {
                setIsLoading(true);
                const connected = await NotionService_1.default.checkConnection();
                setIsConnected(connected);
                if (connected) {
                    const notionTasks = await NotionService_1.default.getTasks();
                    setTasks(notionTasks);
                }
            }
            catch (error) {
                console.error('Failed to initialize Notion:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        initializeNotion();
    }, []);
    const checkConnection = async () => {
        const connected = await NotionService_1.default.checkConnection();
        setIsConnected(connected);
        return connected;
    };
    const refreshTasks = async () => {
        try {
            setIsLoading(true);
            if (isConnected) {
                const notionTasks = await NotionService_1.default.getTasks();
                setTasks(notionTasks);
                return notionTasks;
            }
            return [];
        }
        catch (error) {
            console.error('Failed to refresh Notion tasks:', error);
            return [];
        }
        finally {
            setIsLoading(false);
        }
    };
    const syncTasks = async (tasksToSync) => {
        try {
            setIsLoading(true);
            const result = await NotionService_1.default.syncTasks(tasksToSync);
            if (result.success && result.tasks) {
                setTasks(result.tasks);
            }
            return result;
        }
        catch (error) {
            console.error('Failed to sync tasks with Notion:', error);
            return {
                success: false,
                error: 'Failed to sync with Notion'
            };
        }
        finally {
            setIsLoading(false);
        }
    };
    const searchNotes = async (query, limit = 10) => {
        if (!isConnected) {
            return [];
        }
        return NotionService_1.default.searchNotes(query, limit);
    };
    const value = {
        isConnected,
        isLoading,
        tasks,
        syncTasks,
        checkConnection,
        refreshTasks,
        searchNotes
    };
    return (<NotionContext.Provider value={value}>
      {children}
    </NotionContext.Provider>);
};
exports.NotionProvider = NotionProvider;
const useNotion = () => {
    const context = (0, react_1.useContext)(NotionContext);
    if (context === undefined) {
        throw new Error('useNotion must be used within a NotionProvider');
    }
    return context;
};
exports.useNotion = useNotion;
exports.default = NotionContext;
//# sourceMappingURL=NotionContext.js.map