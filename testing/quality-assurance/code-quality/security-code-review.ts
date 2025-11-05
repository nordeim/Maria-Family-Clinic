import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface SecurityIssue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  file: string;
  line: number;
  description: string;
  recommendation: string;
  cweId?: string;
  owaspCategory?: string;
}

interface SecurityScanResult {
  overallScore: number;
  issues: SecurityIssue[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  passed: boolean;
  summary: string;
}

export class SecurityCodeReview {
  private readonly securityRules = {
    maxCriticalIssues: 0,
    maxHighIssues: 2,
    maxMediumIssues: 10,
    maxLowIssues: 20
  };

  private readonly securityPatterns = {
    // Hardcoded secrets
    apiKeys: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
    passwords: /password\s*[:=]\s*['"][^'"]+['"]/i,
    secrets: /secret\s*[:=]\s*['"][^'"]+['"]/i,
    tokens: /token\s*[:=]\s*['"][^'"]+['"]/i,
    privateKeys: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    
    // SQL Injection vulnerabilities
    sqlInjection: /(SELECT|INSERT|UPDATE|DELETE).*\+\s*['"][^'"]*['"]/i,
    templateInjection: /template.*\+.*user/i,
    
    // XSS vulnerabilities
    innerHTML: /\.innerHTML\s*=/,
    outerHTML: /\.outerHTML\s*=/,
    dangerouslySetInnerHTML: /dangerouslySetInnerHTML/,
    
    // CSRF vulnerabilities
    noCSRFProtection: /no-csrf-protection/i,
    missingToken: /missing.*csrf.*token/i,
    
    // Access control issues
    missingAuth: /missing.*authentication/i,
    improperAuth: /improper.*authorization/i,
    
    // Healthcare specific security issues
    unencryptedPHI: /phi.*unencrypted/i,
    missingAuditLog: /missing.*audit.*log/i,
    improperAccessLog: /improper.*access.*log/i,
    
    // Data validation
    noInputValidation: /no.*input.*validation/i,
    missingSanitization: /missing.*sanitization/i,
    
    // Secure communication
    httpInsteadOfHttps: /https?:\/\/[^\/]*http:/i,
    missingHSTS: /missing.*hsts/i,
    insecureCipher: /insecure.*cipher/i
  };

  private readonly healthcareSecurityPatterns = {
    // PDPA compliance
    unencryptedPatientData: /patient.*data.*unencrypted/i,
    missingConsent: /missing.*patient.*consent/i,
    improperDataRetention: /improper.*data.*retention/i,
    
    // Medical data security
    hardcodedMedicalRecords: /medical.*records.*hardcoded/i,
    unencryptedMedicalHistory: /medical.*history.*unencrypted/i,
    
    // Emergency system security
    emergencyContactExposure: /emergency.*contact.*exposed/i,
    missingEmergencyEncryption: /emergency.*missing.*encryption/i,
    
    // Healthcare compliance
    missingMOHCompliance: /missing.*moh.*compliance/i,
    improperDataAccessLog: /improper.*healthcare.*access.*log/i
  };

  async performSecurityScan(): Promise<SecurityScanResult> {
    const issues: SecurityIssue[] = [];

    try {
      // Static code analysis
      const staticAnalysisIssues = await this.runStaticAnalysis();
      issues.push(...staticAnalysisIssues);

      // Dependency security scan
      const dependencyIssues = await this.runDependencyScan();
      issues.push(...dependencyIssues);

      // Secret scanning
      const secretIssues = await this.scanForSecrets();
      issues.push(...secretIssues);

      // Healthcare-specific security scan
      const healthcareIssues = await this.scanHealthcareSecurity();
      issues.push(...healthcareIssues);

      // Configuration security scan
      const configIssues = await this.scanConfigurationSecurity();
      issues.push(...configIssues);

      // Generate results
      const result = this.generateSecurityResults(issues);
      return result;

    } catch (error) {
      throw new Error(`Security scan failed: ${error.message}`);
    }
  }

