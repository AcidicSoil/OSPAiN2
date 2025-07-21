import { StandardReportGenerator } from '../../models/report-generator';
import { DarkReport, LightReport, ReportType } from '../../models/report-types';

async function showcaseReportGeneration(): Promise<void> {
  // Initialize the report generator
  const generator = new StandardReportGenerator('./reports');

  // Generate a dark report for security assessment
  const darkReport = await generator.generateReport(ReportType.DARK, {
    title: 'Security Assessment Report',
    createdBy: 'security-team',
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
    }
  }) as DarkReport;

  // Generate a light report for project progress
  const lightReport = await generator.generateReport(ReportType.LIGHT, {
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
      }
    ],
    nextSteps: [
      {
        action: 'Complete remaining stories',
        assignee: 'dev-team',
        dueDate: new Date('2024-03-20'),
        priority: 'high'
      }
    ]
  }) as LightReport;

  // Save the reports
  await generator.saveReport(darkReport);
  await generator.saveReport(lightReport);

  // Format reports for display
  const formattedDarkReport = generator.formatReport(darkReport);
  const formattedLightReport = generator.formatReport(lightReport);

  console.log('Dark Report Example:');
  console.log(formattedDarkReport);
  console.log('\nLight Report Example:');
  console.log(formattedLightReport);
}

// Run the showcase
showcaseReportGeneration().catch(console.error); 