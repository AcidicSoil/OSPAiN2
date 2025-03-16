"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const LinearProgressWithLabel = ({ value, }) => {
    return (<material_1.Box sx={{ display: "flex", alignItems: "center" }}>
      <material_1.Box sx={{ width: "100%", mr: 1 }}>
        <material_1.LinearProgress variant="determinate" value={value}/>
      </material_1.Box>
      <material_1.Box sx={{ minWidth: 35 }}>
        <material_1.Typography variant="body2" color="text.secondary">{`${Math.round(value)}%`}</material_1.Typography>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = LinearProgressWithLabel;
//# sourceMappingURL=LinearProgressWithLabel.js.map