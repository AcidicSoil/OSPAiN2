const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// API endpoint to serve the todo file content
app.get("/api/todo", (req, res) => {
  try {
    // Read the master-todo.md file from the project root
    const todoFilePath = path.join(__dirname, "..", "master-todo.mdc");

    if (fs.existsSync(todoFilePath)) {
      const fileContent = fs.readFileSync(todoFilePath, "utf8");

      // Return the file content as JSON
      res.json({
        content: fileContent,
        parsedData: {
          categories: [
            { name: "AI Infrastructure", priority: 1, progress: 40 },
            { name: "Agent Framework", priority: 1, progress: 25 },
            { name: "Development Tools", priority: 1, progress: 35 },
            { name: "Continuity System", priority: 2, progress: 45 },
            { name: "Mode Orchestration", priority: 2, progress: 55 },
            { name: "Frontend Implementation", priority: 3, progress: 45 },
            { name: "Backend Development", priority: 3, progress: 35 },
            { name: "Mobile Support", priority: 4, progress: 5 },
            { name: "Security & Compliance", priority: 4, progress: 40 },
          ],
          overallProgress: 35,
        },
      });
    } else {
      // If file doesn't exist, return mock data
      console.warn(
        `Todo file not found at ${todoFilePath}, returning mock data`
      );
      res.json({
        content: "# Mock Todo File - Actual file not found",
        parsedData: {
          categories: [{ name: "Mock Category", priority: 1, progress: 50 }],
          overallProgress: 20,
        },
      });
    }
  } catch (error) {
    console.error("Error serving todo file:", error);
    res.status(500).json({ error: "Failed to fetch todo data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/todo`);
});
