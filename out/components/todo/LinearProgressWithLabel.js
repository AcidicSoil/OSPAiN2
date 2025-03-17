"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LinearProgressWithLabel;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
function LinearProgressWithLabel(props) {
    return (<material_1.Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <material_1.Box sx={{ width: '100%', mr: 1 }}>
        <material_1.LinearProgress variant="determinate" {...props}/>
      </material_1.Box>
      <material_1.Box sx={{ minWidth: 35 }}>
        <material_1.Typography variant="body2" color="text.secondary">{`${Math.round(props.value)}%`}</material_1.Typography>
      </material_1.Box>
    </material_1.Box>);
}
//# sourceMappingURL=LinearProgressWithLabel.js.map