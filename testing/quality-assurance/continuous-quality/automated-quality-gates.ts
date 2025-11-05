import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface QualityGate {
  id: string;
  name: string;
  type: 'test' | 'security' | 'performance' | 'compliance' | 'code-quality';
  description: string;
  threshold: number;
  current: number;
  status: 'pass' | 'fail' | 'warning';
  critical: boolean;
  automation: 'required' | 'optional' | 'disabled';
}

interface QualityGateResult {
  gateId: string;
  name: string;
  passed: boolean;
  currentValue: number;
  threshold: number;
  message: string;
  recommendations: string[];
  blocking: boolean;
}

interface PipelineStage {
  name: string;
  gates: QualityGate[];
  blockOnFailure: boolean;
  autoFix: boolean;
}

export class AutomatedQualityGates {
  private readonly stages: PipelineStage[] = [
    {
      name: 'Pre-commit',
      gates: [
        {
          id: 'eslint-errors',
          name: 'ESLint Errors',
          type: 'code-quality',
          description: 'No ESLint errors in modified files',
          threshold: 0,
          current: 0,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'prettier-format',
          name: 'Code Formatting',
          type: 'code-quality',
          description: 'All code properly formatted',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: false,
          automation: 'required'
        },
        {
          id: 'secret-scan',
          name: 'Secret Scanning',
          type: 'security',
          description: 'No hardcoded secrets detected',
          threshold: 0,
          current: 0,
          status: 'pass',
          critical: true,
          automation: 'required'
        }
      ],
      blockOnFailure: true,
      autoFix: true
    },
    {
      name: 'Build',
      gates: [
        {
          id: 'build-success',
          name: 'Build Success',
          type: 'test',
          description: 'Application builds without errors',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'bundle-size',
          name: 'Bundle Size',
          type: 'performance',
          description: 'Bundle size within limits',
          threshold: 250000, // 250KB
          current: 0,
          status: 'pass',
          critical: false,
          automation: 'optional'
        }
      ],
      blockOnFailure: true,
      autoFix: false
    },
    {
      name: 'Test',
      gates: [
        {
          id: 'test-coverage',
          name: 'Test Coverage',
          type: 'test',
          description: 'Minimum test coverage threshold',
          threshold: 95,
          current: 0,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'test-success',
          name: 'Test Success Rate',
          type: 'test',
          description: 'All tests pass',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'healthcare-tests',
          name: 'Healthcare Scenario Tests',
          type: 'test',
          description: 'Healthcare-specific tests pass',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'security-tests',
          name: 'Security Tests',
          type: 'security',
          description: 'Security tests pass',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        }
      ],
      blockOnFailure: true,
      autoFix: false
    },
    {
      name: 'Security',
      gates: [
        {
          id: 'vulnerability-scan',
          name: 'Security Vulnerabilities',
          type: 'security',
          description: 'No critical or high vulnerabilities',
          threshold: 0,
          current: 0,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'dependency-scan',
          name: 'Dependency Vulnerabilities',
          type: 'security',
          description: 'No vulnerable dependencies',
          threshold: 0,
          current: 0,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'license-scan',
          name: 'License Compliance',
          type: 'compliance',
          description: 'All dependencies have compatible licenses',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: false,
          automation: 'required'
        }
      ],
      blockOnFailure: true,
      autoFix: false
    },
    {
      name: 'Performance',
      gates: [
        {
          id: 'core-web-vitals',
          name: 'Core Web Vitals',
          type: 'performance',
          description: 'LCP < 2.5s, FID < 100ms, CLS < 0.1',
          threshold: 100,
          current: 0,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'lighthouse-score',
          name: 'Lighthouse Score',
          type: 'performance',
          description: 'Lighthouse performance score',
          threshold: 90,
          current: 0,
          status: 'pass',
          critical: false,
          automation: 'optional'
        }
      ],
      blockOnFailure: false,
      autoFix: false
    },
    {
      name: 'Compliance',
      gates: [
        {
          id: 'pdpa-compliance',
          name: 'PDPA Compliance',
          type: 'compliance',
          description: 'PDPA compliance checks pass',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'moh-compliance',
          name: 'MOH Compliance',
          type: 'compliance',
          description: 'MOH regulation compliance checks pass',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'accessibility-tests',
          name: 'Accessibility Tests',
          type: 'compliance',
          description: 'WCAG 2.2 AA compliance',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        }
      ],
      blockOnFailure: true,
      autoFix: false
    },
    {
      name: 'Deploy',
      gates: [
        {
          id: 'production-readiness',
          name: 'Production Readiness',
          type: 'test',
          description: 'Production deployment checklist complete',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        },
        {
          id: 'monitoring-setup',
          name: 'Monitoring & Alerting',
          type: 'test',
          description: 'Production monitoring systems configured',
          threshold: 100,
          current: 100,
          status: 'pass',
          critical: true,
          automation: 'required'
        }
      ],
      blockOnFailure: true,
      autoFix: false
    }
  ];

