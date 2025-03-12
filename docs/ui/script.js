// Initialize Mermaid
document.addEventListener('DOMContentLoaded', function () {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis'
    }
  });

  // Initialize UI events
  initializeUI();

  // Setup brainstorming interface
  setupBrainstormingMode();

  // Setup design mode interface
  setupDesignMode();

  // Check URL parameters for mode
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  if (mode === 'brainstorm') {
    // Automatically start brainstorming mode
    setTimeout(function () {
      activateBrainstormMode();

      // If template parameter provided, load that template
      const template = urlParams.get('template');
      if (template) {
        setTimeout(function () {
          loadTemplate(template);
        }, 500);
      }
    }, 500);
  } else if (mode === 'design') {
    // Automatically start design mode
    setTimeout(function () {
      activateDesignMode();
    }, 500);
  }
});

// Handle UI interactions
function initializeUI() {
  // Diagram navigation
  document.querySelectorAll('[data-diagram]').forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const diagramId = this.getAttribute('data-diagram');
      showDiagram(diagramId);

      // Update active state
      document.querySelectorAll('.nav-link').forEach((navLink) => {
        navLink.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // Section navigation
  document.querySelectorAll('[data-section]').forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute('data-section');
      showSection(sectionId);

      // Update active state
      document.querySelectorAll('.nav-link').forEach((navLink) => {
        navLink.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // Theme toggling
  document.getElementById('theme-toggle').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    updateMermaidTheme();
  });

  // Zoom controls
  document.getElementById('zoom-in').addEventListener('click', function (e) {
    e.preventDefault();
    zoomDiagram(1.2);
  });

  document.getElementById('zoom-out').addEventListener('click', function (e) {
    e.preventDefault();
    zoomDiagram(0.8);
  });

  document.getElementById('reset-zoom').addEventListener('click', function (e) {
    e.preventDefault();
    resetZoom();
  });

  // Download SVG
  document.getElementById('download-svg').addEventListener('click', function (e) {
    e.preventDefault();
    downloadCurrentDiagram();
  });
}

// Show the specified diagram
function showDiagram(diagramId) {
  // Hide all diagrams
  document.querySelectorAll('.mermaid').forEach((diagram) => {
    diagram.classList.add('d-none');
  });

  // Hide integration points section
  document.getElementById('integration-points').classList.add('d-none');

  // Hide brainstorming panel if visible
  const brainstormPanel = document.getElementById('brainstorm-panel');
  if (brainstormPanel) {
    brainstormPanel.classList.add('d-none');
  }

  // Show the selected diagram
  const selectedDiagram = document.getElementById(diagramId);
  if (selectedDiagram) {
    selectedDiagram.classList.remove('d-none');

    // Update the title
    updateTitle(diagramId);

    // Update the description
    updateDescription(diagramId);
  }
}

// Show the specified section
function showSection(sectionId) {
  // Hide all diagrams
  document.querySelectorAll('.mermaid').forEach((diagram) => {
    diagram.classList.add('d-none');
  });

  // Hide integration points section
  document.getElementById('integration-points').classList.add('d-none');

  // Hide brainstorming panel if visible
  const brainstormPanel = document.getElementById('brainstorm-panel');
  if (brainstormPanel) {
    brainstormPanel.classList.add('d-none');
  }

  // Show the selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.remove('d-none');

    // Update the title
    updateTitle(sectionId);

    // Update the description
    updateDescription(sectionId);
  }
}

// Update the page title based on the selected diagram/section
function updateTitle(id) {
  const titleElement = document.getElementById('diagram-title');

  switch (id) {
    case 'system-architecture':
      titleElement.textContent = 'System Architecture Overview';
      break;
    case 'ollamavoice-architecture':
      titleElement.textContent = 'OllamaVoice Architecture';
      break;
    case 'ollamahomecontrol-architecture':
      titleElement.textContent = 'OllamaHomeControl Architecture';
      break;
    case 'ollamahub-architecture':
      titleElement.textContent = 'OllamaHub Architecture';
      break;
    case 'data-flow':
      titleElement.textContent = 'Data Flow Diagram';
      break;
    case 'resource-management':
      titleElement.textContent = 'Resource Management Architecture';
      break;
    case 'mobile-client':
      titleElement.textContent = 'Mobile Client Architecture';
      break;
    case 'physical-deployment':
      titleElement.textContent = 'Physical Deployment Architecture';
      break;
    case 'development-environment':
      titleElement.textContent = 'Development Environment Architecture';
      break;
    case 'integration-points':
      titleElement.textContent = 'Integration Points Specification';
      break;
    case 'brainstorm-mode':
      titleElement.textContent = 'Visual System Brainstorming';
      break;
    default:
      titleElement.textContent = 'Ollama Ecosystem Design Schematics';
  }
}

// Update the description based on the selected diagram/section
function updateDescription(id) {
  const descriptionElement = document.getElementById('diagram-description');

  switch (id) {
    case 'system-architecture':
      descriptionElement.textContent =
        'This diagram provides an overview of the entire Ollama ecosystem architecture, showing the interactions between core components.';
      break;
    case 'ollamavoice-architecture':
      descriptionElement.textContent =
        'Detailed architecture of the OllamaVoice component, showing speech processing flow and integration points.';
      break;
    case 'ollamahomecontrol-architecture':
      descriptionElement.textContent =
        'Architecture of the OllamaHomeControl component, focusing on smart home device control and automation creation.';
      break;
    case 'ollamahub-architecture':
      descriptionElement.textContent =
        'Structure of the OllamaHub knowledge management system, with document processing and context awareness.';
      break;
    case 'data-flow':
      descriptionElement.textContent =
        'Sequence diagram showing how data flows through the ecosystem during a typical interaction.';
      break;
    case 'resource-management':
      descriptionElement.textContent =
        'Architecture for managing and optimizing resources across the ecosystem, particularly LLM models.';
      break;
    case 'mobile-client':
      descriptionElement.textContent =
        'Mobile client architecture showing components and integration with the Ollama ecosystem.';
      break;
    case 'physical-deployment':
      descriptionElement.textContent =
        'Physical deployment diagram showing how the ecosystem components are deployed on actual hardware.';
      break;
    case 'development-environment':
      descriptionElement.textContent =
        'Architecture of the development environment used to build and test ecosystem components.';
      break;
    case 'integration-points':
      descriptionElement.textContent =
        'Detailed specifications for integration points between ecosystem components.';
      break;
    case 'brainstorm-mode':
      descriptionElement.textContent =
        'Collaborative visual brainstorming mode for designing and exploring system architectures.';
      break;
    default:
      descriptionElement.textContent = '';
  }
}

// Update Mermaid theme based on current site theme
function updateMermaidTheme() {
  const isDarkMode = document.body.classList.contains('dark-mode');

  // Re-initialize mermaid with the new theme
  mermaid.initialize({
    theme: isDarkMode ? 'dark' : 'default'
  });

  // Re-render all visible diagrams
  document.querySelectorAll('.mermaid:not(.d-none)').forEach((diagram) => {
    const content = diagram.textContent;
    diagram.removeAttribute('data-processed');
    diagram.textContent = content;
    mermaid.init(undefined, diagram);
  });
}

// Zoom the current diagram
let currentZoom = 1;
function zoomDiagram(factor) {
  const visibleDiagram = document.querySelector('.mermaid:not(.d-none)');
  if (!visibleDiagram) return;

  currentZoom *= factor;
  visibleDiagram.style.transform = `scale(${currentZoom})`;
  visibleDiagram.style.transformOrigin = 'center';
}

// Reset zoom level
function resetZoom() {
  const visibleDiagram = document.querySelector('.mermaid:not(.d-none)');
  if (!visibleDiagram) return;

  currentZoom = 1;
  visibleDiagram.style.transform = 'scale(1)';
}

// Download the current diagram as SVG
function downloadCurrentDiagram() {
  const visibleDiagram = document.querySelector('.mermaid:not(.d-none)');
  if (!visibleDiagram) return;

  const svgElement = visibleDiagram.querySelector('svg');
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = document.getElementById('diagram-title').textContent.replace(/\s+/g, '_') + '.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Setup Brainstorming Mode
function setupBrainstormingMode() {
  // Add brainstorming mode button to sidebar
  const sidebarNav = document.querySelector('.sidebar-header');
  const brainstormButton = document.createElement('button');
  brainstormButton.className = 'btn btn-light w-100 mb-3';
  brainstormButton.textContent = 'Brainstorm Mode';
  brainstormButton.addEventListener('click', activateBrainstormMode);
  sidebarNav.appendChild(brainstormButton);
}

// Activate Brainstorming Mode
function activateBrainstormMode() {
  // Update UI
  updateTitle('brainstorm-mode');
  updateDescription('brainstorm-mode');

  // Hide all diagrams and sections
  document.querySelectorAll('.mermaid').forEach((diagram) => {
    diagram.classList.add('d-none');
  });
  document.getElementById('integration-points').classList.add('d-none');

  // Create or show brainstorming panel
  let brainstormPanel = document.getElementById('brainstorm-panel');
  if (!brainstormPanel) {
    brainstormPanel = createBrainstormPanel();
    document.querySelector('.diagram-container').appendChild(brainstormPanel);
  } else {
    brainstormPanel.classList.remove('d-none');
  }

  // Reset navigation active state
  document.querySelectorAll('.nav-link').forEach((navLink) => {
    navLink.classList.remove('active');
  });
}

// Create Brainstorming Panel
function createBrainstormPanel() {
  const panel = document.createElement('div');
  panel.id = 'brainstorm-panel';
  panel.className = 'brainstorm-panel';

  // Session controls section
  const sessionControls = document.createElement('div');
  sessionControls.className = 'mb-4';
  sessionControls.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="mb-0">Visual System Brainstorming</h3>
            <div class="btn-group">
                <button id="start-session" class="btn btn-primary">Start Session</button>
                <button id="end-session" class="btn btn-secondary" disabled>End Session</button>
            </div>
        </div>
        <div class="session-timer">00:00</div>
        <div class="participant-list">
            <div class="participant">
                <div class="participant-avatar">Y</div>
                <span>You (Host)</span>
            </div>
        </div>
    `;

  // Template selection
  const templateSelection = document.createElement('div');
  templateSelection.className = 'mb-4';
  templateSelection.innerHTML = `
        <h4>Start With Template</h4>
        <div class="row mb-3">
            <div class="col-md-3">
                <div class="card template-card" data-template="system-architecture">
                    <div class="card-body text-center">
                        <h6>System Architecture</h6>
                        <small>Full ecosystem view</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card template-card" data-template="component-arch">
                    <div class="card-body text-center">
                        <h6>Component Architecture</h6>
                        <small>Single component focus</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card template-card" data-template="data-flow">
                    <div class="card-body text-center">
                        <h6>Data Flow</h6>
                        <small>Process sequence view</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card template-card" data-template="blank">
                    <div class="card-body text-center">
                        <h6>Blank Canvas</h6>
                        <small>Start from scratch</small>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Interactive diagram area
  const diagramArea = document.createElement('div');
  diagramArea.className = 'mb-4';
  diagramArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Diagram Workspace</h4>
            <div class="btn-group">
                <button id="add-component" class="btn btn-sm btn-outline-primary">Add Component</button>
                <button id="add-connection" class="btn btn-sm btn-outline-primary">Add Connection</button>
                <button id="add-note" class="btn btn-sm btn-outline-secondary">Add Note</button>
            </div>
        </div>
        <div class="canvas-container">
            <div id="brainstorm-diagram" class="mermaid">
                graph TD
                    A[Brainstorm Node] --- B[New Idea]
                    A --- C[Another Concept]
                    click A callback "Node A clicked"
                    click B callback "Node B clicked"
                    click C callback "Node C clicked"
            </div>
        </div>
    `;

  // Ideas collection
  const ideasSection = document.createElement('div');
  ideasSection.className = 'mb-4';
  ideasSection.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Brainstormed Ideas</h4>
            <button id="add-idea" class="btn btn-sm btn-success">Add New Idea</button>
        </div>
        <div id="ideas-container">
            <div class="idea-card highlight-animation">
                <div class="d-flex justify-content-between">
                    <h5>Voice Control Component</h5>
                    <div>
                        <span class="idea-vote" data-voted="false">⭐</span>
                        <span class="badge bg-primary ms-2">New</span>
                    </div>
                </div>
                <p>Add voice control capabilities to the OllamaHomeControl component for hands-free operation.</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Added by You - 1 minute ago</small>
                    <div>
                        <button class="btn btn-sm btn-outline-primary">Add to Diagram</button>
                        <button class="btn btn-sm btn-outline-secondary">Comment</button>
                    </div>
                </div>
                <div class="comment-thread d-none">
                    <div class="comment">
                        <small class="fw-bold">You:</small>
                        <p class="mb-0">This could integrate with the existing OllamaVoice component</p>
                    </div>
                    <div class="input-group mt-2">
                        <input type="text" class="form-control form-control-sm" placeholder="Add comment...">
                        <button class="btn btn-sm btn-outline-primary">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Export options
  const exportSection = document.createElement('div');
  exportSection.className = 'mt-4';
  exportSection.innerHTML = `
        <h4>Export Session</h4>
        <div class="export-options">
            <button class="btn btn-outline-primary" id="export-diagram">Export Diagram</button>
            <button class="btn btn-outline-primary" id="export-ideas">Export Ideas</button>
            <button class="btn btn-outline-primary" id="export-all">Export Complete Session</button>
        </div>
    `;

  // Assemble the panel
  panel.appendChild(sessionControls);
  panel.appendChild(templateSelection);
  panel.appendChild(diagramArea);
  panel.appendChild(ideasSection);
  panel.appendChild(exportSection);

  // Add event listeners after adding to DOM
  setTimeout(() => {
    // Template selection
    document.querySelectorAll('.template-card').forEach((card) => {
      card.addEventListener('click', function () {
        const template = this.getAttribute('data-template');
        loadTemplate(template);
      });
    });

    // Session controls
    document.getElementById('start-session').addEventListener('click', startBrainstormSession);
    document.getElementById('end-session').addEventListener('click', endBrainstormSession);

    // Diagram controls
    document.getElementById('add-component').addEventListener('click', addComponent);
    document.getElementById('add-connection').addEventListener('click', addConnection);
    document.getElementById('add-note').addEventListener('click', addNote);

    // Ideas management
    document.getElementById('add-idea').addEventListener('click', addNewIdea);
    document.querySelectorAll('.idea-vote').forEach((vote) => {
      vote.addEventListener('click', toggleVote);
    });
    document.querySelectorAll('.idea-card .btn-outline-secondary').forEach((button) => {
      button.addEventListener('click', toggleComments);
    });

    // Export options
    document.getElementById('export-diagram').addEventListener('click', exportDiagram);
    document.getElementById('export-ideas').addEventListener('click', exportIdeas);
    document.getElementById('export-all').addEventListener('click', exportAll);

    // Initialize the brainstorm diagram
    mermaid.init(undefined, document.getElementById('brainstorm-diagram'));
  }, 100);

  return panel;
}

// Brainstorming Session Functions
function startBrainstormSession() {
  document.getElementById('start-session').disabled = true;
  document.getElementById('end-session').disabled = false;

  // Start timer
  let seconds = 0;
  brainstormTimer = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    document.querySelector('.session-timer').textContent =
      `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, 1000);

  // Simulate participant joining
  setTimeout(() => {
    const participantList = document.querySelector('.participant-list');
    const newParticipant = document.createElement('div');
    newParticipant.className = 'participant';
    newParticipant.innerHTML = `
            <div class="participant-avatar" style="background-color: #28a745;">A</div>
            <span>Alex</span>
        `;
    participantList.appendChild(newParticipant);

    // Show notification toast
    showToast('Alex has joined the session');
  }, 3000);
}

function endBrainstormSession() {
  document.getElementById('start-session').disabled = false;
  document.getElementById('end-session').disabled = true;

  // Stop timer
  clearInterval(brainstormTimer);

  // Ask for session summary
  const confirmEnd = confirm(
    'End brainstorming session? You can export the results before closing.'
  );
  if (confirmEnd) {
    showToast('Session ended. You can still export your results.');
  }
}

function loadTemplate(template) {
  const diagramElement = document.getElementById('brainstorm-diagram');

  switch (template) {
    case 'system-architecture':
      diagramElement.textContent = `
                graph TD
                    User((User)) --> Interface[User Interface]
                    Interface --> Core[Core System]
                    Core --> Data[(Database)]
                    Core --> API[API Services]
                    API --> External[External Systems]
                    
                    click User callback "Edit User"
                    click Interface callback "Edit Interface"
                    click Core callback "Edit Core System"
                    click Data callback "Edit Database" 
                    click API callback "Edit API"
                    click External callback "Edit External Systems"
            `;
      break;
    case 'component-arch':
      diagramElement.textContent = `
                graph TD
                    Input[Input Handler] --> Processor[Main Processor]
                    Processor --> Model[AI Model]
                    Processor --> Output[Output Generator]
                    Model --> Cache[(Cache)]
                    
                    click Input callback "Edit Input"
                    click Processor callback "Edit Processor"
                    click Model callback "Edit Model"
                    click Output callback "Edit Output"
                    click Cache callback "Edit Cache"
            `;
      break;
    case 'data-flow':
      diagramElement.textContent = `
                sequenceDiagram
                    participant User
                    participant System
                    participant Database
                    
                    User->>System: Request Data
                    System->>Database: Query
                    Database-->>System: Results
                    System-->>User: Formatted Response
            `;
      break;
    case 'blank':
      diagramElement.textContent = `
                graph TD
                    A[Add Your First Node] --- B[Right Click to Edit]
                    
                    click A callback "Edit Node A"
                    click B callback "Edit Node B"
            `;
      break;
  }

  diagramElement.removeAttribute('data-processed');
  mermaid.init(undefined, diagramElement);
  showToast(`Loaded ${template.replace('-', ' ')} template`);
}

// UI Interaction Functions
function addComponent() {
  const componentName = prompt('Enter component name:');
  if (!componentName) return;

  // Get the current diagram
  const diagramElement = document.getElementById('brainstorm-diagram');
  let diagramText = diagramElement.textContent;

  // Add new component based on diagram type
  if (diagramText.includes('sequenceDiagram')) {
    diagramText = diagramText.replace(
      'sequenceDiagram',
      `sequenceDiagram\n    participant ${componentName}`
    );
  } else {
    // Assume it's a flowchart
    const newNodeId = generateId();
    diagramText += `\n    ${newNodeId}[${componentName}]`;
    diagramText += `\n    click ${newNodeId} callback "Edit ${componentName}"`;
  }

  // Update diagram
  diagramElement.textContent = diagramText;
  diagramElement.removeAttribute('data-processed');
  mermaid.init(undefined, diagramElement);

  showToast(`Added component: ${componentName}`);
}

function addConnection() {
  const sourceId = prompt('Enter source component ID:');
  if (!sourceId) return;

  const targetId = prompt('Enter target component ID:');
  if (!targetId) return;

  const label = prompt('Enter connection label (optional):');

  // Get the current diagram
  const diagramElement = document.getElementById('brainstorm-diagram');
  let diagramText = diagramElement.textContent;

  // Add new connection based on diagram type
  if (diagramText.includes('sequenceDiagram')) {
    const arrowType = prompt('Enter arrow type (->>, -->, -x, etc.):') || '->>';
    diagramText += `\n    ${sourceId}${arrowType}${targetId}: ${label || 'connects to'}`;
  } else {
    // Assume it's a flowchart
    diagramText += `\n    ${sourceId} ${label ? `-->|${label}|` : '---'} ${targetId}`;
  }

  // Update diagram
  diagramElement.textContent = diagramText;
  diagramElement.removeAttribute('data-processed');
  mermaid.init(undefined, diagramElement);

  showToast('Added connection');
}

function addNote() {
  const noteText = prompt('Enter note text:');
  if (!noteText) return;

  const notePosition = prompt('Enter position (e.g., right of ComponentName):');
  if (!notePosition) return;

  // Get the current diagram
  const diagramElement = document.getElementById('brainstorm-diagram');
  let diagramText = diagramElement.textContent;

  // Add note based on diagram type
  if (diagramText.includes('sequenceDiagram')) {
    diagramText += `\n    Note ${notePosition}: ${noteText}`;
  } else {
    // Assume it's a flowchart
    const noteId = generateId('note');
    diagramText += `\n    ${noteId}[\"${noteText}\"]`;
    if (notePosition.includes('of ')) {
      const targetComponent = notePosition.split('of ')[1].trim();
      diagramText += `\n    ${targetComponent} --- ${noteId}`;
    }
  }

  // Update diagram
  diagramElement.textContent = diagramText;
  diagramElement.removeAttribute('data-processed');
  mermaid.init(undefined, diagramElement);

  showToast('Added note');
}

function addNewIdea() {
  const ideaTitle = prompt('Enter idea title:');
  if (!ideaTitle) return;

  const ideaDescription = prompt('Enter idea description:');
  if (!ideaDescription) return;

  const ideasContainer = document.getElementById('ideas-container');
  const newIdea = document.createElement('div');
  newIdea.className = 'idea-card highlight-animation';
  newIdea.innerHTML = `
        <div class="d-flex justify-content-between">
            <h5>${ideaTitle}</h5>
            <div>
                <span class="idea-vote" data-voted="false">⭐</span>
                <span class="badge bg-primary ms-2">New</span>
            </div>
        </div>
        <p>${ideaDescription}</p>
        <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">Added by You - just now</small>
            <div>
                <button class="btn btn-sm btn-outline-primary">Add to Diagram</button>
                <button class="btn btn-sm btn-outline-secondary">Comment</button>
            </div>
        </div>
        <div class="comment-thread d-none">
            <div class="input-group mt-2">
                <input type="text" class="form-control form-control-sm" placeholder="Add comment...">
                <button class="btn btn-sm btn-outline-primary">Send</button>
            </div>
        </div>
    `;

  // Insert at the top
  ideasContainer.insertBefore(newIdea, ideasContainer.firstChild);

  // Add event listeners
  newIdea.querySelector('.idea-vote').addEventListener('click', toggleVote);
  newIdea.querySelector('.btn-outline-secondary').addEventListener('click', toggleComments);

  showToast('Added new idea');
}

function toggleVote() {
  const isVoted = this.getAttribute('data-voted') === 'true';
  this.setAttribute('data-voted', !isVoted);

  if (!isVoted) {
    this.classList.add('active');
  } else {
    this.classList.remove('active');
  }
}

function toggleComments() {
  const ideaCard = this.closest('.idea-card');
  const commentThread = ideaCard.querySelector('.comment-thread');

  commentThread.classList.toggle('d-none');

  if (!commentThread.classList.contains('d-none')) {
    commentThread.querySelector('input').focus();
  }
}

// Export Functions
function exportDiagram() {
  const diagramSvg = document.querySelector('#brainstorm-diagram svg');
  if (!diagramSvg) {
    showToast('No diagram to export', 'warning');
    return;
  }

  const svgData = new XMLSerializer().serializeToString(diagramSvg);
  downloadFile(svgData, 'brainstorm_diagram.svg', 'image/svg+xml');

  showToast('Diagram exported');
}

function exportIdeas() {
  const ideasContainer = document.getElementById('ideas-container');
  const ideas = [];

  ideasContainer.querySelectorAll('.idea-card').forEach((card) => {
    const title = card.querySelector('h5').textContent;
    const description = card.querySelector('p').textContent;
    const author = card.querySelector('small').textContent.split('-')[0].trim();
    const voted = card.querySelector('.idea-vote').getAttribute('data-voted') === 'true';

    ideas.push({
      title,
      description,
      author,
      voted,
      comments: []
    });

    // Get comments if any
    card.querySelectorAll('.comment').forEach((comment) => {
      const author = comment.querySelector('small').textContent.replace(':', '');
      const text = comment.querySelector('p').textContent;
      ideas[ideas.length - 1].comments.push({ author, text });
    });
  });

  downloadFile(JSON.stringify(ideas, null, 2), 'brainstorm_ideas.json', 'application/json');
  showToast('Ideas exported');
}

function exportAll() {
  const diagramSvg = document.querySelector('#brainstorm-diagram svg');
  const diagramCode = document.getElementById('brainstorm-diagram').textContent;
  const ideasContainer = document.getElementById('ideas-container');
  const ideas = [];

  ideasContainer.querySelectorAll('.idea-card').forEach((card) => {
    const title = card.querySelector('h5').textContent;
    const description = card.querySelector('p').textContent;
    const author = card.querySelector('small').textContent.split('-')[0].trim();
    const voted = card.querySelector('.idea-vote').getAttribute('data-voted') === 'true';

    ideas.push({
      title,
      description,
      author,
      voted,
      comments: []
    });

    // Get comments if any
    card.querySelectorAll('.comment').forEach((comment) => {
      const author = comment.querySelector('small').textContent.replace(':', '');
      const text = comment.querySelector('p').textContent;
      ideas[ideas.length - 1].comments.push({ author, text });
    });
  });

  const sessionData = {
    title: 'Brainstorming Session',
    date: new Date().toISOString(),
    duration: document.querySelector('.session-timer').textContent,
    participants: [],
    diagram: {
      code: diagramCode,
      svg: diagramSvg ? new XMLSerializer().serializeToString(diagramSvg) : null
    },
    ideas: ideas
  };

  document.querySelectorAll('.participant').forEach((p) => {
    sessionData.participants.push(p.querySelector('span').textContent);
  });

  downloadFile(
    JSON.stringify(sessionData, null, 2),
    'complete_brainstorm_session.json',
    'application/json'
  );
  showToast('Complete session exported');
}

// Utility Functions
function generateId(prefix = 'node') {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showToast(message, type = 'success') {
  // Create toast if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

  toastContainer.appendChild(toast);

  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000
  });

  bsToast.show();

  // Clean up after hiding
  toast.addEventListener('hidden.bs.toast', function () {
    toast.remove();
  });
}

