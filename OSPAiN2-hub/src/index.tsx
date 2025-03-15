import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// Check initial online status and show toast notification
const checkOnlineStatus = () => {
  if (!navigator.onLine) {
    toast.warning('You are currently offline. Some features may be limited.', {
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

// Run initial online status check
checkOnlineStatus();

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer />
    </BrowserRouter>
  </React.StrictMode>
);

// Register the service worker
serviceWorkerRegistration.register({
  // When a new service worker has been installed and is waiting to be activated
  onUpdate: (registration) => {
    const waitingServiceWorker = registration.waiting;
    
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", (event) => {
        const target = event.target as ServiceWorker;
        if (target && target.state === "activated") {
          const toastId = toast.info('Application updated! Refresh to see the latest version.', {
            position: "top-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            closeButton: ({ closeToast }) => (
              <button 
                onClick={() => {
                  toast.dismiss(toastId);
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Refresh Now
              </button>
            )
          });
        }
      });
      
      // Tell the service worker to skip waiting, triggering the statechange event
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
  
  // When service worker is successfully registered for the first time
  onSuccess: (registration) => {
    console.log('Service worker registered successfully:', registration);
    toast.success('App ready for offline use!', {
      position: "bottom-right",
      autoClose: 3000,
    });
  },
  
  // When app goes offline
  onOffline: () => {
    toast.warning('You are currently offline. Some features may be limited.', {
      position: "bottom-right",
      autoClose: false,
      toastId: 'offline-notification',
    });
  },
  
  // When app comes back online
  onOnline: () => {
    toast.dismiss('offline-notification');
    toast.success('You are back online!', {
      position: "bottom-right",
      autoClose: 3000,
    });
  }
});
