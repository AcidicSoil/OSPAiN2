"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
/**
 * PageContainer component that provides a consistent layout container for pages
 * @param {string} title - Optional title to display at the top of the container
 * @param {string} description - Optional description text to display below the title
 * @param {ReactNode} children - Content to be rendered inside the container
 * @param {string|number} maxWidth - Optional maximum width of the container
 * @param {number} padding - Optional padding value for the container
 */
const PageContainer = ({ title, description, children, maxWidth = "100%", padding = 3, }) => {
    return (<material_1.Box sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 2,
        }}>
      <material_1.Paper elevation={2} sx={{
            width: "100%",
            maxWidth,
            padding,
            borderRadius: 2,
            overflow: "hidden",
        }}>
        {title && (<material_1.Typography variant="h5" component="h1" gutterBottom>
            {title}
          </material_1.Typography>)}
        {description && (<material_1.Typography variant="body1" color="text.secondary" paragraph>
            {description}
          </material_1.Typography>)}
        {children}
      </material_1.Paper>
    </material_1.Box>);
};
exports.default = PageContainer;
//# sourceMappingURL=PageContainer.js.map