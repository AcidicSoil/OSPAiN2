import React, { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface PageContainerProps {
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string | number;
  padding?: number;
}

/**
 * PageContainer component that provides a consistent layout container for pages
 * @param {string} title - Optional title to display at the top of the container
 * @param {string} description - Optional description text to display below the title
 * @param {ReactNode} children - Content to be rendered inside the container
 * @param {string|number} maxWidth - Optional maximum width of the container
 * @param {number} padding - Optional padding value for the container
 */
const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  children,
  maxWidth = "100%",
  padding = 3,
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth,
          padding,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {title && (
          <Typography variant="h5" component="h1" gutterBottom>
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {description}
          </Typography>
        )}
        {children}
      </Paper>
    </Box>
  );
};

export default PageContainer;
