/// <reference types="jest" />

import { beforeAll, describe, expect, it } from '@jest/globals';
import { mkdtemp, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { StandardReportGenerator } from '../report-generator';
import { DarkReport, LightReport, ReportType } from '../report-types';

describe('StandardReportGenerator', () => {
  let generator: StandardReportGenerator;
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'report-test-'));
    generator = new StandardReportGenerator(tempDir);
  });

  describe('Dark Report Generation', () => {
    it('should generate a valid dark report with all fields', async () => {
      const darkReportData = {
        title: 'Security Assessment Report',
        createdBy: 'security-agent',
        securityLevel: 'confidential',
        technicalDetails: {
          systemAccess: ['Root access detected on system A'],
          vulnerabilities: ['CVE-2024-1234: Critical SQL injection vulnerability'],
          exploitationRisks: ['Remote code execution possible'],
          mitigationSteps: ['Update database to version 5.0.8']
        },
        findings: [
          {
            severity: 'critical',
            description: 'Unauthorized access vulnerability in API endpoint',
            evidence: 'Successful exploitation demonstrated in test environment',
            recommendations: ['Implement rate limiting', 'Add request validation']
          }
        ],
        riskAssessment: {
          overallRisk: 'high',
          impactAnalysis: 'Critical business impact if exploited',
          probabilityMatrix: 'High likelihood of exploitation'
        },
        tags: ['security', 'critical'],
        horizon: 'H1' as const,
        priority: 1,
        mode: '🔧' as const
      };

      const report = await generator.generateReport(ReportType.DARK, darkReportData) as DarkReport;
      
      // Test basic fields
      expect(report.type).toBe(ReportType.DARK);
      expect(report.title).toBe(darkReportData.title);
      expect(report.createdBy).toBe(darkReportData.createdBy);
      expect(report.tags).toEqual(darkReportData.tags);
      expect(report.horizon).toBe(darkReportData.horizon);
      expect(report.priority).toBe(darkReportData.priority);
      expect(report.mode).toBe(darkReportData.mode);
      
      // Test security-specific fields
      expect(report.securityLevel).toBe(darkReportData.securityLevel);
      expect(report.technicalDetails).toEqual(darkReportData.technicalDetails);
      expect(report.findings).toHaveLength(1);
      expect(report.findings[0].severity).toBe('critical');
      expect(report.riskAssessment.overallRisk).toBe('high');

      // Test dates
      expect(report.createdAt).toBeInstanceOf(Date);
      expect(report.updatedAt).toBeInstanceOf(Date);

      // Test report formatting
      const formatted = generator.formatReport(report);
      expect(formatted).toContain('Security Assessment Report');
      expect(formatted).toContain('Security Level: confidential');
      expect(formatted).toContain('CVE-2024-1234');
      expect(formatted).toContain('Root access detected');
      expect(formatted).toContain('Critical business impact');

      // Test report saving
      await generator.saveReport(report);
      const savedContent = await readFile(
        join(tempDir, `dark-${report.id}-${report.createdAt.toISOString().split('T')[0]}.md`),
        'utf-8'
      );
      expect(savedContent).toBe(formatted);
    });

    it('should validate dark report security levels', async () => {
      const invalidSecurityLevel = {
        title: 'Invalid Report',
        createdBy: 'security-agent',
        securityLevel: 'invalid-level'
      };

      await expect(generator.generateReport(ReportType.DARK, invalidSecurityLevel))
        .rejects
        .toThrow('Generated report failed validation');
    });

    it('should require at least one finding for dark reports', async () => {
      const noFindings = {
        title: 'Invalid Report',
        createdBy: 'security-agent',
        securityLevel: 'confidential',
        findings: []
      };

      await expect(generator.generateReport(ReportType.DARK, noFindings))
        .rejects
        .toThrow('Generated report failed validation');
    });
  });

  describe('Light Report Generation', () => {
    it('should generate a valid light report with all fields', async () => {
      const lightReportData = {
        title: 'Sprint Progress Report',
        createdBy: 'project-manager',
        visibility: 'internal',
        sections: [
          {
            title: 'Sprint Overview',
            content: 'Completed 15 out of 20 planned stories',
            subsections: [
              {
                title: 'Key Achievements',
                content: 'Successfully deployed new authentication system'
              }
            ]
          }
        ],
        metrics: [
          {
            name: 'Sprint Velocity',
            value: 45,
            target: 50,
            status: 'warning'
          },
          {
            name: 'Code Coverage',
            value: '87%',
            target: '85%',
            status: 'success'
          }
        ],
        nextSteps: [
          {
            action: 'Complete remaining stories',
            assignee: 'dev-team',
            dueDate: new Date('2024-03-20'),
            priority: 'high'
          }
        ],
        tags: ['sprint', 'progress'],
        horizon: 'H2' as const,
        priority: 2,
        mode: '📦' as const
      };

      const report = await generator.generateReport(ReportType.LIGHT, lightReportData) as LightReport;
      
      // Test basic fields
      expect(report.type).toBe(ReportType.LIGHT);
      expect(report.title).toBe(lightReportData.title);
      expect(report.createdBy).toBe(lightReportData.createdBy);
      expect(report.tags).toEqual(lightReportData.tags);
      expect(report.horizon).toBe(lightReportData.horizon);
      expect(report.priority).toBe(lightReportData.priority);
      expect(report.mode).toBe(lightReportData.mode);
      
      // Test light-specific fields
      expect(report.visibility).toBe(lightReportData.visibility);
      expect(report.sections).toHaveLength(1);
      expect(report.sections[0].subsections).toHaveLength(1);
      expect(report.metrics).toHaveLength(2);
      expect(report.nextSteps).toHaveLength(1);

      // Test dates
      expect(report.createdAt).toBeInstanceOf(Date);
      expect(report.updatedAt).toBeInstanceOf(Date);

      // Test report formatting
      const formatted = generator.formatReport(report);
      expect(formatted).toContain('Sprint Progress Report');
      expect(formatted).toContain('Visibility: internal');
      expect(formatted).toContain('Sprint Overview');
      expect(formatted).toContain('Sprint Velocity');
      expect(formatted).toContain('Code Coverage');

      // Test report saving
      await generator.saveReport(report);
      const savedContent = await readFile(
        join(tempDir, `light-${report.id}-${report.createdAt.toISOString().split('T')[0]}.md`),
        'utf-8'
      );
      expect(savedContent).toBe(formatted);
    });

    it('should validate light report visibility levels', async () => {
      const invalidVisibility = {
        title: 'Invalid Report',
        createdBy: 'project-manager',
        visibility: 'invalid-level'
      };

      await expect(generator.generateReport(ReportType.LIGHT, invalidVisibility))
        .rejects
        .toThrow('Generated report failed validation');
    });

    it('should require at least one section for light reports', async () => {
      const noSections = {
        title: 'Invalid Report',
        createdBy: 'project-manager',
        visibility: 'internal',
        sections: []
      };

      await expect(generator.generateReport(ReportType.LIGHT, noSections))
        .rejects
        .toThrow('Generated report failed validation');
    });
  });

  describe('Report Generator Utilities', () => {
    it('should generate unique IDs for each report', async () => {
      const baseReport = {
        title: 'Test Report',
        createdBy: 'test-user'
      };

      const report1 = await generator.generateReport(ReportType.LIGHT, baseReport);
      const report2 = await generator.generateReport(ReportType.LIGHT, baseReport);

      expect(report1.id).not.toBe(report2.id);
    });

    it('should update timestamps correctly', async () => {
      const report = await generator.generateReport(ReportType.LIGHT, {
        title: 'Timestamp Test',
        createdBy: 'test-user',
        visibility: 'internal',
        sections: [{ title: 'Test', content: 'Content' }]
      });

      expect(report.createdAt).toBeInstanceOf(Date);
      expect(report.updatedAt).toBeInstanceOf(Date);
      expect(report.createdAt.getTime()).toBeLessThanOrEqual(report.updatedAt.getTime());
    });
  });
}); 