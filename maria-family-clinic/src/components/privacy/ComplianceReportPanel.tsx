/**
 * Compliance Report Panel
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Generate and manage compliance reports
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Shield,
  Users,
  Lock
} from 'lucide-react';

export const ComplianceReportPanel: React.FC = () => {
  const [reports, setReports] = useState([
    {
      id: '1',
      type: 'PDPA Compliance Report',
      status: 'Completed',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      complianceScore: 94,
      findings: 3,
      recommendations: 5
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Compliance Reports</span>
        </h3>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="text-lg">{report.type}</CardTitle>
              <CardDescription>
                Generated: {report.generatedAt.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{report.complianceScore}%</div>
                  <div className="text-xs text-gray-600">Compliance Score</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{report.findings}</div>
                  <div className="text-xs text-gray-600">Findings</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{report.recommendations}</div>
                  <div className="text-xs text-gray-600">Recommendations</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{report.status}</div>
                  <div className="text-xs text-gray-600">Status</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComplianceReportPanel;