"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const react_router_dom_1 = require("react-router-dom");
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
require("./index.css");
const App_1 = __importDefault(require("./App"));
const serviceWorkerRegistration = __importStar(require("./serviceWorkerRegistration"));
const root = client_1.default.createRoot(document.getElementById("root"));
// Check initial online status and show toast notification
const checkOnlineStatus = () => {
    if (!navigator.onLine) {
        react_toastify_1.toast.warning('You are currently offline. Some features may be limited.', {
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
root.render(<react_1.default.StrictMode>
    <react_router_dom_1.BrowserRouter>
      <App_1.default />
      <react_toastify_1.ToastContainer />
    </react_router_dom_1.BrowserRouter>
  </react_1.default.StrictMode>);
// Register the service worker
serviceWorkerRegistration.register({
    // When a new service worker has been installed and is waiting to be activated
    onUpdate: (registration) => {
        const waitingServiceWorker = registration.waiting;
        if (waitingServiceWorker) {
            waitingServiceWorker.addEventListener("statechange", (event) => {
                const target = event.target;
                if (target && target.state === "activated") {
                    const toastId = react_toastify_1.toast.info('Application updated! Refresh to see the latest version.', {
                        position: "top-center",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        closeButton: ({ closeToast }) => (<button onClick={() => {
                                react_toastify_1.toast.dismiss(toastId);
                                window.location.reload();
                            }} style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginLeft: '10px'
                            }}>
                Refresh Now
              </button>)
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
        react_toastify_1.toast.success('App ready for offline use!', {
            position: "bottom-right",
            autoClose: 3000,
        });
    },
    // When app goes offline
    onOffline: () => {
        react_toastify_1.toast.warning('You are currently offline. Some features may be limited.', {
            position: "bottom-right",
            autoClose: false,
            toastId: 'offline-notification',
        });
    },
    // When app comes back online
    onOnline: () => {
        react_toastify_1.toast.dismiss('offline-notification');
        react_toastify_1.toast.success('You are back online!', {
            position: "bottom-right",
            autoClose: 3000,
        });
    }
});
//# sourceMappingURL=index.js.map