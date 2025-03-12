# OSPAiN2 GitHub Backup System

This document provides information about the automated GitHub backup system implemented for the OSPAiN2 project.

## Overview

The GitHub Backup System automatically commits and pushes changes to the OSPAiN2 GitHub repository at scheduled intervals. This ensures that your work is regularly backed up and preserved, reducing the risk of data loss.

## Repository Information

The system is configured to backup to the following GitHub repository:

- **Repository URL**: https://github.com/AcidicSoil/OSPAiN2.git
- **Branch**: main

## Backup Schedule

By default, the system is configured to perform:

- Daily backups at 11:00 PM
- Weekly backups on Sundays at 10:00 PM

## Directory Structure

The backup system consists of the following files:

```
backup-scripts/
├── README.md                  # Detailed documentation
├── backup-config.json         # Configuration settings
├── github-backup.sh           # Bash script for Unix/Linux/Mac
├── github-backup.ps1          # PowerShell script for Windows
├── setup-schedule.sh          # Scheduler for Unix/Linux/Mac
├── setup-schedule.ps1         # Scheduler for Windows
├── test-backup.sh             # Test script for Unix/Linux/Mac
├── test-backup.ps1            # Test script for Windows
└── test-github-connection.sh  # Repository connectivity tester
```

## Getting Started

### Prerequisites

- Git installed and configured
- Access to the GitHub repository
- Either:
  - Bash shell (for Linux/macOS/Git Bash on Windows)
  - PowerShell (for Windows)

### Setup Instructions

#### For Linux/macOS/Git Bash:

1. Test your connection to the GitHub repository:

   ```bash
   ./backup-scripts/test-github-connection.sh
   ```

2. Set up the scheduled backups:
   ```bash
   ./backup-scripts/setup-schedule.sh
   ```

#### For Windows (PowerShell):

1. Open PowerShell as Administrator and set execution policy (if needed):

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. Set up the scheduled backups:
   ```powershell
   .\backup-scripts\setup-schedule.ps1
   ```

### Manual Backup

You can run a manual backup at any time:

#### For Linux/macOS/Git Bash:

```bash
./backup-scripts/github-backup.sh
```

#### For Windows (PowerShell):

```powershell
.\backup-scripts\github-backup.ps1
```

## Configuration

You can customize the backup behavior by editing `backup-scripts/backup-config.json`:

- Change backup intervals
- Modify the commit message prefix
- Update Git user information
- Configure path exclusions

## Logs

Logs are stored in the `logs/` directory:

- `github-backup.log` - Backup operation logs
- `scheduler-setup.log` - Scheduler setup logs
- `backup-test.log` - Test run logs
- `github-connection-test.log` - Connection test logs

## Troubleshooting

If you encounter issues with the backup system:

1. Check the log files in the `logs/` directory
2. Verify your Git credentials are configured correctly
3. Run the test scripts to diagnose issues:
   ```bash
   ./backup-scripts/test-github-connection.sh
   ./backup-scripts/test-backup.sh
   ```

### Common Issues

1. **Authentication Failures**:

   - Ensure you've set up SSH keys or credential caching
   - Check that you have push access to the repository

2. **Scheduling Issues**:

   - Verify that cron (Linux/Mac) or Task Scheduler (Windows) is running
   - Check system logs for scheduling errors

3. **Git Configuration**:
   - Ensure Git is properly installed and configured
   - Verify that your Git user information is correct

## Security Considerations

- The scripts do not store GitHub credentials
- Use SSH keys or credential managers for authentication
- Review the Git user configuration in `backup-config.json`

## License

This backup system is part of the OSPAiN2 project and is subject to the same license terms as the main project.
