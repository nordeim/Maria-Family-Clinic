import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Eye, 
  Download, 
  RefreshCw,
  Camera,
  FileImage,
  Shield,
  Clock,
  Image as ImageIcon
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { UploadedDocument } from '../types/registration'

export interface DocumentUploadProps {
  onUploadComplete?: (documents: UploadedDocument[]) => void
  eligibilityAssessmentId: string
  maxFiles?: number
  requiredDocuments?: string[]
  className?: string
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  eligibilityAssessmentId,
  maxFiles = 10,
  requiredDocuments = ['nric_front', 'nric_back'],
  className = '',
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload document mutation
  const uploadDocumentMutation = trpc.healthierSg.uploadDocument.useMutation({
    onSuccess: (result) => {
      const newDocument: UploadedDocument = {
        id: result.documentId,
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize,
        uploadDate: new Date(),
        verificationStatus: 'pending',
        ocrData: result.ocrData,
      }

      setDocuments(prev => [...prev, newDocument])
      setUploadProgress(prev => ({ ...prev, [result.documentId]: 100 }))
      
      toast({
        title: "Document Uploaded",
        description: `${result.fileName} uploaded successfully.`,
      })

      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete([...documents, newDocument])
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Verify document mutation
  const verifyDocumentMutation = trpc.healthierSg.verifyDocument.useMutation({
    onSuccess: (result) => {
      setDocuments(prev => prev.map(doc => 
        doc.id === result.documentId 
          ? { ...doc, verificationStatus: result.status as any }
          : doc
      ))

      toast({
        title: "Document Verified",
        description: result.message,
      })
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const validateFile = (file: File): string | null => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB'
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, WebP images and PDF files are allowed'
    }

    return null
  }

  const handleFileSelect = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    if (documents.length + fileArray.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      })
      return
    }

    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        toast({
          title: "Invalid File",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        })
        continue
      }

      setIsUploading(true)
      const documentId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [documentId]: Math.min((prev[documentId] || 0) + 10, 90)
          }))
        }, 200)

        await uploadDocumentMutation.mutateAsync({
          file,
          documentId,
          eligibilityAssessmentId,
        })

        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [documentId]: 100 }))

      } catch (error) {
        // Error handled by mutation
      }
    }

    setIsUploading(false)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [])

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[documentId]
      return newProgress
    })

    // Call completion callback
    if (onUploadComplete) {
      onUploadComplete(documents.filter(doc => doc.id !== documentId))
    }
  }

  const retryVerification = (documentId: string) => {
    verifyDocumentMutation.mutate({ documentId })
  }

  const getDocumentIcon = (fileType: string) => {
    if (fileType.includes('image')) return <FileImage className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'requires_review':
        return <Badge variant="outline">Under Review</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getRequiredDocumentsStatus = () => {
    const uploadedDocTypes = documents.map(doc => doc.fileName.toLowerCase())
    const hasAllRequired = requiredDocuments.every(req => 
      uploadedDocTypes.some(uploaded => uploaded.includes(req.replace('_', ' ')))
    )
    return {
      completed: requiredDocuments.filter(req => 
        uploadedDocTypes.some(uploaded => uploaded.includes(req.replace('_', ' ')))
      ).length,
      total: requiredDocuments.length,
      hasAllRequired,
    }
  }

  const requiredStatus = getRequiredDocumentsStatus()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
        <p className="text-gray-600">
          Upload required documents for identity verification and program enrollment
        </p>
      </div>

      {/* Upload Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Required Documents</span>
            <Badge variant={requiredStatus.hasAllRequired ? 'default' : 'secondary'}>
              {requiredStatus.completed}/{requiredStatus.total} Complete
            </Badge>
          </div>
          <div className="space-y-2">
            {requiredDocuments.map((reqDoc) => {
              const uploaded = documents.some(doc => 
                doc.fileName.toLowerCase().includes(reqDoc.replace('_', ' '))
              )
              return (
                <div key={reqDoc} className="flex items-center gap-2 text-sm">
                  {uploaded ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                  <span className={uploaded ? 'text-green-700' : 'text-orange-700'}>
                    {reqDoc.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Drag and drop files here, or{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                browse files
              </Button>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Support for JPEG, PNG, WebP images and PDF files • Max 10MB each • {maxFiles} files max
            </p>
            
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                Take Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileSelect(e.target.files)
                }
              }}
            />
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Uploading Files...</h4>
              {Object.entries(uploadProgress).map(([docId, progress]) => (
                <div key={docId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Document {docId}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(doc.fileType)}
                      <div>
                        <p className="text-sm font-medium">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round(doc.fileSize / 1024)}KB • {doc.uploadDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getVerificationBadge(doc.verificationStatus)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeDocument(doc.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* OCR Extracted Data */}
      {documents.some(doc => doc.ocrData) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Extracted Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents
                .filter(doc => doc.ocrData)
                .map((doc) => (
                  <Alert key={doc.id}>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{doc.fileName}:</strong> {doc.ocrData?.extractedText}
                      <br />
                      <span className="text-xs text-gray-500">
                        Confidence: {Math.round((doc.ocrData?.confidence || 0) * 100)}%
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Security & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5" />
            <div>
              <p>Your documents are protected with:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>End-to-end encryption</li>
                <li>Secure cloud storage</li>
                <li>Automatic OCR processing</li>
                <li>Access logging and monitoring</li>
                <li>Automatic deletion after program completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}