import React, { useCallback, useState, useRef, forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Trash2,
  Eye,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  isDragActive?: boolean;
  setIsDragActive?: (active: boolean) => void;
}

// File type icon mapping
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image;
  if (fileType === 'application/pdf') return FileText;
  return File;
};

// File type color mapping
const getFileTypeColor = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'bg-blue-100 text-blue-600';
  if (fileType === 'application/pdf') return 'bg-red-100 text-red-600';
  if (fileType.includes('word')) return 'bg-blue-100 text-blue-600';
  return 'bg-gray-100 text-gray-600';
};

export const FileUploadZone = forwardRef<HTMLInputElement, FileUploadZoneProps>((
  {
    onFilesSelected,
    maxFiles = 5,
    maxFileSize = 20 * 1024 * 1024, // 20MB default
    acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt'],
    className,
    disabled = false,
    showPreview = true,
    isDragActive: externalIsDragActive,
    setIsDragActive: externalSetIsDragActive,
  },
  ref
) => {
  const [internalIsDragActive, setInternalIsDragActive] = useState(false);
  const isDragActive = externalIsDragActive !== undefined ? externalIsDragActive : internalIsDragActive;
  const setIsDragActive = externalSetIsDragActive || setInternalIsDragActive;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, [setIsDragActive]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, disabled, setIsDragActive]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, disabled]);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('w-full', className)}>
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive && !disabled && 'border-blue-500 bg-blue-50',
          !isDragActive && !disabled && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isDragActive ? 'bg-blue-100' : 'bg-gray-100'
              )}>
                <Upload className={cn(
                  'w-6 h-6',
                  isDragActive ? 'text-blue-500' : 'text-gray-500'
                )} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop files here' : 'Upload Medical Documents'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Max {maxFiles} files, {Math.round(maxFileSize / 1024 / 1024)}MB each
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-1">
              {acceptedTypes.map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="w-full"
            >
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <input
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          fileInputRef.current = node;
        }}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        aria-label="File upload input"
      />
    </div>
  );
});

FileUploadZone.displayName = 'FileUploadZone';

// File preview component
interface FilePreviewProps {
  file: File;
  preview?: string;
  uploadProgress?: number;
  isUploaded?: boolean;
  isUploading?: boolean;
  error?: string;
  onRemove?: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
  showActions?: boolean;
  className?: string;
}

export function FilePreview({
  file,
  preview,
  uploadProgress = 0,
  isUploaded = false,
  isUploading = false,
  error,
  onRemove,
  onDownload,
  onPreview,
  showActions = true,
  className
}: FilePreviewProps) {
  const FileIcon = getFileIcon(file.type);
  const fileTypeColor = getFileTypeColor(file.type);
  const fileSize = file.size;
  const fileSizeFormatted = formatFileSize(fileSize);

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start space-x-4">
        {/* File Preview/Icon */}
        <div className="flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt={file.name}
              className="w-12 h-12 object-cover rounded cursor-pointer"
              onClick={onPreview}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {file.type} • {fileSizeFormatted}
          </p>
          
          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-1" />
              <p className="text-xs text-gray-500">Uploading... {uploadProgress}%</p>
            </div>
          )}
          
          {/* Status */}
          {isUploaded && !isUploading && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs">Upload complete</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-1">
            {onPreview && preview && (
              <Button size="sm" variant="ghost" onClick={onPreview} className="h-8 w-8 p-0">
                <Eye className="w-3 h-3" />
              </Button>
            )}
            
            {onDownload && isUploaded && (
              <Button size="sm" variant="ghost" onClick={onDownload} className="h-8 w-8 p-0">
                <Download className="w-3 h-3" />
              </Button>
            )}
            
            {onRemove && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onRemove} 
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// File list component
interface FileListProps {
  files: Array<{
    id: string;
    file: File;
    preview?: string;
    uploadProgress?: number;
    isUploaded?: boolean;
    isUploading?: boolean;
    error?: string;
  }>;
  onRemove?: (id: string) => void;
  onPreview?: (file: File, preview?: string) => void;
  onDownload?: (file: File) => void;
  maxFiles?: number;
  className?: string;
}

export function FileList({
  files,
  onRemove,
  onPreview,
  onDownload,
  maxFiles,
  className
}: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  const remainingSlots = maxFiles ? maxFiles - files.length : 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          Uploaded Files ({files.length}
          {maxFiles && ` / ${maxFiles}`})
        </Label>
        {remainingSlots > 0 && (
          <Badge variant="outline" className="text-xs">
            {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {files.map((fileData) => (
          <FilePreview
            key={fileData.id}
            file={fileData.file}
            preview={fileData.preview}
            uploadProgress={fileData.uploadProgress}
            isUploaded={fileData.isUploaded}
            isUploading={fileData.isUploading}
            error={fileData.error}
            onRemove={onRemove ? () => onRemove(fileData.id) : undefined}
            onPreview={onPreview ? () => onPreview(fileData.file, fileData.preview) : undefined}
            onDownload={onDownload ? () => onDownload(fileData.file) : undefined}
          />
        ))}
      </div>

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              {files.filter(f => f.isUploaded).length} file{files.filter(f => f.isUploaded).length !== 1 ? 's' : ''} ready
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Total: {formatFileSize(files.reduce((acc, f) => acc + f.file.size, 0))}
          </div>
        </div>
      )}
    </div>
  );
}

// File validation utility
export function validateFiles(
  files: FileList | File[],
  options: {
    maxFiles?: number;
    maxFileSize?: number;
    acceptedTypes?: string[];
  } = {}
): { valid: File[]; errors: string[] } {
  const {
    maxFiles = 5,
    maxFileSize = 20 * 1024 * 1024,
    acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt']
  } = options;

  const errors: string[] = [];
  const valid: File[] = [];

  const fileArray = Array.from(files);

  // Check file count
  if (fileArray.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
    return { valid: [], errors };
  }

  fileArray.forEach((file, index) => {
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File ${file.name} is too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB)`);
      return;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isValidType) {
      errors.push(`File ${file.name} has an unsupported format`);
      return;
    }

    valid.push(file);
  });

  return { valid, errors };
}

// File processing utility
export function processFiles(
  files: File[],
  options: {
    createPreview?: boolean;
    maxPreviewSize?: number;
  } = {}
): Promise<Array<{
  file: File;
  preview?: string;
  id: string;
}>> {
  const { createPreview = true, maxPreviewSize = 5 * 1024 * 1024 } = options;

  return Promise.all(
    files.map(file => {
      return new Promise<{
        file: File;
        preview?: string;
        id: string;
      }>((resolve) => {
        const result = {
          file,
          preview: undefined as string | undefined,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        if (createPreview && file.type.startsWith('image/') && file.size <= maxPreviewSize) {
          const reader = new FileReader();
          reader.onload = (e) => {
            result.preview = e.target?.result as string;
            resolve(result);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(result);
        }
      });
    })
  );
}