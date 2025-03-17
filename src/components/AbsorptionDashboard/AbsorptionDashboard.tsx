import React, { useState } from 'react';
import { useComponentAbsorption } from '../../hooks/useComponentAbsorption';
import {
    AbsorptionStatus,
    ComponentAbsorption,
    ComponentAdaptation
} from '../../types/absorption';

interface AbsorptionDashboardProps {
  className?: string;
}

export const AbsorptionDashboard: React.FC<AbsorptionDashboardProps> = ({ className }) => {
  const {
    absorptions,
    absorptionsByStatus,
    testingProtocols,
    startAbsorption,
    recordAdaptation,
    logAbsorptionMessage,
    completeAbsorption,
    getAbsorption,
    refreshData
  } = useComponentAbsorption();

  const [selectedAbsorptionId, setSelectedAbsorptionId] = useState<string | null>(null);
  const [newComponentForm, setNewComponentForm] = useState({
    componentName: '',
    sourceRepo: '',
    targetLocation: ''
  });
  const [adaptationForm, setAdaptationForm] = useState({
    type: 'CODE_MODIFICATION',
    description: '',
    beforeState: '',
    afterState: '',
    reason: ''
  });
  const [logMessage, setLogMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'inProgress' | 'completed' | 'failed'>('all');

  const selectedAbsorption = selectedAbsorptionId 
    ? getAbsorption(selectedAbsorptionId) 
    : null;

  const handleStartAbsorption = () => {
    const { componentName, sourceRepo, targetLocation } = newComponentForm;
    if (componentName && sourceRepo && targetLocation) {
      startAbsorption(componentName, sourceRepo, targetLocation);
      setNewComponentForm({
        componentName: '',
        sourceRepo: '',
        targetLocation: ''
      });
      refreshData();
    }
  };

  const handleRecordAdaptation = () => {
    if (!selectedAbsorptionId) return;
    
    const { type, description, beforeState, afterState, reason } = adaptationForm;
    recordAdaptation(
      selectedAbsorptionId,
      type as ComponentAdaptation['type'],
      description,
      beforeState,
      afterState,
      reason
    );
    
    setAdaptationForm({
      type: 'CODE_MODIFICATION',
      description: '',
      beforeState: '',
      afterState: '',
      reason: ''
    });
    
    refreshData();
  };

  const handleLogMessage = () => {
    if (!selectedAbsorptionId || !logMessage) return;
    
    logAbsorptionMessage(selectedAbsorptionId, logMessage);
    setLogMessage('');
    refreshData();
  };

  const handleCompleteAbsorption = (failed: boolean = false, error?: string) => {
    if (!selectedAbsorptionId) return;
    
    completeAbsorption(selectedAbsorptionId, failed, error);
    refreshData();
  };

  const getStatusColor = (status: AbsorptionStatus) => {
    switch (status) {
      case AbsorptionStatus.NOT_STARTED:
        return 'bg-gray-200';
      case AbsorptionStatus.IN_PROGRESS:
        return 'bg-blue-200';
      case AbsorptionStatus.COMPLETED:
        return 'bg-green-200';
      case AbsorptionStatus.FAILED:
        return 'bg-red-200';
      default:
        return 'bg-gray-200';
    }
  };

  const displayedAbsorptions = (): ComponentAbsorption[] => {
    switch (activeTab) {
      case 'inProgress':
        return absorptionsByStatus[AbsorptionStatus.IN_PROGRESS] || [];
      case 'completed':
        return absorptionsByStatus[AbsorptionStatus.COMPLETED] || [];
      case 'failed':
        return absorptionsByStatus[AbsorptionStatus.FAILED] || [];
      default:
        return absorptions;
    }
  };

  return (
    <div className={`p-4 ${className}`}>
      <h1 className="text-2xl font-bold mb-4">Component Absorption Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex mb-4 border-b">
        <button 
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({absorptions.length})
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'inProgress' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('inProgress')}
        >
          In Progress ({absorptionsByStatus[AbsorptionStatus.IN_PROGRESS]?.length || 0})
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'completed' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({absorptionsByStatus[AbsorptionStatus.COMPLETED]?.length || 0})
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'failed' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('failed')}
        >
          Failed ({absorptionsByStatus[AbsorptionStatus.FAILED]?.length || 0})
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left panel - Absorption List */}
        <div className="w-full md:w-1/3 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Components</h2>
          
          {displayedAbsorptions().length === 0 ? (
            <p className="text-gray-500">No absorptions found.</p>
          ) : (
            <ul className="space-y-2">
              {displayedAbsorptions().map((absorption) => (
                <li 
                  key={absorption.componentId}
                  className={`p-2 rounded cursor-pointer ${
                    selectedAbsorptionId === absorption.componentId 
                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                      : `${getStatusColor(absorption.status)} hover:bg-gray-100`
                  }`}
                  onClick={() => setSelectedAbsorptionId(absorption.componentId)}
                >
                  <div className="font-medium">{absorption.componentName}</div>
                  <div className="text-sm text-gray-600">
                    Status: {AbsorptionStatus[absorption.status]}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {absorption.componentId.substring(0, 8)}...
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Right panel - Details and Actions */}
        <div className="w-full md:w-2/3">
          {/* New Absorption Form */}
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="text-xl font-semibold mb-2">Start New Absorption</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Component Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newComponentForm.componentName}
                  onChange={(e) => setNewComponentForm({...newComponentForm, componentName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Source Repository</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newComponentForm.sourceRepo}
                  onChange={(e) => setNewComponentForm({...newComponentForm, sourceRepo: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Location</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newComponentForm.targetLocation}
                  onChange={(e) => setNewComponentForm({...newComponentForm, targetLocation: e.target.value})}
                />
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleStartAbsorption}
              >
                Start Absorption
              </button>
            </div>
          </div>
          
          {/* Selected Absorption Details */}
          {selectedAbsorption ? (
            <div className="bg-white p-4 rounded shadow mb-4">
              <h2 className="text-xl font-semibold mb-2">
                {selectedAbsorption.componentName} Details
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">ID:</span> {selectedAbsorption.componentId}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {AbsorptionStatus[selectedAbsorption.status]}
                </div>
                <div>
                  <span className="font-medium">Source:</span> {selectedAbsorption.sourceRepo}
                </div>
                <div>
                  <span className="font-medium">Target:</span> {selectedAbsorption.targetLocation}
                </div>
                <div>
                  <span className="font-medium">Started:</span> {new Date(selectedAbsorption.startTime).toLocaleString()}
                </div>
                {selectedAbsorption.completionTime && (
                  <div>
                    <span className="font-medium">Completed:</span> {new Date(selectedAbsorption.completionTime).toLocaleString()}
                  </div>
                )}
                
                {/* Adaptations */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Adaptations</h3>
                  {selectedAbsorption.adaptations && selectedAbsorption.adaptations.length > 0 ? (
                    <ul className="space-y-2 mt-2">
                      {selectedAbsorption.adaptations.map((adaptation, index) => (
                        <li key={index} className="p-2 bg-gray-50 rounded">
                          <div className="font-medium">{adaptation.type}</div>
                          <div>{adaptation.description}</div>
                          <div className="text-sm text-gray-600">{adaptation.reason}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No adaptations recorded.</p>
                  )}
                </div>
                
                {/* Logs */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Logs</h3>
                  {selectedAbsorption.absorptionLogs && selectedAbsorption.absorptionLogs.length > 0 ? (
                    <ul className="space-y-1 mt-2 max-h-40 overflow-y-auto">
                      {selectedAbsorption.absorptionLogs.map((log, index) => (
                        <li key={index} className="text-sm">
                          <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}: </span>
                          {log.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No logs available.</p>
                  )}
                </div>
                
                {/* Actions for In Progress absorptions */}
                {selectedAbsorption.status === AbsorptionStatus.IN_PROGRESS && (
                  <div className="mt-4 space-y-4">
                    {/* Record Adaptation */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-2">Record Adaptation</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Type</label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={adaptationForm.type}
                            onChange={(e) => setAdaptationForm({...adaptationForm, type: e.target.value})}
                          >
                            <option value="CODE_MODIFICATION">Code Modification</option>
                            <option value="DEPENDENCY_CHANGE">Dependency Change</option>
                            <option value="API_ADAPTATION">API Adaptation</option>
                            <option value="STYLE_ADJUSTMENT">Style Adjustment</option>
                            <option value="PERFORMANCE_OPTIMIZATION">Performance Optimization</option>
                            <option value="ACCESSIBILITY_IMPROVEMENT">Accessibility Improvement</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={adaptationForm.description}
                            onChange={(e) => setAdaptationForm({...adaptationForm, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Before State</label>
                          <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={3}
                            value={adaptationForm.beforeState}
                            onChange={(e) => setAdaptationForm({...adaptationForm, beforeState: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">After State</label>
                          <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={3}
                            value={adaptationForm.afterState}
                            onChange={(e) => setAdaptationForm({...adaptationForm, afterState: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Reason</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={adaptationForm.reason}
                            onChange={(e) => setAdaptationForm({...adaptationForm, reason: e.target.value})}
                          />
                        </div>
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                          onClick={handleRecordAdaptation}
                        >
                          Record Adaptation
                        </button>
                      </div>
                    </div>
                    
                    {/* Log Message */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-2">Add Log Message</h3>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={logMessage}
                          onChange={(e) => setLogMessage(e.target.value)}
                          placeholder="Enter log message..."
                        />
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                          onClick={handleLogMessage}
                        >
                          Log
                        </button>
                      </div>
                    </div>
                    
                    {/* Complete Absorption */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-2">Complete Absorption</h3>
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                          onClick={() => handleCompleteAbsorption(false)}
                        >
                          Mark as Completed
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                          onClick={() => handleCompleteAbsorption(true, "Absorption failed")}
                        >
                          Mark as Failed
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded shadow mb-4">
              <p className="text-gray-500">Select a component to view details.</p>
            </div>
          )}
          
          {/* Testing Protocols */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Testing Protocols</h2>
            {testingProtocols.length === 0 ? (
              <p className="text-gray-500">No testing protocols available.</p>
            ) : (
              <div className="space-y-4">
                {testingProtocols.map((protocol) => (
                  <div key={protocol.id} className="border p-3 rounded">
                    <h3 className="font-medium">{protocol.name}</h3>
                    <p className="text-sm text-gray-600">{protocol.description}</p>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">Steps:</h4>
                      <ol className="list-decimal list-inside text-sm">
                        {protocol.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsorptionDashboard; 