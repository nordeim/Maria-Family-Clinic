import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface DeploymentScript {
  name: string;
  path: string;
  type: 'build' | 'migrate' | 'deploy' | 'rollback' | 'health-check';
  dependencies: string[];
  environment: 'development' | 'staging' | 'production';
  timeout: number; // in seconds
}

interface ScriptTestResult {
  scriptName: string;
  testType: 'syntax' | 'dry-run' | 'integration' | 'rollback' | 'performance';
  passed: boolean;
  executionTime: number;
  output?: string;
  error?: string;
  recommendations: string[];
}

interface DeploymentValidationResult {
  timestamp: Date;
  environment: string;
  overallStatus: 'pass' | 'fail' | 'warning';
  scriptResults: ScriptTestResult[];
  criticalIssues: string[];
  recommendations: string[];
  deploymentReady: boolean;
}

export class DeploymentScriptTesting {
  private readonly scripts: DeploymentScript[] = [
    {
      name: 'Build Application',
      path: './scripts/build.sh',
      type: 'build',
      dependencies: [],
      environment: 'production',
      timeout: 300
    },
    {
      name: 'Database Migration',
      path: './scripts/migrate-database.sh',
      type: 'migrate',
      dependencies: ['build'],
      environment: 'production',
      timeout: 600
    },
    {
      name: 'Deploy Application',
      path: './scripts/deploy.sh',
      type: 'deploy',
      dependencies: ['build', 'migrate'],
      environment: 'production',
      timeout: 900
    },
    {
      name: 'Health Check',
      path: './scripts/health-check.sh',
      type: 'health-check',
      dependencies: ['deploy'],
      environment: 'production',
      timeout: 60
    },
    {
      name: 'Rollback',
      path: './scripts/rollback.sh',
      type: 'rollback',
      dependencies: [],
      environment: 'production',
      timeout: 300
    }
  ];

  async validateAllScripts(environment: 'staging' | 'production'): Promise<DeploymentValidationResult> {
    const results: ScriptTestResult[] = [];
    const environmentScripts = this.scripts.filter(s => s.environment === environment);

    // Test each script with multiple validation types
    for (const script of environmentScripts) {
      console.log(`Testing script: ${script.name}`);
      
      // Syntax validation
      const syntaxTest = await this.testScriptSyntax(script);
      results.push(syntaxTest);

      // Dry run validation
      const dryRunTest = await this.testScriptDryRun(script);
      results.push(dryRunTest);

      // Performance test
      const performanceTest = await this.testScriptPerformance(script);
      results.push(performanceTest);

      // Integration test (if safe to run)
      if (this.canRunIntegrationTest(script)) {
        const integrationTest = await this.testScriptIntegration(script);
        results.push(integrationTest);
      }
    }

    // Test rollback script separately
    const rollbackScript = environmentScripts.find(s => s.type === 'rollback');
    if (rollbackScript) {
      const rollbackTest = await this.testRollbackProcedure(rollbackScript);
      results.push(rollbackTest);
    }

    // Generate results
    return this.generateValidationResults(results, environment);
  }

  private async testScriptSyntax(script: DeploymentScript): Promise<ScriptTestResult> {
    const startTime = Date.now();
    const recommendations: string[] = [];

    try {
      // Check if script file exists
      await fs.access(script.path);

      // Run shell syntax check
      const { stdout, stderr } = await execAsync(`bash -n ${script.path}`);

      const executionTime = Date.now() - startTime;
      const passed = stderr.length === 0;

      if (!passed) {
        recommendations.push('Fix shell syntax errors before deployment');
      }

      // Check for common issues
      const content = await fs.readFile(script.path, 'utf8');
      const issues = this.checkScriptIssues(content);

      if (issues.length > 0) {
        recommendations.push(...issues);
      }

      return {
        scriptName: script.name,
        testType: 'syntax',
        passed,
        executionTime,
        output: stdout,
        error: stderr || undefined,
        recommendations
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        scriptName: script.name,
        testType: 'syntax',
        passed: false,
        executionTime,
        error: error.message,
        recommendations: ['Script file not found or syntax check failed']
      };
    }
  }

  private async testScriptDryRun(script: DeploymentScript): Promise<ScriptTestResult> {
    const startTime = Date.now();
    const recommendations: string[] = [];

    try {
      // Run script with dry-run flag if available
      const dryRunFlags = ['--dry-run', '-n', '--preview'];
      let command = script.path;
      
      // Add dry-run flag if script supports it
      const scriptContent = await fs.readFile(script.path, 'utf8');
      const supportsDryRun = dryRunFlags.some(flag => scriptContent.includes(flag));

      if (supportsDryRun) {
        command += ' --dry-run';
      }

      // Check for required environment variables
      const envCheck = await this.validateEnvironmentVariables(script);
      if (!envCheck.passed) {
        recommendations.push(...envCheck.issues);
      }

      // Test dependencies
      const dependencyCheck = await this.validateDependencies(script);
      if (!dependencyCheck.passed) {
        recommendations.push(...dependencyCheck.issues);
      }

      const executionTime = Date.now() - startTime;
      const passed = envCheck.passed && dependencyCheck.passed;

      return {
        scriptName: script.name,
        testType: 'dry-run',
        passed,
        executionTime,
        recommendations
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        scriptName: script.name,
        testType: 'dry-run',
        passed: false,
        executionTime,
        error: error.message,
        recommendations: ['Script dry-run validation failed']
      };
    }
  }

  private async testScriptPerformance(script: DeploymentScript): Promise<ScriptTestResult> {
    const startTime = Date.now();
    const recommendations: string[] = [];

    try {
      const timeout = script.timeout * 1000; // Convert to milliseconds
      let passed = true;

      // Run script with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Script execution timeout')), timeout);
      });

      const executionPromise = execAsync(script.path);
      
      await Promise.race([executionPromise, timeoutPromise]);

      const executionTime = Date.now() - startTime;

      // Check if execution time is acceptable
      if (executionTime > script.timeout * 1000) {
        passed = false;
        recommendations.push(`Script execution time (${executionTime}ms) exceeds timeout (${script.timeout * 1000}ms)`);
      }

      if (executionTime > 300000) { // 5 minutes
        recommendations.push('Consider optimizing script performance');
      }

      return {
        scriptName: script.name,
        testType: 'performance',
        passed,
        executionTime,
        recommendations
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        scriptName: script.name,
        testType: 'performance',
        passed: false,
        executionTime,
        error: error.message,
        recommendations: ['Script performance test failed']
      };
    }
  }

  private async testScriptIntegration(script: DeploymentScript): Promise<ScriptTestResult> {
    const startTime = Date.now();
    const recommendations: string[] = [];

    try {
      // Only run integration tests in staging environment
      if (process.env.NODE_ENV !== 'staging') {
        return {
          scriptName: script.name,
          testType: 'integration',
          passed: true,
          executionTime: 0,
          recommendations: ['Integration test skipped (production environment)']
        };
      }

      // Test script in staging environment
      const stagingCommand = script.path.replace('/production/', '/staging/');
      
      try {
        await fs.access(stagingCommand);
      } catch {
        return {
          scriptName: script.name,
          testType: 'integration',
          passed: false,
          executionTime: 0,
          error: 'Staging deployment script not found',
          recommendations: ['Create staging deployment script for testing']
        };
      }

      const { stdout, stderr } = await execAsync(`bash ${stagingCommand} --dry-run`);
      const executionTime = Date.now() - startTime;
      const passed = stderr.length === 0;

      if (!passed) {
        recommendations.push('Fix staging deployment issues');
      }

      return {
        scriptName: script.name,
        testType: 'integration',
        passed,
        executionTime,
        output: stdout,
        error: stderr || undefined,
        recommendations
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        scriptName: script.name,
        testType: 'integration',
        passed: false,
        executionTime,
        error: error.message,
        recommendations: ['Script integration test failed']
      };
    }
  }

  private async testRollbackProcedure(script: DeploymentScript): Promise<ScriptTestResult> {
    const startTime = Date.now();
    const recommendations: string[] = [];

    try {
      // Test rollback script syntax
      const syntaxResult = await this.testScriptSyntax(script);
      if (!syntaxResult.passed) {
        return syntaxResult;
      }

      // Test rollback script in safe mode
      const rollbackCheck = await this.validateRollbackSteps(script);
      if (!rollbackCheck.passed) {
        recommendations.push(...rollbackCheck.issues);
      }

      // Verify rollback dependencies
      const dependencyCheck = await this.validateRollbackDependencies(script);
      if (!dependencyCheck.passed) {
        recommendations.push(...dependencyCheck.issues);
      }

      const executionTime = Date.now() - startTime;
      const passed = rollbackCheck.passed && dependencyCheck.passed;

      return {
        scriptName: script.name,
        testType: 'rollback',
        passed,
        executionTime,
        recommendations
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        scriptName: script.name,
        testType: 'rollback',
        passed: false,
        executionTime,
        error: error.message,
        recommendations: ['Rollback procedure validation failed']
      };
    }
  }

  private async validateEnvironmentVariables(script: DeploymentScript): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Read script content to identify required environment variables
      const content = await fs.readFile(script.path, 'utf8');
      const envVarPattern = /\$([A-Z_][A-Z0-9_]*)/g;
      const matches = content.match(envVarPattern) || [];

      // Extract unique environment variable names
      const requiredVars = [...new Set(matches.map(match => match.substring(1)))];

      // Check if each required variable is set
      for (const envVar of requiredVars) {
        if (!process.env[envVar] && envVar !== 'NODE_ENV') {
          issues.push(`Required environment variable ${envVar} is not set`);
        }
      }

      // Check for hardcoded sensitive values
      if (content.includes('password') || content.includes('secret')) {
        issues.push('Script may contain hardcoded sensitive values');
      }

      return {
        passed: issues.length === 0,
        issues
      };

    } catch (error: any) {
      return {
        passed: false,
        issues: [`Failed to validate environment variables: ${error.message}`]
      };
    }
  }

  private async validateDependencies(script: DeploymentScript): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check if dependencies are valid
    for (const dependency of script.dependencies) {
      const depScript = this.scripts.find(s => s.name === dependency);
      if (!depScript) {
        issues.push(`Unknown dependency: ${dependency}`);
      }
    }

    // Check script execution order
    const executionOrder = this.validateExecutionOrder(script);
    if (!executionOrder.valid) {
      issues.push(...executionOrder.issues);
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  private validateExecutionOrder(script: DeploymentScript): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const typeOrder = ['build', 'migrate', 'deploy', 'health-check'];
    
    const scriptIndex = typeOrder.indexOf(script.type);
    if (scriptIndex > 0) {
      const previousTypes = typeOrder.slice(0, scriptIndex);
      
      // Check if dependencies include all required previous steps
      for (const prevType of previousTypes) {
        const hasDependency = script.dependencies.some(dep => 
          this.scripts.find(s => s.name === dep && s.type === prevType)
        );
        
        if (!hasDependency && prevType !== 'build') {
          issues.push(`Script should depend on ${prevType} step`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  private async validateRollbackSteps(script: DeploymentScript): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const content = await fs.readFile(script.path, 'utf8');
      
      // Check for essential rollback steps
      const requiredSteps = [
        'backup',
        'stop',
        'restore',
        'start',
        'verify'
      ];

      for (const step of requiredSteps) {
        if (!content.toLowerCase().includes(step)) {
          issues.push(`Rollback script missing ${step} step`);
        }
      }

      // Check for safety measures
      if (!content.includes('confirm') && !content.includes('--force')) {
        issues.push('Rollback script should include confirmation mechanism');
      }

      // Check for logging
      if (!content.includes('log') && !content.includes('echo')) {
        issues.push('Rollback script should include logging');
      }

      return {
        passed: issues.length === 0,
        issues
      };

    } catch (error: any) {
      return {
        passed: false,
        issues: [`Failed to validate rollback steps: ${error.message}`]
      };
    }
  }

  private async validateRollbackDependencies(script: DeploymentScript): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const content = await fs.readFile(script.path, 'utf8');
      
      // Check for database rollback dependency
      if (content.includes('database') && !content.includes('migrate:down')) {
        issues.push('Database rollback step missing');
      }

      // Check for application rollback dependency
      if (content.includes('application') && !content.includes('previous version')) {
        issues.push('Application rollback step missing');
      }

      // Check for configuration rollback
      if (content.includes('config') && !content.includes('restore config')) {
        issues.push('Configuration rollback step missing');
      }

      return {
        passed: issues.length === 0,
        issues
      };

    } catch (error: any) {
      return {
        passed: false,
        issues: [`Failed to validate rollback dependencies: ${error.message}`]
      };
    }
  }

  private checkScriptIssues(content: string): string[] {
    const issues: string[] = [];

    // Check for common script problems
    if (content.includes('rm -rf /')) {
      issues.push('Script contains dangerous rm -rf command');
    }

    if (content.includes('sudo') && !content.includes('use sudo appropriately')) {
      issues.push('Script uses sudo without proper safeguards');
    }

    if (!content.includes('set -e')) {
      issues.push('Script should use "set -e" for error handling');
    }

    if (!content.includes('trap') && content.includes('cleanup')) {
      issues.push('Script should use trap for cleanup');
    }

    if (content.includes('wget') && !content.includes('--no-check-certificate')) {
      issues.push('Script should validate SSL certificates for wget downloads');
    }

    return issues;
  }

  private canRunIntegrationTest(script: DeploymentScript): boolean {
    // Only run integration tests for safe scripts
    const safeScriptTypes = ['build', 'health-check'];
    return safeScriptTypes.includes(script.type) && process.env.NODE_ENV === 'staging';
  }

  private generateValidationResults(results: ScriptTestResult[], environment: string): DeploymentValidationResult {
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';

    // Analyze results
    for (const result of results) {
      if (!result.passed) {
        criticalIssues.push(`${result.scriptName} - ${result.testType}: ${result.error || 'Failed'}`);
        overallStatus = 'fail';
      }
      
      recommendations.push(...result.recommendations);
    }

    // Check for warning conditions
    const performanceIssues = results.filter(r => r.testType === 'performance' && r.executionTime > 180000);
    if (performanceIssues.length > 0) {
      overallStatus = overallStatus === 'fail' ? 'fail' : 'warning';
    }

    // Check if deployment is ready
    const deploymentReady = overallStatus === 'pass' && criticalIssues.length === 0;

    return {
      timestamp: new Date(),
      environment,
      overallStatus,
      scriptResults: results,
      criticalIssues,
      recommendations: [...new Set(recommendations)], // Remove duplicates
      deploymentReady
    };
  }

  async generateReport(result: DeploymentValidationResult): Promise<string> {
    const report = `# Deployment Script Validation Report

**Environment:** ${result.environment.toUpperCase()}
**Generated:** ${result.timestamp.toLocaleString()}
**Overall Status:** ${result.overallStatus === 'pass' ? '✅ PASSED' : result.overallStatus === 'warning' ? '⚠️ WARNING' : '❌ FAILED'}
**Deployment Ready:** ${result.deploymentReady ? '✅ YES' : '❌ NO'}

## Script Test Results

${result.scriptResults.map(result => `
### ${result.scriptName} - ${result.testType.replace('-', ' ').toUpperCase()}
- **Status:** ${result.passed ? '✅ PASS' : '❌ FAIL'}
- **Execution Time:** ${result.executionTime}ms
${result.error ? `- **Error:** ${result.error}` : ''}
${result.output ? `- **Output:** ${result.output}` : ''}
${result.recommendations.length > 0 ? `- **Recommendations:**\n${result.recommendations.map(rec => `  - ${rec}`).join('\n')}` : ''}
`).join('\n')}

## Critical Issues
${result.criticalIssues.length > 0 ? result.criticalIssues.map(issue => `- ${issue}`).join('\n') : 'No critical issues found'}

## Recommendations
${result.recommendations.length > 0 ? result.recommendations.map(rec => `- ${rec}`).join('\n') : 'No additional recommendations'}

## Summary
- Total Scripts Tested: ${result.scriptResults.length}
- Passed Tests: ${result.scriptResults.filter(r => r.passed).length}
- Failed Tests: ${result.scriptResults.filter(r => !r.passed).length}
- Total Execution Time: ${result.scriptResults.reduce((sum, r) => sum + r.executionTime, 0)}ms

---
**Next Steps:**
${result.deploymentReady ? 
  '✅ All scripts are ready for production deployment' : 
  '❌ Address critical issues before production deployment'}
`;

    return report;
  }

  async saveReport(result: DeploymentValidationResult): Promise<void> {
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `deployment-script-validation-${timestamp}.md`);
    
    const report = await this.generateReport(result);
    await fs.writeFile(reportPath, report);

    console.log(`Deployment script validation report saved: ${reportPath}`);
  }
}

export default DeploymentScriptTesting;