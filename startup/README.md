# OSPAiN₂ Server Startup Scripts

This directory contains scripts and configuration files for automatically starting the OSPAiN₂ server on different platforms and environments.

## Available Scripts

### For Windows

- `ospain2-startup.bat` - Basic Windows batch script to start the OSPAiN₂ server
- `knowledge-graph-startup.bat` - Windows batch script to start the Knowledge Graph server
- `setup-windows-task.bat` - Setup script to create a Windows Task Scheduler task for automatic OSPAiN₂ startup
- `setup-kg-windows-task.bat` - Setup script to create a Windows Task Scheduler task for automatic Knowledge Graph startup
- `start-all.bat` - Combined script to start both OSPAiN₂ and Knowledge Graph servers

### For Unix/Linux

- `ospain2-startup.sh` - Shell script to start the OSPAiN₂ server on Unix-like systems
- `knowledge-graph-startup.sh` - Shell script to start the Knowledge Graph server on Unix-like systems
- `ospain2.service` - Systemd service configuration file for Linux systems
- `knowledge-graph.service` - Systemd service configuration file for the Knowledge Graph server for Linux systems
- `start-all.sh` - Combined script to start both OSPAiN₂ and Knowledge Graph servers

### Cross-Platform

- `health-check.js` - Node.js script for monitoring the OSPAiN₂ server health and automatic restart
- `knowledge-graph-health-check.js` - Node.js script for monitoring the Knowledge Graph server health and automatic restart
- `check-status.js` - Node.js script for checking the status of both servers
- `ecosystem.config.js` - PM2 process manager configuration file

## Usage Instructions

### Windows

#### Basic Startup

1. Navigate to the project root directory
2. Run `startup\ospain2-startup.bat`

For development mode:

```
startup\ospain2-startup.bat dev
```

#### Knowledge Graph Server Startup

1. Navigate to the project root directory
2. Run `startup\knowledge-graph-startup.bat`

#### Automatic Startup with Task Scheduler

1. Right-click on `startup\setup-windows-task.bat` and select "Run as administrator"
2. Follow the on-screen instructions
3. The OSPAiN₂ server will now start automatically when you log in

#### Knowledge Graph Automatic Startup with Task Scheduler

1. Right-click on `startup\setup-kg-windows-task.bat` and select "Run as administrator"
2. Follow the on-screen instructions
3. The Knowledge Graph server will now start automatically when you log in

#### Combined Startup (Both Servers)

1. Navigate to the project root directory
2. Run `startup\start-all.bat`

For development mode:

```
startup\start-all.bat dev
```

This will start both the OSPAiN₂ server and the Knowledge Graph server together.

### Unix/Linux

#### Basic Startup

1. Navigate to the project root directory
2. Run `./startup/ospain2-startup.sh`

For development mode:

```
./startup/ospain2-startup.sh dev
```

#### Knowledge Graph Server Startup

1. Navigate to the project root directory
2. Run `./startup/knowledge-graph-startup.sh`

#### Systemd Service Setup

1. Edit `startup/ospain2.service` and replace `/path/to/ospain2` with your actual project path
2. Copy the file to systemd:
   ```
   sudo cp startup/ospain2.service /etc/systemd/system/
   ```
3. Enable and start the service:
   ```
   sudo systemctl enable ospain2.service
   sudo systemctl start ospain2.service
   ```
4. Check status:
   ```
   sudo systemctl status ospain2.service
   ```

#### Knowledge Graph Systemd Service Setup

1. Edit `startup/knowledge-graph.service` and replace the path with your actual project path
2. Copy the file to systemd:
   ```
   sudo cp startup/knowledge-graph.service /etc/systemd/system/
   ```
3. Enable and start the service:
   ```
   sudo systemctl enable knowledge-graph.service
   sudo systemctl start knowledge-graph.service
   ```
4. Check status:
   ```
   sudo systemctl status knowledge-graph.service
   ```

#### Combined Startup (Both Servers)

1. Navigate to the project root directory
2. Run `./startup/start-all.sh`

For development mode:

```
./startup/start-all.sh dev
```

This will start both the OSPAiN₂ server and the Knowledge Graph server together.

### PM2 Process Manager

If you have PM2 installed globally:

```
pm2 start startup/ecosystem.config.js
```

For development mode:

```
pm2 start startup/ecosystem.config.js --env development
```

This will start both the OSPAiN₂ server and the Knowledge Graph server as configured in the ecosystem.config.js file.

To save the PM2 configuration for restart on system boot:

```
pm2 save
pm2 startup
```

### Health Check Monitoring

To start the OSPAiN₂ health monitoring script:

```
node startup/health-check.js
```

To start the Knowledge Graph health monitoring script:

```
node startup/knowledge-graph-health-check.js
```

The OSPAiN₂ health check server will run on port 3099 and provide status at http://localhost:3099/health

### Status Check

To check the status of all servers in the ecosystem:

```
node startup/check-status.js
```

This will check if both the OSPAiN₂ server and the Knowledge Graph server are running and responding to health checks.

## Configuration

- OSPAiN₂ server runs on port 3001 by default (configurable in the scripts)
- Knowledge Graph server runs on port 3005 by default (configurable in the scripts)
- Health check server runs on port 3099 by default
- Log files are stored in the `logs` directory at the project root

## Troubleshooting

- If the server fails to start, check the logs in the `logs` directory
- Ensure Node.js and npm are installed and in your PATH
- Verify the project structure and ensure `OSPAiN2-hub` directory exists for the main server
- Verify the project structure and ensure `mcp-knowledge-graph` directory exists for the Knowledge Graph server
- For Windows Task Scheduler issues, check the Windows Event Viewer
- For systemd issues, check the journal logs: `journalctl -u ospain2.service`

## Customization

You can modify the scripts to adjust:

- Port numbers
- Environmental variables
- Check intervals
- Restart behavior
- Log locations

Edit the corresponding configuration files to match your specific requirements.
