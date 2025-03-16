# Nightly Question Collection Framework

## Overview

The Nightly Question Collection Framework is a systematic process for gathering, organizing, and addressing questions that arise during daily development. This framework ensures that important questions are documented, addressed by expert resources, and the resulting knowledge is integrated back into the project.

## Process Flow

1. **Collection Phase (End of Day)**

   - Developers flag questions in code or documentation with `// QUESTION: [question text]`
   - Questions are also collected from project discussions, issues, and roadblocks
   - The collection system scans repositories for question markers
   - Questions are consolidated into a central question database

2. **Organization Phase (Automated)**

   - Questions are categorized by topic, priority, and impact
   - Duplicate or similar questions are merged
   - Related questions are grouped into knowledge clusters
   - Context is added to each question (code references, related discussions)

3. **Research Phase (Overnight)**

   - Questions are submitted to expert resources
   - External research is conducted on complex topics
   - Answers are formulated with references and supporting evidence
   - Solutions and implementation suggestions are provided

4. **Integration Phase (Morning)**

   - Answers are reviewed by the team
   - Knowledge is integrated into documentation, code comments, or implementation
   - Question status is updated in the tracking system
   - Implementation tasks are created for actionable items

5. **Tracking Phase (Ongoing)**
   - Question/answer pairs are stored in the knowledge base
   - Implementation of answers is tracked
   - Effectiveness of solutions is measured
   - Knowledge gaps are identified for further research

## Implementation Details

### Question Collection Tool

```typescript
// QuestionCollector.ts
import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

interface QuestionEntry {
  id: string;
  text: string;
  location: string;
  context: string;
  timestamp: Date;
  status: "pending" | "submitted" | "answered" | "implemented";
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
}

export class QuestionCollector {
  private questionDb: Map<string, QuestionEntry> = new Map();
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.loadQuestions();
  }

  public collectQuestionsFromCodebase(rootPath: string): void {
    const files = glob.sync("**/*.{ts,tsx,js,jsx,md}", { cwd: rootPath });

    for (const file of files) {
      const fullPath = path.join(rootPath, file);
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/\/\/\s*QUESTION:\s*(.+)$/);

        if (match) {
          const questionText = match[1].trim();
          const context = this.extractContext(lines, i);

          this.addQuestion({
            id: this.generateId(),
            text: questionText,
            location: `${file}:${i + 1}`,
            context,
            timestamp: new Date(),
            status: "pending",
            priority: this.estimatePriority(questionText, context),
            tags: this.extractTags(questionText, context),
          });
        }
      }
    }

    this.saveQuestions();
  }

  private generateId(): string {
    return `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  private extractContext(lines: string[], questionLineIdx: number): string {
    const startLine = Math.max(0, questionLineIdx - 5);
    const endLine = Math.min(lines.length - 1, questionLineIdx + 5);

    return lines.slice(startLine, endLine + 1).join("\n");
  }

  private estimatePriority(
    questionText: string,
    context: string
  ): "low" | "medium" | "high" | "critical" {
    // Simple heuristic based on keywords
    if (/critical|urgent|blocking|crash|fail/i.test(questionText)) {
      return "critical";
    } else if (/important|significant|performance/i.test(questionText)) {
      return "high";
    } else if (/should|better|improve/i.test(questionText)) {
      return "medium";
    } else {
      return "low";
    }
  }

  private extractTags(questionText: string, context: string): string[] {
    const tags: string[] = [];

    // Extract hashtags
    const hashtagRegex = /#([a-zA-Z0-9]+)/g;
    let match;

    while ((match = hashtagRegex.exec(questionText)) !== null) {
      tags.push(match[1].toLowerCase());
    }

    // Add technology tags based on context
    if (/react|component|jsx|tsx|hook/i.test(context)) tags.push("react");
    if (/api|endpoint|request|fetch|axios/i.test(context)) tags.push("api");
    if (/database|query|model|schema/i.test(context)) tags.push("database");
    if (/style|css|layout|ui|ux/i.test(context)) tags.push("ui");
    if (/test|jest|enzyme|testing|spec/i.test(context)) tags.push("testing");
    if (/performance|optimize|slow|fast/i.test(context))
      tags.push("performance");

    return [...new Set(tags)]; // Remove duplicates
  }

  public addQuestion(question: QuestionEntry): void {
    this.questionDb.set(question.id, question);
  }

  public getQuestions(): QuestionEntry[] {
    return Array.from(this.questionDb.values());
  }

  public getPendingQuestions(): QuestionEntry[] {
    return this.getQuestions().filter((q) => q.status === "pending");
  }

  private loadQuestions(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, "utf-8");
        const questions = JSON.parse(data);

        for (const q of questions) {
          this.questionDb.set(q.id, {
            ...q,
            timestamp: new Date(q.timestamp),
          });
        }
      }
    } catch (err) {
      console.error("Error loading questions:", err);
    }
  }

  private saveQuestions(): void {
    try {
      const data = JSON.stringify(
        Array.from(this.questionDb.values()),
        null,
        2
      );
      fs.writeFileSync(this.dbPath, data, "utf-8");
    } catch (err) {
      console.error("Error saving questions:", err);
    }
  }
}
```

### Integration with Task System

The Question Collection Framework integrates with the existing TaskQueue system:

```typescript
// QuestionTaskIntegration.ts
import { TaskQueue } from "../services/TaskQueue";
import { TaskType, TaskPriority } from "../types/Task";
import { QuestionCollector } from "./QuestionCollector";

export class QuestionTaskIntegration {
  private taskQueue: TaskQueue;
  private questionCollector: QuestionCollector;

  constructor(taskQueue: TaskQueue, questionCollector: QuestionCollector) {
    this.taskQueue = taskQueue;
    this.questionCollector = questionCollector;
  }

  public async scheduleNightlyCollection(): Promise<string> {
    return await this.taskQueue.addTask({
      type: TaskType.CUSTOM,
      priority: TaskPriority.LOW,
      data: {
        customType: "question_collection",
        action: "collect",
      },
      tags: ["question", "nightly", "automated"],
      maxAttempts: 3,
    }).id;
  }

  public async scheduleQuestionResearch(): Promise<string> {
    const pendingQuestions = this.questionCollector.getPendingQuestions();

    if (pendingQuestions.length === 0) {
      console.log("No pending questions to research");
      return "";
    }

    return await this.taskQueue.addTask({
      type: TaskType.CUSTOM,
      priority: TaskPriority.MEDIUM,
      data: {
        customType: "question_research",
        action: "research",
        questions: pendingQuestions.map((q) => ({
          id: q.id,
          text: q.text,
          context: q.context,
          priority: q.priority,
          tags: q.tags,
        })),
      },
      tags: ["question", "research", "automated"],
      maxAttempts: 1,
    }).id;
  }

  public async scheduleAnswerIntegration(
    researchTaskId: string
  ): Promise<string> {
    return await this.taskQueue.addTask({
      type: TaskType.CUSTOM,
      priority: TaskPriority.MEDIUM,
      data: {
        customType: "question_integration",
        action: "integrate",
        researchTaskId,
      },
      tags: ["question", "integration", "automated"],
      maxAttempts: 2,
      dependencies: [researchTaskId],
    }).id;
  }
}
```

## User Interface

### Question Dashboard

The Question Dashboard provides a centralized view of all questions, their status, and answers:

```tsx
// QuestionDashboard.tsx
import React, { useState, useEffect } from "react";
import { Typography, Table, Tag, Space, Button, Input, Select } from "antd";
import { QuestionCollector } from "../utils/QuestionCollector";
import { QuestionTaskIntegration } from "../utils/QuestionTaskIntegration";

const { Search } = Input;
const { Option } = Select;

interface QuestionDashboardProps {
  questionCollector: QuestionCollector;
  taskIntegration: QuestionTaskIntegration;
}

