import React from 'react';
import { Button, ToastProvider, useToast, toast } from '../components/ui';

const ToastDemo: React.FC = () => {
  const { addToast, removeAllToasts } = useToast();

  const showDefaultToast = () => {
    addToast({
      message: 'This is a default toast notification',
      duration: 5000,
    });
  };

  const showSuccessToast = () => {
    toast.success('Operation completed successfully!');
  };

  const showErrorToast = () => {
    toast.error('An error occurred while processing your request.');
  };

  const showWarningToast = () => {
    toast.warning('Please review your input before continuing.');
  };

  const showInfoToast = () => {
    toast.info('New updates are available.');
  };

  const showPersistentToast = () => {
    const id = toast.info(
      'This toast will not auto-close. You must dismiss it manually.',
      {
        duration: 0,
        action: {
          label: 'Dismiss',
          onClick: () => toast.remove(id),
        },
      }
    );
  };

  const showActionToast = () => {
    toast.info(
      'Your file has been uploaded successfully.',
      {
        action: {
          label: 'View',
          onClick: () => alert('View action clicked'),
          variant: 'primary',
        },
      }
    );
  };

  const showMultipleToasts = () => {
    toast.info('Processing started...');
    
    setTimeout(() => {
      toast.warning('Processing taking longer than expected...');
    }, 1000);
    
    setTimeout(() => {
      toast.success('Processing completed successfully!');
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Toast Component Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-4">Basic Toasts</h2>
          <div className="space-y-2">
            <Button onClick={showDefaultToast} className="w-full">Show Default Toast</Button>
            <Button onClick={showSuccessToast} variant="success" className="w-full">Show Success Toast</Button>
            <Button onClick={showErrorToast} variant="danger" className="w-full">Show Error Toast</Button>
            <Button onClick={showWarningToast} variant="warning" className="w-full">Show Warning Toast</Button>
            <Button onClick={showInfoToast} variant="info" className="w-full">Show Info Toast</Button>
          </div>
        </div>
        
        <div className="p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-4">Advanced Toasts</h2>
          <div className="space-y-2">
            <Button onClick={showPersistentToast} variant="secondary" className="w-full">Show Persistent Toast</Button>
            <Button onClick={showActionToast} variant="secondary" className="w-full">Show Toast With Action</Button>
            <Button onClick={showMultipleToasts} variant="secondary" className="w-full">Show Multiple Toasts</Button>
            <Button onClick={removeAllToasts} variant="outline" className="w-full">Clear All Toasts</Button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded-md bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Setup:</strong> Wrap your application with the <code>ToastProvider</code> component
            to enable toast notifications.
          </p>
          <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
            {`
// In your App.tsx or layout component:
import { ToastProvider } from './components/ui';

const App = () => (
  <ToastProvider position="top-right">
    <YourApp />
  </ToastProvider>
);
            `}
          </pre>
          <p className="mt-4">
            <strong>Usage:</strong> Use the <code>useToast</code> hook or the <code>toast</code> utility.
          </p>
          <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
            {`
// Using the hook:
const { addToast, removeToast } = useToast();
addToast({
  message: 'Hello World',
  variant: 'success',
  duration: 5000
});

// Using the utility:
toast.success('Hello World');
toast.error('An error occurred');
            `}
          </pre>
        </div>
      </div>
    </div>
  );
};

const ToastExample: React.FC = () => {
  return (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  );
};

export default ToastExample; 