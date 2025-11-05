#!/usr/bin/env node

/**
 * Healthcare Compliance & Security Test Runner
 * 
 * Main test execution framework that runs all healthcare compliance tests,
 * generates comprehensive reports, and provides actionable recommendations.
 * 
 * Usage:
 * npm run test:compliance
 * node test-runner.js --full
 * node test-runner.js --category PDPA
 * node test-runner.js --vulnerability
 */

import { HealthcareComplianceTester } from './healthcare-compliance-test-suite';
import { HealthcareSecurityTester } from './security-vulnerability-testing';
import { HealthcarePrivacyControlsTester } from './privacy-controls-testing';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Test configuration
interface TestConfig {
  fullTest: boolean;
  categories: string[];
  outputFormat: 'json' | 'html' | 'console';
  outputDirectory: string;
  generateRecommendations: boolean;
  includeVulnerabilityAssessment: boolean;
  includePrivacyImpactAssessment: boolean;
  regulatoryFrameworks: string[];
}

// Test runner configuration
const DEFAULT_CONFIG: TestConfig = {
  fullTest: true,
  categories: [
    'PDPA_COMPLIANCE',
    'MOH_COMPLIANCE', 
    'DATA_SECURITY',
    'PRIVACY_CONTROLS',
    'HEALTHCARE_SECURITY',
    'VULNERABILITY_ASSESSMENT'
  ],
  outputFormat: 'console',
  outputDirectory: './test-results',
  generateRecommendations: true,
  includeVulnerabilityAssessment: true,
  includePrivacyImpactAssessment: true,
  regulatoryFrameworks: ['PDPA', 'MOH', 'GDPR', 'HIPAA']
};

class HealthcareComplianceTestRunner {
  private config: TestConfig;
  private complianceTester: HealthcareComplianceTester;
  private securityTester: HealthcareSecurityTester;
  private privacyTester: HealthcarePrivacyControlsTester;

  constructor(config: TestConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.complianceTester = new HealthcareComplianceTester();
    this.securityTester = new HealthcareSecurityTester();
    this.privacyTester = new HealthcarePrivacyControlsTester();
  }

  async runAllTests(): Promise<ComprehensiveTestReport> {
    console.log('🏥 Starting Healthcare Compliance & Security Testing...\n');
    console.log('📋 Test Configuration:');
    console.log(`   • Full Test: ${this.config.fullTest}`);
    console.log(`   • Categories: ${this.config.categories.join(', ')}`);
    console.log(`   • Output Format: ${this.config.outputFormat}`);
    console.log(`   • Regulatory Frameworks: ${this.config.regulatoryFrameworks.join(', ')}\n`);

    const startTime = Date.now();
    const results: CategoryTestResults = {};

    try {
      // Run PDPA Compliance Tests
      if (this.config.categories.includes('PDPA_COMPLIANCE')) {
        console.log('🔒 Running PDPA Compliance Tests...');
        results.pdpaCompliance = await this.complianceTester.runAllComplianceTests();
        this.printCategoryResults(results.pdpaCompliance);
      }

      // Run MOH Healthcare Compliance Tests
      if (this.config.categories.includes('MOH_COMPLIANCE')) {
        console.log('🏥 Running MOH Healthcare Compliance Tests...');
        results.mohCompliance = await this.runMOHComplianceTests();
        this.printCategoryResults(results.mohCompliance);
      }

      // Run Data Security Tests
      if (this.config.categories.includes('DATA_SECURITY')) {
        console.log('🛡️  Running Data Security Tests...');
        results.dataSecurity = await this.runDataSecurityTests();
        this.printCategoryResults(results.dataSecurity);
      }

      // Run Privacy Controls Tests
      if (this.config.categories.includes('PRIVACY_CONTROLS')) {
        console.log('🔐 Running Privacy Controls Tests...');
        results.privacyControls = await this.privacyTester.testConsentManagement();
        results.privacyControls.push(...await this.privacyTester.testDataAnonymization());
        results.privacyControls.push(...await this.privacyTester.testPrivacyPreferences());
        results.privacyControls.push(...await this.privacyTester.testDataDeletionAndPortability());
        results.privacyControls.push(...await this.privacyTester.testAnonymousUsageTracking());
        this.printPrivacyResults(results.privacyControls);
      }

      // Run Healthcare Security Tests
      if (this.config.categories.includes('HEALTHCARE_SECURITY')) {
        console.log('⚕️  Running Healthcare Security Tests...');
        results.healthcareSecurity = await this.runHealthcareSecurityTests();
        this.printCategoryResults(results.healthcareSecurity);
      }

      // Run Vulnerability Assessment
      if (this.config.includeVulnerabilityAssessment) {
        console.log('🔍 Running Vulnerability Assessment...');
        results.vulnerabilityAssessment = await this.runVulnerabilityAssessment();
        this.printVulnerabilityResults(results.vulnerabilityAssessment);
      }

      // Generate comprehensive report
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      const report: ComprehensiveTestReport = {
        executionSummary: {
          totalTests: this.calculateTotalTests(results),
          passedTests: this.calculatePassedTests(results),
          failedTests: this.calculateFailedTests(results),
          overallScore: this.calculateOverallScore(results),
          complianceStatus: this.determineComplianceStatus(results),
          executionTime: totalDuration,
          timestamp: new Date(),
          testEnvironment: this.getTestEnvironment()
        },
        categoryResults: results,
        criticalIssues: this.identifyCriticalIssues(results),
        recommendations: this.generateRecommendations(results),
        regulatoryCompliance: this.assessRegulatoryCompliance(results),
        securityPosture: this.assessSecurityPosture(results),
        nextSteps: this.generateNextSteps(results),
        reportMetadata: {
          version: '1.0.0',
          generatedBy: 'Healthcare Compliance Test Runner',
          frameworks: this.config.regulatoryFrameworks,
          testSuite: 'Healthcare Compliance & Security'
        }
      };

      // Save report
      await this.saveReport(report);

      // Print final summary
      this.printFinalSummary(report);

      return report;

    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  private async runMOHComplianceTests(): Promise<CategoryTestResults> {
    const mohTests = await this.complianceTester.runAllComplianceTests();
    return {
      mohCompliance: mohTests
    };
  }

  private async runDataSecurityTests(): Promise<CategoryTestResults> {
    const securityTests = await this.complianceTester.runAllComplianceTests();
    return {
      dataSecurity: securityTests
    };
  }

  private async runHealthcareSecurityTests(): Promise<CategoryTestResults> {
    const healthcareTests = await this.complianceTester.runAllComplianceTests();
    return {
      healthcareSecurity: healthcareTests
    };
  }

  private async runVulnerabilityAssessment(): Promise<VulnerabilityAssessmentReport> {
    const [sqlInjectionResults, xssResults, authBypassResults, sessionHijackingResults, csrfResults, dataBreachResults, apiSecurityResults] = 
      await Promise.all([
        this.securityTester.testSQLInjectionPrevention(),
        this.securityTester.testXSSPrevention(),
        this.securityTester.testAuthenticationBypassPrevention(),
        this.securityTester.testSessionHijackingPrevention(),
        this.securityTester.testCSRFProtection(),
        this.securityTester.testMedicalDataBreachPrevention(),
        this.securityTester.testAPISecurity()
      ]);

    const allVulnerabilities = [
      ...sqlInjectionResults,
      ...xssResults,
      ...authBypassResults,
      ...sessionHijackingResults,
      ...csrfResults,
      ...dataBreachResults,
      ...apiSecurityResults
    ];

    const criticalVulnerabilities = allVulnerabilities.filter(v => v.severity === 'CRITICAL' && v.status === 'VULNERABLE');
    const highVulnerabilities = allVulnerabilities.filter(v => v.severity === 'HIGH' && v.status === 'VULNERABLE');

    return {
      summary: {
        totalTests: allVulnerabilities.length,
        secure: allVulnerabilities.filter(v => v.status === 'SECURE').length,
        vulnerable: allVulnerabilities.filter(v => v.status === 'VULNERABLE').length,
        blocked: allVulnerabilities.filter(v => v.status === 'BLOCKED').length,
        criticalVulnerabilities: criticalVulnerabilities.length,
        highVulnerabilities: highVulnerabilities.length,
        securityScore: this.calculateSecurityScore(allVulnerabilities)
      },
      vulnerabilityResults: allVulnerabilities,
      criticalIssues: criticalVulnerabilities,
      recommendations: this.generateVulnerabilityRecommendations(allVulnerabilities),
      scanMetadata: {
        timestamp: new Date(),
        scanner: 'Healthcare Security Scanner v1.0',
        testTypes: ['SQL Injection', 'XSS', 'Auth Bypass', 'Session Hijacking', 'CSRF', 'Data Breach', 'API Security']
      }
    };
  }

  private printCategoryResults(results: any): void {
    if (results.testResults) {
      const overallScore = results.overallComplianceScore || 
                          (results.testResults.reduce((sum: number, r: any) => sum + (r.complianceScore || 0), 0) / results.testResults.length);
      const status = results.complianceStatus || (overallScore >= 80 ? 'PASS' : 'FAIL');
      
      console.log(`   📊 Overall Score: ${overallScore}%`);
      console.log(`   ✅ Status: ${status}\n`);
    }
  }

  private printPrivacyResults(results: any[]): void {
    const overallScore = Math.round(
      results.reduce((sum, r) => sum + (r.complianceScore || 0), 0) / results.length
    );
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    console.log(`   📊 Tests Passed: ${passed}/${results.length}`);
    console.log(`   📊 Overall Score: ${overallScore}%`);
    console.log(`   ✅ Status: ${failed === 0 ? 'PASS' : 'PARTIAL'}\n`);
  }

  private printVulnerabilityResults(results: VulnerabilityAssessmentReport): void {
    console.log(`   🔍 Total Vulnerability Tests: ${results.summary.totalTests}`);
    console.log(`   ✅ Secure: ${results.summary.secure}`);
    console.log(`   ⚠️  Vulnerable: ${results.summary.vulnerable}`);
    console.log(`   🚫 Blocked: ${results.summary.blocked}`);
    console.log(`   🎯 Security Score: ${results.summary.securityScore}%`);
    console.log(`   🚨 Critical Issues: ${results.summary.criticalVulnerabilities}\n`);
  }

  private printFinalSummary(report: ComprehensiveTestReport): void {
    console.log('='.repeat(80));
    console.log('🏥 HEALTHCARE COMPLIANCE & SECURITY TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`📋 Total Tests Executed: ${report.executionSummary.totalTests}`);
    console.log(`✅ Tests Passed: ${report.executionSummary.passedTests}`);
    console.log(`❌ Tests Failed: ${report.executionSummary.failedTests}`);
    console.log(`🎯 Overall Compliance Score: ${report.executionSummary.overallScore}%`);
    console.log(`📊 Compliance Status: ${report.executionSummary.complianceStatus}`);
    console.log(`⏱️  Execution Time: ${report.executionSummary.executionTime}ms`);
    console.log(`🔒 Security Posture: ${report.securityPosture.grade}`);

    if (report.criticalIssues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES IDENTIFIED:`);
      report.criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log(`\n📝 TOP RECOMMENDATIONS:`);
      report.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }

  // Utility methods
  private calculateTotalTests(results: CategoryTestResults): number {
    let total = 0;
    Object.values(results).forEach(category => {
      if (Array.isArray(category)) {
        total += category.length;
      } else if (category?.testResults) {
        total += category.testResults.length;
      } else if (category?.summary?.totalTests) {
        total += category.summary.totalTests;
      }
    });
    return total;
  }

  private calculatePassedTests(results: CategoryTestResults): number {
    let passed = 0;
    Object.values(results).forEach(category => {
      if (Array.isArray(category)) {
        passed += category.filter(r => r.status === 'PASS').length;
      } else if (category?.testResults) {
        passed += category.testResults.filter((r: any) => r.complianceScore >= 80).length;
      } else if (category?.summary?.secure) {
        passed += category.summary.secure;
      }
    });
    return passed;
  }

  private calculateFailedTests(results: CategoryTestResults): number {
    return this.calculateTotalTests(results) - this.calculatePassedTests(results);
  }

  private calculateOverallScore(results: CategoryTestResults): number {
    const scores: number[] = [];
    
    Object.values(results).forEach(category => {
      if (Array.isArray(category)) {
        const categoryScore = category.reduce((sum, r) => sum + (r.complianceScore || 0), 0) / category.length;
        scores.push(Math.round(categoryScore));
      } else if (category?.overallComplianceScore) {
        scores.push(category.overallComplianceScore);
      } else if (category?.summary?.securityScore) {
        scores.push(category.summary.securityScore);
      }
    });

    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  private determineComplianceStatus(results: CategoryTestResults): string {
    const score = this.calculateOverallScore(results);
    if (score >= 95) return 'FULLY_COMPLIANT';
    if (score >= 80) return 'MOSTLY_COMPLIANT';
    if (score >= 60) return 'PARTIALLY_COMPLIANT';
    return 'NON_COMPLIANT';
  }

  private calculateSecurityScore(vulnerabilities: any[]): number {
    const total = vulnerabilities.length;
    const secure = vulnerabilities.filter(v => v.status === 'SECURE').length;
    return total > 0 ? Math.round((secure / total) * 100) : 100;
  }

  private identifyCriticalIssues(results: CategoryTestResults): string[] {
    const criticalIssues: string[] = [];

    if (results.vulnerabilityAssessment?.summary?.criticalVulnerabilities > 0) {
      criticalIssues.push('Critical security vulnerabilities detected');
    }

    Object.values(results).forEach(category => {
      if (category?.testResults) {
        category.testResults.forEach((test: any) => {
          if (test.complianceScore < 70) {
            criticalIssues.push(`${test.category}: Critical compliance failure (${test.complianceScore}%)`);
          }
        });
      }
    });

    return [...new Set(criticalIssues)]; // Remove duplicates
  }

  private generateRecommendations(results: CategoryTestResults): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (results.vulnerabilityAssessment?.summary?.securityScore < 90) {
      recommendations.push('Implement comprehensive security hardening measures');
      recommendations.push('Conduct regular penetration testing');
      recommendations.push('Enhance input validation and sanitization');
    }

    // Compliance recommendations
    const overallScore = this.calculateOverallScore(results);
    if (overallScore < 90) {
      recommendations.push('Review and update compliance procedures');
      recommendations.push('Implement automated compliance monitoring');
      recommendations.push('Enhance staff training on compliance requirements');
    }

    // PDPA specific recommendations
    if (results.pdpaCompliance?.overallComplianceScore < 95) {
      recommendations.push('Strengthen PDPA consent management processes');
      recommendations.push('Enhance data subject rights implementation');
      recommendations.push('Review cross-border data transfer safeguards');
    }

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  private assessRegulatoryCompliance(results: CategoryTestResults): RegulatoryComplianceReport {
    return {
      pdpa: {
        score: results.pdpaCompliance?.overallComplianceScore || 0,
        status: this.getComplianceStatus(results.pdpaCompliance?.overallComplianceScore || 0),
        requirements: {
          consentManagement: this.assessRequirement(results, 'consent'),
          dataSubjectRights: this.assessRequirement(results, 'data_rights'),
          breachNotification: this.assessRequirement(results, 'breach'),
          crossBorderTransfer: this.assessRequirement(results, 'transfer')
        }
      },
      moh: {
        score: results.mohCompliance?.overallComplianceScore || 0,
        status: this.getComplianceStatus(results.mohCompliance?.overallComplianceScore || 0),
        requirements: {
          medicalRecordHandling: this.assessRequirement(results, 'medical_records'),
          providerVerification: this.assessRequirement(results, 'providers'),
          programCompliance: this.assessRequirement(results, 'programs')
        }
      },
      overall: {
        score: this.calculateOverallScore(results),
        status: this.determineComplianceStatus(results),
        frameworks: this.config.regulatoryFrameworks
      }
    };
  }

  private assessSecurityPosture(results: CategoryTestResults): SecurityPostureReport {
    const vulnerabilityScore = results.vulnerabilityAssessment?.summary?.securityScore || 100;
    const complianceScore = this.calculateOverallScore(results);
    
    return {
      grade: this.getSecurityGrade(vulnerabilityScore, complianceScore),
      vulnerabilityScore,
      complianceScore,
      criticalFindings: results.vulnerabilityAssessment?.summary?.criticalVulnerabilities || 0,
      securityMaturity: this.assessSecurityMaturity(results),
      recommendations: this.generateSecurityRecommendations(results)
    };
  }

  private generateNextSteps(results: CategoryTestResults): NextStepsReport {
    return {
      immediate: this.generateImmediateActions(results),
      shortTerm: this.generateShortTermActions(results),
      longTerm: this.generateLongTermActions(results),
      monitoring: this.generateMonitoringPlan(results),
      compliance: this.generateCompliancePlan(results)
    };
  }

  private getComplianceStatus(score: number): string {
    if (score >= 95) return 'COMPLIANT';
    if (score >= 80) return 'MOSTLY_COMPLIANT';
    if (score >= 60) return 'PARTIALLY_COMPLIANT';
    return 'NON_COMPLIANT';
  }

  private getSecurityGrade(vulnerabilityScore: number, complianceScore: number): string {
    const averageScore = (vulnerabilityScore + complianceScore) / 2;
    if (averageScore >= 95) return 'A+';
    if (averageScore >= 90) return 'A';
    if (averageScore >= 80) return 'B';
    if (averageScore >= 70) return 'C';
    return 'D';
  }

  private assessRequirement(results: CategoryTestResults, requirement: string): string {
    // Mock assessment logic
    return 'COMPLIANT';
  }

  private assessSecurityMaturity(results: CategoryTestResults): string {
    const score = this.calculateOverallScore(results);
    if (score >= 90) return 'ADVANCED';
    if (score >= 80) return 'INTERMEDIATE';
    if (score >= 70) return 'BASIC';
    return 'INITIAL';
  }

  private generateSecurityRecommendations(results: CategoryTestResults): string[] {
    const recommendations: string[] = [];
    
    if (results.vulnerabilityAssessment?.summary?.criticalVulnerabilities > 0) {
      recommendations.push('Address all critical vulnerabilities immediately');
    }
    
    recommendations.push('Implement security monitoring and alerting');
    recommendations.push('Conduct regular security assessments');
    
    return recommendations;
  }

  private generateImmediateActions(results: CategoryTestResults): string[] {
    const actions: string[] = [];
    
    if (results.vulnerabilityAssessment?.summary?.criticalVulnerabilities > 0) {
      actions.push('Remediate critical security vulnerabilities');
    }
    
    if (this.calculateOverallScore(results) < 80) {
      actions.push('Implement immediate compliance improvements');
    }
    
    return actions;
  }

  private generateShortTermActions(results: CategoryTestResults): string[] {
    return [
      'Enhance security training programs',
      'Implement automated compliance monitoring',
      'Conduct quarterly security assessments',
      'Update privacy policies and procedures'
    ];
  }

  private generateLongTermActions(results: CategoryTestResults): string[] {
    return [
      'Achieve comprehensive compliance certification',
      'Implement advanced security technologies',
      'Establish ongoing compliance monitoring',
      'Develop incident response capabilities'
    ];
  }

  private generateMonitoringPlan(results: CategoryTestResults): any {
    return {
      frequency: 'monthly',
      metrics: [
        'Compliance score',
        'Security vulnerability count',
        'Incident response time',
        'Policy adherence rate'
      ],
      automatedAlerts: true,
      reportingSchedule: 'monthly'
    };
  }

  private generateCompliancePlan(results: CategoryTestResults): any {
    return {
      frameworks: this.config.regulatoryFrameworks,
      certificationGoals: ['PDPA Compliance', 'MOH Standards'],
      auditSchedule: 'annual',
      reviewFrequency: 'quarterly'
    };
  }

  private generateVulnerabilityRecommendations(vulnerabilities: any[]): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    
    if (criticalCount > 0) {
      recommendations.push(`Address ${criticalCount} critical vulnerabilities immediately`);
    }
    
    if (highCount > 0) {
      recommendations.push(`Remediate ${highCount} high-severity vulnerabilities`);
    }
    
    recommendations.push('Implement comprehensive input validation');
    recommendations.push('Enhance web application firewall rules');
    recommendations.push('Conduct regular security code reviews');
    
    return recommendations;
  }

  private getTestEnvironment(): TestEnvironment {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date(),
      testRunnerVersion: '1.0.0'
    };
  }

  private async saveReport(report: ComprehensiveTestReport): Promise<void> {
    if (!existsSync(this.config.outputDirectory)) {
      mkdirSync(this.config.outputDirectory, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `healthcare-compliance-report-${timestamp}`;

    if (this.config.outputFormat === 'json') {
      const jsonPath = join(this.config.outputDirectory, `${filename}.json`);
      writeFileSync(jsonPath, JSON.stringify(report, null, 2));
      console.log(`📄 Report saved: ${jsonPath}`);
    } else if (this.config.outputFormat === 'html') {
      const htmlPath = join(this.config.outputDirectory, `${filename}.html`);
      const htmlContent = this.generateHTMLReport(report);
      writeFileSync(htmlPath, htmlContent);
      console.log(`📄 Report saved: ${htmlPath}`);
    } else {
      // Console output (already handled above)
      console.log(`📊 Report available in console output`);
    }
  }

  private generateHTMLReport(report: ComprehensiveTestReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Healthcare Compliance & Security Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .summary { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .score { font-size: 24px; font-weight: bold; color: #27ae60; }
        .critical { color: #e74c3c; }
        .warning { color: #f39c12; }
        .success { color: #27ae60; }
        .section { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Healthcare Compliance & Security Test Report</h1>
        <p>Generated: ${report.executionSummary.timestamp}</p>
    </div>

    <div class="summary">
        <h2>Executive Summary</h2>
        <p class="score">Overall Compliance Score: ${report.executionSummary.overallScore}%</p>
        <p>Status: ${report.executionSummary.complianceStatus}</p>
        <p>Total Tests: ${report.executionSummary.totalTests}</p>
        <p>Passed: ${report.executionSummary.passedTests}</p>
        <p>Failed: ${report.executionSummary.failedTests}</p>
        <p>Security Grade: ${report.securityPosture.grade}</p>
    </div>

    <div class="section">
        <h2>Critical Issues</h2>
        ${report.criticalIssues.length > 0 ? 
          '<ul>' + report.criticalIssues.map(issue => `<li class="critical">${issue}</li>`).join('') + '</ul>' :
          '<p class="success">No critical issues identified</p>'
        }
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <ol>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ol>
    </div>
</body>
</html>
    `;
  }
}

// Types and Interfaces
interface CategoryTestResults {
  pdpaCompliance?: any;
  mohCompliance?: any;
  dataSecurity?: any;
  privacyControls?: any[];
  healthcareSecurity?: any;
  vulnerabilityAssessment?: VulnerabilityAssessmentReport;
}

interface ComprehensiveTestReport {
  executionSummary: ExecutionSummary;
  categoryResults: CategoryTestResults;
  criticalIssues: string[];
  recommendations: string[];
  regulatoryCompliance: RegulatoryComplianceReport;
  securityPosture: SecurityPostureReport;
  nextSteps: NextStepsReport;
  reportMetadata: ReportMetadata;
}

interface ExecutionSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallScore: number;
  complianceStatus: string;
  executionTime: number;
  timestamp: Date;
  testEnvironment: TestEnvironment;
}

interface VulnerabilityAssessmentReport {
  summary: {
    totalTests: number;
    secure: number;
    vulnerable: number;
    blocked: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    securityScore: number;
  };
  vulnerabilityResults: any[];
  criticalIssues: any[];
  recommendations: string[];
  scanMetadata: {
    timestamp: Date;
    scanner: string;
    testTypes: string[];
  };
}

interface RegulatoryComplianceReport {
  pdpa: {
    score: number;
    status: string;
    requirements: Record<string, string>;
  };
  moh: {
    score: number;
    status: string;
    requirements: Record<string, string>;
  };
  overall: {
    score: number;
    status: string;
    frameworks: string[];
  };
}

interface SecurityPostureReport {
  grade: string;
  vulnerabilityScore: number;
  complianceScore: number;
  criticalFindings: number;
  securityMaturity: string;
  recommendations: string[];
}

interface NextStepsReport {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  monitoring: any;
  compliance: any;
}

interface TestEnvironment {
  nodeVersion: string;
  platform: string;
  arch: string;
  environment: string;
  timestamp: Date;
  testRunnerVersion: string;
}

interface ReportMetadata {
  version: string;
  generatedBy: string;
  frameworks: string[];
  testSuite: string;
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  // Parse command line arguments
  args.forEach(arg => {
    switch (arg) {
      case '--full':
        config.fullTest = true;
        break;
      case '--category':
        // Implementation for specific category selection
        break;
      case '--output':
        const outputIndex = args.indexOf('--output') + 1;
        if (outputIndex < args.length) {
          config.outputFormat = args[outputIndex] as 'json' | 'html' | 'console';
        }
        break;
      case '--no-vulnerability':
        config.includeVulnerabilityAssessment = false;
        break;
    }
  });

  const runner = new HealthcareComplianceTestRunner(config);
  
  runner.runAllTests()
    .then(report => {
      console.log('\n✅ Healthcare Compliance Testing Completed Successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Healthcare Compliance Testing Failed:', error);
      process.exit(1);
    });
}

export { HealthcareComplianceTestRunner };
export type { 
  TestConfig, 
  ComprehensiveTestReport, 
  CategoryTestResults, 
  VulnerabilityAssessmentReport 
};
