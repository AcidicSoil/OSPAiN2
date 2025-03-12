# GitHub Backup System - Quick Start Guide

This guide provides a quick overview of how to use the GitHub backup system for OSPAiN2.

## 1. Test Your GitHub Connection

First, verify that your system can connect to the GitHub repository:

### On Linux/macOS/Git Bash:

```bash
./backup-scripts/test-github-connection.sh
```

### On Windows PowerShell:

```powershell
.\backup-scripts\test-github-connection.ps1
```

Review the output to ensure you have proper access. If there are issues with push access, you'll need to set up credentials.

## 2. Run a Manual Backup Test

Before setting up scheduled backups, test the backup process manually:

### On Linux/macOS/Git Bash:

```bash
./backup-scripts/test-backup.sh
```

### On Windows PowerShell:

```powershell
.\backup-scripts\test-backup.ps1
```

This will check for changes and simulate the backup process without actually pushing changes.

## 3. Configure Git Credentials

To enable automatic pushing to GitHub, configure your credentials:

### Using SSH Keys (Recommended)

1. Generate an SSH key if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add the key to your GitHub account
3. Test the connection:
   ```bash
   ssh -T git@github.com
   ```

### Using Git Credential Helper

```bash
git config --global credential.helper cache
# or on Windows
git config --global credential.helper wincred
```

Then perform a manual push once to cache credentials.

## 4. Set Up Scheduled Backups

Once connection testing is successful, set up scheduled backups:

### On Linux/macOS/Git Bash:

```bash
./backup-scripts/setup-schedule.sh
```

### On Windows PowerShell:

```powershell
# Run as Administrator
.\backup-scripts\setup-schedule.ps1
```

## 5. Customize Backup Configuration (Optional)

Edit `backup-scripts/backup-config.json` to customize:

- Backup intervals and timing
- Commit message format
- Files to exclude from backup

## 6. Run a Manual Backup

To manually trigger a backup at any time:

### On Linux/macOS/Git Bash:

```bash
./backup-scripts/github-backup.sh
```

### On Windows PowerShell:

```powershell
.\backup-scripts\github-backup.ps1
```

## 7. Check Backup Logs

Monitor the backup process through log files in the `logs/` directory:

```bash
cat logs/github-backup.log
```

## Need Help?

For detailed instructions, see the full documentation in:

- `GITHUB_BACKUP.md` in the root directory
- `backup-scripts/README.md` for detailed backup system documentation
