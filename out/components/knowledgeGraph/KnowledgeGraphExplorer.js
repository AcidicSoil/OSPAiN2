"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeGraphExplorer = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const KnowledgeGraphExplorer = () => {
    return (<material_1.Paper sx={{ p: 3 }}>
      <material_1.Typography variant="h5">Knowledge Graph Explorer</material_1.Typography>
      <material_1.Box sx={{ mt: 2 }}>
        <material_1.Typography>This is a placeholder for the Knowledge Graph Explorer component.</material_1.Typography>
      </material_1.Box>
    </material_1.Paper>);
};
exports.KnowledgeGraphExplorer = KnowledgeGraphExplorer;
// Ensure default export is also available
exports.default = exports.KnowledgeGraphExplorer;
//# sourceMappingURL=KnowledgeGraphExplorer.js.map