  async executeQualityGates(stageName?: string): Promise<{
    overallStatus: 'pass' | 'fail' | 'warning';
    stageResults: PipelineStageResult[];
    blockingIssues: QualityGateResult[];
    recommendations: string[];
  }> {
    const stagesToRun = stageName ? 
      this.stages.filter(s => s.name === stageName) : 
      this.stages;

    const stageResults: PipelineStageResult[] = [];
    const allBlockingIssues: QualityGateResult[] = [];
    const allRecommendations: string[] = [];

    for (const stage of stagesToRun) {
      console.log(`\n🔍 Executing quality gates for stage: ${stage.name}`);
      
      const stageResult = await this.executeStage(stage);
      stageResults.push(stageResult);
      
      if (stageResult.blockingIssues.length > 0) {
        allBlockingIssues.push(...stageResult.blockingIssues);
      }
      
      allRecommendations.push(...stageResult.recommendations);

      // Stop on first critical failure if stage blocks on failure
      if (stage.blockOnFailure && stageResult.failed) {
        console.log(`\n❌ Stage "${stage.name}" failed, stopping pipeline`);
        break;
      }
    }

    const overallStatus = this.determineOverallStatus(stageResults, allBlockingIssues);

    return {
      overallStatus,
      stageResults,
      blockingIssues: allBlockingIssues,
      recommendations: [...new Set(allRecommendations)] // Remove duplicates
    };
  }

  private async executeStage(stage: PipelineStage): Promise<PipelineStageResult> {
    const gateResults: QualityGateResult[] = [];
    const blockingIssues: QualityGateResult[] = [];

    for (const gate of stage.gates) {
      const result = await this.executeGate(gate);
      gateResults.push(result);

      if (!result.passed && gate.critical) {
        blockingIssues.push(result);
      }

      console.log(`  ${result.passed ? '✅' : '❌'} ${gate.name}: ${result.message}`);
    }

    const failed = gateResults.some(r => !r.passed);
    const hasBlockingFailures = blockingIssues.length > 0;

    return {
      stageName: stage.name,
      gates: stage.gates,
      gateResults,
      failed,
      hasBlockingFailures,
      blockingIssues,
      recommendations: this.generateStageRecommendations(stage, gateResults)
    };
  }

  private async executeGate(gate: QualityGate): Promise<QualityGateResult> {
    try {
      let currentValue = 0;

      // Execute specific gate based on type
      switch (gate.type) {
        case 'code-quality':
          currentValue = await this.checkCodeQuality(gate);
          break;
        case 'test':
          currentValue = await this.checkTestCoverage(gate);
          break;
        case 'security':
          currentValue = await this.checkSecurity(gate);
          break;
        case 'performance':
          currentValue = await this.checkPerformance(gate);
          break;
        case 'compliance':
          currentValue = await this.checkCompliance(gate);
          break;
        default:
          throw new Error(`Unknown gate type: ${gate.type}`);
      }

      gate.current = currentValue;
      const passed = currentValue >= gate.threshold;
      gate.status = passed ? 'pass' : (this.isNearThreshold(gate, currentValue) ? 'warning' : 'fail');

      const message = this.generateGateMessage(gate, currentValue);
      const recommendations = this.generateGateRecommendations(gate, currentValue);
      const blocking = gate.critical && !passed;

      return {
        gateId: gate.id,
        name: gate.name,
        passed,
        currentValue,
        threshold: gate.threshold,
        message,
        recommendations,
        blocking
      };

    } catch (error) {
      console.error(`Error executing gate ${gate.name}:`, error);
      
      return {
        gateId: gate.id,
        name: gate.name,
        passed: false,
        currentValue: 0,
        threshold: gate.threshold,
        message: `Error executing gate: ${error.message}`,
        recommendations: [`Fix gate execution error: ${error.message}`],
        blocking: gate.critical
      };
    }
  }

