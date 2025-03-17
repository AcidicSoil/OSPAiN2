import { fireEvent, render, screen } from '@testing-library/react';
import { useComponentAbsorption } from '../../../hooks/useComponentAbsorption';
import AbsorptionDashboard from '../AbsorptionDashboard';

// Mock the hook
jest.mock('../../../hooks/useComponentAbsorption');

describe('AbsorptionDashboard', () => {
  const mockUseComponentAbsorption = useComponentAbsorption as jest.Mock;
  
  const mockAbsorption = {
    componentId: 'test-id-123',
    componentName: 'TestComponent',
    sourceRepo: 'https://github.com/test/repo',
    targetLocation: 'src/components/test',
    status: 0, // NOT_STARTED
    startTime: new Date().toISOString(),
    adaptations: [],
    absorptionLogs: []
  };
  
  const mockAbsorptionInProgress = {
    ...mockAbsorption,
    componentId: 'test-id-456',
    componentName: 'InProgressComponent',
    status: 1, // IN_PROGRESS
  };
  
  const mockAbsorptionCompleted = {
    ...mockAbsorption,
    componentId: 'test-id-789',
    componentName: 'CompletedComponent',
    status: 2, // COMPLETED
    completionTime: new Date().toISOString()
  };
  
  const mockTestingProtocol = {
    id: 'protocol-1',
    name: 'Render Performance Protocol',
    description: 'Tests rendering performance under various conditions',
    steps: [
      'Initialize component with standard props',
      'Measure render time',
      'Assess memory usage'
    ],
    expectedResults: ['Render time < 100ms', 'Memory increase < 5MB']
  };
  
  const mockStartAbsorption = jest.fn();
  const mockRecordAdaptation = jest.fn();
  const mockLogAbsorptionMessage = jest.fn();
  const mockCompleteAbsorption = jest.fn();
  const mockGetAbsorption = jest.fn();
  const mockRefreshData = jest.fn();
  
  beforeEach(() => {
    mockUseComponentAbsorption.mockReturnValue({
      absorptions: [mockAbsorption, mockAbsorptionInProgress, mockAbsorptionCompleted],
      absorptionsByStatus: {
        0: [mockAbsorption],
        1: [mockAbsorptionInProgress],
        2: [mockAbsorptionCompleted]
      },
      testingProtocols: [mockTestingProtocol],
      startAbsorption: mockStartAbsorption,
      recordAdaptation: mockRecordAdaptation,
      logAbsorptionMessage: mockLogAbsorptionMessage,
      completeAbsorption: mockCompleteAbsorption,
      getAbsorption: mockGetAbsorption.mockImplementation((id) => {
        if (id === 'test-id-123') return mockAbsorption;
        if (id === 'test-id-456') return mockAbsorptionInProgress;
        if (id === 'test-id-789') return mockAbsorptionCompleted;
        return null;
      }),
      refreshData: mockRefreshData
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the dashboard with tabs and component list', () => {
    render(<AbsorptionDashboard />);
    
    // Check for main elements
    expect(screen.getByText('Component Absorption Dashboard')).toBeInTheDocument();
    expect(screen.getByText('All (3)')).toBeInTheDocument();
    expect(screen.getByText('In Progress (1)')).toBeInTheDocument();
    expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    
    // Check for component list
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
    expect(screen.getByText('InProgressComponent')).toBeInTheDocument();
    expect(screen.getByText('CompletedComponent')).toBeInTheDocument();
  });
  
  test('allows starting a new absorption', async () => {
    render(<AbsorptionDashboard />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Component Name'), { 
      target: { value: 'NewComponent' } 
    });
    fireEvent.change(screen.getByLabelText('Source Repository'), { 
      target: { value: 'https://github.com/new/repo' } 
    });
    fireEvent.change(screen.getByLabelText('Target Location'), { 
      target: { value: 'src/components/new' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Start Absorption'));
    
    // Check if the startAbsorption function was called with correct params
    expect(mockStartAbsorption).toHaveBeenCalledWith(
      'NewComponent', 
      'https://github.com/new/repo', 
      'src/components/new'
    );
    
    // Check if refreshData was called
    expect(mockRefreshData).toHaveBeenCalled();
  });
  
  test('displays absorption details when a component is selected', () => {
    render(<AbsorptionDashboard />);
    
    // Click on a component
    fireEvent.click(screen.getByText('TestComponent'));
    
    // Check if getAbsorption was called
    expect(mockGetAbsorption).toHaveBeenCalledWith('test-id-123');
    
    // Check if details are displayed
    expect(screen.getByText('TestComponent Details')).toBeInTheDocument();
    expect(screen.getByText(/test-id-123/)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/github.com\/test\/repo/)).toBeInTheDocument();
  });
  
  test('shows adaptation form for in-progress absorptions', () => {
    render(<AbsorptionDashboard />);
    
    // Click on an in-progress component
    fireEvent.click(screen.getByText('InProgressComponent'));
    
    // Check if adaptation form is displayed
    expect(screen.getByText('Record Adaptation')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Record Adaptation')).toBeInTheDocument();
    
    // Check if completion buttons are displayed
    expect(screen.getByText('Mark as Completed')).toBeInTheDocument();
    expect(screen.getByText('Mark as Failed')).toBeInTheDocument();
  });
  
  test('allows recording an adaptation', () => {
    render(<AbsorptionDashboard />);
    
    // Click on an in-progress component
    fireEvent.click(screen.getByText('InProgressComponent'));
    
    // Fill out the adaptation form
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: 'Changed API implementation' } 
    });
    fireEvent.change(screen.getByLabelText('Before State'), { 
      target: { value: 'Old code' } 
    });
    fireEvent.change(screen.getByLabelText('After State'), { 
      target: { value: 'New code' } 
    });
    fireEvent.change(screen.getByLabelText('Reason'), { 
      target: { value: 'Better performance' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Record Adaptation'));
    
    // Check if recordAdaptation was called with correct params
    expect(mockRecordAdaptation).toHaveBeenCalledWith(
      'test-id-456',
      'CODE_MODIFICATION',
      'Changed API implementation',
      'Old code',
      'New code',
      'Better performance'
    );
    
    // Check if refreshData was called
    expect(mockRefreshData).toHaveBeenCalled();
  });
  
  test('allows completing an absorption', () => {
    render(<AbsorptionDashboard />);
    
    // Click on an in-progress component
    fireEvent.click(screen.getByText('InProgressComponent'));
    
    // Click the complete button
    fireEvent.click(screen.getByText('Mark as Completed'));
    
    // Check if completeAbsorption was called with correct params
    expect(mockCompleteAbsorption).toHaveBeenCalledWith('test-id-456', false);
    
    // Check if refreshData was called
    expect(mockRefreshData).toHaveBeenCalled();
  });
  
  test('allows marking an absorption as failed', () => {
    render(<AbsorptionDashboard />);
    
    // Click on an in-progress component
    fireEvent.click(screen.getByText('InProgressComponent'));
    
    // Click the fail button
    fireEvent.click(screen.getByText('Mark as Failed'));
    
    // Check if completeAbsorption was called with correct params
    expect(mockCompleteAbsorption).toHaveBeenCalledWith('test-id-456', true, 'Absorption failed');
    
    // Check if refreshData was called
    expect(mockRefreshData).toHaveBeenCalled();
  });
  
  test('displays testing protocols', () => {
    render(<AbsorptionDashboard />);
    
    // Check if testing protocols are displayed
    expect(screen.getByText('Testing Protocols')).toBeInTheDocument();
    expect(screen.getByText('Render Performance Protocol')).toBeInTheDocument();
    expect(screen.getByText('Tests rendering performance under various conditions')).toBeInTheDocument();
    expect(screen.getByText('Initialize component with standard props')).toBeInTheDocument();
  });
}); 