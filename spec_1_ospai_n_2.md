# SPEC-1: OSPAiN2 Ecosystem Architecture

## Background

OSPAiN2 empowers individual developers with a fully local‑first, sovereign AI platform. It addresses key needs in:

- **Security & Privacy:** All data and inference occur locally, eliminating external exposure.
- **Offline Resilience:** The system operates reliably without network connectivity.
- **Cost Savings:** No cloud dependencies reduce ongoing infrastructure expenses.

By combining advanced agentic workflow automation with intelligent task management, OSPAiN2 gives developers complete control over their data and compute environments.

## Requirements

**Must Have (M)**

1. **Offline Model Inference:** Perform AI workloads without network access.
2. **Agentic Workflow & Task Orchestration:** End‑to‑end task lifecycle management.
3. **Windows Compatibility:** Native support and installer for Windows.

**Should Have (S)**

- Local storage encryption to protect user data.
- Modular design for easy extension and customization.
- Both CLI and web‑based frontend interfaces.

**Could Have (C)**

- Cross‑platform support (macOS, Linux).
- Progressive Web App (PWA) features with offline caching.
- AI‑assisted note‑taking, tagging, and horizon planning.

**Won’t Have (W)**

- Reliance on cloud‑hosted models or external APIs.
- Real‑time multi‑user collaborative editing.

## Method

### 1. Frontend: OSPAiN2‑Hub

Imported from `` and ``:

- **Overview:** A Vite/React/TypeScript/Tailwind CSS web UI with PWA support for offline use.
- **Directory Structure:**
  ```
  /src
    /components   # Atomic-design UI components
    /pages        # Vite routing entry points
    /stores       # Zustand state stores (tasks, UI, models)
    /services     # API integration (REST, WebSocket)
    /styles       # Tailwind config and global styles
  ```
- **Patterns & Tools:**
  - Atomic Design and container/presentational separation
  - Framer Motion for interactive animations
  - Middlewares for IndexedDB persistence and logging
  - WebSocket hooks for real‑time task updates

### 2. Core Architecture

```plantuml
@startuml
package "Frontend" {
  [Web UI]
}
package "Services" {
  [Task Orchestrator]
  [Model Registry]
  [MCP Servers]
}
package "Execution" {
  [Worker Pool]
  [Docker Runtime]
}
package "Storage" {
  [SQLite DB]
  [Model Cache]
}

Web UI --> Task Orchestrator : Submit Task
Task Orchestrator --> SQLite DB : Enqueue Job
Task Orchestrator --> Model Registry : Request Model
Model Registry --> Model Cache : Provide Artifact
Task Orchestrator --> Docker Runtime : Launch Worker
Worker Pool --> SQLite DB : Persist Results
Task Orchestrator --> Web UI : Notify Completion
@enduml
```

### 3. Database Schema

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  payload JSON NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE models (
  name TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  artifact_ref TEXT NOT NULL,
  loaded_at DATETIME
);
```

### 4. Task Orchestration

- **Queue:** SQLite‑backed persistent queue (using `better-queue-sqlite`).
- **Scheduler:** Polls the queue, loads the appropriate model, and dispatches jobs to workers.
- **Workers:** Dockerized Node.js processes running `node-llama-cpp` for inference.

### 5. Model Management

- **Registry Service:** Lightweight Node.js service with SQLite (or Postgres) storing model metadata and artifacts. Exposes HTTP endpoints for upload, listing, and download.
- **Artifact Storage:** Models stored as checkpoints (PyTorch, ONNX) with semantic versioning and metadata (tags, benchmarks).
- **Runtime Caching:** The orchestrator’s Model Manager retrieves and caches artifacts on the local filesystem.

### 6. Communication Patterns

- **Registry API:** REST endpoints under `/models` for CRUD operations and `/models/{name}/versions/{ver}/download` for artifact retrieval.
- **Orchestrator API:** Express-based REST endpoints for job submission, status checks, and model queries.
- **Frontend Integration:** React WebSocket hook for live progress and registry status updates.

### 7. Execution Algorithm

1. **Task Submission:** Frontend sends `POST /api/tasks` with payload and model name.
2. **Enqueue:** Orchestrator inserts a new record in `tasks`.
3. **Scheduling:** Scheduler dequeues the job and notes the start time.
4. **Model Retrieval:** Model Manager checks cache or downloads via Registry API.
5. **Worker Launch:** Docker runtime spawns a worker container for inference.
6. **Inference:** Worker runs the model, streams results via IPC.
7. **Completion:** Orchestrator updates task status and timestamps.
8. **Notification:** WebSocket event informs the frontend of the outcome.

This approach ensures isolation (via Docker), lightweight persistence, and modular scalability.

## Implementation

**Documentation Sources:**

- `templates/documentation/README.md` — Standard templates, naming conventions, and mode integrations.
- `docs/frontend/frontend-implementation-plan.md` — Phased frontend implementation plan and tracking.

1. **Environment Setup**

   - Install Node.js and Docker Desktop on Windows.
   - Clone the repository and run `npm install` in `/hub-frontend`, `/core-services`, and `/registry-service`.

2. **Model Registry Deployment**

   - Enter `/registry-service`, configure `.env.windows` for SQLite or Postgres.
   - Run `npm start`, exposing the API on port 3100.
   - Optionally, register as a Windows service for auto‑start.

3. **Model Preparation**

   - Use the CLI: `npm run cli -- upload-model --name qwen_qwq --version latest --path ./models/qwen_qwq.ckpt`.
   - Verify via `GET /models/qwen_qwq`.

4. **Frontend Build & Packaging**

   - Run `npm build` in `/hub-frontend`.
   - Use `electron-builder` to create a Windows PWA installer.

5. **Backend Service Deployment**

   - Configure `.env.windows` for the Task Orchestrator and MCP servers.
   - Run `npm run dev` for core services.

6. **Worker Pool Configuration**

   - Build the Docker image integrating `node-llama-cpp`.
   - Launch with `docker-compose up --scale worker=4`.

7. **Installer & CI/CD**

   - Incorporate `electron-builder` into GitHub Actions.
   - Follow release naming and tagging guidelines from the documentation.

*All steps are tailored to OSPAiN2’s MVP goals and Windows‑first deployment.*

## Gathering Results

- **Requirement Validation:** Confirm offline inference, workflow orchestration, and Windows compatibility through end‑to‑end tests.
- **Performance Metrics:** Measure inference latency, job throughput, and resource utilization.
- **User Feedback:** Survey developers on usability, reliability, and setup experience.

---

Need professional help? Reach out at [sammuti.com](https://sammuti.com) 🙂

