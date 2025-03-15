"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EnhancedContextManager_1 = require("../context/EnhancedContextManager");
const KnowledgeGraph_1 = require("../knowledge/KnowledgeGraph");
const RateLimitService_1 = require("../services/RateLimitService");
const types_1 = require("../types");
describe("Token Context Management System", () => {
    let contextManager;
    let knowledgeGraph;
    let rateLimitService;
    beforeEach(() => {
        knowledgeGraph = new KnowledgeGraph_1.KnowledgeGraph();
        rateLimitService = new RateLimitService_1.RateLimitService();
        contextManager = new EnhancedContextManager_1.EnhancedContextManager(knowledgeGraph, rateLimitService);
    });
    describe("EnhancedContextManager", () => {
        it("should optimize context within token limits", async () => {
            const context = "Test context ".repeat(1000); // Large context
            const mode = types_1.DevelopmentMode.Engineering;
            const optimizedContext = await contextManager.optimizeContext(context, mode);
            expect(optimizedContext.length).toBeLessThan(context.length);
            expect(optimizedContext).toContain("Test context");
        });
        it("should preserve important context elements", async () => {
            const context = `
        // Important comment
        const importantFunction = () => {
          // Critical logic
          return true;
        }
        
        // Less important comment
        const lessImportantFunction = () => {
          return false;
        }
      `;
            const mode = types_1.DevelopmentMode.Engineering;
            const optimizedContext = await contextManager.optimizeContext(context, mode);
            expect(optimizedContext).toContain("importantFunction");
            expect(optimizedContext).toContain("Critical logic");
        });
        it("should handle different development modes appropriately", async () => {
            const context = "Test context ".repeat(500);
            const modes = Object.values(types_1.DevelopmentMode);
            for (const mode of modes) {
                const optimizedContext = await contextManager.optimizeContext(context, mode);
                expect(optimizedContext.length).toBeLessThanOrEqual(context.length);
            }
        });
    });
    describe("KnowledgeGraph", () => {
        it("should chunk context appropriately", async () => {
            const context = `
        // First chunk
        const first = () => {};
        
        // Second chunk
        const second = () => {};
        
        // Third chunk
        const third = () => {};
      `;
            const chunks = await knowledgeGraph.chunkContext(context);
            expect(chunks).toContain("first");
            expect(chunks).toContain("second");
            expect(chunks).toContain("third");
        });
        it("should score and filter chunks based on relevance", async () => {
            const context = `
        // High relevance
        const criticalFunction = () => {
          // Important logic
          return true;
        }
        
        // Low relevance
        const utilityFunction = () => {
          return false;
        }
      `;
            const filteredContext = await knowledgeGraph.scoreAndFilter(context);
            expect(filteredContext).toContain("criticalFunction");
            expect(filteredContext).toContain("Important logic");
        });
        it("should prioritize elements correctly", async () => {
            const context = `
        // High priority
        const mainFunction = () => {
          // Core functionality
          return true;
        }
        
        // Medium priority
        const helperFunction = () => {
          return false;
        }
        
        // Low priority
        const utilityFunction = () => {
          return null;
        }
      `;
            const prioritizedContext = await knowledgeGraph.prioritizeElements(context);
            expect(prioritizedContext.indexOf("mainFunction")).toBeLessThan(prioritizedContext.indexOf("utilityFunction"));
        });
    });
    describe("RateLimitService", () => {
        it("should enforce rate limits correctly", async () => {
            const mode = types_1.DevelopmentMode.Engineering;
            const largeTokens = 2000; // Exceeds minute limit
            const canProceed = await rateLimitService.checkRateLimit(largeTokens, mode);
            expect(canProceed).toBe(false);
        });
        it("should track usage history", async () => {
            const mode = types_1.DevelopmentMode.Engineering;
            const tokens = 100;
            await rateLimitService.recordUsage(tokens, mode);
            const usage = rateLimitService.getUsageHistory();
            expect(usage.length).toBe(1);
            expect(usage[0].tokens).toBe(tokens);
            expect(usage[0].mode).toBe(mode);
        });
        it("should handle mode-specific limits", async () => {
            const modes = Object.values(types_1.DevelopmentMode);
            for (const mode of modes) {
                const usage = rateLimitService.getModeUsage(mode);
                expect(usage.minute).toBe(0);
                expect(usage.hour).toBe(0);
            }
        });
        it("should clean up old usage records", async () => {
            const mode = types_1.DevelopmentMode.Engineering;
            const tokens = 100;
            // Simulate old usage
            const oldUsage = {
                timestamp: Date.now() - 86400000, // 1 day ago
                tokens,
                mode,
            };
            // @ts-ignore - Accessing private property for testing
            rateLimitService.usageHistory.push(oldUsage);
            // Trigger cleanup
            await rateLimitService.checkRateLimit(0, mode);
            const usage = rateLimitService.getUsageHistory();
            expect(usage).not.toContain(oldUsage);
        });
    });
    describe("Integration Tests", () => {
        it("should handle complete context optimization flow", async () => {
            const context = `
        // Important section
        const criticalFunction = () => {
          // Core logic
          return true;
        }
        
        // Less important section
        const utilityFunction = () => {
          return false;
        }
      `;
            const mode = types_1.DevelopmentMode.Engineering;
            // Check rate limit first
            const canProceed = await rateLimitService.checkRateLimit(100, mode);
            expect(canProceed).toBe(true);
            // Optimize context
            const optimizedContext = await contextManager.optimizeContext(context, mode);
            // Verify optimization
            expect(optimizedContext.length).toBeLessThan(context.length);
            expect(optimizedContext).toContain("criticalFunction");
            expect(optimizedContext).toContain("Core logic");
            // Record usage
            await rateLimitService.recordUsage(100, mode);
            // Verify usage tracking
            const usage = rateLimitService.getUsageHistory();
            expect(usage.length).toBe(1);
        });
    });
});
//# sourceMappingURL=token-context.test.js.map