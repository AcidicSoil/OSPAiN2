"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const SecureChat_1 = __importDefault(require("../components/SecureChat"));
const SecureChatPage = () => {
    return (<material_1.Container maxWidth="lg" sx={{ py: 4 }}>
      <material_1.Typography variant="h4" component="h1" gutterBottom>
        Secure Communications
      </material_1.Typography>
      <material_1.Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
        End-to-end encrypted messaging for sensitive information
      </material_1.Typography>
      
      <material_1.Box sx={{ height: 'calc(100vh - 200px)' }}>
        <SecureChat_1.default />
      </material_1.Box>
    </material_1.Container>);
};
exports.default = SecureChatPage;
//# sourceMappingURL=SecureChatPage.js.map