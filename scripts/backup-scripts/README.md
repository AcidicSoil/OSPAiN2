# GitHub Backup Automation System

This directory contains scripts to automate the backup of the OSPAiN2 project to GitHub through scheduled commits and pushes.

## Overview

The GitHub Backup Automation System provides:

- Automatic detection of changes in the repository
- Scheduled commits and pushes to GitHub
- Detailed logging and error handling
- Cross-platform support (Windows PowerShell and Unix-like bash)
- Customizable configuration options

## Files

- `github-backup.sh` - Bash script for Linux/macOS
- `github-backup.ps1` - PowerShell script for Windows
- `backup-config.json` - Configuration settings for backup behavior
- `setup-schedule.sh` / `setup-schedule.ps1` - Scripts to set up automated scheduling
- `README.md` - This documentation file

## Installation

### For Linux/macOS

1. Make the scripts executable:

   ```bash
   chmod +x backup-scripts/*.sh
   ```

2. Set up the scheduled task with:
   ```bash
   ./backup-scripts/setup-schedule.sh
   ```

### For Windows

1. Run PowerShell as Administrator and set execution policy (if needed):

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. Set up the scheduled task with:
   ```powershell
   .\backup-scripts\setup-schedule.ps1
   ```

## Configuration

Edit the `backup-config.json` file to customize:

- Git user information
- Commit message prefix
- Backup intervals (hourly, daily, weekly)
- Files to exclude from backups
- Logging preferences
- Notification settings
- GitHub repository URL (currently set to https://github.com/AcidicSoil/OSPAiN2.git)

## Manual Execution

To run a backup manually:

### Linux/macOS:

```bash
./backup-scripts/github-backup.sh
```

### Windows:

```powershell
.\backup-scripts\github-backup.ps1
```

## Viewing Logs

Logs are stored in the `logs/github-backup.log` file at the root of the repository.

## Modifying the Schedule

### Linux/macOS

The script uses `crontab` for scheduling. To modify:

```bash
crontab -e
```

### Windows

The script uses Windows Task Scheduler. To modify:

1. Open Task Scheduler
2. Find the "OSPAiN2 GitHub Backup" task
3. Right-click and select "Properties"

## Troubleshooting

### Common Issues:

1. **Authentication Failures**:

   - Ensure you've set up SSH keys or cached credentials
   - Check that the remote is properly configured

2. **Permission Denied**:

   - Verify the user has write access to the repository
   - Check file permissions on the scripts

3. **Script Not Running on Schedule**:
   - Verify crontab/Task Scheduler is properly configured
   - Check system logs for scheduling errors

## Security Considerations

- The scripts do not store GitHub credentials
- Use SSH keys or credential managers for authentication
- Review the Git user configuration in `backup-config.json`

## Contributing

To improve these scripts:

1. Fork the repository
2. Make your changes
3. Submit a pull request with a clear description of the improvements

## License

These scripts are part of the OSPAiN2 project and are subject to the same license terms as the main project.
