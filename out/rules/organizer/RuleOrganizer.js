"use strict";
/**
 * Rule Organizer
 *
 * Organizes rules into appropriate directories based on their types.
 * Implements the directory-based organization pattern for rule files.
 */
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
exports.RuleOrganizer = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const types_1 = require("../types");
class RuleOrganizer {
    /**
     * Creates a new RuleOrganizer
     *
     * @param ruleTypeManager The RuleTypeManager instance to use
     */
    constructor(ruleTypeManager) {
        this.ruleTypeManager = ruleTypeManager;
    }
    /**
     * Organizes rules into appropriate directories based on their types
     *
     * @param sourceDir Directory containing rule files to organize
     * @param targetDir Root directory where organized rules will be placed
     * @param dryRun If true, only report what would be done without making changes
     * @returns Information about the organization process
     */
    async organizeRulesByType(sourceDir, targetDir, dryRun = false) {
        // Result tracking
        const result = {
            organized: 0,
            skipped: 0,
            errors: []
        };
        try {
            // Create target directories
            if (!dryRun) {
                await this.createDirectories(targetDir);
            }
            // Find all .mdc files in the source directory
            const files = await this.ruleTypeManager.findMdcFiles(sourceDir);
            // Process each file
            for (const file of files) {
                try {
                    // Get rule info to determine its type
                    const ruleInfo = await this.ruleTypeManager.getRuleInfo(file);
                    const ruleType = ruleInfo.currentType;
                    // Determine target directory
                    const destDir = this.getTargetDirectory(targetDir, ruleType);
                    const destPath = path.join(destDir, path.basename(file));
                    // Check if file already exists in the correct location
                    if (file === destPath) {
                        console.log(`Skipping ${file} - already in the correct location`);
                        result.skipped++;
                        continue;
                    }
                    // Move the file
                    console.log(`Moving ${file} to ${destPath}`);
                    if (!dryRun) {
                        await this.moveFile(file, destPath);
                    }
                    result.organized++;
                }
                catch (error) {
                    console.error(`Error processing ${file}:`, error);
                    result.errors.push({
                        path: file,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
            return result;
        }
        catch (error) {
            console.error(`Failed to organize rules:`, error);
            throw error;
        }
    }
    /**
     * Organizes all rules in the source directory according to their content analysis
     *
     * @param sourceDir Directory containing rule files to analyze and organize
     * @param targetDir Root directory where organized rules will be placed
     * @param dryRun If true, only report what would be done without making changes
     * @returns Information about the organization process
     */
    async organizeRulesByContent(sourceDir, targetDir, dryRun = false) {
        // Result tracking
        const result = {
            organized: 0,
            skipped: 0,
            errors: []
        };
        try {
            // Create target directories
            if (!dryRun) {
                await this.createDirectories(targetDir);
            }
            // Find all .mdc files in the source directory
            const files = await this.ruleTypeManager.findMdcFiles(sourceDir);
            // Process each file
            for (const file of files) {
                try {
                    // Get rule info to analyze suggested type
                    const ruleInfo = await this.ruleTypeManager.getRuleInfo(file);
                    const ruleType = ruleInfo.suggestedType;
                    // Determine target directory
                    const destDir = this.getTargetDirectory(targetDir, ruleType);
                    const destPath = path.join(destDir, path.basename(file));
                    // Check if file already exists in the correct location
                    if (file === destPath) {
                        console.log(`Skipping ${file} - already in the correct location`);
                        result.skipped++;
                        continue;
                    }
                    // Move the file
                    console.log(`Moving ${file} to ${destPath} (suggested type: ${ruleType})`);
                    if (!dryRun) {
                        await this.moveFile(file, destPath);
                    }
                    result.organized++;
                }
                catch (error) {
                    console.error(`Error processing ${file}:`, error);
                    result.errors.push({
                        path: file,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
            return result;
        }
        catch (error) {
            console.error(`Failed to organize rules:`, error);
            throw error;
        }
    }
    /**
     * Creates the directory structure for organized rules
     *
     * @param targetDir Root directory where organized rules will be placed
     */
    async createDirectories(targetDir) {
        const dirs = [
            path.join(targetDir, 'memory'),
            path.join(targetDir, 'rules', 'core'),
            path.join(targetDir, 'rules', 'conditional'),
            path.join(targetDir, 'user', 'custom')
        ];
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }
    /**
     * Gets the target directory for a rule based on its type
     *
     * @param targetDir Root directory where organized rules will be placed
     * @param ruleType The type of the rule
     * @returns The full path to the target directory
     */
    getTargetDirectory(targetDir, ruleType) {
        switch (ruleType) {
            case types_1.RuleType.AGENT_REQUESTED:
                return path.join(targetDir, 'memory');
            case types_1.RuleType.AUTO_APPLIED:
                return path.join(targetDir, 'rules', 'core');
            case types_1.RuleType.CONDITIONAL:
                return path.join(targetDir, 'rules', 'conditional');
            case types_1.RuleType.MANUAL:
            default:
                return path.join(targetDir, 'user', 'custom');
        }
    }
    /**
     * Moves a file to a new location
     *
     * @param sourcePath Source file path
     * @param destPath Destination file path
     */
    async moveFile(sourcePath, destPath) {
        // Ensure destination directory exists
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        // Copy the file first
        await fs.copyFile(sourcePath, destPath);
        // Verify the copy was successful
        const sourceStats = await fs.stat(sourcePath);
        const destStats = await fs.stat(destPath);
        if (sourceStats.size === destStats.size) {
            // Delete the original
            await fs.unlink(sourcePath);
        }
        else {
            throw new Error(`Copy verification failed for ${sourcePath}`);
        }
    }
}
exports.RuleOrganizer = RuleOrganizer;
//# sourceMappingURL=RuleOrganizer.js.map