  private async runStaticAnalysis(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // Run ESLint with security rules
      const { stdout } = await execAsync('npx eslint src/ --ext .ts,.tsx --format=json --quiet');
      const results = JSON.parse(stdout);

      results.forEach((file: any) => {
        file.messages.forEach((message: any) => {
          if (this.isSecurityIssue(message)) {
            issues.push({
              id: `eslint-${message.ruleId}`,
              severity: this.mapESLintSeverity(message.severity),
              type: 'Static Analysis',
              file: file.filePath,
              line: message.line,
              description: message.message,
              recommendation: this.getRecommendationForRule(message.ruleId),
              cweId: this.mapToCWE(message.ruleId),
              owaspCategory: this.mapToOWASP(message.ruleId)
            });
          }
        });
      });

    } catch (error) {
      // ESLint might fail, continue with other scans
      console.warn('Static analysis failed:', error.message);
    }

    return issues;
  }

  private async runDependencyScan(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // Run npm audit
      const { stdout } = await execAsync('npm audit --json');
      const auditResult = JSON.parse(stdout);

      if (auditResult.vulnerabilities) {
        Object.entries(auditResult.vulnerabilities).forEach(([packageName, vuln]: [string, any]) => {
          const severity = this.mapNpmSeverity(vuln.severity);
          if (severity !== 'LOW') {
            issues.push({
              id: `npm-${packageName}`,
              severity,
              type: 'Dependency Vulnerability',
              file: 'package.json',
              line: 0,
              description: `${packageName}: ${vuln.title}`,
              recommendation: `Update ${packageName} to version ${vuln.fixAvailable}`,
              cweId: vuln.cwe ? Object.keys(vuln.cwe)[0] : undefined
            });
          }
        });
      }

      // Run Snyk scan if available
      try {
        const { stdout: snykOutput } = await execAsync('npx snyk test --json');
        const snykResult = JSON.parse(snykOutput);

        if (snykResult.vulnerabilities) {
          snykResult.vulnerabilities.forEach((vuln: any) => {
            issues.push({
              id: `snyk-${vuln.id}`,
              severity: this.mapSnykSeverity(vuln.severity),
              type: 'Snyk Vulnerability Scan',
              file: 'dependency',
              line: 0,
              description: vuln.title,
              recommendation: vuln.fixInformation || 'Update to latest secure version'
            });
          });
        }
      } catch (snykError) {
        // Snyk scan failed, continue without it
        console.warn('Snyk scan failed:', snykError.message);
      }

    } catch (error) {
      console.warn('Dependency scan failed:', error.message);
    }

