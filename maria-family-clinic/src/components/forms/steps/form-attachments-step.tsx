import React, { useCallback, useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useContactForm } from '../contact-form-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  FileText, 
  Image, 
  FileCheck, 
  AlertCircle,
  CheckCircle,
  Download,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormAttachmentsStepProps {
  onNext: () => void;
  onPrev: () => void;
  compactMode?: boolean;
}

interface FileUpload {
  id: string;
  file: File;
  preview?: string;
  uploadProgress: number;
  isUploading: boolean;
  isUploaded: boolean;
  error?: string;
}

// File type configurations
const FILE_TYPES = {
  'image/*': {
    label: 'Images',
    icon: Image,
    color: 'bg-blue-100 text-blue-600',
    maxSize: 10 * 1024 * 1024, // 10MB
    accepted: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  'application/pdf': {
    label: 'PDF Documents',
    icon: FileText,
    color: 'bg-red-100 text-red-600',
    maxSize: 20 * 1024 * 1024, // 20MB
    accepted: ['.pdf'],
  },
  'application/msword': {
    label: 'Word Documents',
    icon: FileText,
    color: 'bg-blue-100 text-blue-600',
    maxSize: 10 * 1024 * 1024, // 10MB
    accepted: ['.doc', '.docx'],
  },
  'text/plain': {
    label: 'Text Files',
    icon: FileText,
    color: 'bg-gray-100 text-gray-600',
    maxSize: 5 * 1024 * 1024, // 5MB
    accepted: ['.txt'],
  },
} as const;

const DOCUMENT_TYPES = [
  { value: 'medical-report', label: 'Medical Report' },
  { value: 'lab-results', label: 'Lab Results' },
  { value: 'x-ray', label: 'X-Ray / Imaging' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'insurance-card', label: 'Insurance Card' },
  { value: 'identification', label: 'Identification Document' },
  { value: 'other', label: 'Other' },
] as const;

export function FormAttachmentsStep({ onNext, onPrev, compactMode = false }: FormAttachmentsStepProps) {
  const { state } = useContactForm();
  const { watch, setValue } = useFormContext();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const watchedValues = watch();
  const attachments = watchedValues.attachments || [];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileUpload[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Validate file type
      const isValidType = Object.keys(FILE_TYPES).some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        continue; // Skip invalid files
      }
      
      const fileUpload: FileUpload = {
        id: `${Date.now()}-${i}`,
        file,
        uploadProgress: 0,
        isUploading: false,
        isUploaded: false,
      };
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileUpload.preview = e.target?.result as string;
          setFiles(prev => prev.map(f => f.id === fileUpload.id ? { ...f, preview: e.target?.result as string } : f));
        };
        reader.readAsDataURL(file);
      }
      
      newFiles.push(fileUpload);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate file upload
    newFiles.forEach(uploadFile => {
      simulateFileUpload(uploadFile.id);
    });
  };

  const simulateFileUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId && !file.isUploaded) {
          const newProgress = Math.min(file.uploadProgress + 10, 100);
          return {
            ...file,
            uploadProgress: newProgress,
            isUploading: newProgress < 100,
            isUploaded: newProgress === 100,
          };
        }
        return file;
      }));
      
      // Clear interval when upload is complete
      const file = files.find(f => f.id === fileId);
      if (file && file.uploadProgress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileText;
    return File;
  };

  const handleContinue = () => {
    // Convert files to attachment format and add to form
    const attachmentData = files
      .filter(f => f.isUploaded)
      .map(f => ({
        fileName: f.file.name,
        fileType: f.file.type,
        fileSize: f.file.size,
        fileContent: f.preview || '', // In real app, this would be base64 or server URL
        isMedicalDocument: true,
        documentType: 'other' as const,
        description: '',
      }));
    
    setValue('attachments', attachmentData);
    onNext();
  };

  const completedFiles = files.filter(f => f.isUploaded);
  const canProceed = files.length === 0 || completedFiles.length > 0;

  if (compactMode) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Attachments</h3>
          <p className="text-sm text-muted-foreground">
            Upload medical documents (optional)
          </p>
        </div>

        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
            'cursor-pointer'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Drag and drop files here, or click to select
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports: Images, PDF, Word documents (max 20MB)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Files</Label>
            {files.map((file) => {
              const FileIcon = getFileIcon(file.file.type);
              return (
                <div key={file.id} className="flex items-center space-x-2 p-2 border rounded">
                  <FileIcon className="w-4 h-4" />
                  <span className="text-sm flex-1">{file.file.name}</span>
                  {file.isUploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <Button onClick={handleContinue} className="w-full" disabled={!canProceed}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Attach Medical Documents
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          You can upload medical documents, lab results, or other relevant files to help us better assist you. This step is optional.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>File Upload</span>
          </CardTitle>
          <CardDescription>
            Upload up to 5 files (max 20MB each)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
              'cursor-pointer'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: PDF, Word documents, Images, Text files
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(FILE_TYPES).map(([type, config]) => {
                const IconComponent = config.icon;
                return (
                  <Badge key={type} variant="outline" className="flex items-center space-x-1">
                    <IconComponent className="w-3 h-3" />
                    <span>{config.label}</span>
                  </Badge>
                );
              })}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Uploaded Files</Label>
              {files.map((file) => {
                const FileIcon = getFileIcon(file.file.type);
                return (
                  <Card key={file.id} className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <FileIcon className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.file.size)}
                        </p>
                        
                        {/* Upload Progress */}
                        {file.isUploading && (
                          <div className="mt-2">
                            <Progress value={file.uploadProgress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              Uploading... {file.uploadProgress}%
                            </p>
                          </div>
                        )}
                        
                        {file.isUploaded && (
                          <div className="flex items-center space-x-1 text-green-600 mt-1">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs">Upload complete</span>
                          </div>
                        )}
                        
                        {file.error && (
                          <div className="flex items-center space-x-1 text-red-600 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-xs">{file.error}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {file.isUploaded && (
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Upload Summary */}
          {completedFiles.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <FileCheck className="w-5 h-5" />
                <span className="font-medium">
                  {completedFiles.length} file{completedFiles.length !== 1 ? 's' : ''} ready for submission
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Information (for medical documents) */}
      {completedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Information</CardTitle>
            <CardDescription>
              Help us categorize your documents for better processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedFiles.map((file, index) => (
              <div key={file.id} className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{file.file.name}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`documentType-${file.id}`}>Document Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`description-${file.id}`}>Description (Optional)</Label>
                    <Input
                      id={`description-${file.id}`}
                      placeholder="Brief description of this document"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!canProceed} size="lg">
          Continue to Review
        </Button>
      </div>
    </div>
  );
}