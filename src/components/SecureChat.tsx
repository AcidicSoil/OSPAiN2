import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import EncryptionService from '../services/todo/EncryptionService';

interface ChatMessage {
  id: string;
  text: string;
  isEncrypted: boolean;
  timestamp: Date;
}

export const SecureChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Generate encryption key on component mount
  useEffect(() => {
    const generateKey = async () => {
      try {
        const key = await EncryptionService.generateKey();
        setEncryptionKey(key);
      } catch (error) {
        console.error('Failed to generate encryption key:', error);
      }
    };
    
    generateKey();
  }, []);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const messageId = `msg_${Date.now()}`;
      const messageText = newMessage;
      
      if (isEncryptionEnabled && encryptionKey) {
        // Encrypt the message
        const encryptedText = await EncryptionService.encrypt(messageText, encryptionKey);
        
        setMessages([
          ...messages,
          {
            id: messageId,
            text: encryptedText,
            isEncrypted: true,
            timestamp: new Date()
          }
        ]);
      } else {
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
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDecryptMessage = async (message: ChatMessage) => {
    if (!message.isEncrypted || !encryptionKey) return message.text;
    
    try {
      return await EncryptionService.decrypt(message.text, encryptionKey);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return '[Decryption failed]';
    }
  };
  
  const toggleEncryption = () => {
    if (!isEncryptionEnabled) {
      setPasswordDialogOpen(true);
    } else {
      setIsEncryptionEnabled(false);
    }
  };
  
  const handleSetPassword = async () => {
    if (!password || !encryptionKey) return;
    
    try {
      setIsProcessing(true);
      await EncryptionService.storeKey(encryptionKey, password);
      setIsEncryptionEnabled(true);
      setPasswordDialogOpen(false);
      setPassword('');
    } catch (error) {
      console.error('Failed to set password:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCopyMessage = async (message: ChatMessage) => {
    try {
      const textToCopy = message.isEncrypted 
        ? await handleDecryptMessage(message)
        : message.text;
        
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };
  
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(m => m.id !== messageId));
  };
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          Secure Chat {isEncryptionEnabled && <LockIcon color="success" fontSize="small" />}
        </Typography>
        
        <Tooltip title={isEncryptionEnabled ? "Encryption Enabled" : "Enable Encryption"}>
          <IconButton color={isEncryptionEnabled ? "success" : "default"} onClick={toggleEncryption}>
            {isEncryptionEnabled ? <LockIcon /> : <LockOpenIcon />}
          </IconButton>
        </Tooltip>
      </Paper>
      
      <Paper elevation={2} sx={{ flex: 1, mb: 2, p: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
        <List>
          {messages.map(async (message) => (
            <ListItem key={message.id} alignItems="flex-start" 
              sx={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                bgcolor: message.isEncrypted ? 'rgba(0, 200, 83, 0.05)' : 'transparent',
                borderRadius: 1,
                mb: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(message.timestamp)}
                  {message.isEncrypted && (
                    <LockIcon fontSize="inherit" color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />
                  )}
                </Typography>
                
                <Box>
                  <Tooltip title="Copy">
                    <IconButton size="small" onClick={() => handleCopyMessage(message)}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDeleteMessage(message.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <ListItemText 
                primary={
                  message.isEncrypted
                    ? <React.Suspense fallback={<Typography variant="body2">[Decrypting...]</Typography>}>
                        <DecryptedMessage message={message} decryptFn={handleDecryptMessage} />
                      </React.Suspense>
                    : message.text
                }
              />
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Paper>
      
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isProcessing}
            size="small"
            InputProps={{
              endAdornment: isEncryptionEnabled && (
                <LockIcon color="success" fontSize="small" sx={{ mr: 1 }} />
              )
            }}
          />
          <Button 
            variant="contained" 
            color="primary"
            endIcon={isProcessing ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSendMessage}
            disabled={isProcessing || !newMessage.trim()}
            sx={{ ml: 1 }}
          >
            Send
          </Button>
        </Box>
      </Paper>
      
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Set Encryption Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set a password to enable message encryption. You'll need this password to decrypt messages later.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSetPassword} 
            color="primary"
            disabled={!password || isProcessing}
          >
            {isProcessing ? <CircularProgress size={24} /> : 'Enable Encryption'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Component to handle decryption asynchronously
const DecryptedMessage: React.FC<{
  message: ChatMessage;
  decryptFn: (message: ChatMessage) => Promise<string>;
}> = ({ message, decryptFn }) => {
  const [decryptedText, setDecryptedText] = useState<string>('[Decrypting...]');
  
  useEffect(() => {
    let isMounted = true;
    
    const decrypt = async () => {
      try {
        const text = await decryptFn(message);
        if (isMounted) {
          setDecryptedText(text);
        }
      } catch (error) {
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
  
  return <Typography variant="body2">{decryptedText}</Typography>;
};

export default SecureChat; 