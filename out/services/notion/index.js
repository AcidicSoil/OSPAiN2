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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notionSchemaManager = exports.notionValidator = exports.notionMapper = void 0;
__exportStar(require("./NotionMapper"), exports);
__exportStar(require("./NotionValidator"), exports);
__exportStar(require("./NotionSchemaManager"), exports);
const NotionMapper_1 = require("./NotionMapper");
const NotionValidator_1 = require("./NotionValidator");
const NotionSchemaManager_1 = require("./NotionSchemaManager");
// Export singleton instances for global use
exports.notionMapper = new NotionMapper_1.NotionMapper();
exports.notionValidator = new NotionValidator_1.NotionValidator();
exports.notionSchemaManager = new NotionSchemaManager_1.NotionSchemaManager();
// Default export for backward compatibility
exports.default = exports.notionMapper;
//# sourceMappingURL=index.js.map