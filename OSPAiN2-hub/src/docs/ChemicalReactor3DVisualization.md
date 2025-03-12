# Chemical Reactor 3D Visualization

## Overview

The Chemical Reactor visualization is a 3D interactive representation of the OSPAiN2 system using ThreeJS. It visualizes tasks, workers, and agents as chemical elements in a virtual reactor, providing an engaging and intuitive way to understand system dynamics.

## Concept: "Chemical Reactor" - Building Molecular Intelligence

Leveraging the OSPAiN2 chemical theme (Ollama Sovereign Personal AI Network), we'll create a 3D visualization where tasks, components, and processes are represented as atoms, molecules, and reactions in a virtual chemical reactor.

## Implementation Plan

### Phase 1: Setup & Foundation (1-2 days)

1. **Create Base Component Structure**

   ```
   OSPAiN2-hub/src/components/visualization/threejs/ChemicalReactor.tsx
   OSPAiN2-hub/src/components/visualization/threejs/molecules/TaskMolecule.tsx
   OSPAiN2-hub/src/components/visualization/threejs/molecules/AgentMolecule.tsx
   OSPAiN2-hub/src/components/visualization/threejs/environment/Reactor.tsx
   OSPAiN2-hub/src/components/visualization/threejs/controls/OrbitControls.tsx
   OSPAiN2-hub/src/components/visualization/threejs/effects/ParticleEffects.tsx
   ```

2. **Install Dependencies**

   ```bash
   npm install three @react-three/fiber @react-three/drei @react-three/postprocessing r3f-perf
   ```

3. **Create Base Scene Component**
   - Set up basic ThreeJS environment with React Three Fiber
   - Implement camera, lighting, and scene controls
   - Create container and navigation elements

### Phase 2: Data Mapping & Molecule Design (2-3 days)

1. **Design Molecular Representations**

   - Tasks → Atoms (color-coded by status/type)
   - Projects → Molecules (collections of task atoms)
   - Agents → Catalysts (special molecules that interact with tasks)
   - Workers → Enzymes (process tasks and modify their properties)

2. **Implement Data Transformers**

   ```typescript
   // Example transformer
   const taskToAtomProps = (task: Task): AtomProps => ({
     size: calculateSizeByPriority(task.priority),
     color: getColorByStatus(task.status),
     position: calculatePosition(task.id),
     connections:
       task.dependencies?.map((dep) => ({
         to: dep,
         strength: 0.5,
       })) || [],
     metadata: {
       id: task.id,
       type: task.type,
       status: task.status,
       data: task.data,
     },
   });
   ```

3. **Create Basic Molecular Objects**
   - Implement spheres and connections for atoms and molecules
   - Create shader materials for glowing and interactive effects
   - Implement hover and selection visual feedback

### Phase 3: Physics & Interaction (3-4 days)

1. **Implement Physics System**

   - Use react-spring or cannon-es for physics simulation
   - Create force-directed layout for molecules to organize naturally
   - Implement attraction/repulsion based on task relationships

2. **Build Interaction System**

   - Click to select/inspect molecules and atoms
   - Drag to move molecules
   - Zoom to focus on specific areas
   - Context-based interactions (e.g., "catalyze" a task)

3. **Create Dynamic Bonds**
   - Generate connections between related tasks
   - Visualize dependencies with adjustable bond strength
   - Show data flow between components with animated particles

### Phase 4: Animation & Visual Effects (2-3 days)

1. **Implement Core Animations**

   - Task creation: Atoms fading in with energy pulse
   - Task completion: Atoms transforming state with particle effect
   - Task failure: Atoms destabilizing with negative energy release
   - Dependency resolution: Energy transfer along bonds

2. **Add Visual Effects**

   - Bloom effect for active elements
   - Ambient occlusion for depth perception
   - Custom shaders for energy flows and reactions
   - Particle systems for transitions and events

3. **Optimize Performance**
   - Implement instancing for similar objects
   - Use LOD (Level of Detail) for complex molecules
   - Implement frustum culling for offscreen elements
   - Add performance monitoring with r3f-perf

### Phase 5: Integration & Reactive System (2-3 days)

1. **Connect to Live Data**

   - Subscribe to task queue events
   - Update visualization in real-time as tasks change
   - Implement smooth transitions for state changes

2. **Build Control Panel**

   - Toggle different visualization modes
   - Filter by task types, statuses, or priorities
   - Control simulation parameters (speed, forces, etc.)
   - Save/load visualization states

3. **Create Demo Scenarios**
   - "Project Genesis": Visualization of project bootstrapping
   - "Task Processing Flow": Show complete lifecycle of tasks
   - "Agent Collaboration": Visualize multi-agent interactions
   - "System Stress Test": Simulate high load scenarios

### Phase 6: Polish & Optimization (1-2 days)

1. **Refine Visual Design**

   - Implement coherent color schemes aligned with UI
   - Add atmospheric effects (fog, lighting)
   - Improve materials and textures
   - Add subtle ambient animations

2. **Optimize for Different Devices**

   - Implement adaptive rendering quality
   - Create mobile-friendly controls
   - Test and optimize for different screen sizes

3. **Add Visual Tutorials**
   - Interactive help overlays
   - Visual guides for first-time users
   - Tooltips and contextual information