    return issues;
  }

  private async scanForSecrets(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const srcFiles = await this.getAllSourceFiles('src/');

    for (const file of srcFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for hardcoded API keys
          if (this.securityPatterns.apiKeys.test(line)) {
            issues.push({
              id: `secret-${file}-${index}`,
              severity: 'CRITICAL',
              type: 'Hardcoded API Key',
              file,
              line: index + 1,
              description: 'Potential hardcoded API key detected',
              recommendation: 'Move API keys to environment variables or secure configuration',
              cweId: 'CWE-798',
              owaspCategory: 'A02:2021'
            });
          }

          // Check for hardcoded passwords
          if (this.securityPatterns.passwords.test(line)) {
            issues.push({
              id: `secret-${file}-${index}`,
              severity: 'CRITICAL',
              type: 'Hardcoded Password',
              file,
              line: index + 1,
              description: 'Potential hardcoded password detected',
              recommendation: 'Use environment variables or secure password storage',
              cweId: 'CWE-798',
              owaspCategory: 'A02:2021'
            });
          }

          // Check for private keys
          if (this.securityPatterns.privateKeys.test(line)) {
            issues.push({
              id: `secret-${file}-${index}`,
              severity: 'CRITICAL',
              type: 'Private Key Exposure',
              file,
              line: index + 1,
              description: 'Private key detected in source code',
              recommendation: 'Remove private keys from source code and use secure key management',
              cweId: 'CWE-798',
              owaspCategory: 'A02:2021'
            });
          }
        });

      } catch (error) {
        console.warn(`Failed to scan file ${file}:`, error.message);
      }
    }

    return issues;
  }

  private async scanHealthcareSecurity(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const srcFiles = await this.getAllSourceFiles('src/');

    for (const file of srcFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');

        // Check for unencrypted PHI
        if (this.healthcareSecurityPatterns.unencryptedPatientData.test(content)) {
          issues.push({
            id: `healthcare-${file}-phi`,
            severity: 'CRITICAL',
            type: 'Unencrypted PHI',
            file,
            line: this.findLineNumber(content, this.healthcareSecurityPatterns.unencryptedPatientData),
            description: 'Patient health information may be stored unencrypted',
            recommendation: 'Implement encryption for all patient health information',
            cweId: 'CWE-311',
            owaspCategory: 'A02:2021'
          });
        }

        // Check for missing consent
        if (this.healthcareSecurityPatterns.missingConsent.test(content)) {
          issues.push({
            id: `healthcare-${file}-consent`,
            severity: 'HIGH',
            type: 'Missing Patient Consent',
            file,
            line: this.findLineNumber(content, this.healthcareSecurityPatterns.missingConsent),
            description: 'Patient consent validation may be missing',
            recommendation: 'Implement proper patient consent management and logging',
            cweId: 'CWE-862'
          });
        }

        // Check for improper data retention
        if (this.healthcareSecurityPatterns.improperDataRetention.test(content)) {
          issues.push({
            id: `healthcare-${file}-retention`,
            severity: 'HIGH',
            type: 'Improper Data Retention',
            file,
            line: this.findLineNumber(content, this.healthcareSecurityPatterns.improperDataRetention),
            description: 'Data retention policy may not comply with healthcare regulations',
            recommendation: 'Implement proper data retention and deletion policies',
            cweId: 'CWE-404'
          });
        }

      } catch (error) {
        console.warn(`Failed to scan healthcare security in file ${file}:`, error.message);
      }
    }

    return issues;
  }

  private async scanConfigurationSecurity(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    // Check for HTTP instead of HTTPS
    const configFiles = [
      'next.config.ts',
      'package.json',
      '.env.example',
      'nginx.conf'
    ];

    for (const configFile of configFiles) {
      try {
        const filePath = path.join(process.cwd(), configFile);
        const content = await fs.readFile(filePath, 'utf8');

        if (this.securityPatterns.httpInsteadOfHttps.test(content)) {
          issues.push({
            id: `config-${configFile}-https`,
            severity: 'HIGH',
            type: 'Insecure HTTP Configuration',
            file: configFile,
            line: this.findLineNumber(content, this.securityPatterns.httpInsteadOfHttps),
            description: 'HTTP configuration detected, should use HTTPS',
            recommendation: 'Configure HTTPS for all communications',
            cweId: 'CWE-319'
          });
        }

      } catch (error) {
        // File doesn't exist, continue
        continue;
      }
    }

    return issues;
  }

  private generateSecurityResults(issues: SecurityIssue[]): SecurityScanResult {
    const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
    const highCount = issues.filter(i => i.severity === 'HIGH').length;
    const mediumCount = issues.filter(i => i.severity === 'MEDIUM').length;
    const lowCount = issues.filter(i => i.severity === 'LOW').length;

    // Calculate overall security score (0-100)
    const score = Math.max(0, 100 - (criticalCount * 25 + highCount * 15 + mediumCount * 5 + lowCount * 1));

    const passed = 
      criticalCount <= this.securityRules.maxCriticalIssues &&
      highCount <= this.securityRules.maxHighIssues &&
      mediumCount <= this.securityRules.maxMediumIssues &&
      lowCount <= this.securityRules.maxLowIssues;

    const summary = `Security scan completed. Found ${criticalCount} critical, ${highCount} high, ${mediumCount} medium, and ${lowCount} low severity issues.`;

    return {
      overallScore: score,
      issues: issues.sort((a, b) => {
        const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      passed,
      summary
    };
  }

  // Helper methods
  private async getAllSourceFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.getAllSourceFiles(fullPath));
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private isSecurityIssue(message: any): boolean {
    const securityRules = [
      'no-eval',
      'no-implied-eval',
      'no-script-url',
      'no-new-func',
      'security/detect-object-injection',
      'security/detect-non-literal-regexp',
      'security/detect-unsafe-regex',
      'security/detect-buffer-noassert',
      'security/detect-child-process',
      'security/detect-non-literal-fs-filename',
      'security/detect-non-literal-require',
      'security/detect-possible-timing-attacks',
      'security/detect-pseudoRandomBytes'
    ];

    return securityRules.includes(message.ruleId) || 
           message.message.includes('security') ||
           message.message.includes('vulnerability');
  }

  private mapESLintSeverity(severity: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (severity) {
      case 2: return 'HIGH';
      case 1: return 'MEDIUM';
      default: return 'LOW';
    }
  }

  private mapNpmSeverity(severity: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (severity) {
      case 'critical': return 'CRITICAL';
      case 'high': return 'HIGH';
      case 'moderate': return 'MEDIUM';
      default: return 'LOW';
    }
  }

  private mapSnykSeverity(severity: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'CRITICAL';
      case 'high': return 'HIGH';
      case 'medium': return 'MEDIUM';
      default: return 'LOW';
    }
  }

  private mapToCWE(ruleId: string): string | undefined {
    const cweMappings: { [key: string]: string } = {
      'no-eval': 'CWE-95',
      'no-implied-eval': 'CWE-95',
      'security/detect-object-injection': 'CWE-94',
      'security/detect-unsafe-regex': 'CWE-1333',
      'security/detect-child-process': 'CWE-78'
    };

    return cweMappings[ruleId];
  }

  private mapToOWASP(ruleId: string): string | undefined {
    const owaspMappings: { [key: string]: string } = {
      'security/detect-object-injection': 'A03:2021',
      'security/detect-non-literal-require': 'A03:2021',
      'security/detect-child-process': 'A03:2021',
      'no-eval': 'A03:2021'
    };

    return owaspMappings[ruleId];
  }

  private getRecommendationForRule(ruleId: string): string {
    const recommendations: { [key: string]: string } = {
      'no-eval': 'Avoid using eval() as it can lead to code injection vulnerabilities',
      'no-implied-eval': 'Avoid functions that can evaluate strings as code',
      'security/detect-object-injection': 'Validate and sanitize user input before using it in object property access',
      'security/detect-unsafe-regex': 'Use safe regex patterns to prevent ReDoS attacks',
      'security/detect-child-process': 'Validate and sanitize input before executing child processes'
    };

    return recommendations[ruleId] || 'Review this security issue and implement appropriate mitigation';
  }

  private findLineNumber(content: string, pattern: RegExp): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return 0;
  }

  async generateSecurityReport(result: SecurityScanResult): Promise<string> {
    const report = `# Security Code Review Report

## Executive Summary
**Overall Security Score:** ${result.overallScore}/100
**Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}
**Total Issues Found:** ${result.issues.length}

## Issue Breakdown
- 🔴 **Critical:** ${result.criticalCount} (Max allowed: ${this.securityRules.maxCriticalIssues})
- 🟠 **High:** ${result.highCount} (Max allowed: ${this.securityRules.maxHighIssues})
- 🟡 **Medium:** ${result.mediumCount} (Max allowed: ${this.securityRules.maxMediumIssues})
- 🟢 **Low:** ${result.lowCount} (Max allowed: ${this.securityRules.maxLowIssues})

## Critical Issues
${result.issues.filter(i => i.severity === 'CRITICAL').map(issue => 
  `### ${issue.type}
**File:** ${issue.file}:${issue.line}
**Description:** ${issue.description}
**CWE:** ${issue.cweId || 'N/A'}
**Recommendation:** ${issue.recommendation}`
).join('\n\n') || 'No critical issues found.'}

## High Priority Issues
${result.issues.filter(i => i.severity === 'HIGH').slice(0, 10).map(issue => 
  `### ${issue.type}
**File:** ${issue.file}:${issue.line}
**Description:** ${issue.description}
**CWE:** ${issue.cweId || 'N/A'}
**Recommendation:** ${issue.recommendation}`
).join('\n\n') || 'No high priority issues found.'}

## Healthcare Security Compliance
### PDPA Compliance
${result.issues.some(i => i.description.includes('patient') || i.description.includes('consent')) ? 
  '⚠️ Potential PDPA compliance issues detected. Review patient data handling and consent management.' :
  '✅ No obvious PDPA compliance issues detected.'}

### Medical Data Security
${result.issues.some(i => i.type.includes('PHI') || i.description.includes('medical')) ? 
  '⚠️ Medical data security concerns detected. Ensure proper encryption and access controls.' :
  '✅ No obvious medical data security issues detected.'}

## Recommendations

### Immediate Actions Required
${result.criticalCount > 0 ? 
  `- Address all ${result.criticalCount} critical security issues before production deployment
- Implement secure configuration management
- Review and update access controls` :
  '✅ No immediate critical actions required'}

### Short-term Improvements
${result.highCount > 0 ? 
  `- Address high priority issues in the next sprint
- Implement additional security monitoring
- Enhance input validation and sanitization` :
  '✅ Security posture is good'}

### Long-term Security Enhancements
- Regular security audits and penetration testing
- Security awareness training for development team
- Implementation of security-focused code review process
- Continuous security monitoring and alerting

---
**Generated:** ${new Date().toISOString()}
**Next Review:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
`;

    return report;
  }
}

export default SecurityCodeReview;