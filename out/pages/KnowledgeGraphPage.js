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
const material_1 = require("@mui/material");
const knowledgeGraph_1 = require("../components/knowledgeGraph");
const KnowledgeGraphPage = () => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [snackbarOpen, setSnackbarOpen] = (0, react_1.useState)(false);
    const [snackbarMessage, setSnackbarMessage] = (0, react_1.useState)('');
    const [snackbarSeverity, setSnackbarSeverity] = (0, react_1.useState)('info');
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };
    return (<div className="pt-16 pl-20 md:pl-64">
      <material_1.Container maxWidth="xl" sx={{ py: 4 }}>
        <material_1.Typography variant="h4" component="h1" gutterBottom>
          Knowledge Graph
        </material_1.Typography>

        <material_1.Grid container spacing={4}>
          <material_1.Grid item xs={12} md={6}>
            <knowledgeGraph_1.KnowledgeGraphExplorer />
            <knowledgeGraph_1.BatchDocumentImport />
            <knowledgeGraph_1.BatchProcessingProgress />
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6}>
            <knowledgeGraph_1.GraphVisualization />
          </material_1.Grid>
        </material_1.Grid>

        <material_1.Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <material_1.Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </material_1.Alert>
        </material_1.Snackbar>
      </material_1.Container>
    </div>);
};
exports.default = KnowledgeGraphPage;
//# sourceMappingURL=KnowledgeGraphPage.js.map