## Technical Architecture

```typescript
// Core rendering component
const ChemicalReactor: React.FC<{
  tasks: Task[];
  workers: Worker[];
  agents: Agent[];
  settings: VisualizationSettings;
}> = ({ tasks, workers, agents, settings }) => {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 50], fov: 50 }}>
      <Perf position="top-left" />

      {/* Environment */}
      <Environment preset="studio" />
      <fog attach="fog" args={["#202030", 5, 100]} />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -10]} color="#ff0040" intensity={10.0} />

      {/* Controls */}
      <OrbitControls makeDefault />

      {/* Physics System */}
      <Physics>
        {/* Reactor Container */}
        <Reactor>
          {/* Task Molecules */}
          {tasks.map((task) => (
            <TaskMolecule key={task.id} task={task} settings={settings} />
          ))}

          {/* Worker Enzymes */}
          {workers.map((worker) => (
            <WorkerEnzyme key={worker.id} worker={worker} settings={settings} />
          ))}

          {/* Agent Catalysts */}
          {agents.map((agent) => (
            <AgentCatalyst key={agent.id} agent={agent} settings={settings} />
          ))}

          {/* Reaction Events */}
          <ReactionEvents tasks={tasks} workers={workers} />

          {/* Energy Field */}
          <EnergyField intensity={settings.energyLevel} />
        </Reactor>
      </Physics>

      {/* Postprocessing Effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} mipmapBlur />
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
      </EffectComposer>
    </Canvas>
  );
};
```

## Data Flow

1. **Task Creation**:

   - New task appears as an atom with unstable energy
   - Connects to related tasks with bond visualization
   - Pulsates to indicate pending status

2. **Task Processing**:

   - Worker enzyme attaches to task atom
   - Energy transfer animation shows processing
   - Task atom changes state (color/shape) as status updates

3. **Task Completion**:

   - Successful tasks emit positive energy particles
   - Failed tasks emit unstable energy bursts
   - Completed tasks may form stable molecules with related tasks

4. **System Visualization**:
   - Tasks organize by type into molecular clusters
   - Worker enzymes move between clusters based on workload
   - Agent catalysts influence molecular behavior through proximity

## Integration with Current System

1. **Add Route in App.tsx**:

   ```tsx
   <Route path="chemical-reactor" element={<ChemicalReactorPage />} />
   ```

2. **Create Integration Component**:

   ```tsx
   // ChemicalReactorPage.tsx
   import React, { useState, useEffect } from "react";
   import taskQueue from "../services/TaskQueue";
   import workerManager from "../services/WorkerManager";
   import ChemicalReactor from "../components/visualization/threejs/ChemicalReactor";
   import { VisualizationSettings } from "../types/Visualization";
   import { Task, Worker, Agent } from "../types/Task";

   const ChemicalReactorPage: React.FC = () => {
     const [tasks, setTasks] = useState<Task[]>([]);
     const [workers, setWorkers] = useState<Worker[]>([]);
     const [agents, setAgents] = useState<Agent[]>([]);
     const [settings, setSettings] = useState<VisualizationSettings>({
       showCompleted: true,
       energyLevel: 1.0,
       simulationSpeed: 1.0,
       detailLevel: "high",
     });

     useEffect(() => {
       // Fetch initial data
       const fetchData = async () => {
         const allTasks = await taskQueue.getAllTasks();
         setTasks(allTasks);

         const workerStats = workerManager.getWorkerStats();
         setWorkers(workerStats);

         // TODO: Fetch agents when implemented
       };

       fetchData();

       // Subscribe to updates
       const taskListener = () => fetchData();
       taskQueue.on("task:updated", taskListener);
       taskQueue.on("task:added", taskListener);
       taskQueue.on("task:completed", taskListener);

       return () => {
         taskQueue.off("task:updated", taskListener);
         taskQueue.off("task:added", taskListener);
         taskQueue.off("task:completed", taskListener);
       };
     }, []);

     return (
       <div className="chemical-reactor-container">
         <div className="controls-panel">
           <h2>Chemical Reactor Visualization</h2>
           {/* Settings controls */}
         </div>
         <div className="reactor-view">
           <ChemicalReactor
             tasks={tasks}
             workers={workers}
             agents={agents}
             settings={settings}
           />
         </div>
       </div>
     );
   };

   export default ChemicalReactorPage;
   ```

## Timeline & Resources

- **Total Estimated Time**: 11-17 days
- **Required Skills**: ThreeJS, React, React Three Fiber, Shader Programming, Physics Simulation, Data Visualization
- **Key Dependencies**:
  - three.js (core 3D library)
  - @react-three/fiber (React renderer for three.js)
  - @react-three/drei (useful helpers for R3F)
  - @react-three/cannon (physics)
  - @react-three/postprocessing (visual effects)

## Success Metrics

- **Performance**: Maintains 60fps with 100+ animated elements
- **Engagement**: Users spend 20%+ more time analyzing task data
- **Usability**: Users can identify task relationships 30% faster than with traditional views
- **Integration**: Visualization reacts to real-time changes within 500ms

## Next Steps

1. Set up initial project structure
2. Create proof-of-concept with basic atom visualization
3. Implement data binding to task system
4. Develop physics and interaction system
5. Add visual effects and polish