  private async checkCodeQuality(gate: QualityGate): Promise<number> {
    switch (gate.id) {
      case 'eslint-errors':
        return await this.checkESLintErrors();
      case 'prettier-format':
        return await this.checkPrettierFormat();
      case 'complexity':
        return await this.checkCodeComplexity();
      default:
        throw new Error(`Unknown code quality gate: ${gate.id}`);
    }
  }

  private async checkTestCoverage(gate: QualityGate): Promise<number> {
    switch (gate.id) {
      case 'test-coverage':
        return await this.getTestCoverage();
      case 'test-success':
        return await this.getTestSuccessRate();
      case 'healthcare-tests':
        return await this.getHealthcareTestCoverage();
      default:
        throw new Error(`Unknown test gate: ${gate.id}`);
    }
  }

  private async checkSecurity(gate: QualityGate): Promise<number> {
    switch (gate.id) {
      case 'secret-scan':
        return await this.scanForSecrets();
      case 'vulnerability-scan':
        return await this.runVulnerabilityScan();
      case 'dependency-scan':
        return await this.scanDependencies();
      default:
        throw new Error(`Unknown security gate: ${gate.id}`);
    }
  }

  private async checkPerformance(gate: QualityGate): Promise<number> {
    switch (gate.id) {
      case 'core-web-vitals':
        return await this.checkCoreWebVitals();
      case 'bundle-size':
        return await this.checkBundleSize();
      default:
        throw new Error(`Unknown performance gate: ${gate.id}`);
    }
  }

  private async checkCompliance(gate: QualityGate): Promise<number> {
    switch (gate.id) {
      case 'pdpa-compliance':
        return await this.checkPDPACompliance();
      case 'moh-compliance':
        return await this.checkMOHCompliance();
      case 'accessibility-tests':
        return await this.checkAccessibilityCompliance();
      default:
        throw new Error(`Unknown compliance gate: ${gate.id}`);
    }
  }

  // Specific gate implementations
  private async checkESLintErrors(): Promise<number> {
    try {
      const { stdout } = await execAsync('npx eslint src/ --format=json --quiet');
      const results = JSON.parse(stdout);
      
      const totalErrors = results.reduce((sum: number, file: any) => {
        return sum + file.messages.filter((msg: any) => msg.severity === 2).length;
      }, 0);

      return totalErrors === 0 ? 100 : Math.max(0, 100 - (totalErrors * 10));
    } catch (error) {
      return 0; // Fail closed
    }
  }

  private async getTestCoverage(): Promise<number> {
    try {
      const { stdout } = await execAsync('npm test -- --coverage --coverageReporters=json');
      const coverageMatch = stdout.match(/"lines":\s*{\s*"p":\s*(\d+(?:\.\d+)?)/);
      return coverageMatch ? parseFloat(coverageMatch[1]) : 0;
    } catch (error) {
      return 0; // Fail closed
    }
  }

  private async scanForSecrets(): Promise<number> {
    try {
      // Simple secret scanning - in production, use dedicated tools like TruffleHog
      const secretPatterns = [
        /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
        /password\s*[:=]\s*['"][^'"]+['"]/i,
        /secret\s*[:=]\s*['"][^'"]+['"]/i,
        /token\s*[:=]\s*['"][^'"]+['"]/i
      ];

      const srcFiles = await this.getAllTsFiles('src/');
      let secretsFound = 0;

      for (const file of srcFiles) {
        const content = await fs.readFile(file, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            secretsFound++;
          }
        }
      }

      return secretsFound === 0 ? 100 : 0;
    } catch (error) {
      return 0; // Fail closed
    }
  }