// Design Mode Functions
function setupDesignMode() {
  // Add design mode button to toolbar
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    const designBtn = document.createElement('button');
    designBtn.className = 'btn btn-primary';
    designBtn.innerHTML = '🎨 Design Mode';
    designBtn.onclick = activateDesignMode;
    toolbar.appendChild(designBtn);
  }
}

function activateDesignMode() {
  // Update UI for design mode
  document.body.classList.add('design-mode');
  showToast('Design Mode Activated', 'info');

  // Create design tools panel
  const designPanel = createDesignPanel();
  document.body.appendChild(designPanel);

  // Update mermaid settings for design mode
  mermaid.initialize({
    theme: 'default',
    flowchart: {
      curve: 'linear',
      defaultRenderer: 'elk'
    }
  });
}

function createDesignPanel() {
  const panel = document.createElement('div');
  panel.className = 'design-panel';
  panel.innerHTML = `
        <div class="design-tools">
            <h3>🎨 Design Tools</h3>
            <div class="tool-group">
                <button onclick="addUIComponent('container')">Add Container</button>
                <button onclick="addUIComponent('component')">Add Component</button>
                <button onclick="addUILayout()">Add Layout</button>
            </div>
            <div class="tool-group">
                <button onclick="toggleGrid()">Toggle Grid</button>
                <button onclick="toggleGuides()">Toggle Guides</button>
            </div>
            <div class="tool-group">
                <button onclick="exportDesign()">Export Design</button>
                <button onclick="saveDesignState()">Save State</button>
            </div>
        </div>
    `;
  return panel;
}

// Design mode utility functions
function addUIComponent(type) {
  const id = generateId('ui-' + type);
  const component = {
    id: id,
    type: type,
    position: { x: 100, y: 100 },
    size: { width: 200, height: 100 }
  };
  // Add component to diagram
  updateDiagram();
  showToast(`Added ${type}`, 'success');
}

function addUILayout() {
  const layout = {
    type: 'grid',
    columns: 12,
    gap: 16
  };
  // Apply layout to diagram
  updateDiagram();
  showToast('Added layout grid', 'success');
}

function toggleGrid() {
  document.body.classList.toggle('show-grid');
  showToast('Toggled grid visibility', 'info');
}

function toggleGuides() {
  document.body.classList.toggle('show-guides');
  showToast('Toggled alignment guides', 'info');
}

function exportDesign() {
  const design = {
    components: [], // Collect all UI components
    layout: {}, // Collect layout information
    styles: {} // Collect style information
  };
  downloadFile(JSON.stringify(design, null, 2), 'ui-design.json', 'application/json');
  showToast('Design exported successfully', 'success');
}

function saveDesignState() {
  const state = {
    timestamp: new Date().toISOString(),
    components: [], // Current component state
    layout: {} // Current layout state
  };
  localStorage.setItem('design-state', JSON.stringify(state));
  showToast('Design state saved', 'success');
}
