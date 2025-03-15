"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const PageContainer_1 = __importDefault(require("../components/layout/PageContainer"));
const ComponentManager_1 = __importDefault(require("../components/ComponentManager"));
/**
 * Component Manager Page
 *
 * This page provides an interface for evaluating and absorbing components
 * into the OSPAiN2 ecosystem.
 */
const ComponentManagerPage = () => {
    return (<PageContainer_1.default title="Component Manager" description="Evaluate and absorb components into the OSPAiN2 ecosystem">
      <ComponentManager_1.default />
    </PageContainer_1.default>);
};
exports.default = ComponentManagerPage;
//# sourceMappingURL=ComponentManagerPage.js.map