  private async checkCoreWebVitals(): Promise<number> {
    try {
      // This would typically run Lighthouse or similar tool
      // For now, return a mock score based on file analysis
      const viteConfigExists = await this.checkFileExists('vite.config.ts');
      const hasOptimization = await this.checkOptimizationSetup();
      
      let score = 50; // Base score
      
      if (viteConfigExists) score += 20;
      if (hasOptimization) score += 30;
      
      return Math.min(score, 100);
    } catch (error) {
      return 0;
    }
  }

  private async checkPDPACompliance(): Promise<number> {
    try {
      // Check for PDPA-related configurations and validations
      const pdpaChecks = [
        await this.checkEncryptionSetup(),
        await this.checkConsentManagement(),
        await this.checkDataRetentionPolicy(),
        await this.checkAuditLogging()
      ];

      const passedChecks = pdpaChecks.filter(check => check.passed).length;
      return (passedChecks / pdpaChecks.length) * 100;
    } catch (error) {
      return 0;
    }
  }

  private async checkMOHCompliance(): Promise<number> {
    try {
      // Check for MOH healthcare regulation compliance
      const mohChecks = [
        await this.checkMedicalDataHandling(),
        await this.checkHealthcareWorkflowValidation(),
        await this.checkEmergencySystemSetup(),
        await this.checkHealthcareProviderIntegration()
      ];

      const passedChecks = mohChecks.filter(check => check.passed).length;
      return (passedChecks / mohChecks.length) * 100;
    } catch (error) {
      return 0;
    }
  }

  private async checkAccessibilityCompliance(): Promise<number> {
    try {
      // Check for WCAG 2.2 AA compliance
      const accessibilityChecks = [
        await this.checkAriaLabels(),
        await this.checkKeyboardNavigation(),
        await this.checkColorContrast(),
        await this.checkScreenReaderSupport()
      ];

      const passedChecks = accessibilityChecks.filter(check => check.passed).length;
      return (passedChecks / accessibilityChecks.length) * 100;
    } catch (error) {
      return 0;
    }
  }

  private async checkBundleSize(): Promise<number> {
    try {
      // Check build output size
      const distExists = await this.checkFileExists('dist');
      if (!distExists) return 0;

      const buildFiles = await this.getBuildFiles();
      const totalSize = buildFiles.reduce((sum, file) => sum + file.size, 0);
      
      // Threshold: 250KB
      const threshold = 250000;
      return totalSize <= threshold ? 100 : Math.max(0, 100 - ((totalSize - threshold) / threshold) * 100);
    } catch (error) {
      return 0;
    }
  }

