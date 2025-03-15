#!/bin/bash

# Test suite for knowledge-graph-startup.sh
echo "Running Knowledge Graph Startup Script Tests"
echo "=========================================="

# Helper function to clean up test processes
cleanup() {
    echo "Cleaning up test processes..."
    if [ -f "../../data/knowledge-graph.pid" ]; then
        kill $(cat ../../data/knowledge-graph.pid) 2>/dev/null
        rm ../../data/knowledge-graph.pid
    fi
    rm -rf ../../test_data ../../test_logs 2>/dev/null
}

# Set up test environment
setup() {
    echo "Setting up test environment..."
    cleanup
    mkdir -p ../../test_data ../../test_logs
}

# Run a test case and report result
run_test() {
    local test_name=$1
    local test_cmd=$2
    echo -n "Testing $test_name... "
    if eval "$test_cmd"; then
        echo "PASSED"
        return 0
    else
        echo "FAILED"
        return 1
    fi
}

# Test Cases

# Test 1: Directory Creation
test_directory_creation() {
    rm -rf ../../logs ../../data
    ../knowledge-graph-startup.sh
    run_test "Directory Creation" "[ -d '../../logs' ] && [ -d '../../data' ]"
}

# Test 2: Port Auto-selection
test_port_autoselection() {
    # Start a temporary server on port 3004
    node -e "const http=require('http');const s=http.createServer();s.listen(3004,'localhost',()=>{console.log('Test server running on 3004')})" &
    TEST_SERVER_PID=$!
    sleep 2
    
    # Start Knowledge Graph server
    ../knowledge-graph-startup.sh
    
    # Check if server started on a different port
    sleep 2
    run_test "Port Auto-selection" "netstat -an | grep LISTEN | grep -E '3005|3006|3007'"
    
    # Cleanup
    kill $TEST_SERVER_PID 2>/dev/null
}

# Test 3: Server Already Running Detection
test_server_running_detection() {
    # Start server first time
    ../knowledge-graph-startup.sh
    sleep 2
    
    # Try to start again and capture output
    OUTPUT=$(../knowledge-graph-startup.sh 2>&1)
    run_test "Server Running Detection" "echo '$OUTPUT' | grep -q 'already running'"
}

# Test 4: Node.js Requirement
test_node_requirement() {
    # Temporarily move node executable
    if command -v node > /dev/null; then
        OLD_PATH="$PATH"
        export PATH=$(echo "$PATH" | tr ':' '\n' | grep -v "node" | tr '\n' ':')
        OUTPUT=$(../knowledge-graph-startup.sh 2>&1)
        export PATH="$OLD_PATH"
        run_test "Node.js Requirement" "echo '$OUTPUT' | grep -q 'Node.js is not installed'"
    else
        echo "Skipping Node.js requirement test (Node.js not found)"
    fi
}

# Test 5: Log File Creation
test_log_file_creation() {
    ../knowledge-graph-startup.sh
    sleep 2
    run_test "Log File Creation" "[ -f '../../logs/knowledge-graph.log' ]"
}

# Run all tests
echo "Starting tests..."
setup

test_directory_creation
test_port_autoselection
test_server_running_detection
test_node_requirement
test_log_file_creation

# Final cleanup
cleanup

echo "Tests completed." 