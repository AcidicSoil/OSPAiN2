# System File Manager

## Overview

The `system-file-manager.sh` script automates the management of system-level MDC files that use the `@` prefix convention. It provides tools for tagging and untagging files, updating references, scanning for potential system files, and generating reports on system file status.

## Features

- **Tagging System Files**: Add `@` prefix to files that should be designated as system files
- **Untagging System Files**: Remove `@` prefix when needed
- **Reference Management**: Automatically update references to system files throughout the codebase
- **System File Scanning**: Identify MDC files that appear to be system files but don't have the `@` prefix
- **Reporting**: Generate reports on system file status and consistency issues
- **Safety Options**: Includes dry-run and backup options to prevent data loss

## Usage

```bash
./system-file-manager.sh [command] [options]
```

### Commands

- `tag <file.mdc>` - Add `@` prefix to a file and update references
- `untag <@file.mdc>` - Remove `@` prefix from a file and update references
- `list` - List all system files with `@` prefix
- `scan` - Scan for potential system files that should have `@` prefix
- `update-refs` - Update all references to system files in the codebase
- `report` - Generate a report of system files status
- `help` - Show help message

### Options

- `--dry-run` - Show what would be done without making changes
- `--backup` - Create backups of modified files
- `--force` - Force operation without confirmation

## Examples

### Tag a file as a system file

```bash
./system-file-manager.sh tag horizon-map.mdc
```

This adds the `@` prefix to `horizon-map.mdc` and updates references throughout the codebase.

### List all system files

```bash
./system-file-manager.sh list
```

Displays a list of all files with the `@` prefix.

### Scan for potential system files

```bash
./system-file-manager.sh scan
```

Scans the codebase for MDC files that appear to be system files but don't have the `@` prefix.

### Generate a report

```bash
./system-file-manager.sh report
```

Generates a report on system file status and consistency issues.

## System File Criteria

The script uses the following criteria to identify system files:

1. Files with `alwaysApply: true` in their header
2. Files with `todo:: master` in their header
3. Files containing specific system-level indicators:
   - `## High Priority Tasks`
   - `## Status Indicators`
   - `## Development Modes Framework`
   - `## Horizon Management`

## Configuration

The script maintains a `system-files-manifest.json` file that tracks system files. This is automatically updated when files are tagged or untagged.

## Implementation Details

### File Tagging Process

When tagging a file:

1. The script verifies if the file meets system file criteria
2. It creates a backup if requested
3. It copies the file with the `@` prefix added
4. It updates references throughout the codebase
5. It adds the file to the system files manifest

### Reference Updating

The script searches for references to the file name in all project files (excluding directories like `node_modules`, `.git`, etc.) and updates them to use the `@` prefix.

## Benefits

- **Consistency**: Ensures consistent application of the `@` prefix convention
- **Automation**: Eliminates manual work in maintaining file references
- **Safety**: Provides options to prevent data loss during operations
- **Visibility**: Makes it easy to identify and manage system-level files
- **Reporting**: Helps identify and fix consistency issues

## Related Documentation

- [MDC Naming Convention](./mdc-naming-convention.md) 