export const QuestionDashboard: React.FC<QuestionDashboardProps> = ({
  questionCollector,
  taskIntegration,
}) => {
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionEntry[]>(
    []
  );
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    const allQuestions = questionCollector.getQuestions();
    setQuestions(allQuestions);
    applyFilters(allQuestions, searchText, statusFilter);
  };

  const applyFilters = (
    questionList: QuestionEntry[],
    search: string,
    statuses: string[]
  ) => {
    let result = questionList;

    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.text.toLowerCase().includes(lowerSearch) ||
          q.context.toLowerCase().includes(lowerSearch) ||
          q.tags.some((t) => t.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply status filter
    if (statuses.length > 0) {
      result = result.filter((q) => statuses.includes(q.status));
    }

    setFilteredQuestions(result);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(questions, value, statusFilter);
  };

  const handleStatusFilterChange = (value: string[]) => {
    setStatusFilter(value);
    applyFilters(questions, searchText, value);
  };

  const handleRunNightlyCollection = async () => {
    await taskIntegration.scheduleNightlyCollection();
    // Show notification of success
  };

  const columns = [
    {
      title: "Question",
      dataIndex: "text",
      key: "text",
      render: (text: string, record: QuestionEntry) => (
        <div>
          <div>
            <strong>{text}</strong>
          </div>
          <div className="question-location">{record.location}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "pending"
            ? "gold"
            : status === "submitted"
            ? "blue"
            : status === "answered"
            ? "green"
            : status === "implemented"
            ? "purple"
            : "default";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => {
        const color =
          priority === "critical"
            ? "red"
            : priority === "high"
            ? "orange"
            : priority === "medium"
            ? "blue"
            : "green";

        return <Tag color={color}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: string[]) => (
        <span>
          {tags.map((tag) => (
            <Tag color="geekblue" key={tag}>
              {tag}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, record: QuestionEntry) => (
        <Space size="small">
          <Button size="small">View</Button>
          {record.status === "answered" && (
            <Button size="small" type="primary">
              Implement
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="question-dashboard">
      <div className="dashboard-header">
        <Typography.Title level={3}>
          Question Collection Dashboard
        </Typography.Title>
        <Button type="primary" onClick={handleRunNightlyCollection}>
          Run Collection Now
        </Button>
      </div>

      <div className="filters">
        <Search
          placeholder="Search questions..."
          onSearch={handleSearch}
          style={{ width: 300, marginRight: 16 }}
        />
        <Select
          mode="multiple"
          placeholder="Filter by status"
          onChange={handleStatusFilterChange}
          style={{ width: 300 }}
        >
          <Option value="pending">Pending</Option>
          <Option value="submitted">Submitted</Option>
          <Option value="answered">Answered</Option>
          <Option value="implemented">Implemented</Option>
        </Select>
      </div>

      <Table
        dataSource={filteredQuestions}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
```

## Automation Script

A cron job or scheduled task will run the collection process every night:

```typescript
// nightly-collection.ts
import { QuestionCollector } from "./utils/QuestionCollector";
import { QuestionTaskIntegration } from "./utils/QuestionTaskIntegration";
import { TaskQueue } from "./services/TaskQueue";
import * as path from "path";
import * as fs from "fs";

async function runNightlyCollection() {
  console.log("Starting nightly question collection...");

  const dbPath = path.join(__dirname, "../data/questions.json");
  const rootPath = path.join(__dirname, "../");

  // Ensure the data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const taskQueue = TaskQueue.getInstance();
  const questionCollector = new QuestionCollector(dbPath);
  const taskIntegration = new QuestionTaskIntegration(
    taskQueue,
    questionCollector
  );

  // Collect questions from codebase
  console.log("Scanning codebase for questions...");
  questionCollector.collectQuestionsFromCodebase(rootPath);

  // Schedule research task
  console.log("Scheduling research for questions...");
  const researchTaskId = await taskIntegration.scheduleQuestionResearch();

  if (researchTaskId) {
    console.log(`Research task scheduled: ${researchTaskId}`);

    // Schedule integration task (to run after research)
    console.log("Scheduling answer integration...");
    const integrationTaskId = await taskIntegration.scheduleAnswerIntegration(
      researchTaskId
    );
    console.log(`Integration task scheduled: ${integrationTaskId}`);
  } else {
    console.log("No questions to research");
  }

  console.log("Nightly collection completed");
}

// Run the script
runNightlyCollection().catch((err) => {
  console.error("Error during nightly collection:", err);
  process.exit(1);
});
```

## Best Practices for Question Formatting

When adding questions to code or documentation, follow these guidelines:

1. **Use the standard format**: `// QUESTION: [question text]`
2. **Be specific**: Include enough context for someone else to understand
3. **Add priority markers**: Use `#critical`, `#high`, `#medium`, or `#low` to indicate priority
4. **Add topic tags**: Use hashtags like `#performance` or `#security` to categorize
5. **Reference related code**: Mention file names, functions, or components
6. **Suggest potential solutions**: If you have ideas, include them with the question

Example:

```typescript
// QUESTION: Should we implement lazy loading for these components? #performance #medium
// The initial load time is currently over 2s which exceeds our target.
// Possible solutions: React.lazy() or a custom dynamic import wrapper.
```

## Transition to Researcher Section

This framework is a temporary solution until the dedicated researcher section is implemented. The transition plan includes:

1. Export all collected question/answer pairs to the new system
2. Train the researcher section using historical data
3. Phase out the nightly collection with a gradual handover
4. Maintain the question format for backward compatibility

## Metrics and Evaluation

The success of the Nightly Question Collection Framework is measured by:

- **Throughput**: Number of questions processed per week
- **Time to Answer**: Average duration between question collection and answer
- **Implementation Rate**: Percentage of answers actually implemented
- **Knowledge Reuse**: Frequency of referencing existing answers
- **Question Reduction**: Decrease in similar questions over time

## Conclusion

By systematically collecting and addressing questions that arise during development, we ensure that knowledge gaps are filled efficiently. This process enhances team knowledge, reduces duplication of research, and improves the overall quality of the codebase through expert insights.
