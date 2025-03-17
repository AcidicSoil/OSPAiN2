import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * T2P command for conducting deep research using ollama-deep-researcher-ts
 * 
 * @param args Command line arguments
 * @returns Promise resolving when research is complete
 */
export async function researchCommand(args: string[]): Promise<void> {
  // Parse arguments
  const topic = args[0];
  if (!topic) {
    console.error("Error: Research topic is required");
    console.log("Usage: t2p research \"your research topic\" [--iterations=3] [--enhance] [--output=./research-results]");
    process.exit(1);
  }
  
  // Parse options
  const options = {
    iterations: 3,
    enhance: false,
    outputDir: './research-results'
  };
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--iterations=')) {
      options.iterations = parseInt(arg.split('=')[1]);
    } else if (arg === '--enhance') {
      options.enhance = true;
    } else if (arg.startsWith('--output=')) {
      options.outputDir = arg.split('=')[1];
    }
  }
  
  // Create output directory
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }
  
  console.log(`Starting research on topic: "${topic}"`);
  
  try {
    // Check if services are running
    console.log('Checking if research services are running...');
    
    try {
      await axios.get('http://localhost:2024/health');
      console.log('Deep Researcher service is running');
    } catch (error) {
      console.log('Deep Researcher service is not running, starting Docker services...');
      execSync('docker-compose -f docker-compose.research.yml up -d', { stdio: 'inherit' });
      
      // Wait for services to start
      console.log('Waiting for services to start...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    // Start research
    console.log('Initiating research process...');
    const response = await axios.post('http://localhost:2024/api/research', {
      topic,
      iterations: options.iterations,
      includeSourceDetails: true
    });
    
    const taskId = response.data.taskId;
    
    // Poll for completion with progress display
    console.log('Research in progress...');
    let completed = false;
    
    while (!completed) {
      try {
        const statusResponse = await axios.get(`http://localhost:2024/api/research/${taskId}`);
        const { status, progress } = statusResponse.data;
        
        // Display progress
        const progressPercent = Math.round(progress * 100);
        process.stdout.write(`\rProgress: ${progressPercent}% complete`);
        
        if (status === 'completed') {
          process.stdout.write('\n');
          console.log('Research completed successfully!');
          completed = true;
          
          // Save results
          const result = statusResponse.data.result;
          const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
          const filename = path.join(options.outputDir, `research_${timestamp}.md`);
          fs.writeFileSync(filename, result.summary);
          
          console.log(`Results saved to: ${filename}`);
          
          // Process with OpenManus if enabled
          if (options.enhance) {
            console.log('Enhancing with OpenManus...');
            try {
              const manusResponse = await axios.post('http://localhost:3006/api/analyze', {
                researchData: result,
                analysisType: 'research_enhancement'
              });
              
              const enhancedFilename = path.join(options.outputDir, `research_enhanced_${timestamp}.md`);
              fs.writeFileSync(enhancedFilename, manusResponse.data.summary);
              console.log(`Enhanced results saved to: ${enhancedFilename}`);
            } catch (manusError: any) {
              console.error('Error enhancing with OpenManus:', manusError.message || 'Unknown error');
              console.log('Using original research results');
            }
          }
        } else if (status === 'failed') {
          console.error(`\nResearch failed: ${statusResponse.data.error || 'Unknown error'}`);
          completed = true;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (pollError: any) {
        console.error('\nError polling for research status:', pollError.message || 'Unknown error');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Longer delay on error
      }
    }
  } catch (error: any) {
    console.error('Error during research:', error.message || 'Unknown error');
    process.exit(1);
  }
} 