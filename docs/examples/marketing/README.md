# Ollama Ecosystem Report Generation Examples

This directory contains example reports and code snippets that showcase the capabilities of the Ollama Ecosystem Report Generation System. These examples demonstrate how to create both dark and light reports for various use cases.

## Example Reports

### Dark Report Example
[dark-report-example.md](./dark-report-example.md)
- Security assessment report
- Critical infrastructure analysis
- Detailed technical findings
- Risk assessment and mitigation steps

### Light Report Example
[light-report-example.md](./light-report-example.md)
- Sprint progress report
- Project metrics tracking
- Team achievements
- Next steps and action items

## Code Examples

### TypeScript Integration
[showcase.ts](./showcase.ts)
- Complete example of report generation
- Dark and light report creation
- Report formatting and saving
- Error handling and validation

## Key Features Demonstrated

### Dark Reports
- Multiple security levels (restricted, confidential, top-secret)
- Technical vulnerability documentation
- Risk assessment matrices
- Mitigation recommendations
- Evidence-based findings

### Light Reports
- Visibility control (public, internal, team)
- Structured content sections
- Performance metrics tracking
- Action item management
- Progress visualization

## Integration Examples

```typescript
// Initialize report generator
const generator = new StandardReportGenerator('./reports');

// Generate a dark report
const darkReport = await generator.generateReport(ReportType.DARK, {
  title: 'Security Assessment',
  securityLevel: 'confidential',
  // ... other fields
});

// Generate a light report
const lightReport = await generator.generateReport(ReportType.LIGHT, {
  title: 'Sprint Update',
  visibility: 'internal',
  // ... other fields
});

// Save reports
await generator.saveReport(darkReport);
await generator.saveReport(lightReport);
```

## Report Templates

### Dark Report Template
```markdown
# Security Assessment Report

## Metadata
- Type: dark
- Security Level: [restricted|confidential|top-secret]

## Technical Details
- System Access
- Vulnerabilities
- Exploitation Risks
- Mitigation Steps

## Findings
- Severity
- Description
- Evidence
- Recommendations

## Risk Assessment
- Overall Risk
- Impact Analysis
- Probability Matrix
```

### Light Report Template
```markdown
# Project Progress Report

## Metadata
- Type: light
- Visibility: [public|internal|team]

## Sections
- Overview
- Progress Update
- Key Achievements

## Metrics
- Name
- Value
- Target
- Status

## Next Steps
- Action Items
- Assignees
- Due Dates
```

## Usage Guidelines

1. Choose the appropriate report type based on content sensitivity
2. Fill in all required fields for the chosen report type
3. Add relevant tags for better organization
4. Set appropriate horizon and priority levels
5. Include detailed metrics and next steps
6. Save reports in the designated directory

## Best Practices

1. Use clear, descriptive titles
2. Include specific, actionable items
3. Add relevant metrics with targets
4. Set appropriate security/visibility levels
5. Tag reports for easy categorization
6. Update status as reports progress

## Development

To run the showcase example:

```bash
# Build the project
npm run build

# Run the showcase
node dist/examples/marketing/showcase.js
```

## Testing

The examples are covered by comprehensive tests in `models/__tests__/report-generator.test.ts`. Run the tests with:

```bash
npm test
```

## Contributing

Feel free to add more examples or improve existing ones. Please follow these guidelines:

1. Use descriptive names for example files
2. Include comprehensive comments
3. Add test cases for new examples
4. Update this README as needed
5. Follow the established code style

## License

MIT 