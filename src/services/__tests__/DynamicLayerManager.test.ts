import { KnowledgeGraph } from '../../knowledge/KnowledgeGraph';
import { DynamicLayerManager } from '../DynamicLayerManager';

jest.mock('../../knowledge/KnowledgeGraph');

describe('DynamicLayerManager', () => {
  let manager: DynamicLayerManager;
  let mockKnowledgeGraph: jest.Mocked<KnowledgeGraph>;

  beforeEach(() => {
    mockKnowledgeGraph = new KnowledgeGraph() as jest.Mocked<KnowledgeGraph>;
    mockKnowledgeGraph.chunkContext = jest.fn().mockResolvedValue(['chunk1', 'chunk2']);
    mockKnowledgeGraph.addNode = jest.fn().mockResolvedValue(undefined);
    manager = new DynamicLayerManager(mockKnowledgeGraph);
  });

  describe('detectPatterns', () => {
    it('should detect patterns from context', async () => {
      const patterns = await manager.detectPatterns('test context');
      expect(patterns).toHaveLength(2);
      expect(patterns[0]).toHaveProperty('confidence');
      expect(patterns[0]).toHaveProperty('signature');
    });

    it('should only return patterns above threshold', async () => {
      mockKnowledgeGraph.chunkContext = jest.fn().mockResolvedValue(['low confidence chunk']);
      const patterns = await manager.detectPatterns('test context');
      expect(patterns).toHaveLength(0);
    });
  });

  describe('createLayer', () => {
    it('should create a layer with given patterns', async () => {
      const patterns = await manager.detectPatterns('test context');
      const layer = await manager.createLayer(patterns);
      
      expect(layer).toHaveProperty('id');
      expect(layer.patterns).toEqual(patterns);
      expect(layer.type).toBe('emergent');
    });

    it('should emit layerCreated event', async () => {
      const patterns = await manager.detectPatterns('test context');
      const eventSpy = jest.fn();
      manager.on('layerCreated', eventSpy);
      
      await manager.createLayer(patterns);
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('evolveLayer', () => {
    it('should evolve existing layer with new context', async () => {
      const patterns = await manager.detectPatterns('initial context');
      const layer = await manager.createLayer(patterns);
      
      const evolvedLayer = await manager.evolveLayer(layer.id, 'new context');
      expect(evolvedLayer.id).toBe(layer.id);
      expect(evolvedLayer.patterns.length).toBeGreaterThanOrEqual(patterns.length);
    });

    it('should throw error for non-existent layer', async () => {
      await expect(manager.evolveLayer('non-existent', 'context'))
        .rejects.toThrow('Layer non-existent not found');
    });
  });

  describe('persistLayer', () => {
    it('should persist layer to knowledge graph', async () => {
      const patterns = await manager.detectPatterns('test context');
      const layer = await manager.createLayer(patterns);
      
      await manager.persistLayer(layer.id);
      expect(mockKnowledgeGraph.addNode).toHaveBeenCalled();
      expect(layer.type).toBe('persistent');
    });

    it('should emit layerPersisted event', async () => {
      const patterns = await manager.detectPatterns('test context');
      const layer = await manager.createLayer(patterns);
      const eventSpy = jest.fn();
      manager.on('layerPersisted', eventSpy);
      
      await manager.persistLayer(layer.id);
      expect(eventSpy).toHaveBeenCalled();
    });
  });
}); 