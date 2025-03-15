"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const componentEvaluation_1 = require("../utils/componentEvaluation");
const componentAbsorber_1 = require("../utils/componentAbsorber");
const statusColors = {
    [componentEvaluation_1.ComponentEvaluationStatus.NOT_STARTED]: "#9e9e9e", // grey
    [componentEvaluation_1.ComponentEvaluationStatus.IN_PROGRESS]: "#2196f3", // blue
    [componentEvaluation_1.ComponentEvaluationStatus.COMPLETED]: "#ff9800", // orange
    [componentEvaluation_1.ComponentEvaluationStatus.REJECTED]: "#f44336", // red
    [componentEvaluation_1.ComponentEvaluationStatus.ABSORBED]: "#4caf50", // green
};
const absorptionStatusColors = {
    [componentAbsorber_1.AbsorptionStatus.NOT_STARTED]: "#9e9e9e", // grey
    [componentAbsorber_1.AbsorptionStatus.IN_PROGRESS]: "#2196f3", // blue
    [componentAbsorber_1.AbsorptionStatus.COMPLETED]: "#4caf50", // green
    [componentAbsorber_1.AbsorptionStatus.FAILED]: "#f44336", // red
};
const ComponentManager = () => {
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const [evaluations, setEvaluations] = (0, react_1.useState)([]);
    const [absorptions, setAbsorptions] = (0, react_1.useState)([]);
    const [selectedEvaluation, setSelectedEvaluation] = (0, react_1.useState)(null);
    const [selectedAbsorption, setSelectedAbsorption] = (0, react_1.useState)(null);
    const [evaluationDetailsOpen, setEvaluationDetailsOpen] = (0, react_1.useState)(false);
    const [absorptionDetailsOpen, setAbsorptionDetailsOpen] = (0, react_1.useState)(false);
    const [newEvaluationOpen, setNewEvaluationOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(true);
    // New evaluation form state
    const [newComponentId, setNewComponentId] = (0, react_1.useState)("");
    const [newComponentName, setNewComponentName] = (0, react_1.useState)("");
    const [newSourceRepo, setNewSourceRepo] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        // Fetch evaluations and absorptions
        const fetchData = async () => {
            setLoading(true);
            // In a real implementation, these might be API calls
            setEvaluations(componentEvaluation_1.componentRegistry.getAllEvaluations());
            setAbsorptions(componentAbsorber_1.componentAbsorber.getAllAbsorptions());
            setLoading(false);
        };
        // Initial data fetch
        fetchData();
        // Set up periodic refresh (every 5 seconds)
        const refreshInterval = setInterval(() => {
            setEvaluations(componentEvaluation_1.componentRegistry.getAllEvaluations());
            setAbsorptions(componentAbsorber_1.componentAbsorber.getAllAbsorptions());
        }, 5000);
        // Clean up interval on component unmount
        return () => clearInterval(refreshInterval);
    }, []);
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const handleViewEvaluationDetails = (evaluation) => {
        setSelectedEvaluation(evaluation);
        setEvaluationDetailsOpen(true);
    };
    const handleViewAbsorptionDetails = (absorption) => {
        setSelectedAbsorption(absorption);
        setAbsorptionDetailsOpen(true);
    };
    const handleCloseEvaluationDetails = () => {
        setEvaluationDetailsOpen(false);
        setSelectedEvaluation(null);
    };
    const handleCloseAbsorptionDetails = () => {
        setAbsorptionDetailsOpen(false);
        setSelectedAbsorption(null);
    };
    const handleOpenNewEvaluation = () => {
        setNewEvaluationOpen(true);
    };
    const handleCloseNewEvaluation = () => {
        setNewEvaluationOpen(false);
        // Reset form
        setNewComponentId("");
        setNewComponentName("");
        setNewSourceRepo("");
    };
    const handleSubmitNewEvaluation = () => {
        // In a real implementation, this would create a new evaluation
        // and add it to the registry
        console.log("Creating new evaluation for:", {
            componentId: newComponentId,
            componentName: newComponentName,
            sourceRepo: newSourceRepo,
        });
        handleCloseNewEvaluation();
    };
    const handleStartAbsorption = (evaluation) => {
        // Use the componentAbsorber to start the absorption process
        try {
            // Define the target location based on component type
            const targetLocation = `src/components/absorbed/${evaluation.componentId}`;
            // Start the absorption process
            const absorption = componentAbsorber_1.componentAbsorber.startAbsorption(evaluation, targetLocation);
            // Add the new absorption to the state
            setAbsorptions((prev) => [...prev, absorption]);
            // Log initial message
            componentAbsorber_1.componentAbsorber.logAbsorptionMessage(evaluation.componentId, `Absorption process initiated for ${evaluation.componentName}`);
            // Simulate the absorption process with several adaptations
            // After 1 second, record a style adaptation
            setTimeout(() => {
                recordComponentAdaptation(evaluation.componentId, "style", "Updated component styling to match OSPAiN2 theme", "Maintain consistent UI appearance across ecosystem", ".component { color: blue; }", ".component { color: var(--ospain-primary); }");
                componentAbsorber_1.componentAbsorber.logAbsorptionMessage(evaluation.componentId, "Style adaptation completed");
            }, 1000);
            // After 1.5 seconds, record a dependency adaptation
            setTimeout(() => {
                recordComponentAdaptation(evaluation.componentId, "dependency", "Replaced external dependencies with OSPAiN2 internal utilities", "Reduce external dependencies and bundle size", "import { format } from 'date-fns';", "import { format } from '../../utils/dateUtils';");
                componentAbsorber_1.componentAbsorber.logAbsorptionMessage(evaluation.componentId, "Dependency adaptation completed");
            }, 1500);
            // After 2 seconds, record an interface adaptation
            setTimeout(() => {
                recordComponentAdaptation(evaluation.componentId, "interface", "Updated props interface to match OSPAiN2 standards", "Ensure type consistency across components", "interface Props { data: any }", "interface Props { data: OSPAiNComponentData }");
                componentAbsorber_1.componentAbsorber.logAbsorptionMessage(evaluation.componentId, "Interface adaptation completed");
            }, 2000);
            // After 3 seconds, complete the absorption process
            setTimeout(() => {
                componentAbsorber_1.componentAbsorber.completeAbsorption(evaluation.componentId, true);
                // Update the absorptions state
                setAbsorptions(componentAbsorber_1.componentAbsorber.getAllAbsorptions());
                // Show completion alert
                alert(`Absorption process completed for ${evaluation.componentName}`);
            }, 3000);
            // Show initial feedback to the user
            alert(`Absorption process started for ${evaluation.componentName}. Check the Absorptions tab to track progress.`);
        }
        catch (error) {
            console.error("Error starting absorption:", error);
            alert(`Error starting absorption: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    const getStatusLabel = (status) => {
        const labels = {
            [componentEvaluation_1.ComponentEvaluationStatus.NOT_STARTED]: "Not Started",
            [componentEvaluation_1.ComponentEvaluationStatus.IN_PROGRESS]: "In Progress",
            [componentEvaluation_1.ComponentEvaluationStatus.COMPLETED]: "Completed",
            [componentEvaluation_1.ComponentEvaluationStatus.REJECTED]: "Rejected",
            [componentEvaluation_1.ComponentEvaluationStatus.ABSORBED]: "Absorbed",
        };
        return labels[status] || status;
    };
    const getAbsorptionStatusLabel = (status) => {
        const labels = {
            [componentAbsorber_1.AbsorptionStatus.NOT_STARTED]: "Not Started",
            [componentAbsorber_1.AbsorptionStatus.IN_PROGRESS]: "In Progress",
            [componentAbsorber_1.AbsorptionStatus.COMPLETED]: "Completed",
            [componentAbsorber_1.AbsorptionStatus.FAILED]: "Failed",
        };
        return labels[status] || status;
    };
    /**
     * Records an adaptation made during the component absorption process
     * @param componentId The ID of the component being adapted
     * @param adaptationType The type of adaptation being made
     * @param description A description of the adaptation
     * @param before Optional - the state before the adaptation
     * @param after Optional - the state after the adaptation
     * @param reason The reason for the adaptation
     */
    const recordComponentAdaptation = (componentId, adaptationType, description, reason, before, after) => {
        try {
            componentAbsorber_1.componentAbsorber.recordAdaptation(componentId, {
                type: adaptationType,
                description,
                reason,
                before,
                after,
            });
            // Refresh the absorptions data
            setAbsorptions(componentAbsorber_1.componentAbsorber.getAllAbsorptions());
        }
        catch (error) {
            console.error("Error recording adaptation:", error);
            alert(`Error recording adaptation: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    const renderEvaluationSummary = () => {
        const summary = componentEvaluation_1.componentRegistry.getEvaluationSummary();
        return (<material_1.Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <material_1.Grid item xs={12} sm={6} md={2.4}>
          <material_1.Paper sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <material_1.Typography variant="h6" align="center">
              Total
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.total}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={2.4}>
          <material_1.Paper sx={{
                p: 2,
                bgcolor: statusColors[componentEvaluation_1.ComponentEvaluationStatus.ABSORBED],
                color: "white",
                borderRadius: 2,
            }}>
            <material_1.Typography variant="h6" align="center">
              Absorbed
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.absorbed}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={2.4}>
          <material_1.Paper sx={{
                p: 2,
                bgcolor: statusColors[componentEvaluation_1.ComponentEvaluationStatus.REJECTED],
                color: "white",
                borderRadius: 2,
            }}>
            <material_1.Typography variant="h6" align="center">
              Rejected
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.rejected}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={2.4}>
          <material_1.Paper sx={{
                p: 2,
                bgcolor: statusColors[componentEvaluation_1.ComponentEvaluationStatus.COMPLETED],
                color: "white",
                borderRadius: 2,
            }}>
            <material_1.Typography variant="h6" align="center">
              Pending
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.pending}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={2.4}>
          <material_1.Paper sx={{
                p: 2,
                bgcolor: statusColors[componentEvaluation_1.ComponentEvaluationStatus.IN_PROGRESS],
                color: "white",
                borderRadius: 2,
            }}>
            <material_1.Typography variant="h6" align="center">
              In Progress
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.inProgress}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
      </material_1.Grid>);
    };
    const renderAbsorptionSummary = () => {
        const summary = componentAbsorber_1.componentAbsorber.getAbsorptionSummary();
        return (<material_1.Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Paper sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <material_1.Typography variant="h6" align="center">
              Total
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.total}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Paper sx={{
                p: 2,
                bgcolor: absorptionStatusColors[componentAbsorber_1.AbsorptionStatus.COMPLETED],
                color: "white",
                borderRadius: 2,
            }}>
            <material_1.Typography variant="h6" align="center">
              Completed
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.completed}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Paper sx={{
                p: 2,
                bgcolor: absorptionStatusColors[componentAbsorber_1.AbsorptionStatus.FAILED],
                color: "white",
                borderRadius: 2,
            }}>
            <material_1.Typography variant="h6" align="center">
              Failed
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.failed}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Paper sx={{
                p: 2,
                bgcolor: absorptionStatusColors[componentAbsorber_1.AbsorptionStatus.IN_PROGRESS],
                color: "white",
                borderRadius: 2,
            }}>
            <material_1.Typography variant="h6" align="center">
              In Progress
            </material_1.Typography>
            <material_1.Typography variant="h4" align="center">
              {summary.inProgress}
            </material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>
      </material_1.Grid>);
    };
    const renderEvaluationsTab = () => {
        return (<material_1.Box>
        {renderEvaluationSummary()}

        <material_1.Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <material_1.Button variant="contained" color="primary" onClick={handleOpenNewEvaluation}>
            New Evaluation
          </material_1.Button>
        </material_1.Box>

        <material_1.TableContainer component={material_1.Paper} sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <material_1.Table stickyHeader>
            <material_1.TableHead>
              <material_1.TableRow>
                <material_1.TableCell>Component</material_1.TableCell>
                <material_1.TableCell>Source Repo</material_1.TableCell>
                <material_1.TableCell>Status</material_1.TableCell>
                <material_1.TableCell>Score</material_1.TableCell>
                <material_1.TableCell>Evaluation Date</material_1.TableCell>
                <material_1.TableCell>Actions</material_1.TableCell>
              </material_1.TableRow>
            </material_1.TableHead>
            <material_1.TableBody>
              {evaluations.length === 0 ? (<material_1.TableRow>
                  <material_1.TableCell colSpan={6} align="center">
                    No evaluations found
                  </material_1.TableCell>
                </material_1.TableRow>) : (evaluations.map((evaluation) => (<material_1.TableRow key={evaluation.componentId}>
                    <material_1.TableCell>{evaluation.componentName}</material_1.TableCell>
                    <material_1.TableCell>{evaluation.sourceRepo}</material_1.TableCell>
                    <material_1.TableCell>
                      <material_1.Chip label={getStatusLabel(evaluation.status)} sx={{
                    bgcolor: statusColors[evaluation.status],
                    color: "white",
                }}/>
                    </material_1.TableCell>
                    <material_1.TableCell>
                      {(evaluation.score * 100).toFixed(2)}%
                    </material_1.TableCell>
                    <material_1.TableCell>
                      {evaluation.evaluationDate.toLocaleDateString()}
                    </material_1.TableCell>
                    <material_1.TableCell>
                      <material_1.Button variant="outlined" size="small" onClick={() => handleViewEvaluationDetails(evaluation)} sx={{ mr: 1 }}>
                        Details
                      </material_1.Button>
                      {evaluation.status ===
                    componentEvaluation_1.ComponentEvaluationStatus.ABSORBED &&
                    !absorptions.some((a) => a.componentId === evaluation.componentId) && (<material_1.Button variant="contained" color="primary" size="small" onClick={() => handleStartAbsorption(evaluation)}>
                            Absorb
                          </material_1.Button>)}
                    </material_1.TableCell>
                  </material_1.TableRow>)))}
            </material_1.TableBody>
          </material_1.Table>
        </material_1.TableContainer>
      </material_1.Box>);
    };
    const renderAbsorptionsTab = () => {
        return (<material_1.Box>
        {renderAbsorptionSummary()}

        <material_1.TableContainer component={material_1.Paper} sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <material_1.Table stickyHeader>
            <material_1.TableHead>
              <material_1.TableRow>
                <material_1.TableCell>Component</material_1.TableCell>
                <material_1.TableCell>Source Repo</material_1.TableCell>
                <material_1.TableCell>Target Location</material_1.TableCell>
                <material_1.TableCell>Status</material_1.TableCell>
                <material_1.TableCell>Start Time</material_1.TableCell>
                <material_1.TableCell>Completion Time</material_1.TableCell>
                <material_1.TableCell>Actions</material_1.TableCell>
              </material_1.TableRow>
            </material_1.TableHead>
            <material_1.TableBody>
              {absorptions.length === 0 ? (<material_1.TableRow>
                  <material_1.TableCell colSpan={7} align="center">
                    No absorptions found
                  </material_1.TableCell>
                </material_1.TableRow>) : (absorptions.map((absorption) => (<material_1.TableRow key={absorption.componentId}>
                    <material_1.TableCell>{absorption.componentName}</material_1.TableCell>
                    <material_1.TableCell>{absorption.sourceRepo}</material_1.TableCell>
                    <material_1.TableCell>{absorption.targetLocation}</material_1.TableCell>
                    <material_1.TableCell>
                      <material_1.Chip label={getAbsorptionStatusLabel(absorption.status)} sx={{
                    bgcolor: absorptionStatusColors[absorption.status],
                    color: "white",
                }}/>
                    </material_1.TableCell>
                    <material_1.TableCell>
                      {absorption.startTime.toLocaleDateString()}
                    </material_1.TableCell>
                    <material_1.TableCell>
                      {absorption.completionTime
                    ? absorption.completionTime.toLocaleDateString()
                    : "N/A"}
                    </material_1.TableCell>
                    <material_1.TableCell>
                      <material_1.Button variant="outlined" size="small" onClick={() => handleViewAbsorptionDetails(absorption)}>
                        Details
                      </material_1.Button>
                    </material_1.TableCell>
                  </material_1.TableRow>)))}
            </material_1.TableBody>
          </material_1.Table>
        </material_1.TableContainer>
      </material_1.Box>);
    };
    const renderEvaluationDetailsDialog = () => {
        if (!selectedEvaluation)
            return null;
        const { componentName, metrics, score, status, evaluationDate, evaluatedBy, comments, } = selectedEvaluation;
        return (<material_1.Dialog open={evaluationDetailsOpen} onClose={handleCloseEvaluationDetails} maxWidth="md" fullWidth>
        <material_1.DialogTitle>
          <material_1.Typography variant="h5">
            {componentName} Evaluation Details
          </material_1.Typography>
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <material_1.Grid container spacing={2}>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Typography variant="subtitle2">Status</material_1.Typography>
                <material_1.Chip label={getStatusLabel(status)} sx={{
                bgcolor: statusColors[status],
                color: "white",
                mt: 1,
            }}/>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Typography variant="subtitle2">Overall Score</material_1.Typography>
                <material_1.Typography variant="h6">
                  {(score * 100).toFixed(2)}%
                </material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Typography variant="subtitle2">Evaluation Date</material_1.Typography>
                <material_1.Typography variant="body1">
                  {evaluationDate.toLocaleDateString()}
                </material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Typography variant="subtitle2">Evaluated By</material_1.Typography>
                <material_1.Typography variant="body1">{evaluatedBy}</material_1.Typography>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.Box>

          <material_1.Typography variant="h6" gutterBottom>
            Metrics
          </material_1.Typography>

          <material_1.Grid container spacing={2}>
            <material_1.Grid item xs={12} md={6}>
              <material_1.Typography variant="subtitle2" gutterBottom>
                Performance
              </material_1.Typography>
              <material_1.TableContainer component={material_1.Paper} variant="outlined" sx={{ mb: 3 }}>
                <material_1.Table size="small">
                  <material_1.TableBody>
                    <material_1.TableRow>
                      <material_1.TableCell>Render Time</material_1.TableCell>
                      <material_1.TableCell align="right">{metrics.renderTime}</material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell>Memory Usage</material_1.TableCell>
                      <material_1.TableCell align="right">{metrics.memoryUsage}</material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell>Bundle Size</material_1.TableCell>
                      <material_1.TableCell align="right">{metrics.bundleSize}</material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>

              <material_1.Typography variant="subtitle2" gutterBottom>
                Quality
              </material_1.Typography>
              <material_1.TableContainer component={material_1.Paper} variant="outlined" sx={{ mb: 3 }}>
                <material_1.Table size="small">
                  <material_1.TableBody>
                    <material_1.TableRow>
                      <material_1.TableCell>Code Quality</material_1.TableCell>
                      <material_1.TableCell align="right">{metrics.codeQuality}</material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell>Accessibility</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.accessibility}
                      </material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell>Test Coverage</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.testCoverage}
                      </material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>
            </material_1.Grid>

            <material_1.Grid item xs={12} md={6}>
              <material_1.Typography variant="subtitle2" gutterBottom>
                Integration
              </material_1.Typography>
              <material_1.TableContainer component={material_1.Paper} variant="outlined" sx={{ mb: 3 }}>
                <material_1.Table size="small">
                  <material_1.TableBody>
                    <material_1.TableRow>
                      <material_1.TableCell>Dependency Count</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.dependencyCount}
                      </material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell>Integration Effort</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.integrationEffort}
                      </material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell>Compatibility Score</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.compatibilityScore}
                      </material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>

              <material_1.Typography variant="subtitle2" gutterBottom>
                User Experience
              </material_1.Typography>
              <material_1.TableContainer component={material_1.Paper} variant="outlined" sx={{ mb: 3 }}>
                <material_1.Table size="small">
                  <material_1.TableBody>
                    <material_1.TableRow>
                      <material_1.TableCell>Usability Score</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.usabilityScore}
                      </material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell>Interactivity Score</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.interactivityScore}
                      </material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>

              <material_1.Typography variant="subtitle2" gutterBottom>
                Maintenance
              </material_1.Typography>
              <material_1.TableContainer component={material_1.Paper} variant="outlined">
                <material_1.Table size="small">
                  <material_1.TableBody>
                    <material_1.TableRow>
                      <material_1.TableCell>Documentation Quality</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.documentationQuality}
                      </material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell>Maintainability Score</material_1.TableCell>
                      <material_1.TableCell align="right">
                        {metrics.maintainabilityScore}
                      </material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>
            </material_1.Grid>
          </material_1.Grid>

          <material_1.Box sx={{ mt: 3 }}>
            <material_1.Typography variant="subtitle2" gutterBottom>
              Comments
            </material_1.Typography>
            <material_1.Paper variant="outlined" sx={{ p: 2 }}>
              <material_1.Typography variant="body2">{comments}</material_1.Typography>
            </material_1.Paper>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions>
          {status === componentEvaluation_1.ComponentEvaluationStatus.ABSORBED &&
                !absorptions.some((a) => a.componentId === selectedEvaluation.componentId) && (<material_1.Button variant="contained" color="primary" onClick={() => handleStartAbsorption(selectedEvaluation)}>
                Start Absorption
              </material_1.Button>)}
          <material_1.Button onClick={handleCloseEvaluationDetails}>Close</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>);
    };
    const renderAbsorptionDetailsDialog = () => {
        if (!selectedAbsorption)
            return null;
        const { componentName, sourceRepo, targetLocation, status, startTime, completionTime, error, absorptionLogs, adaptations, } = selectedAbsorption;
        return (<material_1.Dialog open={absorptionDetailsOpen} onClose={handleCloseAbsorptionDetails} maxWidth="md" fullWidth>
        <material_1.DialogTitle>
          <material_1.Typography variant="h5">
            {componentName} Absorption Details
          </material_1.Typography>
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <material_1.Grid container spacing={2}>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Typography variant="subtitle2">Status</material_1.Typography>
                <material_1.Chip label={getAbsorptionStatusLabel(status)} sx={{
                bgcolor: absorptionStatusColors[status],
                color: "white",
                mt: 1,
            }}/>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Typography variant="subtitle2">Source Repository</material_1.Typography>
                <material_1.Typography variant="body1">{sourceRepo}</material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Typography variant="subtitle2">Target Location</material_1.Typography>
                <material_1.Typography variant="body1">{targetLocation}</material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Typography variant="subtitle2">Start Time</material_1.Typography>
                <material_1.Typography variant="body1">
                  {startTime.toLocaleDateString()}
                </material_1.Typography>
              </material_1.Grid>
            </material_1.Grid>
            {completionTime && (<material_1.Grid container spacing={2} sx={{ mt: 1 }}>
                <material_1.Grid item xs={12}>
                  <material_1.Typography variant="subtitle2">Completion Time</material_1.Typography>
                  <material_1.Typography variant="body1">
                    {completionTime.toLocaleDateString()}
                  </material_1.Typography>
                </material_1.Grid>
              </material_1.Grid>)}
            {error && (<material_1.Grid container spacing={2} sx={{ mt: 1 }}>
                <material_1.Grid item xs={12}>
                  <material_1.Typography variant="subtitle2" color="error">
                    Error
                  </material_1.Typography>
                  <material_1.Typography variant="body1" color="error">
                    {error}
                  </material_1.Typography>
                </material_1.Grid>
              </material_1.Grid>)}
          </material_1.Box>

          <material_1.Typography variant="h6" gutterBottom>
            Adaptations
          </material_1.Typography>

          {adaptations.length === 0 ? (<material_1.Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <material_1.Typography variant="body2">No adaptations recorded</material_1.Typography>
            </material_1.Paper>) : (<material_1.TableContainer component={material_1.Paper} variant="outlined" sx={{ mb: 3 }}>
              <material_1.Table size="small">
                <material_1.TableHead>
                  <material_1.TableRow>
                    <material_1.TableCell>Type</material_1.TableCell>
                    <material_1.TableCell>Description</material_1.TableCell>
                    <material_1.TableCell>Reason</material_1.TableCell>
                  </material_1.TableRow>
                </material_1.TableHead>
                <material_1.TableBody>
                  {adaptations.map((adaptation, index) => (<material_1.TableRow key={index}>
                      <material_1.TableCell>{adaptation.type}</material_1.TableCell>
                      <material_1.TableCell>{adaptation.description}</material_1.TableCell>
                      <material_1.TableCell>{adaptation.reason}</material_1.TableCell>
                    </material_1.TableRow>))}
                </material_1.TableBody>
              </material_1.Table>
            </material_1.TableContainer>)}

          <material_1.Typography variant="h6" gutterBottom>
            Logs
          </material_1.Typography>

          <material_1.Paper variant="outlined" sx={{
                p: 2,
                maxHeight: 200,
                overflow: "auto",
                bgcolor: "#f5f5f5",
                fontFamily: "monospace",
                fontSize: "0.875rem",
            }}>
            {absorptionLogs.map((log, index) => (<material_1.Box key={index} sx={{ mb: 0.5 }}>
                {log}
              </material_1.Box>))}
          </material_1.Paper>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={handleCloseAbsorptionDetails}>Close</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>);
    };
    const renderNewEvaluationDialog = () => {
        return (<material_1.Dialog open={newEvaluationOpen} onClose={handleCloseNewEvaluation} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>
          <material_1.Typography variant="h5">New Component Evaluation</material_1.Typography>
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box sx={{ mt: 2 }}>
            <material_1.TextField label="Component ID" value={newComponentId} onChange={(e) => setNewComponentId(e.target.value)} fullWidth margin="normal" variant="outlined"/>
            <material_1.TextField label="Component Name" value={newComponentName} onChange={(e) => setNewComponentName(e.target.value)} fullWidth margin="normal" variant="outlined"/>
            <material_1.TextField label="Source Repository" value={newSourceRepo} onChange={(e) => setNewSourceRepo(e.target.value)} fullWidth margin="normal" variant="outlined"/>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={handleCloseNewEvaluation}>Cancel</material_1.Button>
          <material_1.Button variant="contained" color="primary" onClick={handleSubmitNewEvaluation}>
            Create
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>);
    };
    if (loading) {
        return (<material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <material_1.CircularProgress />
      </material_1.Box>);
    }
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" gutterBottom>
        Component Manager
      </material_1.Typography>

      <material_1.Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <material_1.Tabs value={tabValue} onChange={handleTabChange}>
          <material_1.Tab label="Evaluations"/>
          <material_1.Tab label="Absorptions"/>
        </material_1.Tabs>
      </material_1.Box>

      {tabValue === 0 ? renderEvaluationsTab() : renderAbsorptionsTab()}

      {/* Dialogs */}
      {renderEvaluationDetailsDialog()}
      {renderAbsorptionDetailsDialog()}
      {renderNewEvaluationDialog()}
    </material_1.Box>);
};
exports.default = ComponentManager;
//# sourceMappingURL=ComponentManager.js.map