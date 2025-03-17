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
exports.BatchDocumentImport = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const KnowledgeGraphService_1 = __importDefault(require("../../services/KnowledgeGraphService"));
const BatchDocumentImport = () => {
    const [files, setFiles] = (0, react_1.useState)([]);
    const [dragActive, setDragActive] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [importing, setImporting] = (0, react_1.useState)(false);
    const [uploadStatus, setUploadStatus] = (0, react_1.useState)(null);
    const handleFileChange = (event) => {
        const fileList = event.target.files;
        if (fileList) {
            processFiles(fileList);
        }
    };
    const processFiles = (fileList) => {
        const newFiles = [];
        Array.from(fileList).forEach(file => {
            // Check file type
            if (!isValidFileType(file.type)) {
                setError(`File type not supported: ${file.name}`);
                return;
            }
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setError(`File too large: ${file.name}. Maximum size is 10MB.`);
                return;
            }
            newFiles.push({
                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                data: file
            });
        });
        setFiles(prev => [...prev, ...newFiles]);
        setError(null);
    };
    const isValidFileType = (type) => {
        const validTypes = [
            'application/pdf',
            'text/plain',
            'text/markdown',
            'text/csv',
            'application/json',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
        return validTypes.includes(type);
    };
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };
    const removeFile = (id) => {
        setFiles(files.filter(file => file.id !== id));
    };
    const getFileIcon = (type) => {
        if (type.includes('pdf'))
            return <icons_material_1.PictureAsPdf color="error"/>;
        if (type.includes('image'))
            return <icons_material_1.Image color="primary"/>;
        if (type.includes('text/plain') || type.includes('markdown'))
            return <icons_material_1.Description color="info"/>;
        if (type.includes('json') || type.includes('csv'))
            return <icons_material_1.Code color="secondary"/>;
        if (type.includes('msword') || type.includes('wordprocessing'))
            return <icons_material_1.FileCopy color="warning"/>;
        return <icons_material_1.Description />;
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return `${bytes} bytes`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    const clearAllFiles = () => {
        setFiles([]);
    };
    const importFiles = async () => {
        if (files.length === 0)
            return;
        try {
            setImporting(true);
            // Convert UploadedFile objects to File objects
            const filesToUpload = files.map(file => {
                // We need to re-create File objects from our stored metadata
                return new File([file.data], // Use the actual file data blob
                file.name, {
                    type: file.type,
                    lastModified: file.lastModified
                });
            });
            // Use the service to upload the files
            await KnowledgeGraphService_1.default.uploadDocuments(filesToUpload);
            // Show success message
            setUploadStatus({
                type: 'success',
                message: `Successfully queued ${files.length} file(s) for processing.`
            });
            // Clear the uploaded files
            setFiles([]);
        }
        catch (error) {
            console.error('Error uploading files:', error);
            setUploadStatus({
                type: 'error',
                message: 'Failed to import files. Please try again.'
            });
        }
        finally {
            setImporting(false);
        }
    };
    return (<material_1.Paper sx={{ p: 3, mt: 3 }}>
      <material_1.Typography variant="h5">Batch Document Import</material_1.Typography>
      
      {error && (<material_1.Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError(null)}>
          {error}
        </material_1.Alert>)}
      
      <material_1.Box sx={{
            mt: 2,
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            p: 3,
            backgroundColor: dragActive ? 'rgba(3, 169, 244, 0.04)' : 'transparent',
            transition: 'all 0.2s ease',
            textAlign: 'center',
            cursor: 'pointer'
        }} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => document.getElementById('file-upload')?.click()}>
        <input type="file" id="file-upload" multiple style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.jpg,.jpeg,.png"/>
        <icons_material_1.UploadFile sx={{ fontSize: 50, color: 'primary.main', mb: 2 }}/>
        <material_1.Typography variant="h6">
          Drag & Drop Files Here
        </material_1.Typography>
        <material_1.Typography variant="body2" color="textSecondary">
          or click to browse
        </material_1.Typography>
        <material_1.Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Supports PDF, TXT, MD, CSV, JSON, DOC, DOCX, JPG, PNG (Max 10MB per file)
        </material_1.Typography>
      </material_1.Box>
      
      {files.length > 0 && (<material_1.Box sx={{ mt: 3 }}>
          <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <material_1.Typography variant="subtitle1">
              {files.length} {files.length === 1 ? 'File' : 'Files'} Selected
            </material_1.Typography>
            <material_1.Button size="small" startIcon={<icons_material_1.DeleteOutline />} onClick={clearAllFiles} color="error" variant="outlined">
              Clear All
            </material_1.Button>
          </material_1.Box>
          
          <material_1.Divider sx={{ mb: 2 }}/>
          
          <material_1.List>
            {files.map((file) => (<material_1.ListItem key={file.id} secondaryAction={<material_1.Button size="small" color="error" onClick={() => removeFile(file.id)}>
                    <icons_material_1.DeleteOutline />
                  </material_1.Button>}>
                <material_1.ListItemIcon>
                  {getFileIcon(file.type)}
                </material_1.ListItemIcon>
                <material_1.ListItemText primary={file.name} secondary={<>
                      {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                      <material_1.Chip label={file.type.split('/')[1].toUpperCase()} size="small" sx={{ ml: 1 }} variant="outlined"/>
                    </>}/>
              </material_1.ListItem>))}
          </material_1.List>
          
          <material_1.Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <material_1.Button variant="contained" color="primary" size="large" onClick={importFiles} disabled={files.length === 0}>
              Import Files
            </material_1.Button>
          </material_1.Box>
        </material_1.Box>)}
    </material_1.Paper>);
};
exports.BatchDocumentImport = BatchDocumentImport;
exports.default = exports.BatchDocumentImport;
//# sourceMappingURL=BatchDocumentImport.js.map