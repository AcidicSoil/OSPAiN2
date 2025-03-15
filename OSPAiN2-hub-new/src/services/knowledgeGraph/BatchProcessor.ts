import { KnowledgeGraphService } from './KnowledgeGraphService';
import { Document } from './types';
import { EventEmitter } from 'events';

export interface BatchProcessingOptions {
  batchSize?: number;
  concurrency?: number;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface BatchProcessingStats {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  inProgress: number;
  errors: Array<{ documentId: string; error: Error }>;
}

export interface BatchProcessingProgress {
  stats: BatchProcessingStats;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining?: number;
}

export class BatchProcessor extends EventEmitter {
  private kgService: KnowledgeGraphService;
  private options: Required<BatchProcessingOptions>;
  private stats: BatchProcessingStats;
  private startTime: number = 0;
  private processingQueue: Document[] = [];
  private isProcessing: boolean = false;
  private shouldStop: boolean = false;

  constructor(
    kgService: KnowledgeGraphService,
    options: BatchProcessingOptions = {}
  ) {
    super();
    this.kgService = kgService;
    this.options = {
      batchSize: options.batchSize || 10,
      concurrency: options.concurrency || 2,
      retryCount: options.retryCount || 3,
      retryDelay: options.retryDelay || 1000,
      timeout: options.timeout || 30000,
    };
    this.stats = this.resetStats();
  }

  private resetStats(): BatchProcessingStats {
    return {
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      inProgress: 0,
      errors: [],
    };
  }

  /**
   * Process a batch of documents
   * @param documents Array of documents to process
   * @returns Promise that resolves when all documents are processed
   */
  async processBatch(documents: Document[]): Promise<BatchProcessingStats> {
    if (this.isProcessing) {
      throw new Error('Batch processing already in progress');
    }

    try {
      this.isProcessing = true;
      this.shouldStop = false;
      this.stats = this.resetStats();
      this.stats.total = documents.length;
      this.processingQueue = [...documents];
      this.startTime = Date.now();

      this.emit('start', { stats: this.stats });

      // Process documents in batches
      const totalBatches = Math.ceil(documents.length / this.options.batchSize);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        if (this.shouldStop) {
          break;
        }

        const batchStart = batchIndex * this.options.batchSize;
        const batchEnd = Math.min(batchStart + this.options.batchSize, documents.length);
        const currentBatch = documents.slice(batchStart, batchEnd);
        
        // Process current batch with concurrency limit
        await this.processBatchWithConcurrency(currentBatch, batchIndex, totalBatches);
        
        // Emit progress event after each batch
        this.emitProgress(batchIndex, totalBatches);
      }

      return this.stats;
    } finally {
      this.isProcessing = false;
      this.emit('complete', { stats: this.stats });
    }
  }

  /**
   * Process a batch of documents with concurrency limit
   */
  private async processBatchWithConcurrency(
    batch: Document[], 
    batchIndex: number, 
    totalBatches: number
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < batch.length; i += this.options.concurrency) {
      if (this.shouldStop) {
        break;
      }
      
      const concurrentBatch = batch.slice(i, i + this.options.concurrency);
      const concurrentPromises = concurrentBatch.map(doc => this.processDocument(doc));
      
      // Wait for the concurrent batch to complete before moving to the next one
      await Promise.all(concurrentPromises);
      
      // Update progress
      this.emitProgress(batchIndex, totalBatches);
    }
  }

  /**
   * Process a single document with retry logic
   */
  private async processDocument(document: Document): Promise<void> {
    this.stats.inProgress++;
    
    let retries = 0;
    let success = false;
    
    while (retries <= this.options.retryCount && !success && !this.shouldStop) {
      try {
        // Create a promise that will timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Processing timed out after ${this.options.timeout}ms`)), this.options.timeout);
        });
        
        // Process document with timeout
        await Promise.race([
          this.kgService.addDocument(document),
          timeoutPromise
        ]);
        
        success = true;
        this.stats.succeeded++;
      } catch (error) {
        retries++;
        
        if (retries > this.options.retryCount) {
          this.stats.failed++;
          this.stats.errors.push({ 
            documentId: document.id || 'unknown', 
            error: error instanceof Error ? error : new Error(String(error)) 
          });
          
          this.emit('error', { 
            document, 
            error, 
            retries 
          });
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
        }
      }
    }
    
    this.stats.processed++;
    this.stats.inProgress--;
  }

  /**
   * Emit progress event with current stats and estimated time remaining
   */
  private emitProgress(currentBatch: number, totalBatches: number): void {
    const elapsedTime = Date.now() - this.startTime;
    let estimatedTimeRemaining: number | undefined;
    
    if (this.stats.processed > 0) {
      const processRate = this.stats.processed / elapsedTime;
      const remainingItems = this.stats.total - this.stats.processed;
      estimatedTimeRemaining = remainingItems / processRate;
    }
    
    const progress: BatchProcessingProgress = {
      stats: { ...this.stats },
      currentBatch,
      totalBatches,
      estimatedTimeRemaining
    };
    
    this.emit('progress', progress);
  }

  /**
   * Stop the current batch processing
   */
  stop(): void {
    if (this.isProcessing) {
      this.shouldStop = true;
      this.emit('stopping', { stats: this.stats });
    }
  }

  /**
   * Check if batch processing is currently running
   */
  isRunning(): boolean {
    return this.isProcessing;
  }

  /**
   * Get current processing stats
   */
  getStats(): BatchProcessingStats {
    return { ...this.stats };
  }
} 