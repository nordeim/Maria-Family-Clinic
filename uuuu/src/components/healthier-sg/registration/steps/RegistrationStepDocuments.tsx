import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Clock
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { DocumentUploadStep, UploadedDocument, DocumentMetadata } from '../../types/registration'

export interface RegistrationStepDocumentsProps {
  data: DocumentUploadStep | null
  onUpdate: (data: DocumentUploadStep) => void
  onNext: () => void
  eligibilityAssessmentId: string
  className?: string
}

const DOCUMENT_TYPES: DocumentMetadata[] = [
  {
    documentType: 'nric_front',
    required: true,
    description: 'Front side of your NRIC/IC',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    validationRules: ['Must be clear and readable', 'All corners must be visible'],
  },
  {
    documentType: 'nric_back',
    required: true,
    description: 'Back side of your NRIC/IC',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    validationRules: ['Must be clear and readable', 'All corners must be visible'],
  },
  {
    documentType: 'insurance_card',
    required: false,
    description: 'Medisave/Medishield insurance card (optional)',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    validationRules: ['Must be clear and readable', 'Card number must be visible'],
  },
  {
    documentType: 'medical_records',
    required: false,
    description: 'Recent medical records or lab results (optional)',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    validationRules: ['Must be clear and readable', 'Date must be visible'],
  },
  {
    documentType: 'medication_list',
    required: false,
    description: 'Current medication list (optional)',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    validationRules: ['Must be clear and readable', 'Medications and dosages must be visible'],
  },
  {
    documentType: 'proof_of_address',
    required: false,
    description: 'Proof of address (optional)',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    validationRules: ['Must be clear and readable', 'Address must match provided information'],
  },
]