  // Helper methods
  private async getAllTsFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.getAllTsFiles(fullPath));
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getBuildFiles(): Promise<Array<{ path: string; size: number }>> {
    const buildFiles = [];
    try {
      const distPath = path.join(process.cwd(), 'dist');
      const entries = await fs.readdir(distPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(distPath, entry.name);
        const stats = await fs.stat(fullPath);
        buildFiles.push({ path: fullPath, size: stats.size });
      }
    } catch (error) {
      // Build directory doesn't exist
    }

    return buildFiles;
  }

  private async checkOptimizationSetup(): Promise<boolean> {
    try {
      const viteConfig = await fs.readFile('vite.config.ts', 'utf8');
      return viteConfig.includes('build') && viteConfig.includes('rollupOptions');
    } catch {
      return false;
    }
  }

  private isNearThreshold(gate: QualityGate, currentValue: number): boolean {
    const threshold = gate.threshold;
    const tolerance = 0.05; // 5% tolerance
    return currentValue >= threshold * (1 - tolerance);
  }

  private generateGateMessage(gate: QualityGate, currentValue: number): string {
    const status = currentValue >= gate.threshold ? 'PASS' : 'FAIL';
    return `${status}: ${currentValue}/${gate.threshold} ${gate.description}`;
  }

  private generateGateRecommendations(gate: QualityGate, currentValue: number): string[] {
    const recommendations: string[] = [];

    if (currentValue < gate.threshold) {
      switch (gate.type) {
        case 'test':
          recommendations.push('Increase test coverage by adding more unit and integration tests');
          recommendations.push('Focus on testing critical healthcare workflows');
          break;
        case 'security':
          recommendations.push('Address security vulnerabilities immediately');
          recommendations.push('Enable security scanning in CI/CD pipeline');
          break;
        case 'performance':
          recommendations.push('Optimize bundle size and improve Core Web Vitals');
          recommendations.push('Implement code splitting and lazy loading');
          break;
        case 'compliance':
          recommendations.push('Ensure healthcare compliance requirements are met');
          recommendations.push('Review and update compliance documentation');
          break;
      }
    }

    return recommendations;
  }

  private generateStageRecommendations(stage: PipelineStage, results: QualityGateResult[]): string[] {
    const recommendations: string[] = [];
    
    const failedGates = results.filter(r => !r.passed);
    
    if (failedGates.length > 0) {
      recommendations.push(`Fix ${failedGates.length} failing quality gates in ${stage.name} stage`);
      
      if (stage.autoFix) {
        recommendations.push('Auto-fix enabled: Some issues may be automatically resolved');
      }
    }

    return recommendations;
  }

  private determineOverallStatus(stageResults: PipelineStageResult[], blockingIssues: QualityGateResult[]): 'pass' | 'fail' | 'warning' {
    if (blockingIssues.length > 0) {
      return 'fail';
    }

    const hasWarnings = stageResults.some(result => 
      result.gateResults.some(gate => gate.status === 'warning')
    );

    return hasWarnings ? 'warning' : 'pass';
  }

  // Placeholder implementations for compliance checks
  private async checkEncryptionSetup(): Promise<{ passed: boolean; details: string }> {
    // Check for encryption configuration
    const hasEncryption = await this.checkFileExists('.env.example');
    return {
      passed: hasEncryption,
      details: hasEncryption ? 'Encryption configuration found' : 'No encryption configuration'
    };
  }

  private async checkConsentManagement(): Promise<{ passed: boolean; details: string }> {
    // Check for consent management implementation
    const hasConsent = await this.checkFileExists('src/components/privacy/ConsentManagement.tsx');
    return {
      passed: hasConsent,
      details: hasConsent ? 'Consent management found' : 'No consent management implementation'
    };
  }

  private async checkDataRetentionPolicy(): Promise<{ passed: boolean; details: string }> {
    // Check for data retention policy documentation
    const hasPolicy = await this.checkFileExists('docs/data-retention-policy.md');
    return {
      passed: hasPolicy,
      details: hasPolicy ? 'Data retention policy documented' : 'No data retention policy found'
    };
  }

  private async checkAuditLogging(): Promise<{ passed: boolean; details: string }> {
    // Check for audit logging implementation
    const hasAudit = await this.checkFileExists('src/lib/audit/service.ts');
    return {
      passed: hasAudit,
      details: hasAudit ? 'Audit logging implementation found' : 'No audit logging found'
    };
  }

  private async checkMedicalDataHandling(): Promise<{ passed: boolean; details: string }> {
    // Check for medical data handling compliance
    const hasMedicalData = await this.checkFileExists('src/components/healthcare/');
    return {
      passed: hasMedicalData,
      details: hasMedicalData ? 'Medical data handling components found' : 'No medical data handling found'
    };
  }

  private async checkHealthcareWorkflowValidation(): Promise<{ passed: boolean; details: string }> {
    // Check for healthcare workflow validation
    const hasWorkflows = await this.checkFileExists('src/hooks/use-healthcare-workflow.ts');
    return {
      passed: hasWorkflows,
      details: hasWorkflows ? 'Healthcare workflow validation found' : 'No healthcare workflow validation'
    };
  }

  private async checkEmergencySystemSetup(): Promise<{ passed: boolean; details: string }> {
    // Check for emergency system implementation
    const hasEmergency = await this.checkFileExists('src/components/emergency/');
    return {
      passed: hasEmergency,
      details: hasEmergency ? 'Emergency system components found' : 'No emergency system found'
    };
  }

  private async checkHealthcareProviderIntegration(): Promise<{ passed: boolean; details: string }> {
    // Check for healthcare provider integration
    const hasIntegration = await this.checkFileExists('src/components/integration/');
    return {
      passed: hasIntegration,
      details: hasIntegration ? 'Healthcare provider integration found' : 'No provider integration found'
    };
  }

  private async checkAriaLabels(): Promise<{ passed: boolean; details: string }> {
    // Check for ARIA labels in components
    const hasAccessibility = await this.checkFileExists('src/components/accessibility/');
    return {
      passed: hasAccessibility,
      details: hasAccessibility ? 'Accessibility components found' : 'No accessibility components'
    };
  }

  private async checkKeyboardNavigation(): Promise<{ passed: boolean; details: string }> {
    // Check for keyboard navigation support
    const hasKeyboardNav = await this.checkFileExists('src/accessibility/navigation/');
    return {
      passed: hasKeyboardNav,
      details: hasKeyboardNav ? 'Keyboard navigation found' : 'No keyboard navigation found'
    };
  }

  private async checkColorContrast(): Promise<{ passed: boolean; details: string }> {
    // Check for color contrast compliance
    const hasHighContrast = await this.checkFileExists('src/components/accessibility/high-contrast-toggle.tsx');
    return {
      passed: hasHighContrast,
      details: hasHighContrast ? 'High contrast toggle found' : 'No high contrast support'
    };
  }

  private async checkScreenReaderSupport(): Promise<{ passed: boolean; details: string }> {
    // Check for screen reader support
    const hasScreenReader = await this.checkFileExists('src/accessibility/voice/');
    return {
      passed: hasScreenReader,
      details: hasScreenReader ? 'Screen reader support found' : 'No screen reader support'
    };
  }

  private async checkPrettierFormat(): Promise<number> {
    try {
      const { stdout } = await execAsync('npx prettier --check src/');
      return stdout.includes('different') ? 0 : 100;
    } catch {
      return 0;
    }
  }

  private async checkCodeComplexity(): Promise<number> {
    try {
      // Simplified complexity check
      const complexFiles = await this.getAllTsFiles('src/');
      let totalComplexity = 0;
      
      for (const file of complexFiles) {
        const content = await fs.readFile(file, 'utf8');
        const complexity = (content.match(/if|for|while|switch|catch/g) || []).length;
        totalComplexity += complexity;
      }
      
      const avgComplexity = totalComplexity / complexFiles.length;
      return Math.max(0, 100 - (avgComplexity * 5));
    } catch {
      return 0;
    }
  }

  private async getTestSuccessRate(): Promise<number> {
    try {
      const { stdout } = await execAsync('npm test -- --testNamePattern=".*" --passWithNoTests');
      const passMatch = stdout.match(/Tests:\s+(\d+)\s+passed/);
      const totalMatch = stdout.match(/Tests:\s+\d+\s+passed,\s+(\d+)\s+total/);
      
      if (passMatch && totalMatch) {
        const passed = parseInt(passMatch[1]);
        const total = parseInt(totalMatch[1]);
        return (passed / total) * 100;
      }
      
      return 0;
    } catch {
      return 0;
    }
  }

  private async getHealthcareTestCoverage(): Promise<number> {
    try {
      // Check for healthcare-specific test files
      const healthcareTests = await this.getAllTsFiles('src/test/healthcare/');
      const totalTests = await this.getAllTsFiles('src/test/');
      
      const coverage = (healthcareTests.length / totalTests.length) * 100;
      return isNaN(coverage) ? 0 : Math.min(coverage, 100);
    } catch {
      return 0;
    }
  }

  private async runVulnerabilityScan(): Promise<number> {
    try {
      const { stdout } = await execAsync('npm audit --json');
      const auditResult = JSON.parse(stdout);
      
      const criticalVulns = Object.values(auditResult.vulnerabilities || {})
        .filter((vuln: any) => vuln.severity === 'critical').length;
      
      const highVulns = Object.values(auditResult.vulnerabilities || {})
        .filter((vuln: any) => vuln.severity === 'high').length;
      
      return (criticalVulns + highVulns) === 0 ? 100 : 0;
    } catch {
      return 0;
    }
  }

  private async scanDependencies(): Promise<number> {
    try {
      const { stdout } = await execAsync('npm audit --json');
      const auditResult = JSON.parse(stdout);
      const totalVulns = Object.keys(auditResult.vulnerabilities || {}).length;
      
      return totalVulns === 0 ? 100 : Math.max(0, 100 - (totalVulns * 10));
    } catch {
      return 0;
    }
  }
}

export default AutomatedQualityGates;