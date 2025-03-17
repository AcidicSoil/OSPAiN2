
export enum ReportType {
  DARK = 'dark',
  LIGHT = 'light'
}

export interface BaseReport {
  id: string;
  type: ReportType;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'complete';
  tags: string[];
  horizon: 'H1' | 'H2' | 'H3';
  priority: 1 | 2 | 3 | 4 | 5;
  mode: '🎨' | '🔧' | '🧪' | '📦' | '🔍';
}

export interface DarkReport extends BaseReport {
  type: ReportType.DARK;
  securityLevel: 'restricted' | 'confidential' | 'top-secret';
  technicalDetails: {
    systemAccess: string[];
    vulnerabilities: string[];
    exploitationRisks: string[];
    mitigationSteps: string[];
  };
  findings: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    evidence: string;
    recommendations: string[];
  }[];
  riskAssessment: {
    overallRisk: 'critical' | 'high' | 'medium' | 'low';
    impactAnalysis: string;
    probabilityMatrix: string;
  };
}

export interface LightReport extends BaseReport {
  type: ReportType.LIGHT;
  visibility: 'public' | 'internal' | 'team';
  sections: {
    title: string;
    content: string;
    subsections?: {
      title: string;
      content: string;
    }[];
  }[];
  metrics: {
    name: string;
    value: number | string;
    target?: number | string;
    status: 'success' | 'warning' | 'error';
  }[];
  nextSteps: {
    action: string;
    assignee?: string;
    dueDate?: Date;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export interface ReportGenerator {
  generateReport(type: ReportType, data: any): Promise<DarkReport | LightReport>;
  validateReport(report: DarkReport | LightReport): boolean;
  formatReport(report: DarkReport | LightReport): string;
  saveReport(report: DarkReport | LightReport): Promise<void>;
}

export interface ReportTemplate {
  id: string;
  type: ReportType;
  name: string;
  description: string;
  sections: string[];
  requiredFields: string[];
  optionalFields: string[];
  validationRules: Record<string, (value: any) => boolean>;
} 