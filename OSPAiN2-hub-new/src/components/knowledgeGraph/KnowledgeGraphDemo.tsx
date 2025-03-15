import React, { useState } from 'react';
import { useKnowledgeGraph } from '../../hooks/useKnowledgeGraph';

const KnowledgeGraphDemo: React.FC = () => {
  const { documents, concepts, graphRAG, connection } = useKnowledgeGraph();
  const [question, setQuestion] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentSource, setDocumentSource] = useState('demo');

  // Use React Query hooks
  const { data: documentsList, isLoading: isLoadingDocuments } = documents.useDocumentsQuery();
  const { data: conceptsList, isLoading: isLoadingConcepts } = concepts.useConceptsQuery();
  const { data: answer, isLoading: isLoadingAnswer } = graphRAG.useAnswerQuestionQuery(
    question, 
    { maxDocuments: 3, maxEntities: 5 }
  );

  const { mutate: addDocument, isLoading: isAddingDocument } = documents.useAddDocumentMutation();
  const { mutate: processDocument, isLoading: isProcessingDocument } = graphRAG.useProcessTextMutation();

  // Handle adding a document
  const handleAddDocument = () => {
    if (!documentContent.trim()) return;

    const id = `doc_${Date.now()}`;
    addDocument({
      id,
      type: 'document',
      content: documentContent,
      source: documentSource,
      properties: {
        added: new Date().toISOString()
      }
    });

    setDocumentContent('');
  };

  // Handle processing a document with GraphRAG
  const handleProcessDocument = () => {
    if (!documentContent.trim()) return;

    processDocument({
      text: documentContent,
      source: documentSource
    });

    setDocumentContent('');
  };

  // Handle question submission
  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically run thanks to React Query
  };

  // Show connection status
  if (connection.isConnecting) {
    return (
      <div className="p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Connecting to Knowledge Graph...</p>
        </div>
      </div>
    );
  }

  // Show connection error
  if (!connection.isConnected && connection.connectionError) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Connection Error</p>
          <p>{connection.connectionError}</p>
          <button 
            onClick={() => connection.checkConnection()}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Knowledge Graph Demo</h1>
      
      {/* Add Document Section */}
      <div className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Add Document</h2>
        <div className="mb-4">
          <label htmlFor="documentContent" className="block text-sm font-medium text-gray-700 mb-1">
            Document Content
          </label>
          <textarea
            id="documentContent"
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
            placeholder="Enter document content..."
          />
        </div>
        <div className="mb-4">
          <label htmlFor="documentSource" className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <input
            id="documentSource"
            value={documentSource}
            onChange={(e) => setDocumentSource(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter source..."
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleAddDocument}
            disabled={isAddingDocument || !documentContent.trim()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isAddingDocument ? 'Adding...' : 'Add Document'}
          </button>
          <button
            onClick={handleProcessDocument}
            disabled={isProcessingDocument || !documentContent.trim()}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isProcessingDocument ? 'Processing...' : 'Process with GraphRAG'}
          </button>
        </div>
      </div>
      
      {/* Ask Question Section */}
      <div className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Ask Question</h2>
        <form onSubmit={handleAskQuestion}>
          <div className="mb-4">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Ask a question..."
            />
          </div>
          <button
            type="submit"
            disabled={isLoadingAnswer || !question.trim()}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoadingAnswer ? 'Thinking...' : 'Ask Question'}
          </button>
        </form>
        
        {answer && (
          <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
            <h3 className="font-medium text-purple-800">Answer:</h3>
            <p className="whitespace-pre-line">{answer.answer}</p>
            {answer.sources.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium text-purple-700">Sources:</h4>
                <ul className="text-sm text-gray-600">
                  {answer.sources.map((source, index) => (
                    <li key={index} className="ml-4 list-disc">
                      {source.source} ({source.id.substring(0, 8)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Documents and Concepts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Documents */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Documents ({isLoadingDocuments ? '...' : documentsList?.length || 0})</h2>
          {isLoadingDocuments ? (
            <p>Loading documents...</p>
          ) : documentsList && documentsList.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {documentsList.map((doc) => (
                <li key={doc.id} className="mb-2 p-2 border-b border-gray-100">
                  <div className="text-sm font-medium">{doc.id.substring(0, 8)}</div>
                  <div className="text-xs text-gray-500">Source: {doc.source}</div>
                  <p className="text-sm truncate">{doc.content.substring(0, 100)}...</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No documents found.</p>
          )}
        </div>
        
        {/* Concepts */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Concepts ({isLoadingConcepts ? '...' : conceptsList?.length || 0})</h2>
          {isLoadingConcepts ? (
            <p>Loading concepts...</p>
          ) : conceptsList && conceptsList.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {conceptsList.map((concept) => (
                <li key={concept.id} className="mb-2 p-2 border-b border-gray-100">
                  <div className="text-sm font-medium">{concept.name}</div>
                  <div className="text-xs text-gray-500">{concept.id}</div>
                  <p className="text-sm">{concept.description || 'No description'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No concepts found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphDemo; 