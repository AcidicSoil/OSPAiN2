import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    DarkReport,
    LightReport,
    ReportGenerator,
    ReportTemplate,
    ReportType
} from './report-types';

export class StandardReportGenerator implements ReportGenerator {
  private templates: Map<ReportType, ReportTemplate>;
  private outputDir: string;

  constructor(outputDir: string) {
    this.templates = new Map();
    this.outputDir = outputDir;
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Dark report template
    this.templates.set(ReportType.DARK, {
      id: 'dark-report-template',
      type: ReportType.DARK,
      name: 'Dark Report Template',
      description: 'Template for sensitive technical findings and security assessments',
      sections: [
        'Executive Summary',
        'Technical Details',
        'Findings',
        'Risk Assessment',
        'Recommendations'
      ],
      requiredFields: [
        'title',
        'securityLevel',
        'technicalDetails',
        'findings',
        'riskAssessment'
      ],
      optionalFields: ['tags'],
      validationRules: {
        securityLevel: (value) => ['restricted', 'confidential', 'top-secret'].includes(value),
        findings: (value) => Array.isArray(value) && value.length > 0
      }
    });

    // Light report template
    this.templates.set(ReportType.LIGHT, {
      id: 'light-report-template',
      type: ReportType.LIGHT,
      name: 'Light Report Template',
      description: 'Template for general project updates and progress reports',
      sections: [
        'Overview',
        'Progress Update',
        'Metrics',
        'Next Steps',
        'Conclusion'
      ],
      requiredFields: [
        'title',
        'visibility',
        'sections',
        'metrics'
      ],
      optionalFields: ['tags', 'nextSteps'],
      validationRules: {
        visibility: (value) => ['public', 'internal', 'team'].includes(value),
        sections: (value) => Array.isArray(value) && value.length > 0
      }
    });
  }

  async generateReport(type: ReportType, data: any): Promise<DarkReport | LightReport> {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`No template found for report type: ${type}`);
    }

    const baseReport = {
      id: uuidv4(),
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft' as const,
      tags: data.tags || [],
      horizon: data.horizon || 'H1',
      priority: data.priority || 3,
      mode: data.mode || '🔧',
      ...data
    };

    let report: DarkReport | LightReport;

    if (type === ReportType.DARK) {
      report = {
        ...baseReport,
        type: ReportType.DARK,
        securityLevel: data.securityLevel || 'restricted',
        technicalDetails: data.technicalDetails || {
          systemAccess: [],
          vulnerabilities: [],
          exploitationRisks: [],
          mitigationSteps: []
        },
        findings: data.findings || [],
        riskAssessment: data.riskAssessment || {
          overallRisk: 'medium',
          impactAnalysis: '',
          probabilityMatrix: ''
        }
      } as DarkReport;
    } else {
      report = {
        ...baseReport,
        type: ReportType.LIGHT,
        visibility: data.visibility || 'internal',
        sections: data.sections || [],
        metrics: data.metrics || [],
        nextSteps: data.nextSteps || []
      } as LightReport;
    }

    if (!this.validateReport(report)) {
      throw new Error('Generated report failed validation');
    }

    return report;
  }

  validateReport(report: DarkReport | LightReport): boolean {
    const template = this.templates.get(report.type);
    if (!template) {
      return false;
    }

    // Check required fields
    for (const field of template.requiredFields) {
      const value = field in report ? (report as any)[field] : undefined;
      if (value === undefined || value === null) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Apply validation rules
    for (const [field, rule] of Object.entries(template.validationRules)) {
      const value = field in report ? (report as any)[field] : undefined;
      if (!rule(value)) {
        console.error(`Validation failed for field: ${field}`);
        return false;
      }
    }

    return true;
  }

  formatReport(report: DarkReport | LightReport): string {
    const template = this.templates.get(report.type);
    if (!template) {
      throw new Error(`No template found for report type: ${report.type}`);
    }

    let formattedReport = `# ${report.title}\n\n`;
    formattedReport += `## Metadata\n\n`;
    formattedReport += `- Type: ${report.type}\n`;
    formattedReport += `- Created: ${report.createdAt.toISOString()}\n`;
    formattedReport += `- Updated: ${report.updatedAt.toISOString()}\n`;
    formattedReport += `- Status: ${report.status}\n`;
    formattedReport += `- Horizon: ${report.horizon}\n`;
    formattedReport += `- Priority: ${report.priority}\n`;
    formattedReport += `- Mode: ${report.mode}\n\n`;

    if (report.type === ReportType.DARK) {
      const darkReport = report as DarkReport;
      formattedReport += `## Security Level: ${darkReport.securityLevel}\n\n`;
      
      formattedReport += `## Technical Details\n\n`;
      formattedReport += `### System Access\n${darkReport.technicalDetails.systemAccess.join('\n')}\n\n`;
      formattedReport += `### Vulnerabilities\n${darkReport.technicalDetails.vulnerabilities.join('\n')}\n\n`;
      formattedReport += `### Exploitation Risks\n${darkReport.technicalDetails.exploitationRisks.join('\n')}\n\n`;
      formattedReport += `### Mitigation Steps\n${darkReport.technicalDetails.mitigationSteps.join('\n')}\n\n`;

      formattedReport += `## Findings\n\n`;
      darkReport.findings.forEach((finding, index) => {
        formattedReport += `### Finding ${index + 1} (${finding.severity})\n`;
        formattedReport += `${finding.description}\n\n`;
        formattedReport += `**Evidence:** ${finding.evidence}\n\n`;
        formattedReport += `**Recommendations:**\n${finding.recommendations.join('\n')}\n\n`;
      });

      formattedReport += `## Risk Assessment\n\n`;
      formattedReport += `- Overall Risk: ${darkReport.riskAssessment.overallRisk}\n`;
      formattedReport += `- Impact Analysis: ${darkReport.riskAssessment.impactAnalysis}\n`;
      formattedReport += `- Probability Matrix: ${darkReport.riskAssessment.probabilityMatrix}\n`;
    } else {
      const lightReport = report as LightReport;
      formattedReport += `## Visibility: ${lightReport.visibility}\n\n`;

      lightReport.sections.forEach(section => {
        formattedReport += `## ${section.title}\n\n${section.content}\n\n`;
        if (section.subsections) {
          section.subsections.forEach(sub => {
            formattedReport += `### ${sub.title}\n\n${sub.content}\n\n`;
          });
        }
      });

      if (lightReport.metrics.length > 0) {
        formattedReport += `## Metrics\n\n`;
        lightReport.metrics.forEach(metric => {
          formattedReport += `### ${metric.name}\n`;
          formattedReport += `- Value: ${metric.value}\n`;
          if (metric.target) formattedReport += `- Target: ${metric.target}\n`;
          formattedReport += `- Status: ${metric.status}\n\n`;
        });
      }

      if (lightReport.nextSteps.length > 0) {
        formattedReport += `## Next Steps\n\n`;
        lightReport.nextSteps.forEach(step => {
          formattedReport += `- [${step.priority}] ${step.action}`;
          if (step.assignee) formattedReport += ` (Assignee: ${step.assignee})`;
          if (step.dueDate) formattedReport += ` (Due: ${step.dueDate.toISOString()})`;
          formattedReport += '\n';
        });
      }
    }

    return formattedReport;
  }

  async saveReport(report: DarkReport | LightReport): Promise<void> {
    const formattedReport = this.formatReport(report);
    const filename = `${report.type}-${report.id}-${report.createdAt.toISOString().split('T')[0]}.md`;
    const filepath = join(this.outputDir, filename);
    await writeFile(filepath, formattedReport, 'utf-8');
  }
} 