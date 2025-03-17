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
exports.BatchProcessingProgress = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const KnowledgeGraphService_1 = __importDefault(require("../../services/KnowledgeGraphService"));
const BatchProcessingProgress = () => {
    const [items, setItems] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [expandedItems, setExpandedItems] = (0, react_1.useState)(new Set());
    const [processingActive, setProcessingActive] = (0, react_1.useState)(true);
    const [overallProgress, setOverallProgress] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        loadProcessingStatus();
        // Set up polling if processing is active
        let interval = null;
        if (processingActive) {
            interval = setInterval(() => {
                loadProcessingStatus();
            }, 5000); // Poll every 5 seconds
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [processingActive]);
    const loadProcessingStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await KnowledgeGraphService_1.default.getProcessingStatus();
            setItems(data);
            // Calculate overall progress
            if (data.length > 0) {
                const totalProgress = data.reduce((sum, item) => sum + item.progress, 0);
                setOverallProgress(Math.round(totalProgress / data.length));
            }
            // Check if any items are still processing
            const hasActiveJobs = data.some(item => item.status === 'processing' || item.status === 'waiting');
            setProcessingActive(hasActiveJobs);
        }
        catch (error) {
            console.error('Error loading processing status:', error);
            setError('Failed to load processing status. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        }
        else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };
    const toggleProcessing = () => {
        setProcessingActive(!processingActive);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'info';
            case 'waiting': return 'default';
            case 'error': return 'error';
            case 'paused': return 'warning';
            default: return 'default';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <icons_material_1.CheckCircle fontSize="small"/>;
            case 'processing': return <material_1.CircularProgress size={16}/>;
            case 'waiting': return <icons_material_1.AccessTime fontSize="small"/>;
            case 'error': return <icons_material_1.Error fontSize="small"/>;
            case 'paused': return <icons_material_1.Pause fontSize="small"/>;
            default: return null;
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024)
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    };
    const formatDuration = (startTime, endTime) => {
        if (!startTime)
            return 'N/A';
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const durationMs = end.getTime() - start.getTime();
        const seconds = Math.floor(durationMs / 1000);
        if (seconds < 60)
            return `${seconds} sec`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60)
            return `${minutes} min ${seconds % 60} sec`;
        const hours = Math.floor(minutes / 60);
        return `${hours} hr ${minutes % 60} min`;
    };
    return (<material_1.Paper sx={{ p: 3, mt: 3 }}>
      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <material_1.Typography variant="h5">Processing Queue</material_1.Typography>
        <material_1.Button variant="outlined" startIcon={processingActive ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />} onClick={toggleProcessing}>
          {processingActive ? 'Pause Updates' : 'Resume Updates'}
        </material_1.Button>
      </material_1.Box>
      
      {loading && items.length === 0 ? (<material_1.Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <material_1.CircularProgress />
        </material_1.Box>) : error ? (<material_1.Box sx={{ my: 2 }}>
          <material_1.Typography color="error">{error}</material_1.Typography>
        </material_1.Box>) : items.length === 0 ? (<material_1.Box sx={{ my: 4, textAlign: 'center' }}>
          <material_1.Typography variant="body1" color="textSecondary">
            No items in processing queue
          </material_1.Typography>
        </material_1.Box>) : (<material_1.Box>
          <material_1.Box sx={{ mb: 3 }}>
            <material_1.Typography variant="body2" gutterBottom>
              Overall Progress
            </material_1.Typography>
            <material_1.LinearProgress variant="determinate" value={overallProgress} sx={{ height: 10, borderRadius: 5 }}/>
            <material_1.Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
              {overallProgress}%
            </material_1.Typography>
          </material_1.Box>
          
          <material_1.Divider sx={{ mb: 2 }}/>
          
          {items.map((item) => (<material_1.Card key={item.id} sx={{ mb: 2, border: '1px solid #eee' }}>
              <material_1.CardContent sx={{ pb: 1 }}>
                <material_1.Grid container spacing={2}>
                  <material_1.Grid item xs={12}>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <material_1.Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {item.filename}
                      </material_1.Typography>
                      <material_1.Chip size="small" label={item.status.toUpperCase()} color={getStatusColor(item.status)} icon={getStatusIcon(item.status)}/>
                    </material_1.Box>
                  </material_1.Grid>
                  
                  <material_1.Grid item xs={12}>
                    <material_1.LinearProgress variant="determinate" value={item.progress} color={item.status === 'error' ? 'error' :
                    item.status === 'completed' ? 'success' : 'primary'}/>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <material_1.Typography variant="body2">{item.progress}%</material_1.Typography>
                      <material_1.Typography variant="body2">
                        {formatDuration(item.startTime, item.endTime)}
                      </material_1.Typography>
                    </material_1.Box>
                  </material_1.Grid>
                  
                  <material_1.Grid item xs={12}>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <material_1.Typography variant="body2" color="textSecondary">
                        {item.fileType.toUpperCase()} • {formatFileSize(item.fileSize)}
                      </material_1.Typography>
                      <material_1.IconButton size="small" onClick={() => toggleExpand(item.id)} sx={{ ml: 1 }}>
                        {expandedItems.has(item.id) ? <icons_material_1.ExpandLess /> : <icons_material_1.ExpandMore />}
                      </material_1.IconButton>
                    </material_1.Box>
                  </material_1.Grid>
                  
                  {expandedItems.has(item.id) && (<material_1.Grid item xs={12}>
                      <material_1.Divider sx={{ my: 1 }}/>
                      {item.error && (<material_1.Typography variant="body2" color="error" sx={{ mb: 1 }}>
                          Error: {item.error}
                        </material_1.Typography>)}
                      {item.details && item.details.length > 0 && (<material_1.Box sx={{ mt: 1 }}>
                          <material_1.Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            Details:
                          </material_1.Typography>
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {item.details.map((detail, index) => (<li key={index}>
                                <material_1.Typography variant="body2">{detail}</material_1.Typography>
                              </li>))}
                          </ul>
                        </material_1.Box>)}
                    </material_1.Grid>)}
                </material_1.Grid>
              </material_1.CardContent>
            </material_1.Card>))}
        </material_1.Box>)}
    </material_1.Paper>);
};
exports.BatchProcessingProgress = BatchProcessingProgress;
// Add default export
exports.default = exports.BatchProcessingProgress;
//# sourceMappingURL=BatchProcessingProgress.js.map