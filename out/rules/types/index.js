"use strict";
/**
 * Rule Type Configuration System
 *
 * Defines the types and interfaces for the rule type configuration system.
 * This system manages how rules are applied in the Sovereign AI ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleType = void 0;
/**
 * Represents the possible types of rule application methods.
 */
var RuleType;
(function (RuleType) {
    /** Rules that must be manually requested by users */
    RuleType["MANUAL"] = "manual";
    /** Rules that can be requested by AI agents */
    RuleType["AGENT_REQUESTED"] = "agent_requested";
    /** Rules that are automatically applied */
    RuleType["AUTO_APPLIED"] = "auto_applied";
    /** Rules that are applied based on conditions */
    RuleType["CONDITIONAL"] = "conditional";
})(RuleType || (exports.RuleType = RuleType = {}));
//# sourceMappingURL=index.js.map