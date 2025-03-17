#!/bin/bash
# install-dependencies.sh - Install all necessary dependencies for OSPAiN2
# Source the logger
source "$(dirname "$0")/logger.sh"

# Initialize log file
LOG_FILE=$(initialize_log "$0")
log_message "$LOG_FILE" 2 "Starting OSPAiN2 dependency installation"

# Check if running as root/admin (might be needed for some package installations)
if [ "$(id -u)" -eq 0 ]; then
    log_message "$LOG_FILE" 3 "Script is running as root. This might cause permission issues with npm/pnpm."
fi

# Check for Python
log_message "$LOG_FILE" 2 "Checking for Python..."
if command -v python &> /dev/null; then
    python_version=$(python --version 2>&1)
    log_message "$LOG_FILE" 2 "Python is already installed: $python_version"
else
    log_message "$LOG_FILE" 4 "Python is not installed. Please install Python before continuing."
    exit 1
fi

# Check for Node.js
log_message "$LOG_FILE" 2 "Checking for Node.js..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    log_message "$LOG_FILE" 2 "Node.js is already installed: $node_version"
else
    log_message "$LOG_FILE" 4 "Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Check for package managers
log_message "$LOG_FILE" 2 "Checking for package managers..."
if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm --version)
    log_message "$LOG_FILE" 2 "pnpm is already installed: $pnpm_version"
    PKG_MGR="pnpm"
elif command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    log_message "$LOG_FILE" 2 "npm is already installed: $npm_version"
    PKG_MGR="npm"
    
    # Try to install pnpm
    log_message "$LOG_FILE" 2 "Attempting to install pnpm..."
    npm install -g pnpm
    if command -v pnpm &> /dev/null; then
        pnpm_version=$(pnpm --version)
        log_message "$LOG_FILE" 2 "Successfully installed pnpm: $pnpm_version"
        PKG_MGR="pnpm"
    else
        log_message "$LOG_FILE" 3 "Failed to install pnpm, continuing with npm"
    fi
else
    log_message "$LOG_FILE" 4 "Neither pnpm nor npm found. Please install Node.js with npm."
    exit 1
fi

# Install Python dependencies
log_message "$LOG_FILE" 2 "Installing Python dependencies..."
python -m pip install --upgrade pip || {
    log_message "$LOG_FILE" 3 "Failed to upgrade pip, continuing with existing version"
}

python -m pip install -r requirements.txt || {
    # Try creating a minimal requirements file if the original doesn't exist
    if [ ! -f "requirements.txt" ]; then
        log_message "$LOG_FILE" 3 "requirements.txt not found, creating minimal version"
        cat > requirements.txt << EOF
requests>=2.25.0
websockets>=10.0
python-dotenv>=0.19.0
aiohttp>=3.8.0
EOF
        python -m pip install -r requirements.txt || {
            log_message "$LOG_FILE" 4 "Failed to install Python dependencies"
            exit 1
        }
    else
        log_message "$LOG_FILE" 4 "Failed to install Python dependencies"
        exit 1
    fi
}
log_message "$LOG_FILE" 2 "Python dependencies installed successfully"

# Install Node.js dependencies for the project
if [ -d "OSPAiN2-hub-new" ]; then
    log_message "$LOG_FILE" 2 "Installing OSPAiN2-hub-new dependencies..."
    cd OSPAiN2-hub-new || {
        log_message "$LOG_FILE" 4 "Failed to change to OSPAiN2-hub-new directory"
        exit 1
    }
    
    # Remove node_modules if clean install is needed
    if [ "$1" = "--clean" ]; then
        log_message "$LOG_FILE" 2 "Removing existing node_modules for clean install"
        rm -rf node_modules
    fi
    
    # Install dependencies
    $PKG_MGR install || {
        log_message "$LOG_FILE" 4 "Failed to install frontend dependencies"
        exit 1
    }
    log_message "$LOG_FILE" 2 "Frontend dependencies installed successfully"
    
    # Return to original directory
    cd .. || {
        log_message "$LOG_FILE" 3 "Failed to return to original directory"
    }
else
    log_message "$LOG_FILE" 4 "OSPAiN2-hub-new directory not found"
    exit 1
fi

# Install global tools
log_message "$LOG_FILE" 2 "Installing global tools..."

# Check if TypeScript is installed globally
if ! command -v tsc &> /dev/null; then
    log_message "$LOG_FILE" 2 "Installing TypeScript globally..."
    npm install -g typescript || {
        log_message "$LOG_FILE" 3 "Failed to install TypeScript globally"
    }
else
    tsc_version=$(tsc --version)
    log_message "$LOG_FILE" 2 "TypeScript is already installed globally: $tsc_version"
fi

# Check if Vite is installed globally
if ! command -v vite &> /dev/null; then
    log_message "$LOG_FILE" 2 "Installing Vite globally..."
    npm install -g vite || {
        log_message "$LOG_FILE" 3 "Failed to install Vite globally"
    }
else
    vite_version=$(vite --version 2>&1)
    log_message "$LOG_FILE" 2 "Vite is already installed globally: $vite_version"
fi

# Create an empty .env file if it doesn't exist
if [ ! -f ".env" ]; then
    log_message "$LOG_FILE" 2 "Creating empty .env file..."
    cat > .env << EOF
# OSPAiN2 Environment Configuration
# Created by install-dependencies.sh on $(date)

# MCP Server Configuration
MCP_SERVER_PORT=3002

# Frontend Configuration
VITE_API_URL=http://localhost:3002
EOF
    log_message "$LOG_FILE" 2 "Empty .env file created"
fi

# Install t2p tools if not available
if ! command -v t2p &> /dev/null; then
    log_message "$LOG_FILE" 2 "Installing t2p tools..."
    if [ -d "t2p" ]; then
        cd t2p || {
            log_message "$LOG_FILE" 4 "Failed to change to t2p directory"
            exit 1
        }
        $PKG_MGR install || {
            log_message "$LOG_FILE" 3 "Failed to install t2p dependencies"
        }
        $PKG_MGR link || {
            log_message "$LOG_FILE" 3 "Failed to link t2p globally"
        }
        cd .. || {
            log_message "$LOG_FILE" 3 "Failed to return to original directory"
        }
    else
        log_message "$LOG_FILE" 3 "t2p directory not found, skipping installation"
    fi
else
    log_message "$LOG_FILE" 2 "t2p tools are already installed"
fi

# Create logs directory if it doesn't exist
mkdir -p logs
log_message "$LOG_FILE" 2 "Created logs directory (if it didn't exist)"

# Final summary
log_message "$LOG_FILE" 2 "==== Installation Summary ===="
log_message "$LOG_FILE" 2 "Python version: $(python --version 2>&1)"
log_message "$LOG_FILE" 2 "Node.js version: $(node --version)"
log_message "$LOG_FILE" 2 "Package manager: $PKG_MGR version $(eval "$PKG_MGR --version")"
log_message "$LOG_FILE" 2 "Frontend dependencies: Installed in OSPAiN2-hub-new"
log_message "$LOG_FILE" 2 "Environment setup: .env file available"

# Show next steps
log_message "$LOG_FILE" 2 "OSPAiN2 dependency installation complete"
log_message "$LOG_FILE" 2 ""
log_message "$LOG_FILE" 2 "Next steps:"
log_message "$LOG_FILE" 2 "1. Start the server: ./start-ospain-hub.sh"
log_message "$LOG_FILE" 2 "2. Check system status: ./system-status.sh" 