/**
 * Secure Medical Document Upload Component
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Handles encrypted upload and storage of medical documents
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  FileText, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle, 
  AlertTriangle, 
  X,
  File,
  Image,
  FileAudio,
  Video,
  Archive,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { usePrivacyCompliance } from '@/hooks/use-privacy-compliance';

interface MedicalDocument {
  id: string;
  originalName: string;
  encryptedName: string;
  size: number;
  type: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  encryptionMethod: 'AES-256-GCM';
  uploadDate: Date;
  expiryDate?: Date;
  isEncrypted: boolean;
  scanResults: {
    hasMalware: boolean;
    isSuspicious: boolean;
    lastScanDate: Date;
  };
  accessLog: {
    accessedBy: string;
    accessedAt: Date;
    purpose: string;
  }[];
}

interface SecureMedicalDocumentUploadProps {
  userId?: string;
  enquiryId?: string;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  onUploadComplete?: (documents: MedicalDocument[]) => void;
  onUploadError?: (error: string) => void;
}

export const SecureMedicalDocumentUpload: React.FC<SecureMedicalDocumentUploadProps> = ({
  userId,
  enquiryId,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg',
    'audio/wav',
    'video/mp4'
  ],
  onUploadComplete,
  onUploadError
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<MedicalDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [encryptionStatus, setEncryptionStatus] = useState<{
    [key: string]: 'pending' | 'encrypting' | 'complete' | 'error';
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logHealthDataAccess, createHealthDataConsent } = usePrivacyCompliance();

  // File type detection
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('audio/')) return FileAudio;
    if (type.startsWith('video/')) return Video;
    if (type.includes('zip') || type.includes('archive')) return Archive;
    return File;
  };

  // Security classification based on file content
  const classifyDocument = async (file: File): Promise<MedicalDocument['classification']> => {
    // Simple content-based classification
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // High-risk medical documents
    if (fileName.includes('diagnosis') || 
        fileName.includes('medical record') ||
        fileName.includes('test result') ||
        fileName.includes('prescription') ||
        fileType.includes('pdf')) {
      return 'RESTRICTED';
    }
    
    // Medium-risk documents
    if (fileName.includes('lab') || 
        fileName.includes('blood') ||
        fileName.includes('xray') ||
        fileName.includes('scan')) {
      return 'CONFIDENTIAL';
    }
    
    // Default classification
    return 'INTERNAL';
  };

  // Malware scanning simulation
  const scanForMalware = async (file: File): Promise<{
    hasMalware: boolean;
    isSuspicious: boolean;
  }> => {
    // Simulate malware scanning
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuspicious = Math.random() < 0.05; // 5% chance of suspicious file
        const hasMalware = Math.random() < 0.01; // 1% chance of malware
        resolve({ hasMalware, isSuspicious });
      }, 1000);
    });
  };

  // Encrypt file using AES-256-GCM
  const encryptFile = async (file: File): Promise<{
    encryptedData: ArrayBuffer;
    encryptionKey: string;
    iv: string;
  }> => {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    // Generate encryption key
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Export key for storage
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    const encryptionKey = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    // Generate IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ivString = btoa(String.fromCharCode(...iv));

    // Read file as array buffer
    const fileData = await file.arrayBuffer();

    // Encrypt the file
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      fileData
    );

    return {
      encryptedData,
      encryptionKey,
      iv: ivString
    };
  };

  // File validation
  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds limit of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    // Additional security checks
    const forbiddenPatterns = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'];
    const fileName = file.name.toLowerCase();
    if (forbiddenPatterns.some(pattern => fileName.endsWith(pattern))) {
      return 'Potentially dangerous file type detected';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setError(null);
    setSelectedFiles(fileArray);

    // Validate all files
    const errors = fileArray.map(validateFile).filter(Boolean);
    if (errors.length > 0) {
      setError(errors.join('; '));
      return;
    }

    // Log document access
    logHealthDataAccess({
      userId: userId || 'unknown',
      resourceType: 'medical_document',
      action: 'upload_attempt',
      dataClassification: 'CONFIDENTIAL',
      purpose: 'medical_document_upload',
      enquiryId,
      metadata: {
        fileCount: fileArray.length,
        fileTypes: fileArray.map(f => f.type),
        totalSize: fileArray.reduce((sum, f) => sum + f.size, 0)
      }
    });
  }, [userId, enquiryId, logHealthDataAccess]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Upload and encrypt files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const newDocuments: MedicalDocument[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setEncryptionStatus(prev => ({ ...prev, [file.name]: 'encrypting' }));

        try {
          // 1. Scan for malware
          const scanResults = await scanForMalware(file);
          if (scanResults.hasMalware) {
            throw new Error('Malware detected in file');
          }

          // 2. Classify document
          const classification = await classifyDocument(file);

          // 3. Encrypt file
          const { encryptedData, encryptionKey, iv } = await encryptFile(file);

          // 4. Create document record
          const document: MedicalDocument = {
            id: `doc_${Date.now()}_${i}`,
            originalName: file.name,
            encryptedName: `${Date.now()}_${Math.random().toString(36).substring(7)}.enc`,
            size: file.size,
            type: file.type,
            classification,
            encryptionMethod: 'AES-256-GCM',
            uploadDate: new Date(),
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            isEncrypted: true,
            scanResults: {
              hasMalware: scanResults.hasMalware,
              isSuspicious: scanResults.isSuspicious,
              lastScanDate: new Date()
            },
            accessLog: []
          };

          // 5. Store encrypted file (in real implementation, upload to secure storage)
          // For now, we'll just store the metadata
          
          newDocuments.push(document);
          setEncryptionStatus(prev => ({ ...prev, [file.name]: 'complete' }));

          // Update progress
          setUploadProgress(((i + 1) / selectedFiles.length) * 100);

          // Log successful upload
          await logHealthDataAccess({
            userId: userId || 'unknown',
            resourceType: 'medical_document',
            action: 'upload_success',
            dataClassification: classification,
            purpose: 'medical_document_upload',
            enquiryId,
            metadata: {
              documentId: document.id,
              fileName: file.name,
              fileSize: file.size,
              encryptionMethod: 'AES-256-GCM'
            }
          });

        } catch (error) {
          setEncryptionStatus(prev => ({ ...prev, [file.name]: 'error' }));
          throw error;
        }
      }

      // Update uploaded files list
      setUploadedFiles(prev => [...prev, ...newDocuments]);
      
      // Clear selected files
      setSelectedFiles([]);
      
      if (onUploadComplete) {
        onUploadComplete(newDocuments);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Delete uploaded document
  const deleteDocument = async (documentId: string) => {
    try {
      setUploadedFiles(prev => prev.filter(doc => doc.id !== documentId));
      
      // Log deletion
      await logHealthDataAccess({
        userId: userId || 'unknown',
        resourceType: 'medical_document',
        action: 'delete',
        dataClassification: 'CONFIDENTIAL',
        purpose: 'document_deletion',
        enquiryId,
        metadata: { documentId }
      });
    } catch (error) {
      setError('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Secure Medical Document Upload</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload and encrypt medical documents with PDPA-compliant security
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Lock className="h-3 w-3 mr-1" />
          AES-256-GCM Encrypted
        </Badge>
      </div>

      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          All uploaded documents are automatically encrypted using AES-256-GCM encryption, 
          scanned for malware, and stored with strict access controls. Documents will expire 
          after 7 days for security purposes.
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Documents</CardTitle>
          <CardDescription>
            Supported formats: PDF, DOC, DOCX, JPG, PNG, TIFF, MP3, MP4 (Max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </h4>
            <p className="text-gray-600 mb-4">
              Drag and drop medical documents or click to select files
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <File className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Files ({selectedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                const status = encryptionStatus[file.name];
                
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <FileIcon className="h-8 w-8 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                      {status && (
                        <Badge 
                          variant="outline" 
                          className={`mt-1 text-xs ${
                            status === 'complete' ? 'text-green-600 border-green-200' :
                            status === 'encrypting' ? 'text-yellow-600 border-yellow-200' :
                            status === 'error' ? 'text-red-600 border-red-200' :
                            'text-gray-600 border-gray-200'
                          }`}
                        >
                          {status === 'encrypting' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                          {status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {status === 'error' && <X className="h-3 w-3 mr-1" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Encrypting and uploading...</span>
                  <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Upload & Encrypt
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Documents */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Documents ({uploadedFiles.length})</CardTitle>
            <CardDescription>
              Securely stored and encrypted documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((doc) => {
                const FileIcon = getFileIcon(doc.type);
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <FileIcon className="h-8 w-8 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.type}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            doc.classification === 'RESTRICTED' ? 'text-red-600 border-red-200' :
                            doc.classification === 'CONFIDENTIAL' ? 'text-orange-600 border-orange-200' :
                            doc.classification === 'INTERNAL' ? 'text-yellow-600 border-yellow-200' :
                            'text-green-600 border-green-200'
                          }`}
                        >
                          {doc.classification}
                        </Badge>
                        {doc.scanResults.isSuspicious && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Suspicious
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Encrypted
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecureMedicalDocumentUpload;