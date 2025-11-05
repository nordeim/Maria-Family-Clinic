/**
 * Secure Document Management Panel
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Manage encrypted medical documents with access controls
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Lock,
  Download,
  Eye,
  Trash2,
  Shield,
  Key,
  Clock,
  User
} from 'lucide-react';
import { SecureMedicalDocumentUpload } from './SecureMedicalDocumentUpload';

export const SecureDocumentPanel: React.FC<{
  userId?: string;
  enquiryId?: string;
}> = ({ userId, enquiryId }) => {
  const [documents] = useState([
    {
      id: '1',
      name: 'blood_test_results.pdf',
      type: 'application/pdf',
      size: '2.3 MB',
      classification: 'RESTRICTED',
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      encrypted: true,
      accessCount: 5
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Secure Document Management</span>
        </h3>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Lock className="h-3 w-3 mr-1" />
          Encrypted Storage
        </Badge>
      </div>

      {/* Upload Section */}
      <SecureMedicalDocumentUpload
        userId={userId}
        enquiryId={enquiryId}
        maxFileSize={10 * 1024 * 1024} // 10MB
        onUploadComplete={(docs) => console.log('Uploaded:', docs)}
        onUploadError={(error) => console.error('Upload error:', error)}
      />

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Secure Documents</CardTitle>
          <CardDescription>
            All medical documents are encrypted and access-controlled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-gray-600">
                      {doc.size} • {doc.classification} • {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600">
                    <Lock className="h-3 w-3 mr-1" />
                    Encrypted
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureDocumentPanel;