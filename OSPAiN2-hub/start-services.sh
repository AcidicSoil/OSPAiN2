#!/bin/bash

echo "Starting OSPAiN² Hub services..."

# Check if the script is run with the --api-only flag
API_ONLY=false
for arg in "$@"; do
  if [ "$arg" == "--api-only" ]; then
    API_ONLY=true
  fi
done

# Set the API port
API_PORT=3002

# Start the API server in the background and capture its output
echo "Starting API server..."
node server.js > .server-output.log 2>&1 &
API_PID=$!

# Function to cleanup on exit
cleanup() {
  echo "Shutting down services..."
  if [ -n "$API_PID" ]; then
    echo "Stopping API server (PID: $API_PID)..."
    kill $API_PID 2>/dev/null || true
  fi
  
  if [ -n "$REACT_PID" ]; then
    echo "Stopping React development server (PID: $REACT_PID)..."
    kill $REACT_PID 2>/dev/null || true
  fi
  
  # Remove temporary log file
  rm -f .server-output.log
  
  echo "All services stopped."
  exit 0
}

# Set up trap to catch SIGINT (Ctrl+C) and exit the script gracefully
trap cleanup SIGINT SIGTERM

# Wait for the API server to start and extract the port
echo "Waiting for API server to initialize..."
TIMEOUT=10
START_TIME=$(date +%s)
ACTUAL_PORT=""

while [ -z "$ACTUAL_PORT" ] && [ $(($(date +%s) - START_TIME)) -lt $TIMEOUT ]; do
  if grep -q "API server running on port" .server-output.log; then
    ACTUAL_PORT=$(grep "API server running on port" .server-output.log | sed 's/.*port \([0-9]*\).*/\1/')
    break
  fi
  sleep 0.5
done

if [ -z "$ACTUAL_PORT" ]; then
  echo "Warning: Could not determine the API server port after $TIMEOUT seconds."
  echo "Using default port 3002."
  ACTUAL_PORT=3002
else
  echo "API server is running on port $ACTUAL_PORT"
fi

if [ "$API_ONLY" = true ]; then
  echo "Running in API-only mode. React development server will not be started."
  echo "You can start the React development server separately with 'npm start'"
  echo "API server is running on http://localhost:${ACTUAL_PORT}"
  echo "Press Ctrl+C to stop the services."
  
  # Display the log output in real-time
  tail -f .server-output.log &
  TAIL_PID=$!
  
  # Wait for the API server
  wait $API_PID
  kill $TAIL_PID 2>/dev/null || true
else
  # Start the frontend application with REACT_APP_API_PORT set to the actual port
  echo "Starting React development server..."
  
  # Check if we should use npm or yarn
  if [ -f "yarn.lock" ]; then
    REACT_APP_API_PORT=$ACTUAL_PORT yarn start &
  else
    REACT_APP_API_PORT=$ACTUAL_PORT npm start &
  fi
  
  REACT_PID=$!
  
  echo "React development server starting... (PID: $REACT_PID)"
  echo "The application will be available at http://localhost:3000"
  echo "API server is running on http://localhost:${ACTUAL_PORT}"
  echo "Press Ctrl+C to stop all services."
  
  # Display the API server log output in real-time
  tail -f .server-output.log &
  TAIL_PID=$!
  
  # Wait for both processes
  wait $API_PID $REACT_PID
  kill $TAIL_PID 2>/dev/null || true
fi

# If we get here, the processes have exited
cleanup 