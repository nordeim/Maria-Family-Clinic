/**
 * Audit Log Viewer Component
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * View and search audit logs for compliance monitoring
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Eye,
  Search,
  Filter,
  Download,
  Shield,
  Lock,
  User,
  Database
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs] = useState([
    {
      id: '1',
      timestamp: new Date(),
      user: 'Dr. Smith',
      action: 'VIEW_PATIENT_RECORD',
      resource: 'Patient Health Record #123',
      ipAddress: '192.168.1.100',
      status: 'SUCCESS',
      classification: 'RESTRICTED'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Audit Log Viewer</span>
        </h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Activity</CardTitle>
          <CardDescription>
            All access and modification events for health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-gray-600">{log.resource}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600">
                    {log.status}
                  </Badge>
                  <Badge variant="outline" className="text-red-600">
                    {log.classification}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogViewer;