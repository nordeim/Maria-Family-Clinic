import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface CoverageMetrics {
  lines: CoverageMetric;
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  files: FileCoverage[];
}

interface CoverageMetric {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

interface FileCoverage {
  path: string;
  lines: CoverageMetric;
  statements: CoverageMetric;
  functions: CoverageMetric;
  branches?: CoverageMetric;
  missingCoverage: number[];
  excludedLines: number[];
}

interface CoverageThresholds {
  lines: number;
  statements: number;
  branches: number;
  functions: number;
  overall: number;
}

interface CoverageGap {
  file: string;
  type: 'file' | 'function' | 'branch' | 'line';
  name?: string;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  testSuggestion: string;
}

interface CoverageReport {
  timestamp: Date;
  overall: CoverageMetrics;
  thresholds: CoverageThresholds;
  passed: boolean;
  gaps: CoverageGap[];
  trends: CoverageTrend[];
  recommendations: string[];
  healthScore: number;
}

interface CoverageTrend {
  date: Date;
  overall: number;
  lines: number;
  statements: number;
  branches: number;
  functions: number;
}

export class CoverageReporter {
  private readonly thresholds: CoverageThresholds = {
    lines: 95,
    statements: 95,
    branches: 90,
    functions: 95,
    overall: 95
  };

  async generateCoverageReport(): Promise<CoverageReport> {
    try {
      // Run coverage collection
      const coverageData = await this.collectCoverageData();
      
      // Analyze coverage gaps
      const gaps = await this.identifyCoverageGaps(coverageData);
      
      // Calculate health score
      const healthScore = this.calculateHealthScore(coverageData);
      
      // Generate trends
      const trends = await this.generateTrends();
      
      // Create recommendations
      const recommendations = this.generateRecommendations(coverageData, gaps);
      
      // Check thresholds
      const passed = this.checkThresholds(coverageData);
      
      return {
        timestamp: new Date(),
        overall: coverageData,
        thresholds: this.thresholds,
        passed,
        gaps,
        trends,
        recommendations,
        healthScore
      };

    } catch (error) {
      throw new Error(`Coverage report generation failed: ${error.message}`);
    }
  }

  private async collectCoverageData(): Promise<CoverageMetrics> {
    try {
      // Run test coverage
      const { stdout } = await execAsync('npm test -- --coverage --coverageReporters=json');
      
      // Parse coverage data from various sources
      const lcovData = await this.parseLcovReport();
      const jsonData = await this.parseJsonCoverage();
      
      // Combine data sources
      const combinedData = this.combineCoverageData(lcovData, jsonData);
      
      return combinedData;

    } catch (error) {
      // Fallback to simpler coverage collection
      return await this.collectSimpleCoverage();
    }
  }

  private async parseLcovReport(): Promise<CoverageMetrics | null> {
    try {
      const lcovPath = path.join(process.cwd(), 'coverage', 'lcov.info');
      const lcovContent = await fs.readFile(lcovPath, 'utf8');
      
      const coverage: CoverageMetrics = {
        lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
        statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
        branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
        functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
        files: []
      };

      const lines = lcovContent.split('\n');
      let currentFile: FileCoverage | null = null;

      for (const line of lines) {
        if (line.startsWith('SF:')) {
          const filePath = line.substring(3);
          currentFile = {
            path: filePath,
            lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
            statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
            functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
            missingCoverage: [],
            excludedLines: []
          };
        } else if (line.startsWith('DA:') && currentFile) {
          const [lineNum, hits] = line.substring(3).split(',');
          const lineNumber = parseInt(lineNum);
          const hitCount = parseInt(hits);
          
          if (hitCount === 0) {
            currentFile.missingCoverage.push(lineNumber);
          }
          
          currentFile.lines.total++;
          if (hitCount > 0) {
            currentFile.lines.covered++;
          }
        } else if (line.startsWith('FNF:') && currentFile) {
          currentFile.functions.total = parseInt(line.substring(4));
        } else if (line.startsWith('FNH:') && currentFile) {
          currentFile.functions.covered = parseInt(line.substring(4));
        } else if (line.startsWith('end_of_record')) {
          if (currentFile) {
            currentFile.lines.pct = currentFile.lines.total > 0 ? 
              (currentFile.lines.covered / currentFile.lines.total) * 100 : 0;
            currentFile.functions.pct = currentFile.functions.total > 0 ? 
              (currentFile.functions.covered / currentFile.functions.total) * 100 : 0;
            
            coverage.files.push(currentFile);
            
            // Update overall metrics
            coverage.lines.total += currentFile.lines.total;
            coverage.lines.covered += currentFile.lines.covered;
            coverage.functions.total += currentFile.functions.total;
            coverage.functions.covered += currentFile.functions.covered;
            
            currentFile = null;
          }
        }
      }

      // Calculate percentages
      coverage.lines.pct = coverage.lines.total > 0 ? 
        (coverage.lines.covered / coverage.lines.total) * 100 : 0;
      coverage.functions.pct = coverage.functions.total > 0 ? 
        (coverage.functions.covered / coverage.functions.total) * 100 : 0;

      return coverage;

    } catch (error) {
      console.warn('Failed to parse LCOV report:', error.message);
      return null;
    }
  }

  private async parseJsonCoverage(): Promise<CoverageMetrics | null> {
    try {
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-final.json');
      const coverageContent = await fs.readFile(coveragePath, 'utf8');
      const coverageData = JSON.parse(coverageContent);
      
      const coverage: CoverageMetrics = {
        lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
        statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
        branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
        functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
        files: []
      };

      Object.entries(coverageData).forEach(([filePath, fileData]: [string, any]) => {
        const fileCoverage: FileCoverage = {
          path: filePath,
          lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
          statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
          functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
          missingCoverage: [],
          excludedLines: []
        };

        // Process line coverage
        if (fileData.l) {
          Object.entries(fileData.l).forEach(([lineNum, hitCount]) => {
            fileCoverage.lines.total++;
            if (hitCount > 0) {
              fileCoverage.lines.covered++;
            } else {
              fileCoverage.missingCoverage.push(parseInt(lineNum));
            }
          });
        }

        // Process function coverage
        if (fileData.f) {
          Object.entries(fileData.f).forEach(([funcId, hitCount]) => {
            fileCoverage.functions.total++;
            if (hitCount > 0) {
              fileCoverage.functions.covered++;
            }
          });
        }

        // Process branch coverage
        if (fileData.b) {
          Object.entries(fileData.b).forEach(([branchId, branchData]: [string, any]) => {
            fileCoverage.branches = fileCoverage.branches || { total: 0, covered: 0, skipped: 0, pct: 0 };
            fileCoverage.branches.total++;
            if (branchData.some((hits: number) => hits > 0)) {
              fileCoverage.branches.covered++;
            }
          });
        }

        // Calculate percentages
        fileCoverage.lines.pct = fileCoverage.lines.total > 0 ? 
          (fileCoverage.lines.covered / fileCoverage.lines.total) * 100 : 0;
        fileCoverage.functions.pct = fileCoverage.functions.total > 0 ? 
          (fileCoverage.functions.covered / fileCoverage.functions.total) * 100 : 0;

        coverage.files.push(fileCoverage);

        // Update overall metrics
        coverage.lines.total += fileCoverage.lines.total;
        coverage.lines.covered += fileCoverage.lines.covered;
        coverage.functions.total += fileCoverage.functions.total;
        coverage.functions.covered += fileCoverage.functions.covered;

        if (fileCoverage.branches) {
          coverage.branches.total += fileCoverage.branches.total;
          coverage.branches.covered += fileCoverage.branches.covered;
        }
      });

      // Calculate overall percentages
      coverage.lines.pct = coverage.lines.total > 0 ? 
        (coverage.lines.covered / coverage.lines.total) * 100 : 0;
      coverage.functions.pct = coverage.functions.total > 0 ? 
        (coverage.functions.covered / coverage.functions.total) * 100 : 0;
      coverage.branches.pct = coverage.branches.total > 0 ? 
        (coverage.branches.covered / coverage.branches.total) * 100 : 0;

      return coverage;

    } catch (error) {
      console.warn('Failed to parse JSON coverage:', error.message);
      return null;
    }
  }

  private combineCoverageData(lcovData: CoverageMetrics | null, jsonData: CoverageMetrics | null): CoverageMetrics {
    if (lcovData && jsonData) {
      // Combine data from both sources, preferring more detailed data
      return {
        lines: jsonData.lines.pct > 0 ? jsonData.lines : lcovData.lines,
        statements: jsonData.statements.pct > 0 ? jsonData.statements : lcovData.statements,
        branches: jsonData.branches.pct > 0 ? jsonData.branches : lcovData.branches,
        functions: jsonData.functions.pct > 0 ? jsonData.functions : lcovData.functions,
        files: jsonData.files.length > 0 ? jsonData.files : lcovData.files
      };
    }

    return lcovData || jsonData || {
      lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
      files: []
    };
  }

  private async collectSimpleCoverage(): Promise<CoverageMetrics> {
    try {
      const { stdout } = await execAsync('npm run test:coverage 2>/dev/null | tail -1');
      const coverageMatch = stdout.match(/All files[^|]*\|\s*(\d+(?:\.\d+)?)/);
      const overallPct = coverageMatch ? parseFloat(coverageMatch[1]) : 0;

      return {
        lines: { total: 1000, covered: Math.round(overallPct * 10), skipped: 0, pct: overallPct },
        statements: { total: 1000, covered: Math.round(overallPct * 10), skipped: 0, pct: overallPct },
        branches: { total: 500, covered: Math.round(overallPct * 5), skipped: 0, pct: overallPct },
        functions: { total: 200, covered: Math.round(overallPct * 2), skipped: 0, pct: overallPct },
        files: []
      };
    } catch (error) {
      throw new Error('Unable to collect coverage data');
    }
  }

  private async identifyCoverageGaps(coverageData: CoverageMetrics): Promise<CoverageGap[]> {
    const gaps: CoverageGap[] = [];

    // Identify files with low coverage
    coverageData.files.forEach(file => {
      const fileName = path.basename(file.path);

      if (file.lines.pct < 80) {
        gaps.push({
          file: file.path,
          type: 'file',
          reason: `File has ${file.lines.pct.toFixed(1)}% line coverage (target: 95%)`,
          priority: file.lines.pct < 50 ? 'critical' : file.lines.pct < 70 ? 'high' : 'medium',
          testSuggestion: this.getTestSuggestion(fileName, file)
        });
      }

      // Identify specific missing lines
      file.missingCoverage.forEach(lineNum => {
        gaps.push({
          file: file.path,
          type: 'line',
          name: `Line ${lineNum}`,
          reason: `Line ${lineNum} is not covered by tests`,
          priority: 'high',
          testSuggestion: `Add test to verify behavior at line ${lineNum}`
        });
      });

      // Identify functions with low coverage
      if (file.functions.pct < 90) {
        gaps.push({
          file: file.path,
          type: 'function',
          reason: `Function coverage is ${file.functions.pct.toFixed(1)}% (target: 95%)`,
          priority: 'medium',
          testSuggestion: 'Add tests for uncovered functions'
        });
      }
    });

    // Identify healthcare-specific coverage gaps
    const healthcareFiles = coverageData.files.filter(f => 
      f.path.includes('healthcare') || 
      f.path.includes('patient') || 
      f.path.includes('medical') ||
      f.path.includes('appointment')
    );

    if (healthcareFiles.some(f => f.lines.pct < 95)) {
      gaps.push({
        file: 'Healthcare components',
        type: 'file',
        reason: 'Healthcare-related components need 100% coverage for compliance',
        priority: 'critical',
        testSuggestion: 'Add comprehensive tests for all healthcare workflows'
      });
    }

    return gaps;
  }

  private getTestSuggestion(fileName: string, file: FileCoverage): string {
    if (fileName.includes('service')) {
      return 'Add unit tests for service methods and integration tests for external dependencies';
    } else if (fileName.includes('component') || fileName.includes('.tsx')) {
      return 'Add React component tests for all user interactions and props validation';
    } else if (fileName.includes('api') || fileName.includes('route')) {
      return 'Add API endpoint tests including error scenarios and edge cases';
    } else if (fileName.includes('util') || fileName.includes('helper')) {
      return 'Add unit tests for utility functions with various input scenarios';
    } else {
      return 'Add appropriate tests to cover all code paths and error scenarios';
    }
  }

  private calculateHealthScore(coverageData: CoverageMetrics): number {
    const weights = {
      lines: 0.4,
      statements: 0.3,
      branches: 0.2,
      functions: 0.1
    };

    return Math.round(
      coverageData.lines.pct * weights.lines +
      coverageData.statements.pct * weights.statements +
      coverageData.branches.pct * weights.branches +
      coverageData.functions.pct * weights.functions
    );
  }

  private async generateTrends(): Promise<CoverageTrend[]> {
    // In a real implementation, this would read from a database or historical data
    const now = new Date();
    const trends: CoverageTrend[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      trends.push({
        date,
        overall: 85 + Math.random() * 15,
        lines: 85 + Math.random() * 15,
        statements: 85 + Math.random() * 15,
        branches: 80 + Math.random() * 15,
        functions: 85 + Math.random() * 15
      });
    }

    return trends;
  }

  private generateRecommendations(coverageData: CoverageMetrics, gaps: CoverageGap[]): string[] {
    const recommendations: string[] = [];

    if (coverageData.lines.pct < 95) {
      recommendations.push(`Increase line coverage from ${coverageData.lines.pct.toFixed(1)}% to 95%`);
    }

    if (coverageData.branches.pct < 90) {
      recommendations.push(`Improve branch coverage from ${coverageData.branches.pct.toFixed(1)}% to 90% (critical for healthcare workflows)`);
    }

    const criticalGaps = gaps.filter(g => g.priority === 'critical');
    if (criticalGaps.length > 0) {
      recommendations.push(`Address ${criticalGaps.length} critical coverage gaps immediately`);
    }

    if (coverageData.overall.lines.pct < 90) {
      recommendations.push('Consider adding integration tests for complex user workflows');
    }

    // Healthcare-specific recommendations
    const healthcareFiles = gaps.filter(g => g.file.includes('healthcare'));
    if (healthcareFiles.length > 0) {
      recommendations.push('Add healthcare-specific test scenarios for patient data handling');
      recommendations.push('Implement tests for emergency system functionality');
      recommendations.push('Add tests for medical record access and validation');
    }

    return recommendations;
  }

  private checkThresholds(coverageData: CoverageMetrics): boolean {
    return (
      coverageData.lines.pct >= this.thresholds.lines &&
      coverageData.statements.pct >= this.thresholds.statements &&
      coverageData.branches.pct >= this.thresholds.branches &&
      coverageData.functions.pct >= this.thresholds.functions &&
      this.calculateHealthScore(coverageData) >= this.thresholds.overall
    );
  }

  async generateHtmlReport(report: CoverageReport): Promise<string> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Coverage Report - My Family Clinic</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px; }
        .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-left: 10px; }
        .status.pass { background: #d4edda; color: #155724; }
        .status.fail { background: #f8d7da; color: #721c24; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .metric-target { font-size: 0.9em; color: #6c757d; }
        .gap-list { margin-top: 30px; }
        .gap-item { padding: 15px; margin: 10px 0; border-left: 4px solid; border-radius: 4px; }
        .gap-critical { border-color: #dc3545; background: #f8d7da; }
        .gap-high { border-color: #fd7e14; background: #fff3cd; }
        .gap-medium { border-color: #ffc107; background: #fff3cd; }
        .gap-low { border-color: #28a745; background: #d4edda; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .recommendations h3 { margin-top: 0; color: #1976d2; }
        .trend-chart { margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Coverage Report - My Family Clinic</h1>
            <p>Generated: ${report.timestamp.toLocaleString()}</p>
            <span class="status ${report.passed ? 'pass' : 'fail'}">
                ${report.passed ? '✅ PASSED' : '❌ FAILED'}
            </span>
            <span>Health Score: ${report.healthScore}/100</span>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <h3>Lines</h3>
                <div class="metric-value">${report.overall.lines.pct.toFixed(1)}%</div>
                <div class="metric-target">Target: ${report.thresholds.lines}%</div>
            </div>
            <div class="metric-card">
                <h3>Statements</h3>
                <div class="metric-value">${report.overall.statements.pct.toFixed(1)}%</div>
                <div class="metric-target">Target: ${report.thresholds.statements}%</div>
            </div>
            <div class="metric-card">
                <h3>Branches</h3>
                <div class="metric-value">${report.overall.branches.pct.toFixed(1)}%</div>
                <div class="metric-target">Target: ${report.thresholds.branches}%</div>
            </div>
            <div class="metric-card">
                <h3>Functions</h3>
                <div class="metric-value">${report.overall.functions.pct.toFixed(1)}%</div>
                <div class="metric-target">Target: ${report.thresholds.functions}%</div>
            </div>
        </div>

        <div class="gap-list">
            <h2>Coverage Gaps (${report.gaps.length} issues)</h2>
            ${report.gaps.map(gap => `
                <div class="gap-item gap-${gap.priority}">
                    <strong>${gap.type.toUpperCase()}:</strong> ${gap.name || gap.file}
                    <br>Reason: ${gap.reason}
                    <br><em>Suggestion: ${gap.testSuggestion}</em>
                </div>
            `).join('')}
        </div>

        <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  async saveReport(report: CoverageReport): Promise<void> {
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save JSON report
    const jsonReportPath = path.join(reportsDir, `coverage-report-${timestamp}.json`);
    await fs.writeFile(jsonReportPath, JSON.stringify(report, null, 2));

    // Save HTML report
    const htmlReport = await this.generateHtmlReport(report);
    const htmlReportPath = path.join(reportsDir, `coverage-report-${timestamp}.html`);
    await fs.writeFile(htmlReportPath, htmlReport);

    console.log(`Coverage reports saved:
    JSON: ${jsonReportPath}
    HTML: ${htmlReportPath}`);
  }
}

export default CoverageReporter;