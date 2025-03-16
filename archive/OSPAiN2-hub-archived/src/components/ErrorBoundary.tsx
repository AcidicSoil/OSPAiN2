import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 *
 * A React error boundary that catches JavaScript errors anywhere in its child
 * component tree and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use default error UI
      return (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            m: 2,
            backgroundColor: "rgba(255, 235, 235, 0.8)",
            border: "1px solid #ffcccc",
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>

          <Typography variant="body1" paragraph>
            An error occurred in this component.
          </Typography>

          {this.state.error && (
            <Box
              sx={{
                my: 2,
                p: 2,
                backgroundColor: "#f8f8f8",
                borderRadius: 1,
                maxHeight: "200px",
                overflow: "auto",
              }}
            >
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
              >
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
