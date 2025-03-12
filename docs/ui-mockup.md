# Cursor CLI UI Mockup

This document provides a visual representation of the CLI tool's user interface and interaction flow.

## Command Line Interface

### Sending a Prompt

```
$ cursor-cli prompt "Fix the bug in auth.ts"
✓ Connected to Cursor IDE
✓ Prompt sent successfully
```

### Interactive Chat Session

```
$ cursor-cli chat
✓ Connected to Cursor IDE
Starting interactive chat session. Type "exit" or press Ctrl+C to quit.
Enter your prompts:
> How do I implement JWT authentication?
✓ Prompt sent successfully
> What's the best way to handle refresh tokens?
✓ Prompt sent successfully
> exit
Ending chat session...
```

### Sending a Prompt from a File

```
$ cursor-cli send --file=prompt.txt
✓ Reading prompt file...
✓ Connected to Cursor IDE
✓ Prompt sent successfully
```

### Configuration Management

```
$ cursor-cli config list
Current Configuration:
host: localhost
port: 8765
defaultWindow: default

$ cursor-cli config set host 192.168.1.100
✓ Configuration updated: host = 192.168.1.100

$ cursor-cli config get host
host: 192.168.1.100
```

## Error Handling

### Connection Error

```
$ cursor-cli prompt "Fix the bug in auth.ts"
✗ Failed to connect to Cursor IDE
Error: Connection refused
```

### File Not Found

```
$ cursor-cli send --file=nonexistent.txt
✗ File not found: nonexistent.txt
```

### Invalid Configuration

```
$ cursor-cli config set port abc
✗ Error: Port must be a number
```

## Help Information

```
$ cursor-cli --help
Usage: cursor-cli [options] [command]

CLI tool for sending prompts to Cursor IDE chat windows

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  prompt <prompt>               Send a prompt to the Cursor IDE chat window
  chat                          Start an interactive chat session
  send                          Send a prompt from a file
  config <action> [key] [value] Configure CLI settings
  help [command]                display help for command
```

## Command-Specific Help

```
$ cursor-cli prompt --help
Usage: cursor-cli prompt [options] <prompt>

Send a prompt to the Cursor IDE chat window

Arguments:
  prompt                  The prompt to send

Options:
  -w, --window <window>  Target chat window (default: "default")
  -h, --help             display help for command
``` 