export const RegistrationStepDocuments: React.FC<RegistrationStepDocumentsProps> = ({
  data,
  onUpdate,
  onNext,
  eligibilityAssessmentId,
  className = '',
}) => {
  const [formData, setFormData] = useState<DocumentUploadStep>(
    data || {
      uploadedDocuments: [],
      documentMetadata: DOCUMENT_TYPES,
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState<string | null>(null)

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

      setFormData(prev => ({
        ...prev,
        uploadedDocuments: [...prev.uploadedDocuments, newDocument],
      }))

      onUpdate({
        ...formData,
        uploadedDocuments: [...formData.uploadedDocuments, newDocument],
      })

      setUploadProgress(prev => ({ ...prev, [result.documentId]: 100 }))
      
      toast({
        title: "Document Uploaded",
        description: `${result.fileName} uploaded successfully.`,
      })
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
      setFormData(prev => ({
        ...prev,
        uploadedDocuments: prev.uploadedDocuments.map(doc => 
          doc.id === result.documentId 
            ? { ...doc, verificationStatus: result.status as any }
            : doc
        ),
      }))

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

  const validateFile = (file: File, documentType: string): string | null => {
    const docMetadata = DOCUMENT_TYPES.find(d => d.documentType === documentType)
    if (!docMetadata) return 'Invalid document type'

    // Check file size
    if (file.size > docMetadata.maxFileSize) {
      return `File size must be less than ${Math.round(docMetadata.maxFileSize / (1024 * 1024))}MB`
    }

    // Check file type
    if (!docMetadata.acceptedFormats.includes(file.type)) {
      return 'File format not supported. Please use JPEG, PNG, or PDF files.'
    }

    return null
  }

  const handleFileSelect = async (files: FileList, documentType: string) => {
    const file = files[0]
    if (!file) return

    // Validate file
    const error = validateFile(file, documentType)
    if (error) {
      toast({
        title: "Invalid File",
        description: error,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      formData.append('eligibilityAssessmentId', eligibilityAssessmentId)

      await uploadDocumentMutation.mutateAsync({
        file,
        documentType,
        eligibilityAssessmentId,
      })
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent, documentType: string) => {
    e.preventDefault()
    setDragOver(documentType)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault()
    setDragOver(null)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files, documentType)
    }
  }

  const removeDocument = (documentId: string) => {
    setFormData(prev => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter(doc => doc.id !== documentId),
    }))

    onUpdate({
      ...formData,
      uploadedDocuments: formData.uploadedDocuments.filter(doc => doc.id !== documentId),
    })
  }

  const retryVerification = (documentId: string) => {
    verifyDocumentMutation.mutate({
      documentId,
    })
  }

  const getDocumentStatus = (documentType: string) => {
    return formData.uploadedDocuments.find(doc => 
      doc.id.includes(documentType) || 
      doc.fileName.toLowerCase().includes(documentType.replace('_', ' '))
    )
  }

  const getRequiredDocumentsCompleted = () => {
    return DOCUMENT_TYPES.filter(doc => doc.required && getDocumentStatus(doc.documentType)).length
  }

  const getOverallProgress = () => {
    const totalRequired = DOCUMENT_TYPES.filter(doc => doc.required).length
    const completed = getRequiredDocumentsCompleted()
    return Math.round((completed / totalRequired) * 100)
  }

  const canProceed = () => {
    const requiredDocs = DOCUMENT_TYPES.filter(doc => doc.required)
    return requiredDocs.every(doc => getDocumentStatus(doc.documentType))
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Document Upload</h3>
        </div>
        <Badge variant={getRequiredDocumentsCompleted() === DOCUMENT_TYPES.filter(d => d.required).length ? 'default' : 'secondary'}>
          {getRequiredDocumentsCompleted()}/{DOCUMENT_TYPES.filter(d => d.required).length} Required
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Documents Uploaded</span>
              <span>{getRequiredDocumentsCompleted()}/{DOCUMENT_TYPES.filter(d => d.required).length} Required</span>
            </div>
            <Progress value={getOverallProgress()} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Sections */}
      <div className="space-y-6">
        {DOCUMENT_TYPES.map((docType) => {
          const existingDoc = getDocumentStatus(docType.documentType)
          const isDragOver = dragOver === docType.documentType

          return (
            <Card key={docType.documentType} className={isDragOver ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base capitalize">
                        {docType.documentType.replace('_', ' ')}
                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{docType.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {existingDoc && getVerificationBadge(existingDoc.verificationStatus)}
                    {docType.required && (
                      <Badge variant={existingDoc ? 'default' : 'destructive'}>
                        {existingDoc ? 'Complete' : 'Required'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {existingDoc ? (
                  /* Existing Document */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(existingDoc.fileType)}
                        <div>
                          <p className="text-sm font-medium">{existingDoc.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {Math.round(existingDoc.fileSize / 1024)}KB • 
                            Uploaded {existingDoc.uploadDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeDocument(existingDoc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {existingDoc.ocrData && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>OCR Extracted:</strong> {existingDoc.ocrData.extractedText}
                          <br />
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round(existingDoc.ocrData.confidence * 100)}%
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}

                    {existingDoc.verificationStatus === 'rejected' && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Document verification failed. Please upload a new document.
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => retryVerification(existingDoc.id)}
                            className="ml-2"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  /* Upload Area */
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, docType.documentType)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, docType.documentType)}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your file here, or{' '}
                      <Label htmlFor={`file-${docType.documentType}`} className="text-blue-600 cursor-pointer hover:underline">
                        browse
                      </Label>
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {docType.acceptedFormats.map(format => format.split('/')[1].toUpperCase()).join(', ')} • 
                      Max {Math.round(docType.maxFileSize / (1024 * 1024))}MB
                    </p>
                    
                    <input
                      id={`file-${docType.documentType}`}
                      type="file"
                      className="hidden"
                      accept={docType.acceptedFormats.join(',')}
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileSelect(e.target.files, docType.documentType)
                        }
                      }}
                    />

                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`file-${docType.documentType}`) as HTMLInputElement
                          input?.click()
                        }}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Take Photo
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`file-${docType.documentType}`) as HTMLInputElement
                          input?.click()
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Select File
                      </Button>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress[docType.documentType] !== undefined && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress[docType.documentType]}%</span>
                        </div>
                        <Progress value={uploadProgress[docType.documentType]} className="w-full" />
                      </div>
                    )}
                  </div>
                )}

                {/* Validation Rules */}
                {docType.validationRules.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Requirements:</p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {docType.validationRules.map((rule, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Document Security</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5" />
            <div>
              <p>Your documents are protected with enterprise-grade security:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>All files are encrypted in transit and at rest</li>
                <li>Documents are automatically OCR-scanned for verification</li>
                <li>Only authorized personnel can access your documents</li>
                <li>Documents are automatically deleted after program completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {canProceed() ? 'All required documents uploaded' : `${getRequiredDocumentsCompleted()}/2 required documents`}
          </span>
        </div>

        <Button 
          onClick={onNext}
          disabled={!canProceed() || isUploading}
          className="min-w-32"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}