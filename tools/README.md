# Ollama Ecosystem Tools

This directory contains utilities and tools for the Ollama Ecosystem project.

## Daily Metrics Report

The daily metrics reporting system helps track system performance and usage statistics automatically.

### Components

- **generate-daily-report.js**: Node.js script that collects metrics and generates a daily report
- **schedule-daily-report.sh**: Bash script to schedule the daily report as a cron job (Linux/macOS)
- **schedule-daily-report.bat**: Batch file to schedule the daily report using Task Scheduler (Windows)

### Usage

#### Generate a report manually

```bash
node tools/generate-daily-report.js
```

#### Schedule daily report (Linux/macOS)

To schedule at midnight (default):
```bash
bash tools/schedule-daily-report.sh
```

With a custom time:
```bash
bash tools/schedule-daily-report.sh --time 06:00
```

To disable the scheduled report:
```bash
bash tools/schedule-daily-report.sh --disable
```

#### Schedule daily report (Windows)

To schedule at midnight (default):
```bash
tools\schedule-daily-report.bat
```

With a custom time:
```bash
tools\schedule-daily-report.bat /time 06:00
```

To disable the scheduled report:
```bash
tools\schedule-daily-report.bat /disable
```

### Report Location

Reports are saved to `reports/daily/` with the filename format `metrics-YYYY-MM-DD.md`.

### Logs

Log files for the report generation are saved to `logs/daily-report.log`.

## Other Tools

*Additional tools will be documented here as they are added.* 