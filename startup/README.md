# OSPAiN₂ Server Startup Scripts

This directory contains scripts and configuration files for automatically starting the OSPAiN₂ server on different platforms and environments.

## Available Scripts

### For Windows

- `ospain2-startup.bat` - Basic Windows batch script to start the OSPAiN₂ server
- `setup-windows-task.bat` - Setup script to create a Windows Task Scheduler task for automatic startup

### For Unix/Linux

- `ospain2-startup.sh` - Shell script to start the OSPAiN₂ server on Unix-like systems
- `ospain2.service` - Systemd service configuration file for Linux systems

### Cross-Platform

- `health-check.js` - Node.js script for monitoring the OSPAiN₂ server health and automatic restart
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

#### Automatic Startup with Task Scheduler

1. Right-click on `startup\setup-windows-task.bat` and select "Run as administrator"
2. Follow the on-screen instructions
3. The OSPAiN₂ server will now start automatically when you log in

### Unix/Linux

#### Basic Startup

1. Navigate to the project root directory
2. Run `./startup/ospain2-startup.sh`

For development mode:

```
./startup/ospain2-startup.sh dev
```

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

### PM2 Process Manager

If you have PM2 installed globally:

```
pm2 start startup/ecosystem.config.js
```

For development mode:

```
pm2 start startup/ecosystem.config.js --env development
```

To save the PM2 configuration for restart on system boot:

```
pm2 save
pm2 startup
```

### Health Check Monitoring

To start the health monitoring script:

```
node startup/health-check.js
```

The health check server will run on port 3099 and provide status at http://localhost:3099/health

## Configuration

- OSPAiN₂ server runs on port 3001 by default (configurable in the scripts)
- Health check server runs on port 3099 by default
- Log files are stored in the `logs` directory at the project root

## Troubleshooting

- If the server fails to start, check the logs in the `logs` directory
- Ensure Node.js and npm are installed and in your PATH
- Verify the project structure and ensure `ollama-schematics-ui` directory exists
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
