import React, { useState } from 'react';
import { ResearchTopic, useDeepResearcher } from '../hooks/useDeepResearcher';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const percentage = Math.round(progress * 100);
  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-600 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
      <div className="text-center text-xs mt-1">{percentage}%</div>
    </div>
  );
};

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  // This is a simple markdown renderer, consider using a library like react-markdown for a more complete solution
  const formattedText = markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold my-3">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-2">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold my-2">$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^> (.*$)/gim, '<blockquote class="pl-4 border-l-4 border-gray-200 my-2">$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
    .replace(/^[0-9]+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
    .split('\n\n').join('<p class="my-2"></p>');

  return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
};

export const ResearchPanel: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [iterations, setIterations] = useState(3);
  const { startResearch, cancelResearch, result, isLoading, progress, error } = useDeepResearcher();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const researchTopic: ResearchTopic = {
      topic,
      iterations,
      includeSourceDetails: true
    };
    
    startResearch(researchTopic);
  };

  return (
    <div className="research-panel p-5 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Deep Research Assistant</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Research Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter a research topic..."
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Research Depth (Iterations)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher values (1-5) produce more thorough research but take longer
          </p>
        </div>
        
        {!isLoading ? (
          <button
            type="submit"
            disabled={!topic}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Start Research
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelResearch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel Research
          </button>
        )}
      </form>
      
      {isLoading && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Research in Progress</h3>
          <ProgressBar progress={progress} />
          <p className="text-sm text-gray-600 mt-2">
            Iteration {Math.ceil(progress * iterations)} of {iterations}
          </p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-6">
          <h3 className="font-medium">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="research-results">
          <h3 className="text-xl font-medium mb-4">Research Summary</h3>
          <div className="bg-gray-50 p-4 rounded">
            <MarkdownRenderer markdown={result.summary} />
          </div>
          
          {result.sources && result.sources.length > 0 && (
            <>
              <h4 className="text-lg font-medium mt-6 mb-3">Sources</h4>
              <div className="sources-list space-y-4">
                {result.sources.map((source, index) => (
                  <div key={index} className="p-3 border rounded">
                    <h5 className="font-medium">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {source.title}
                      </a>
                    </h5>
                    <p className="text-sm text-gray-700 mt-1">
                      {source.content.substring(0, 200)}
                      {source.content.length > 200 && '...'}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 