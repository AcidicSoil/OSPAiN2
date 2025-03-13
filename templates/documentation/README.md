# Documentation Templates

This directory contains standardized templates for creating documentation in the Ollama Ecosystem project. These templates are organized according to our horizon framework and follow consistent standards to ensure documentation quality and completeness.

## Available Templates

| Template                                        | Description                                                    | Horizon Level | Typical Owner            |
| ----------------------------------------------- | -------------------------------------------------------------- | ------------- | ------------------------ |
| [PRD Template](./prd-template.md)               | Product Requirements Document - Defines what to build and why  | H1, H2        | Product Manager          |
| [TDD Template](./tdd-template.md)               | Technical Design Document - Describes technical implementation | H1            | Engineering Lead         |
| [PHA Template](./pha-template.md)               | Product Hazard Analysis - Identifies risks and mitigations     | H1            | Security/Compliance Team |
| [PHD Template](./phd-template.md)               | Project Handover Document - Facilitates knowledge transfer     | H1            | Engineering Team         |
| [Model Card Template](./model-card-template.md) | Documents model characteristics                                | H1, H2        | ML Engineer              |
| [DFD Template](./dfd-template.md)               | Data Flow Diagram - Maps data movement through system          | H1, H2        | Data Architect           |

**Note**: Currently implemented templates: PRD, TDD, PHA. The remaining templates will be implemented as part of the ongoing documentation standards framework implementation.

## Usage Guidelines

### Document Naming

Use the following naming convention for documentation files:

- `[feature-name]-[doc-type].md`

Examples:

- `task-runner-prd.md`
- `knowledge-graph-tdd.md`
- `ollama-integration-pha.md`

### Document Hierarchy

Follow this hierarchy for organizing documentation:

```
Project Root
├── docs/
│   ├── vision/                # WHY - Purpose and goals
│   │   ├── prd/               # Product Requirements Documents
│   │   └── roadmap/           # Project roadmap
│   ├── specs/                 # WHAT - Specifications
│   │   ├── functional/        # Functional requirements
│   │   └── non-functional/    # Non-functional requirements
│   ├── implementation/        # HOW - Technical details
│   │   ├── tdd/               # Technical Design Documents
│   │   ├── model-cards/       # AI Model documentation
│   │   └── dfd/               # Data Flow Diagrams
│   └── operations/            # WHEN/WHO - Operational details
│       ├── phd/               # Project Handover Documents
│       ├── pha/               # Product Hazard Analysis
│       └── runbooks/          # Operational runbooks
```

### Integration with Development Modes

Each document should indicate the relevant development mode:

- 🎨 Design Mode - Focus on PRDs, wireframes, user flows
- 🔧 Engineering Mode - Focus on TDDs, DFDs, Model Cards
- 🧪 Testing Mode - Focus on test plans derived from PRDs and TDDs
- 📦 Deployment Mode - Focus on PHDs, runbooks
- 🔍 Maintenance Mode - Focus on PHAs, system documentation

### Weekly Documentation Review

As part of our horizon management:

- Monday: Review documentation needs for promoted horizon items
- Friday: Document lessons learned and update relevant documents

## Template Customization

When using these templates:

1. Replace all placeholder text in [brackets]
2. Remove sections that aren't relevant to your specific use case
3. Add additional sections as needed for your specific context
4. Ensure all metadata fields are completed
5. Include relevant diagrams where indicated

## Documentation Quality Checklist

Before considering a document complete, ensure it:

- [ ] Includes all required metadata
- [ ] Has been reviewed by at least one other team member
- [ ] Addresses all sections in the template
- [ ] Includes clear, specific language
- [ ] Links to related documents
- [ ] Is stored in the correct location in the document hierarchy
- [ ] Is written with the target audience in mind

## References

- [Horizon Framework Map](./../@horizon-map.mdc)
- [Master Todo List](./../.cursor/master-todo.md)
