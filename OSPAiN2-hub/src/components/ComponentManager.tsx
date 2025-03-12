import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  LinearProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ComponentEvaluation,
  ComponentEvaluationStatus,
  componentRegistry,
} from "../utils/componentEvaluation";
import {
  ComponentAbsorption,
  AbsorptionStatus,
  componentAbsorber,
} from "../utils/componentAbsorber";

const statusColors = {
  [ComponentEvaluationStatus.NOT_STARTED]: "#9e9e9e", // grey
  [ComponentEvaluationStatus.IN_PROGRESS]: "#2196f3", // blue
  [ComponentEvaluationStatus.COMPLETED]: "#ff9800", // orange
  [ComponentEvaluationStatus.REJECTED]: "#f44336", // red
  [ComponentEvaluationStatus.ABSORBED]: "#4caf50", // green
};

const absorptionStatusColors = {
  [AbsorptionStatus.NOT_STARTED]: "#9e9e9e", // grey
  [AbsorptionStatus.IN_PROGRESS]: "#2196f3", // blue
  [AbsorptionStatus.COMPLETED]: "#4caf50", // green
  [AbsorptionStatus.FAILED]: "#f44336", // red
};

const ComponentManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [evaluations, setEvaluations] = useState<ComponentEvaluation[]>([]);
  const [absorptions, setAbsorptions] = useState<ComponentAbsorption[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<ComponentEvaluation | null>(null);
  const [selectedAbsorption, setSelectedAbsorption] =
    useState<ComponentAbsorption | null>(null);
  const [evaluationDetailsOpen, setEvaluationDetailsOpen] = useState(false);
  const [absorptionDetailsOpen, setAbsorptionDetailsOpen] = useState(false);
  const [newEvaluationOpen, setNewEvaluationOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New evaluation form state
  const [newComponentId, setNewComponentId] = useState("");
  const [newComponentName, setNewComponentName] = useState("");
  const [newSourceRepo, setNewSourceRepo] = useState("");

  useEffect(() => {
    // Fetch evaluations and absorptions
    const fetchData = async () => {
      setLoading(true);
      // In a real implementation, these might be API calls
      setEvaluations(componentRegistry.getAllEvaluations());
      setAbsorptions(componentAbsorber.getAllAbsorptions());
      setLoading(false);
    };

    // Initial data fetch
    fetchData();

    // Set up periodic refresh (every 5 seconds)
    const refreshInterval = setInterval(() => {
      setEvaluations(componentRegistry.getAllEvaluations());
      setAbsorptions(componentAbsorber.getAllAbsorptions());
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewEvaluationDetails = (evaluation: ComponentEvaluation) => {
    setSelectedEvaluation(evaluation);
    setEvaluationDetailsOpen(true);
  };

  const handleViewAbsorptionDetails = (absorption: ComponentAbsorption) => {
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

  const handleStartAbsorption = (evaluation: ComponentEvaluation) => {
    // Use the componentAbsorber to start the absorption process
    try {
      // Define the target location based on component type
      const targetLocation = `src/components/absorbed/${evaluation.componentId}`;

      // Start the absorption process
      const absorption = componentAbsorber.startAbsorption(
        evaluation,
        targetLocation
      );

      // Add the new absorption to the state
      setAbsorptions((prev) => [...prev, absorption]);

      // Log initial message
      componentAbsorber.logAbsorptionMessage(
        evaluation.componentId,
        `Absorption process initiated for ${evaluation.componentName}`
      );

      // Simulate the absorption process with several adaptations

      // After 1 second, record a style adaptation
      setTimeout(() => {
        recordComponentAdaptation(
          evaluation.componentId,
          "style",
          "Updated component styling to match OSPAiN2 theme",
          "Maintain consistent UI appearance across ecosystem",
          ".component { color: blue; }",
          ".component { color: var(--ospain-primary); }"
        );

        componentAbsorber.logAbsorptionMessage(
          evaluation.componentId,
          "Style adaptation completed"
        );
      }, 1000);

      // After 1.5 seconds, record a dependency adaptation
      setTimeout(() => {
        recordComponentAdaptation(
          evaluation.componentId,
          "dependency",
          "Replaced external dependencies with OSPAiN2 internal utilities",
          "Reduce external dependencies and bundle size",
          "import { format } from 'date-fns';",
          "import { format } from '../../utils/dateUtils';"
        );

        componentAbsorber.logAbsorptionMessage(
          evaluation.componentId,
          "Dependency adaptation completed"
        );
      }, 1500);

      // After 2 seconds, record an interface adaptation
      setTimeout(() => {
        recordComponentAdaptation(
          evaluation.componentId,
          "interface",
          "Updated props interface to match OSPAiN2 standards",
          "Ensure type consistency across components",
          "interface Props { data: any }",
          "interface Props { data: OSPAiNComponentData }"
        );

        componentAbsorber.logAbsorptionMessage(
          evaluation.componentId,
          "Interface adaptation completed"
        );
      }, 2000);

      // After 3 seconds, complete the absorption process
      setTimeout(() => {
        componentAbsorber.completeAbsorption(evaluation.componentId, true);

        // Update the absorptions state
        setAbsorptions(componentAbsorber.getAllAbsorptions());

        // Show completion alert
        alert(`Absorption process completed for ${evaluation.componentName}`);
      }, 3000);

      // Show initial feedback to the user
      alert(
        `Absorption process started for ${evaluation.componentName}. Check the Absorptions tab to track progress.`
      );
    } catch (error) {
      console.error("Error starting absorption:", error);
      alert(
        `Error starting absorption: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const getStatusLabel = (status: ComponentEvaluationStatus) => {
    const labels = {
      [ComponentEvaluationStatus.NOT_STARTED]: "Not Started",
      [ComponentEvaluationStatus.IN_PROGRESS]: "In Progress",
      [ComponentEvaluationStatus.COMPLETED]: "Completed",
      [ComponentEvaluationStatus.REJECTED]: "Rejected",
      [ComponentEvaluationStatus.ABSORBED]: "Absorbed",
    };
    return labels[status] || status;
  };

  const getAbsorptionStatusLabel = (status: AbsorptionStatus) => {
    const labels = {
      [AbsorptionStatus.NOT_STARTED]: "Not Started",
      [AbsorptionStatus.IN_PROGRESS]: "In Progress",
      [AbsorptionStatus.COMPLETED]: "Completed",
      [AbsorptionStatus.FAILED]: "Failed",
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
  const recordComponentAdaptation = (
    componentId: string,
    adaptationType:
      | "rename"
      | "modify"
      | "dependency"
      | "interface"
      | "style"
      | "other",
    description: string,
    reason: string,
    before?: string,
    after?: string
  ) => {
    try {
      componentAbsorber.recordAdaptation(componentId, {
        type: adaptationType,
        description,
        reason,
        before,
        after,
      });

      // Refresh the absorptions data
      setAbsorptions(componentAbsorber.getAllAbsorptions());
    } catch (error) {
      console.error("Error recording adaptation:", error);
      alert(
        `Error recording adaptation: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const renderEvaluationSummary = () => {
    const summary = componentRegistry.getEvaluationSummary();

    return (
      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <Typography variant="h6" align="center">
              Total
            </Typography>
            <Typography variant="h4" align="center">
              {summary.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: statusColors[ComponentEvaluationStatus.ABSORBED],
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" align="center">
              Absorbed
            </Typography>
            <Typography variant="h4" align="center">
              {summary.absorbed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: statusColors[ComponentEvaluationStatus.REJECTED],
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" align="center">
              Rejected
            </Typography>
            <Typography variant="h4" align="center">
              {summary.rejected}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: statusColors[ComponentEvaluationStatus.COMPLETED],
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" align="center">
              Pending
            </Typography>
            <Typography variant="h4" align="center">
              {summary.pending}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: statusColors[ComponentEvaluationStatus.IN_PROGRESS],
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" align="center">
              In Progress
            </Typography>
            <Typography variant="h4" align="center">
              {summary.inProgress}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderAbsorptionSummary = () => {
    const summary = componentAbsorber.getAbsorptionSummary();

    return (
      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <Typography variant="h6" align="center">
              Total
            </Typography>
            <Typography variant="h4" align="center">
              {summary.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              bgcolor: absorptionStatusColors[AbsorptionStatus.COMPLETED],
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" align="center">
              Completed
            </Typography>
            <Typography variant="h4" align="center">
              {summary.completed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              bgcolor: absorptionStatusColors[AbsorptionStatus.FAILED],
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" align="center">
              Failed
            </Typography>
            <Typography variant="h4" align="center">
              {summary.failed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              bgcolor: absorptionStatusColors[AbsorptionStatus.IN_PROGRESS],
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" align="center">
              In Progress
            </Typography>
            <Typography variant="h4" align="center">
              {summary.inProgress}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderEvaluationsTab = () => {
    return (
      <Box>
        {renderEvaluationSummary()}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenNewEvaluation}
          >
            New Evaluation
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{ maxHeight: "calc(100vh - 300px)" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Source Repo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Evaluation Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No evaluations found
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => (
                  <TableRow key={evaluation.componentId}>
                    <TableCell>{evaluation.componentName}</TableCell>
                    <TableCell>{evaluation.sourceRepo}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(evaluation.status)}
                        sx={{
                          bgcolor: statusColors[evaluation.status],
                          color: "white",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {(evaluation.score * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {evaluation.evaluationDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewEvaluationDetails(evaluation)}
                        sx={{ mr: 1 }}
                      >
                        Details
                      </Button>
                      {evaluation.status ===
                        ComponentEvaluationStatus.ABSORBED &&
                        !absorptions.some(
                          (a) => a.componentId === evaluation.componentId
                        ) && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleStartAbsorption(evaluation)}
                          >
                            Absorb
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderAbsorptionsTab = () => {
    return (
      <Box>
        {renderAbsorptionSummary()}

        <TableContainer
          component={Paper}
          sx={{ maxHeight: "calc(100vh - 300px)" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Source Repo</TableCell>
                <TableCell>Target Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Completion Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {absorptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No absorptions found
                  </TableCell>
                </TableRow>
              ) : (
                absorptions.map((absorption) => (
                  <TableRow key={absorption.componentId}>
                    <TableCell>{absorption.componentName}</TableCell>
                    <TableCell>{absorption.sourceRepo}</TableCell>
                    <TableCell>{absorption.targetLocation}</TableCell>
                    <TableCell>
                      <Chip
                        label={getAbsorptionStatusLabel(absorption.status)}
                        sx={{
                          bgcolor: absorptionStatusColors[absorption.status],
                          color: "white",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {absorption.startTime.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {absorption.completionTime
                        ? absorption.completionTime.toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewAbsorptionDetails(absorption)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderEvaluationDetailsDialog = () => {
    if (!selectedEvaluation) return null;

    const {
      componentName,
      metrics,
      score,
      status,
      evaluationDate,
      evaluatedBy,
      comments,
    } = selectedEvaluation;

    return (
      <Dialog
        open={evaluationDetailsOpen}
        onClose={handleCloseEvaluationDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5">
            {componentName} Evaluation Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={getStatusLabel(status)}
                  sx={{
                    bgcolor: statusColors[status],
                    color: "white",
                    mt: 1,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Overall Score</Typography>
                <Typography variant="h6">
                  {(score * 100).toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Evaluation Date</Typography>
                <Typography variant="body1">
                  {evaluationDate.toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Evaluated By</Typography>
                <Typography variant="body1">{evaluatedBy}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h6" gutterBottom>
            Metrics
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Performance
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 3 }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Render Time</TableCell>
                      <TableCell align="right">{metrics.renderTime}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Memory Usage</TableCell>
                      <TableCell align="right">{metrics.memoryUsage}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Bundle Size</TableCell>
                      <TableCell align="right">{metrics.bundleSize}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle2" gutterBottom>
                Quality
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 3 }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Code Quality</TableCell>
                      <TableCell align="right">{metrics.codeQuality}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Accessibility</TableCell>
                      <TableCell align="right">
                        {metrics.accessibility}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Test Coverage</TableCell>
                      <TableCell align="right">
                        {metrics.testCoverage}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Integration
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 3 }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Dependency Count</TableCell>
                      <TableCell align="right">
                        {metrics.dependencyCount}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Integration Effort</TableCell>
                      <TableCell align="right">
                        {metrics.integrationEffort}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Compatibility Score</TableCell>
                      <TableCell align="right">
                        {metrics.compatibilityScore}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle2" gutterBottom>
                User Experience
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 3 }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Usability Score</TableCell>
                      <TableCell align="right">
                        {metrics.usabilityScore}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Interactivity Score</TableCell>
                      <TableCell align="right">
                        {metrics.interactivityScore}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle2" gutterBottom>
                Maintenance
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Documentation Quality</TableCell>
                      <TableCell align="right">
                        {metrics.documentationQuality}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maintainability Score</TableCell>
                      <TableCell align="right">
                        {metrics.maintainabilityScore}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Comments
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2">{comments}</Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          {status === ComponentEvaluationStatus.ABSORBED &&
            !absorptions.some(
              (a) => a.componentId === selectedEvaluation.componentId
            ) && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleStartAbsorption(selectedEvaluation)}
              >
                Start Absorption
              </Button>
            )}
          <Button onClick={handleCloseEvaluationDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderAbsorptionDetailsDialog = () => {
    if (!selectedAbsorption) return null;

    const {
      componentName,
      sourceRepo,
      targetLocation,
      status,
      startTime,
      completionTime,
      error,
      absorptionLogs,
      adaptations,
    } = selectedAbsorption;

    return (
      <Dialog
        open={absorptionDetailsOpen}
        onClose={handleCloseAbsorptionDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5">
            {componentName} Absorption Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={getAbsorptionStatusLabel(status)}
                  sx={{
                    bgcolor: absorptionStatusColors[status],
                    color: "white",
                    mt: 1,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Source Repository</Typography>
                <Typography variant="body1">{sourceRepo}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Target Location</Typography>
                <Typography variant="body1">{targetLocation}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Start Time</Typography>
                <Typography variant="body1">
                  {startTime.toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
            {completionTime && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Completion Time</Typography>
                  <Typography variant="body1">
                    {completionTime.toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            )}
            {error && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="error">
                    Error
                  </Typography>
                  <Typography variant="body1" color="error">
                    {error}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            Adaptations
          </Typography>

          {adaptations.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="body2">No adaptations recorded</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adaptations.map((adaptation, index) => (
                    <TableRow key={index}>
                      <TableCell>{adaptation.type}</TableCell>
                      <TableCell>{adaptation.description}</TableCell>
                      <TableCell>{adaptation.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="h6" gutterBottom>
            Logs
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxHeight: 200,
              overflow: "auto",
              bgcolor: "#f5f5f5",
              fontFamily: "monospace",
              fontSize: "0.875rem",
            }}
          >
            {absorptionLogs.map((log, index) => (
              <Box key={index} sx={{ mb: 0.5 }}>
                {log}
              </Box>
            ))}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAbsorptionDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderNewEvaluationDialog = () => {
    return (
      <Dialog
        open={newEvaluationOpen}
        onClose={handleCloseNewEvaluation}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5">New Component Evaluation</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Component ID"
              value={newComponentId}
              onChange={(e) => setNewComponentId(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Component Name"
              value={newComponentName}
              onChange={(e) => setNewComponentName(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Source Repository"
              value={newSourceRepo}
              onChange={(e) => setNewSourceRepo(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewEvaluation}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitNewEvaluation}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Component Manager
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Evaluations" />
          <Tab label="Absorptions" />
        </Tabs>
      </Box>

      {tabValue === 0 ? renderEvaluationsTab() : renderAbsorptionsTab()}

      {/* Dialogs */}
      {renderEvaluationDetailsDialog()}
      {renderAbsorptionDetailsDialog()}
      {renderNewEvaluationDialog()}
    </Box>
  );
};

export default ComponentManager;
