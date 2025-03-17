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
exports.SecureChat = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const EncryptionService_1 = __importDefault(require("../services/todo/EncryptionService"));
const SecureChat = () => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [newMessage, setNewMessage] = (0, react_1.useState)('');
    const [encryptionKey, setEncryptionKey] = (0, react_1.useState)(null);
    const [isEncryptionEnabled, setIsEncryptionEnabled] = (0, react_1.useState)(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = (0, react_1.useState)(false);
    const [password, setPassword] = (0, react_1.useState)('');
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const messagesEndRef = (0, react_1.useRef)(null);
    // Auto-scroll to bottom when messages update
    (0, react_1.useEffect)(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    // Generate encryption key on component mount
    (0, react_1.useEffect)(() => {
        const generateKey = async () => {
            try {
                const key = await EncryptionService_1.default.generateKey();
                setEncryptionKey(key);
            }
            catch (error) {
                console.error('Failed to generate encryption key:', error);
            }
        };
        generateKey();
    }, []);
    const handleSendMessage = async () => {
        if (!newMessage.trim())
            return;
        setIsProcessing(true);
        try {
            const messageId = `msg_${Date.now()}`;
            const messageText = newMessage;
            if (isEncryptionEnabled && encryptionKey) {
                // Encrypt the message
                const encryptedText = await EncryptionService_1.default.encrypt(messageText, encryptionKey);
                setMessages([
                    ...messages,
                    {
                        id: messageId,
                        text: encryptedText,
                        isEncrypted: true,
                        timestamp: new Date()
                    }
                ]);
            }
            else {
                // Send as plain text
                setMessages([
                    ...messages,
                    {
                        id: messageId,
                        text: messageText,
                        isEncrypted: false,
                        timestamp: new Date()
                    }
                ]);
            }
            setNewMessage('');
        }
        catch (error) {
            console.error('Failed to send message:', error);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleDecryptMessage = async (message) => {
        if (!message.isEncrypted || !encryptionKey)
            return message.text;
        try {
            return await EncryptionService_1.default.decrypt(message.text, encryptionKey);
        }
        catch (error) {
            console.error('Failed to decrypt message:', error);
            return '[Decryption failed]';
        }
    };
    const toggleEncryption = () => {
        if (!isEncryptionEnabled) {
            setPasswordDialogOpen(true);
        }
        else {
            setIsEncryptionEnabled(false);
        }
    };
    const handleSetPassword = async () => {
        if (!password || !encryptionKey)
            return;
        try {
            setIsProcessing(true);
            await EncryptionService_1.default.storeKey(encryptionKey, password);
            setIsEncryptionEnabled(true);
            setPasswordDialogOpen(false);
            setPassword('');
        }
        catch (error) {
            console.error('Failed to set password:', error);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleCopyMessage = async (message) => {
        try {
            const textToCopy = message.isEncrypted
                ? await handleDecryptMessage(message)
                : message.text;
            await navigator.clipboard.writeText(textToCopy);
        }
        catch (error) {
            console.error('Failed to copy message:', error);
        }
    };
    const handleDeleteMessage = (messageId) => {
        setMessages(messages.filter(m => m.id !== messageId));
    };
    const formatTimestamp = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return (<material_1.Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <material_1.Paper elevation={3} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <material_1.Typography variant="h6">
          Secure Chat {isEncryptionEnabled && <icons_material_1.Lock color="success" fontSize="small"/>}
        </material_1.Typography>
        
        <material_1.Tooltip title={isEncryptionEnabled ? "Encryption Enabled" : "Enable Encryption"}>
          <material_1.IconButton color={isEncryptionEnabled ? "success" : "default"} onClick={toggleEncryption}>
            {isEncryptionEnabled ? <icons_material_1.Lock /> : <icons_material_1.LockOpen />}
          </material_1.IconButton>
        </material_1.Tooltip>
      </material_1.Paper>
      
      <material_1.Paper elevation={2} sx={{ flex: 1, mb: 2, p: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
        <material_1.List>
          {messages.map(async (message) => (<material_1.ListItem key={message.id} alignItems="flex-start" sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                bgcolor: message.isEncrypted ? 'rgba(0, 200, 83, 0.05)' : 'transparent',
                borderRadius: 1,
                mb: 1
            }}>
              <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                <material_1.Typography variant="caption" color="text.secondary">
                  {formatTimestamp(message.timestamp)}
                  {message.isEncrypted && (<icons_material_1.Lock fontSize="inherit" color="success" sx={{ ml: 1, verticalAlign: 'middle' }}/>)}
                </material_1.Typography>
                
                <material_1.Box>
                  <material_1.Tooltip title="Copy">
                    <material_1.IconButton size="small" onClick={() => handleCopyMessage(message)}>
                      <icons_material_1.ContentCopy fontSize="small"/>
                    </material_1.IconButton>
                  </material_1.Tooltip>
                  <material_1.Tooltip title="Delete">
                    <material_1.IconButton size="small" onClick={() => handleDeleteMessage(message.id)}>
                      <icons_material_1.Delete fontSize="small"/>
                    </material_1.IconButton>
                  </material_1.Tooltip>
                </material_1.Box>
              </material_1.Box>
              
              <material_1.ListItemText primary={message.isEncrypted
                ? <react_1.default.Suspense fallback={<material_1.Typography variant="body2">[Decrypting...]</material_1.Typography>}>
                        <DecryptedMessage message={message} decryptFn={handleDecryptMessage}/>
                      </react_1.default.Suspense>
                : message.text}/>
            </material_1.ListItem>))}
        </material_1.List>
        <div ref={messagesEndRef}/>
      </material_1.Paper>
      
      <material_1.Paper elevation={2} sx={{ p: 2 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center' }}>
          <material_1.TextField fullWidth variant="outlined" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} disabled={isProcessing} size="small" InputProps={{
            endAdornment: isEncryptionEnabled && (<icons_material_1.Lock color="success" fontSize="small" sx={{ mr: 1 }}/>)
        }}/>
          <material_1.Button variant="contained" color="primary" endIcon={isProcessing ? <material_1.CircularProgress size={20}/> : <icons_material_1.Send />} onClick={handleSendMessage} disabled={isProcessing || !newMessage.trim()} sx={{ ml: 1 }}>
            Send
          </material_1.Button>
        </material_1.Box>
      </material_1.Paper>
      
      <material_1.Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <material_1.DialogTitle>Set Encryption Password</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.DialogContentText>
            Set a password to enable message encryption. You'll need this password to decrypt messages later.
          </material_1.DialogContentText>
          <material_1.TextField autoFocus margin="dense" label="Password" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setPasswordDialogOpen(false)}>Cancel</material_1.Button>
          <material_1.Button onClick={handleSetPassword} color="primary" disabled={!password || isProcessing}>
            {isProcessing ? <material_1.CircularProgress size={24}/> : 'Enable Encryption'}
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.SecureChat = SecureChat;
// Component to handle decryption asynchronously
const DecryptedMessage = ({ message, decryptFn }) => {
    const [decryptedText, setDecryptedText] = (0, react_1.useState)('[Decrypting...]');
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        const decrypt = async () => {
            try {
                const text = await decryptFn(message);
                if (isMounted) {
                    setDecryptedText(text);
                }
            }
            catch (error) {
                if (isMounted) {
                    setDecryptedText('[Decryption failed]');
                }
            }
        };
        decrypt();
        return () => {
            isMounted = false;
        };
    }, [message, decryptFn]);
    return <material_1.Typography variant="body2">{decryptedText}</material_1.Typography>;
};
exports.default = exports.SecureChat;
//# sourceMappingURL=SecureChat.js.map